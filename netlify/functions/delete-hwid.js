const fetch = require('node-fetch');
const { Buffer } = require('buffer');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'Immortal-hacker/FusionVIP-Other';
const FILE = 'hwid.txt';
const BRANCH = 'main';

exports.handler = async (event) => {
    const { hwid } = JSON.parse(event.body);
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

        // Filter out the line to delete
        const initialCount = lines.length;
        const updatedLines = lines.filter(line => {
            const currentHwid = line.split(' ')[0];
            return currentHwid !== hwid;
        });

        if (updatedLines.length === initialCount) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: `HWID ${hwid} not found` })
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
                message: `Deleted HWID: ${hwid}`,
                content: encoded,
                sha,
                branch: BRANCH
            })
        });

        if (!updateRes.ok) throw new Error(`GitHub update failed: ${updateRes.statusText}`);

        return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (err) {
        console.error('Delete error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};
