const fs = require('fs');
const path = require('path');
const https = require('https');

const OWNER = 'niranjanisafk';
const REPO = 'Capstone-final-assessment-';
const BRANCH = 'main';
const TOKEN = process.argv[2] || process.env.GITHUB_TOKEN;

if (!TOKEN) {
  console.error('\n[Error] GitHub Personal Access Token is required.');
  console.log('Usage: node upload_to_github.js <YOUR_GITHUB_TOKEN>\n');
  process.exit(1);
}

const ROOT_DIR = __dirname;
const IGNORE_DIRS = ['node_modules', '.git', 'dist', '.vercel'];

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (IGNORE_DIRS.includes(file)) continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function githubRequest(method, apiPath, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: apiPath,
      method: method,
      headers: {
        'User-Agent': 'NodeJS-Uploader',
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    };
    if (body) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data || '{}');
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`API ${res.statusCode}: ${parsed.message || data}`));
          }
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function uploadFile(relPath, fullPath) {
  const content = fs.readFileSync(fullPath).toString('base64');
  const encodedPath = relPath.split(path.sep).map(encodeURIComponent).join('/');

  // Check if file already exists to get SHA
  let sha;
  try {
    const existing = await githubRequest('GET', `/repos/${OWNER}/${REPO}/contents/${encodedPath}?ref=${BRANCH}`);
    sha = existing.sha;
  } catch (e) {
    // Doesn't exist, will create
  }

  const payload = {
    message: `Add ${relPath.replace(/\\/g, '/')}`,
    content: content,
    branch: BRANCH
  };
  if (sha) payload.sha = sha;

  await githubRequest('PUT', `/repos/${OWNER}/${REPO}/contents/${encodedPath}`, JSON.stringify(payload));
  console.log(`✓ Uploaded: ${relPath}`);
}

async function main() {
  console.log(`Starting push to https://github.com/${OWNER}/${REPO} on branch '${BRANCH}'...\n`);
  const files = getAllFiles(ROOT_DIR);
  console.log(`Found ${files.length} project files to upload.`);

  for (const file of files) {
    const rel = path.relative(ROOT_DIR, file);
    try {
      await uploadFile(rel, file);
    } catch (err) {
      console.error(`✗ Failed ${rel}: ${err.message}`);
    }
  }

  console.log(`\n🎉 All files have been successfully pushed to https://github.com/${OWNER}/${REPO}`);
}

main().catch(err => {
  console.error('\nFatal Error:', err.message);
});
