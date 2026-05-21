# Pantheon XI

> Debate football legends. Mint their prediction. Hold it until the final whistle.

Built for the OKX X Cup Hackathon — X Layer · May 2026

---

## Stack

- React 18 + Vite
- Anthropic API (multi-agent debate)
- ethers.js v6 (wallet + contract)
- X Layer (ERC-721 NFT mint)
- Vercel (hosting + API proxy)

## Local Setup

```bash
npm install
cp .env.example .env.local
# add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

## Deploy to Vercel

```bash
npm install -g vercel
vercel
# Set ANTHROPIC_API_KEY in Vercel dashboard → Settings → Environment Variables
```

## Project Structure

```
pantheon-xi/
├── api/
│   └── chat.js          # Vercel edge function — proxies Anthropic API
├── src/
│   ├── components/
│   │   └── PantheonXI.jsx   # Full app component
│   ├── lib/
│   │   ├── api.js           # Anthropic API helpers
│   │   ├── wallet.js        # OKX Wallet + ethers + mint
│   │   └── constants.js     # Chain config, contract address
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
│   └── favicon.svg
├── index.html
├── vite.config.js
├── vercel.json
└── .env.example
```

## Smart Contract

See `contracts/PantheonNFT.sol` (coming next).
After deploying:
1. Paste contract address into `src/lib/constants.js → CONTRACT_ADDRESS`
2. Paste compiled ABI into `src/lib/constants.js → CONTRACT_ABI`

## Video Background

In `PantheonXI.jsx`, find the `VideoBackground` component.
Replace the placeholder `<div>` with:
```jsx
<video
  autoPlay muted loop playsInline
  style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.18 }}
>
  <source src="/videos/stadium.mp4" type="video/mp4" />
</video>
```
Download royalty-free football footage from pexels.com and place in `/public/videos/`.

## X Layer Testnet Faucet

https://web3.okx.com/xlayer/faucet
