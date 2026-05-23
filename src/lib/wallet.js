import { ethers } from 'ethers'
import { XLAYER_CHAIN, CONTRACT_ADDRESS, CONTRACT_ABI } from './constants.js'

// ── Connect wallet (OKX Wallet preferred, MetaMask fallback) ──────────────
export async function connectWallet() {
  const provider = window.okxwallet ?? window.ethereum
  if (!provider) throw new Error('No wallet found. Install OKX Wallet.')

  await provider.request({ method: 'eth_requestAccounts' })
  await switchToXLayer(provider)

  const web3Provider = new ethers.BrowserProvider(provider)
  const signer = await web3Provider.getSigner()
  const address = await signer.getAddress()
  return { signer, address }
}

// ── Switch to X Layer testnet, add if missing ─────────────────────────────
async function switchToXLayer(provider) {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: XLAYER_CHAIN.chainId }],
    })
  } catch (err) {
    if (err.code === 4902) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [XLAYER_CHAIN],
      })
    } else throw err
  }
}

// ── Mint NFT ──────────────────────────────────────────────────────────────
export async function mintVerdict(signer, tokenURI, debateHashHex) {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
  const tx = await contract.mintVerdict(tokenURI, debateHashHex)
  const receipt = await tx.wait()
  const event = receipt.logs
    .map(log => { try { return contract.interface.parseLog(log) } catch { return null } })
    .find(e => e?.name === 'VerdictMinted')
  return { receipt, tokenId: event?.args?.tokenId?.toString() ?? null }
}

// ── Generate NFT image as inline base64 SVG ───────────────────────────────
function generateNFTImage({ question, legends, consensus, tokenId, debateHashHex }) {
  // Truncate consensus to ~200 chars, split into 4 lines of ~50 chars
  const snippet = (consensus.replace(/\*\*/g, '').replace(/\*/g, '')).slice(0, 220) + (consensus.length > 220 ? '…' : '')
  const words = snippet.split(' ')
  const lines = []
  let current = ''
  for (const word of words) {
    if ((current + ' ' + word).trim().length > 52) {
      lines.push(current.trim())
      current = word
    } else {
      current = (current + ' ' + word).trim()
    }
    if (lines.length === 4) break
  }
  if (current && lines.length < 5) lines.push(current.trim())
  const textLines = lines.slice(0, 5)

  // Truncate question
  const q = question.length > 55 ? question.slice(0, 55) + '…' : question

  // Hash short
  const hashShort = debateHashHex ? debateHashHex.slice(0, 10) + '…' + debateHashHex.slice(-6) : ''

  // Legend pills — max 3 shown
  const shown = legends.slice(0, 3)
  const pillW = 148
  const pillGap = 12
  const totalPillW = shown.length * pillW + (shown.length - 1) * pillGap
  const pillStartX = (680 - totalPillW) / 2

  const pillsHTML = shown.map((name, i) => {
    const cx = pillStartX + i * (pillW + pillGap) + pillW / 2
    return `
    <rect x="${pillStartX + i * (pillW + pillGap)}" y="228" width="${pillW}" height="26" rx="13" fill="#1A1408" stroke="#D4A843" stroke-opacity="0.4" stroke-width="0.5"/>
    <text x="${cx}" y="246" font-family="Georgia,serif" font-size="12" fill="#D4A843" text-anchor="middle">${name}</text>`
  }).join('')

  const consensusLines = textLines.map((line, i) =>
    `<tspan x="80" dy="${i === 0 ? 0 : 21}">${line}</tspan>`
  ).join('')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 680" width="680" height="680">
  <rect width="680" height="680" fill="#08080C"/>
  <rect x="36" y="36" width="608" height="608" rx="2" fill="#0D0B08" stroke="#D4A843" stroke-width="0.5" stroke-opacity="0.45"/>
  <line x1="48" y1="48" x2="72" y2="48" stroke="#D4A843" stroke-opacity="0.7" stroke-width="1"/>
  <line x1="48" y1="48" x2="48" y2="72" stroke="#D4A843" stroke-opacity="0.7" stroke-width="1"/>
  <line x1="632" y1="48" x2="608" y2="48" stroke="#D4A843" stroke-opacity="0.7" stroke-width="1"/>
  <line x1="632" y1="48" x2="632" y2="72" stroke="#D4A843" stroke-opacity="0.7" stroke-width="1"/>
  <line x1="48" y1="632" x2="72" y2="632" stroke="#D4A843" stroke-opacity="0.7" stroke-width="1"/>
  <line x1="48" y1="632" x2="48" y2="608" stroke="#D4A843" stroke-opacity="0.7" stroke-width="1"/>
  <line x1="632" y1="632" x2="608" y2="632" stroke="#D4A843" stroke-opacity="0.7" stroke-width="1"/>
  <line x1="632" y1="632" x2="632" y2="608" stroke="#D4A843" stroke-opacity="0.7" stroke-width="1"/>
  <text x="340" y="105" font-family="Georgia,serif" font-size="26" font-weight="700" fill="#D4A843" text-anchor="middle" letter-spacing="8">PANTHEON</text>
  <text x="340" y="124" font-family="Georgia,serif" font-size="12" fill="#D4A843" fill-opacity="0.4" text-anchor="middle" letter-spacing="10">XI</text>
  <line x1="80" y1="146" x2="318" y2="146" stroke="#D4A843" stroke-opacity="0.22" stroke-width="0.5"/>
  <rect x="335" y="141" width="10" height="10" transform="rotate(45 340 146)" fill="none" stroke="#D4A843" stroke-opacity="0.45" stroke-width="0.5"/>
  <line x1="362" y1="146" x2="600" y2="146" stroke="#D4A843" stroke-opacity="0.22" stroke-width="0.5"/>
  <text x="340" y="168" font-family="Georgia,serif" font-size="9" fill="#D4A843" fill-opacity="0.55" text-anchor="middle" letter-spacing="5">THE VERDICT</text>
  <text x="340" y="204" font-family="Georgia,serif" font-size="14" font-style="italic" fill="#F5EDD8" fill-opacity="0.6" text-anchor="middle">"${q}"</text>
  ${pillsHTML}
  <line x1="80" y1="275" x2="600" y2="275" stroke="#D4A843" stroke-opacity="0.14" stroke-width="0.5"/>
  <text x="80" y="302" font-family="Georgia,serif" font-size="9" fill="#D4A843" fill-opacity="0.5" letter-spacing="4">CONSENSUS</text>
  <text font-family="Georgia,serif" font-size="13" fill="#F5EDD8" fill-opacity="0.82" x="80" y="326">${consensusLines}</text>
  <line x1="80" y1="450" x2="600" y2="450" stroke="#D4A843" stroke-opacity="0.14" stroke-width="0.5"/>
  <text x="80" y="476" font-family="Georgia,serif" font-size="11" fill="#D4A843" fill-opacity="0.7" letter-spacing="2">TOKEN #${tokenId ?? '—'}</text>
  <text x="600" y="476" font-family="Georgia,serif" font-size="11" fill="#A09880" text-anchor="end">${hashShort}</text>
  <text x="80" y="496" font-family="Georgia,serif" font-size="11" fill="#A09880">X Layer · 2026</text>
  <text x="600" y="496" font-family="Georgia,serif" font-size="11" fill="#A09880" text-anchor="end">Unlock: July 19, 2026</text>
  <line x1="80" y1="518" x2="318" y2="518" stroke="#D4A843" stroke-opacity="0.22" stroke-width="0.5"/>
  <rect x="335" y="513" width="10" height="10" transform="rotate(45 340 518)" fill="none" stroke="#D4A843" stroke-opacity="0.45" stroke-width="0.5"/>
  <line x1="362" y1="518" x2="600" y2="518" stroke="#D4A843" stroke-opacity="0.22" stroke-width="0.5"/>
  <text x="340" y="542" font-family="Georgia,serif" font-size="10" fill="#D4A843" fill-opacity="0.4" text-anchor="middle" letter-spacing="5">PANTHEON XI · 2026</text>
</svg>`

  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
}

// ── Build token metadata URI ──────────────────────────────────────────────
export function buildTokenURI({ question, legends, consensus, messages, tokenId }) {
  const debateString = messages.map(m => `${m.legendId}:${m.content}`).join('|')
  const debateHashHex = ethers.keccak256(ethers.toUtf8Bytes(debateString))

  // In-app display: generate SVG as data URI
  const imageDataURI = generateNFTImage({ question, legends, consensus, tokenId, debateHashHex })

  // On-chain metadata: point image at Vercel API route so OKLink can render it
  const imageURL = tokenId
    ? `https://pantheon-ebon.vercel.app/api/nft-image?tokenId=${tokenId}`
    : imageDataURI  // fallback for preview

  const metadata = {
    name: `Pantheon XI Verdict #${tokenId ?? '?'}`,
    description: consensus,description: consensus.replace(/\*\*/g, '').replace(/\*/g, ''),
    image: imageURL,
    attributes: [
      { trait_type: 'Question',   value: question },
      { trait_type: 'Legends',    value: legends.join(', ') },
      { trait_type: 'DebateHash', value: debateHashHex },
      { trait_type: 'Tournament', value: '2026 FIFA World Cup' },
    ],
  }
  const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(metadata))))
  return {
    tokenURI: 'data:application/json;base64,' + base64,
    debateHashHex,
    imageDataURI,  // returned for in-app display
  }
}

// ── Truncate address for display ──────────────────────────────────────────
export function shortAddress(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : ''
}

// ── Scan wallet for owned Pantheon tokens + reveal status ─────────────────
export async function scanWalletTokens(signer) {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
  const address = await signer.getAddress()

  const balance = await contract.balanceOf(address)
  if (balance === 0n) return { hasTokens: false, tokens: [] }

  const total = await contract.totalSupply()
  const tokens = []
  for (let i = 1n; i <= total; i++) {
    try {
      const owner = await contract.ownerOf(i)
      if (owner.toLowerCase() === address.toLowerCase()) {
        const revealed = await contract.verdictRevealed(i)
        tokens.push({ tokenId: i.toString(), revealed })
      }
    } catch { }
  }
  return { hasTokens: tokens.length > 0, tokens }
}