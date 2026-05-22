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

// ── Build token metadata URI ──────────────────────────────────────────────
export function buildTokenURI({ question, legends, consensus, messages }) {
  const debateString = messages.map(m => `${m.legendId}:${m.content}`).join('|')
  const debateHashHex = ethers.keccak256(ethers.toUtf8Bytes(debateString))
  const metadata = {
    name: 'Pantheon XI Verdict',
    description: consensus,
    attributes: [
      { trait_type: 'Question',   value: question },
      { trait_type: 'Legends',    value: legends.join(', ') },
      { trait_type: 'DebateHash', value: debateHashHex },
      { trait_type: 'Tournament', value: '2026 FIFA World Cup' },
    ],
  }
  const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(metadata))))
  return { tokenURI: 'data:application/json;base64,' + base64, debateHashHex }
}

// ── Truncate address for display ──────────────────────────────────────────
export function shortAddress(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : ''
}

// ── Scan wallet for owned Pantheon tokens + reveal status ─────────────────
// Uses Transfer event logs to find all tokens ever minted to this address
export async function scanWalletTokens(signer) {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
  const address = await signer.getAddress()

  // Get balance first — fast check
  const balance = await contract.balanceOf(address)
  if (balance === 0n) return { hasTokens: false, tokens: [] }

  // Get total supply to know range to scan
  const total = await contract.totalSupply()

  // Check each tokenId — small supply so this is fine
  const tokens = []
  for (let i = 1n; i <= total; i++) {
    try {
      const owner = await contract.ownerOf(i)
      if (owner.toLowerCase() === address.toLowerCase()) {
        const revealed = await contract.verdictRevealed(i)
        tokens.push({ tokenId: i.toString(), revealed })
      }
    } catch {
      // token doesn't exist or burned — skip
    }
  }

  return { hasTokens: tokens.length > 0, tokens }
}