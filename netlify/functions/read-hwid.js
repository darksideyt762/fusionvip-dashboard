const fetch = require('node-fetch');
const { Buffer } = require('buffer');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'Immortal-hacker/FusionVIP-Other';
const FILE = 'hwid.txt';
const BRANCH = 'main';

exports.handler = async () => {
  const url = `https://api.github.com/repos/${REPO}/contents/${FILE}?ref=${BRANCH}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const json = await res.json();
    if (!json.content) {
      return { statusCode: 500, body: JSON.stringify({ error: 'No content found' }) };
    }

    const content = Buffer.from(json.content, 'base64').toString('utf8');
    const lines = content.trim().split('\n');

    return { statusCode: 200, body: JSON.stringify({ lines, sha: json.sha }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};