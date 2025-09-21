const fetch = require('node-fetch');
const { Buffer } = require('buffer');
const moment = require('moment');

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

      // Parse the date (assuming format DD-MM-YYYY)
      const [day, month, year] = expiryStr.split('-');
      const expiryDate = moment(`${year}-${month}-${day}`, "YYYY-MM-DD");
      const now = moment();
      const diff = expiryDate.diff(now, 'days');

      return diff < 7 && diff >= 0;
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        expiringSoon: soon,
        count: soon.length 
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
