import express from 'express';
import cors from 'cors';
import fs from 'fs';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store proofs in a file
const PROOFS_FILE = './proofs.json';

// Initialize proofs file if it doesn't exist
if (!fs.existsSync(PROOFS_FILE)) {
    fs.writeFileSync(PROOFS_FILE, '[]');
}

// Callback endpoint - Reclaim will POST proof here
app.post('/api/reclaim/callback', (req, res) => {
    console.log('\n=== RECEIVED PROOF FROM RECLAIM ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('===================================\n');

    try {
        // Save the proof
        const proofs = JSON.parse(fs.readFileSync(PROOFS_FILE, 'utf-8'));
        proofs.push({
            receivedAt: new Date().toISOString(),
            data: req.body
        });
        fs.writeFileSync(PROOFS_FILE, JSON.stringify(proofs, null, 2));

        console.log('Proof saved successfully!');
        res.status(200).json({ success: true, message: 'Proof received' });
    } catch (error) {
        console.error('Error saving proof:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all proofs (for viewing)
app.get('/api/proofs', (req, res) => {
    try {
        const proofs = JSON.parse(fs.readFileSync(PROOFS_FILE, 'utf-8'));
        res.json(proofs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`\n🚀 Backend server running at http://localhost:${PORT}`);
    console.log(`📥 Callback URL: http://localhost:${PORT}/api/reclaim/callback`);
    console.log(`📋 View proofs: http://localhost:${PORT}/api/proofs`);
    console.log('\nWaiting for proofs from Reclaim...\n');
});
