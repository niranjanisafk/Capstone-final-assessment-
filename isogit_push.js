const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

const repoDir = __dirname;
const remoteUrl = 'https://github.com/niranjanisafk/Capstone-final-assessment-.git';
const token = process.argv[2] || process.env.GITHUB_TOKEN;

async function run() {
  console.log('Initializing local git repository...');
  await git.init({ fs, dir: repoDir, defaultBranch: 'main' });

  console.log('Adding files...');
  // Find all files
  function getFiles(dir, list = []) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      if (['node_modules', '.git', 'dist', '.vercel'].includes(f)) continue;
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) getFiles(full, list);
      else list.push(path.relative(repoDir, full).replace(/\\/g, '/'));
    }
    return list;
  }

  const allFiles = getFiles(repoDir);
  for (const filepath of allFiles) {
    await git.add({ fs, dir: repoDir, filepath });
  }
  console.log(`Staged ${allFiles.length} files.`);

  console.log('Committing files...');
  const sha = await git.commit({
    fs,
    dir: repoDir,
    message: 'Complete Personal Expense Tracker MERN Stack Project',
    author: {
      name: 'Niranjan Sabu',
      email: 'niranjanisafk@users.noreply.github.com'
    }
  });
  console.log(`Commit created: ${sha}`);

  if (!token) {
    console.log('\n[!] Git repository committed locally.');
    console.log('To push to remote GitHub repo, provide your token or GitHub password:');
    console.log('Run: node isogit_push.js <YOUR_GITHUB_TOKEN>');
    return;
  }

  console.log(`Pushing to ${remoteUrl}...`);
  const pushResult = await git.push({
    fs,
    http,
    dir: repoDir,
    remote: 'origin',
    url: remoteUrl,
    ref: 'main',
    onAuth: () => ({ username: token })
  });

  console.log('Push complete!', pushResult);
}

run().catch(err => {
  console.error('Error:', err.message);
});
