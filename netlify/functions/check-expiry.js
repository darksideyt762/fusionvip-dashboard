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
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
    const json = await res.json();
    const content = Buffer.from(json.content, 'base64').toString('utf8');
    const lines = content.trim().split('\n');

    const soon = lines.filter(line => {
      const parts = line.split(' ');
      const expiryStr = parts[2];
      if (!expiryStr) return false;

      const [day, month, year] = expiryStr.split('-');
      const expiryDate = new Date(`${year}-${month}-${day}`);
      const now = new Date();
      const diff = (expiryDate - now) / (1000 * 60 * 60 * 24);

      return diff < 7 && diff >= 0;
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ expiringSoon: soon })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};