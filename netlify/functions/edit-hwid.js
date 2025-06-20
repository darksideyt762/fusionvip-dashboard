const fetch = require('node-fetch');
const { Buffer } = require('buffer');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'Immortal-hacker/FusionVIP-Other';
const FILE = 'hwid.txt';
const BRANCH = 'main';

exports.handler = async (event) => {
  const { index, line } = JSON.parse(event.body);
  const getURL = `https://api.github.com/repos/${REPO}/contents/${FILE}?ref=${BRANCH}`;

  try {
    const res = await fetch(getURL, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
    const json = await res.json();
    const sha = json.sha;
    const content = Buffer.from(json.content, 'base64').toString('utf8');
    const lines = content.trim().split('\n');

    lines[index] = line;
    const updated = lines.join('\n');
    const encoded = Buffer.from(updated).toString('base64');

    await fetch(getURL, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Edit line at index ${index}`,
        content: encoded,
        sha,
        branch: BRANCH
      })
    });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};