import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

const APP_ID = process.env.RECLAIM_APP_ID;
const APP_SECRET = process.env.RECLAIM_APP_SECRET;
const PROVIDER_ID = process.env.RECLAIM_PROVIDER_ID;

if (!APP_ID || !APP_SECRET || !PROVIDER_ID) {
    console.error('Missing required environment variables: RECLAIM_APP_ID, RECLAIM_APP_SECRET, RECLAIM_PROVIDER_ID');
    process.exit(1);
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PROOFS_FILE = path.join(__dirname, 'proofs.json');
if (!fs.existsSync(PROOFS_FILE)) {
    fs.writeFileSync(PROOFS_FILE, '[]');
}

app.get('/api/config', async (req, res) => {
    try {
        const reclaimProofRequest = await ReclaimProofRequest.init(APP_ID, APP_SECRET, PROVIDER_ID, { log: true });
        const callbackUrl = process.env.RECLAIM_CALLBACK_URL;
        if (callbackUrl) {
            reclaimProofRequest.setAppCallbackUrl(callbackUrl, true);
        }
        const configJson = reclaimProofRequest.toJsonString();
        res.json({ configJson });
    } catch (error) {
        console.error('Error generating config:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/callback', (req, res) => {
    console.log('\n=== RECEIVED PROOF ===');
    console.log(JSON.stringify(req.body, null, 2));
    console.log('======================\n');

    try {
        const proofs = JSON.parse(fs.readFileSync(PROOFS_FILE, 'utf-8'));
        proofs.push({ receivedAt: new Date().toISOString(), data: req.body });
        fs.writeFileSync(PROOFS_FILE, JSON.stringify(proofs, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/proofs', (req, res) => {
    try {
        const proofs = JSON.parse(fs.readFileSync(PROOFS_FILE, 'utf-8'));
        res.json(proofs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use((req, res, next) => {
    if (req.method === 'GET' && !req.url.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        next();
    }
});

app.listen(PORT, () => {
    console.log(`\nServer running at http://localhost:${PORT}`);
    console.log('Open the browser to start verification.\n');
});
