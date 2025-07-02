const fetch = require('node-fetch');
const { Buffer } = require('buffer');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'Immortal-hacker/FusionVIP-Other';
const FILE = 'hwid.txt';
const BRANCH = 'main';

exports.handler = async (event) => {
    const { originalHwid, newLine } = JSON.parse(event.body);
    const getURL = `https://api.github.com/repos/${REPO}/contents/${FILE}?ref=${BRANCH}`;

    try {
        // Get current file content
        const res = await fetch(getURL, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
        if (!res.ok) throw new Error(`GitHub API error: ${res.statusText}`);
        
        const json = await res.json();
        const sha = json.sha;
        const content = Buffer.from(json.content, 'base64').toString('utf8');
        const lines = content.trim().split('\n');

        // Find and update the specific line
        let found = false;
        const updatedLines = lines.map(line => {
            const currentHwid = line.split(' ')[0];
            if (currentHwid === originalHwid) {
                found = true;
                return newLine;
            }
            return line;
        });

        if (!found) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: `HWID ${originalHwid} not found` })
            };
        }

        // Update the file
        const updatedContent = updatedLines.join('\n');
        const encoded = Buffer.from(updatedContent).toString('base64');

        const updateRes = await fetch(getURL, {
            method: "PUT",
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: `Updated HWID: ${originalHwid}`,
                content: encoded,
                sha,
                branch: BRANCH
            })
        });

        if (!updateRes.ok) throw new Error(`GitHub update failed: ${updateRes.statusText}`);

        return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (err) {
        console.error('Edit error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};
