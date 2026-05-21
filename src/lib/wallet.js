import { ethers } from 'ethers'
import { XLAYER_CHAIN, CONTRACT_ADDRESS, CONTRACT_ABI } from './constants.js'

// ── Connect wallet (OKX Wallet preferred, MetaMask fallback) ──────────────
export async function connectWallet() {
  // OKX Wallet injects window.okxwallet; fallback to window.ethereum
  const provider = window.okxwallet ?? window.ethereum
  if (!provider) throw new Error('No wallet found. Install OKX Wallet.')

  await provider.request({ method: 'eth_requestAccounts' })
  await switchToXLayer(provider)

  const web3Provider = new ethers.BrowserProvider(provider)
  const signer = await web3Provider.getSigner()
  const address = await signer.getAddress()
  return { signer, address, provider: web3Provider }
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
export async function mintVerdict(signer, tokenURI) {
  if (!CONTRACT_ADDRESS) throw new Error('Contract not deployed yet.')
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
  const tx = await contract.mint(await signer.getAddress(), tokenURI)
  const receipt = await tx.wait()
  return receipt
}

// ── Build token metadata (stored on-chain or IPFS) ────────────────────────
export function buildTokenURI({ question, legends, consensus, messages }) {
  const debateHash = ethers.keccak256(
    ethers.toUtf8Bytes(messages.map(m => `${m.legendId}:${m.content}`).join('|'))
  )
  const metadata = {
    name: 'Pantheon XI Verdict',
    description: consensus,
    attributes: [
      { trait_type: 'Question',   value: question },
      { trait_type: 'Legends',    value: legends.join(', ') },
      { trait_type: 'DebateHash', value: debateHash },
      { trait_type: 'Tournament', value: '2026 FIFA World Cup' },
    ],
  }
  // Inline base64 data URI — replace with IPFS upload in production
  return 'data:application/json;base64,' + btoa(JSON.stringify(metadata))
}
