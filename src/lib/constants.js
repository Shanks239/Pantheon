// ─── X Layer Network Config ───────────────────────────────────────────────
export const XLAYER_CHAIN = {
  chainId: '0xC3',          // 195 decimal — X Layer testnet
  chainName: 'X Layer Testnet',
  nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
  rpcUrls: ['https://testrpc.xlayer.tech'],
  blockExplorerUrls: ['https://www.oklink.com/xlayer-test'],
}

export const XLAYER_MAINNET = {
  chainId: '0xC4',          // 196 decimal — X Layer mainnet
  chainName: 'X Layer',
  nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
  rpcUrls: ['https://rpc.xlayer.tech'],
  blockExplorerUrls: ['https://www.oklink.com/xlayer'],
}

// ─── Contract ─────────────────────────────────────────────────────────────
// Populate after deploying PantheonNFT.sol
export const CONTRACT_ADDRESS = ''
export const CONTRACT_ABI = []   // paste ABI here after compile

// ─── Anthropic ────────────────────────────────────────────────────────────
// In production: proxy through a Vercel serverless function
// Never expose this key in client-side code on mainnet
export const ANTHROPIC_MODEL  = 'claude-sonnet-4-20250514'
