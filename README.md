# Pantheon XI

> Summon football legends as AI agents. Argue with them. When consensus is reached, mint the verdict as an NFT on X Layer. Hold it to unlock the council's reaction after the 2026 final whistle.

**Live:** https://pantheon-ebon.vercel.app  
**X:** [@PantheonXI](https://twitter.com/PantheonXI)  
**Contract:** [0x7D7D338BAb8e19bad2c0959f15fe5d7ad6737708](https://www.oklink.com/x-layer-testnet/address/0x7D7D338BAb8e19bad2c0959f15fe5d7ad6737708)  
**Built for:** [OKX X Cup Hackathon](https://web3.okx.com/xlayer/build-x-hackathon/xcup) · X Layer · May 2026

---

## What It Does

Pantheon XI is a multi-agent AI debate system built around the 2026 FIFA World Cup.

1. **Summon the council** — pick 2–5 legends from three tiers: Immortals (Pelé, Maradona, Zidane), Contenders (Messi, CR7, Mbappé), and Heirs (Yamal, Vini Jr, Saka)
2. **Pose the question** — ask anything about 2026. Who wins? Which nation has the best squad? Will Mbappé finally deliver?
3. **Watch them argue** — each legend responds in character, then reacts to the others. They don't agree.
4. **Challenge them** — push back. The legends defend or concede.
5. **Reach a verdict** — a consensus prediction is distilled from the debate
6. **Mint it** — the verdict is minted as an ERC-721 NFT on X Layer with a unique generated image, a debate hash proving authenticity, and your wallet as the owner
7. **Hold it** — after July 19, 2026, NFT holders unlock the council's post-tournament reaction to what actually happened

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| AI agents | Anthropic API (claude-sonnet-4-5 via OpenRouter) |
| Smart contract | Solidity ERC-721, deployed on X Layer Testnet |
| Wallet | OKX Wallet + ethers.js v6 |
| NFT image | Vercel edge function (`@vercel/og`) → PNG |
| Hosting | Vercel |

---

## Architecture

```
User
  │
  ├── Selects legends (2–5)
  ├── Asks question
  │
  ▼
Multi-agent debate (Anthropic API)
  ├── Round 1: each legend responds independently
  ├── Round 2: each legend reacts to the others
  └── User challenge → legends respond
  │
  ▼
Consensus synthesis (Anthropic API)
  │
  ▼
NFT mint (X Layer)
  ├── ERC-721 mintVerdict(tokenURI, debateHash)
  ├── debateHash = keccak256(full debate transcript)
  ├── Image served at /api/nft-image?tokenId=N
  └── Token-gated post-tournament content
```

---

## Smart Contract

**PantheonNFT.sol** — ERC-721 with:
- `mintVerdict(tokenURI, debateHash)` — mints verdict NFT, stores debate hash on-chain
- `revealVerdict(tokenId)` — owner-only, unlocks post-tournament content for a token
- `canAccessVerdict(tokenId)` — returns true if caller owns the token and verdict is revealed
- `debateHash` mapping — proves each NFT came from a real debate, not a mint farm

**Testnet:** X Layer Testnet (Chain ID 1952)  
**Address:** `0x7D7D338BAb8e19bad2c0959f15fe5d7ad6737708`

---

## Local Setup

```bash
git clone https://github.com/Shanks239/Pantheon
cd Pantheon
npm install
cp .env.example .env.local
# Add OPENROUTER_API_KEY to .env.local
npm run dev
```

## Deploy

```bash
vercel
# Set OPENROUTER_API_KEY in Vercel dashboard → Settings → Environment Variables
```

---

## Project Structure

```
Pantheon/
├── api/
│   ├── chat.js           # Edge function — proxies AI API calls
│   └── nft-image.js      # Node function — serves NFT PNG via @vercel/og
├── src/
│   ├── components/
│   │   └── PantheonXI.jsx    # Full app — all phases, debate UI, mint flow
│   └── lib/
│       ├── wallet.js         # OKX Wallet, mint, token scan, NFT image gen
│       ├── constants.js      # Chain config, contract address + ABI
│       └── api.js            # AI API helpers
├── contracts-hardhat/
│   └── contracts/
│       └── PantheonNFT.sol   # ERC-721 contract
└── public/
    └── videos/
        └── stadium.mp4       # Background video (royalty-free)
```

---

## Legend Roster

**Immortals** — Pelé · Maradona · Zidane · Ronaldo R9 · Ronaldinho · Klose · Thierry Henry

**Contenders** — Messi · Ronaldo CR7 · Neymar · Mbappé

**Heirs** — Lamine Yamal · Vinicius Jr · Bukayo Saka · Bellingham · Pedri

---

## Key Design Decisions

**Multi-agent over single agent** — each legend has a distinct persona, era, and bias. The conflict between them is the product. Maradona and Zidane will never agree, and that disagreement is more valuable than consensus alone.

**debateHash on-chain** — every NFT carries a keccak256 hash of the full debate transcript. This proves the verdict was generated from a real argument, not minted arbitrarily. Judges can verify authenticity.

**Token-gated post-tournament content** — the NFT isn't just a receipt. Holding it grants access to the council's reaction after the July 19 final. This gives the token long-term utility beyond the mint moment.

---

## Hackathon Track

**AI Agent** — X Layer · OKX X Cup · May 2026
