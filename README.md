# Reclaim Protocol Verification App

Use [Reclaim Protocol](https://reclaimprotocol.org) to verify user data from any provider. Sessions are created server-side via the official JS SDK.

## Quick Start

```bash
npm install
cp .env.example .env
# edit .env with your credentials
npm start
# open http://localhost:3000
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `RECLAIM_APP_ID` | Yes | Your Reclaim application ID |
| `RECLAIM_APP_SECRET` | Yes | Your Reclaim application secret |
| `RECLAIM_PROVIDER_IDS` | Yes | Comma-separated provider IDs |
| `RECLAIM_CALLBACK_URL` | No | Public callback URL (ngrok) for receiving proofs via HTTP POST |

### Provider ID Format

```
RECLAIM_PROVIDER_IDS=provider-id-1:Display Name,provider-id-2:Another Name
```

Each entry is `ID:Name` — the name appears in the dropdown. If you omit `:Name`, the ID is shown.

Example:
```
RECLAIM_PROVIDER_IDS=6d3f6753-7ee6-49ee-a545-62f1b1822ae5:GitHub,76afcf07-4c8f-4a63-b545-0d4c4f955164:Github Profile
```

### Callback URL (Optional)

For production or when providers require a public callback:
```bash
ngrok http 3000
# set the ngrok URL in .env
RECLAIM_CALLBACK_URL=https://your-url.ngrok-free.dev/api/callback
```

When set, proofs are POSTed to `/api/callback` and stored in `proofs.json`. Without it, proofs are received via the SDK's built-in polling.

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/providers` | GET | List configured providers |
| `/api/config?providerId=` | GET | Generate verification session config for a provider |
| `/api/callback` | POST | Receive proofs from Reclaim (when callback URL is set) |
| `/api/proofs` | GET | List all received proofs |

## Adding Providers

Add provider IDs to `RECLAIM_PROVIDER_IDS` in `.env`. Find provider IDs at [dev.reclaimprotocol.org/explore](https://dev.reclaimprotocol.org/explore).

Providers must be **public** and **approved** to work in web portal mode.

## Source Reference

Built following the official [reclaim-demo-website-v3](https://github.com/reclaimprotocol/reclaim-demo-website-v3).
