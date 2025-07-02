const fetch = require('node-fetch');
const { Buffer } = require('buffer');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'Immortal-hacker/FusionVIP-Other';
const FILE = 'hwid.txt';
const BRANCH = 'main';

exports.handler = async (event) => {
  const { originalHwid, line } = JSON.parse(event.body);
  const getURL = `https://api.github.com/repos/${REPO}/contents/${FILE}?ref=${BRANCH}`;

  try {
    const res = await fetch(getURL, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
    const json = await res.json();
    const sha = json.sha;
    const content = Buffer.from(json.content, 'base64').toString('utf8');
    const lines = content.trim().split('\n');

    // Find line index by original HWID (first part of each line)
    const index = lines.findIndex(l => l.split(' ')[0] === originalHwid);
    
    if (index === -1) {
      return { statusCode: 404, body: JSON.stringify({ error: 'HWID not found' }) };
    }

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
        message: `Update HWID: ${originalHwid}`,
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
