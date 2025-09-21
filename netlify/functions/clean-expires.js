const fetch = require('node-fetch');
const { Buffer } = require('buffer');
const moment = require('moment');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'Immortal-hacker/FusionVIP-Other';
const FILE = 'hwid.txt';
const BRANCH = 'main';

exports.handler = async () => {
  try {
    // Get current file content
    const url = `https://api.github.com/repos/${REPO}/contents/${FILE}?ref=${BRANCH}`;
    const res = await fetch(url, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
    const json = await res.json();
    const content = Buffer.from(json.content, 'base64').toString('utf8');
    const lines = content.trim().split('\n');
    const sha = json.sha;

    // Filter out expired entries
    const now = moment();
    const validLines = lines.filter(line => {
      const parts = line.split(' ');
      if (parts.length < 3) return true; // Keep malformed lines
      
      const expiryStr = parts[2];
      const [day, month, year] = expiryStr.split('-');
      const expiryDate = moment(`${year}-${month}-${day}`, "YYYY-MM-DD");
      
      return expiryDate.isAfter(now);
    });

    // If no expired entries found
    if (validLines.length === lines.length) {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: 'No expired VIP members found',
          removed: 0 
        })
      };
    }

    // Update the file
    const updatedContent = validLines.join('\n');
    const encoded = Buffer.from(updatedContent).toString('base64');
    
    const updateRes = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Removed ${lines.length - validLines.length} expired VIP members`,
        content: encoded,
        sha: sha,
        branch: BRANCH
      })
    });
    
    if (!updateRes.ok) {
      throw new Error('Failed to update file on GitHub');
    }

    const removedCount = lines.length - validLines.length;
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: `Successfully removed ${removedCount} expired VIP members`,
        removed: removedCount 
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
