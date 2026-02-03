import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';

// Provider configuration
const PROVIDERS = {
    amazon: {
        name: 'Amazon',
        id: '7fe734fc-e444-4bd4-8022-aa123a5c9bcd'
    },
    uber: {
        name: 'Uber',
        id: '76afcf07-4c8f-4a63-b545-0d4c4f955164'
    },
    netflix: {
        name: 'Netflix',
        id: 'b3bd406a-cec0-4c91-8c8b-eeb06292cf8e'
    }
};

// Environment variables
const APP_ID = import.meta.env.VITE_RECLAIM_APP_ID;
const APP_SECRET = import.meta.env.VITE_RECLAIM_APP_SECRET;
const CALLBACK_URL = import.meta.env.VITE_CALLBACK_URL; // Your backend endpoint to receive proof

// DOM elements
const providerSelect = document.getElementById('provider');
const startBtn = document.getElementById('startBtn');
const statusDiv = document.getElementById('status');
const qrArea = document.getElementById('qrArea');

// Set status message
function setStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
}

// Clear QR area
function clearQrArea() {
    qrArea.innerHTML = '';
}

// Download JSON file
function downloadJson(data, providerName) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${providerName}_${timestamp}.json`;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Handle proof response
function handleProofResponse(proofs, providerName) {
    console.log('=== RAW PROOF RESPONSE ===');
    console.log(JSON.stringify(proofs, null, 2));
    console.log('=========================');

    // Download as JSON file
    downloadJson(proofs, providerName);

    setStatus('Verification successful! Proof downloaded.', 'success');
}

// Start verification
async function startVerification() {
    const selectedProvider = providerSelect.value;
    const provider = PROVIDERS[selectedProvider];

    if (!APP_ID || !APP_SECRET) {
        setStatus('Error: Missing VITE_RECLAIM_APP_ID or VITE_RECLAIM_APP_SECRET', 'error');
        return;
    }

    try {
        startBtn.disabled = true;
        setStatus('Initializing verification...', 'info');
        clearQrArea();

        // Initialize Reclaim SDK
        const reclaimProofRequest = await ReclaimProofRequest.init(
            APP_ID,
            APP_SECRET,
            provider.id
        );

        // Set callback URL - proof will be POSTed to this URL after verification
        if (CALLBACK_URL) {
            reclaimProofRequest.setAppCallbackUrl(CALLBACK_URL, true); // true = send as JSON
            console.log('Callback URL set:', CALLBACK_URL);
        }

        // Generate request URL
        const requestUrl = await reclaimProofRequest.getRequestUrl();

        setStatus('Scan the QR code or click the link to verify', 'info');

        // Display QR code
        const qrImg = document.createElement('img');
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(requestUrl)}`;
        qrImg.alt = 'Verification QR Code';
        qrArea.appendChild(qrImg);

        // Display clickable link
        const link = document.createElement('a');
        link.href = requestUrl;
        link.target = '_blank';
        link.textContent = 'Open Verification Link';
        qrArea.appendChild(link);

        // Start session and wait for proof
        setStatus('Waiting for verification...', 'info');

        await reclaimProofRequest.startSession({
            onSuccess: (proofs) => {
                handleProofResponse(proofs, provider.name);
                startBtn.disabled = false;
            },
            onError: (error) => {
                console.error('Verification error:', error);
                setStatus(`Verification failed: ${error.message || error}`, 'error');
                startBtn.disabled = false;
            }
        });

    } catch (error) {
        console.error('Error starting verification:', error);
        setStatus(`Error: ${error.message}`, 'error');
        startBtn.disabled = false;
    }
}

// Event listeners
startBtn.addEventListener('click', startVerification);

// Check for environment variables on load
if (!APP_ID || !APP_SECRET) {
    setStatus('Warning: Configure VITE_RECLAIM_APP_ID and VITE_RECLAIM_APP_SECRET in .env file', 'error');
}
