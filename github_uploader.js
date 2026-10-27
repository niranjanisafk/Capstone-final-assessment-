const fs = require('fs');
const path = require('path');
const https = require('https');

const REPO_OWNER = 'niranjanisafk';
const REPO_NAME = 'Capstone-final-assessment-';
const TOKEN = process.env.GITHUB_TOKEN || process.argv[2];

if (!TOKEN) {
  console.log('NO_TOKEN');
  process.exit(1);
}

// Function to upload files via GitHub REST API
console.log('GitHub Token detected. Ready to push to https://github.com/' + REPO_OWNER + '/' + REPO_NAME);
