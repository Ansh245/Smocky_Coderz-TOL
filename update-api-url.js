#!/usr/bin/env node

// Script to automatically update the API URL in client/.env
// Run this after LocalTunnel is running to get the correct URL

import fs from 'fs';
import path from 'path';
import https from 'https';

const LOCAL_TUNNEL_API = 'https://api.localtunnel.me/api/tunnels';

function getLocalTunnelUrl() {
  return new Promise((resolve, reject) => {
    https.get(LOCAL_TUNNEL_API, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const url = json.tunnels?.[0]?.public_url;
          if (url) {
            resolve(url);
          } else {
            reject(new Error('No tunnel URL found'));
          }
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function updateApiUrl() {
  try {
    console.log('Getting LocalTunnel URL...');
    const tunnelUrl = await getLocalTunnelUrl();

    console.log(`Found tunnel URL: ${tunnelUrl}`);

    const envPath = path.join(__dirname, 'client', '.env');
    const envContent = `# API URL for production - Auto-updated by update-api-url.js
# LocalTunnel URL: ${tunnelUrl}
VITE_API_URL=${tunnelUrl}
`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated client/.env with LocalTunnel URL');
    console.log('🔄 Run: npm run build && npx vercel --prod --yes');

  } catch (error) {
    console.error('❌ Failed to get LocalTunnel URL:', error.message);
    console.log('Make sure LocalTunnel is running on port 5000');
    console.log('Run: npx localtunnel --port 5000');
  }
}

updateApiUrl();