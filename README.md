# Reclaim Verification App - Setup Instructions

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Reclaim credentials:
   ```
   VITE_RECLAIM_APP_ID=your_app_id_here
   VITE_RECLAIM_APP_SECRET=your_app_secret_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:5173`

## Usage

1. Select a provider from the dropdown (Amazon, Uber, or Netflix)
2. Click "Start Verification"
3. Scan the QR code with the Reclaim app or click the verification link
4. Complete the verification in the Reclaim app
5. The raw JSON proof will be:
   - Logged to the browser console
   - Downloaded as a `.json` file named `{provider}_{timestamp}.json`

## Provider IDs

| Provider | ID |
|----------|-----|
| Amazon | `1d270ba2-8680-415b-b7e2-2cebd47f6f02` |
| Uber | `2c597463-6a21-4f93-8e39-eae46135d2ce` |
| Netflix | `b3bd406a-cec0-4c91-8c8b-eeb06292cf8e` |

## Requirements

- Node.js 18+
- Reclaim app on mobile device for verification
- Valid Reclaim App ID and Secret from [Reclaim Developer Portal](https://dev.reclaimprotocol.org)
