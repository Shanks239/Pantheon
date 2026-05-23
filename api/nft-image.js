import { ethers } from 'ethers'

const CONTRACT_ADDRESS = '0x7D7D338BAb8e19bad2c0959f15fe5d7ad6737708'
const RPC_URL = 'https://testrpc.xlayer.tech'
const TOKEN_URI_ABI = ['function tokenURI(uint256 tokenId) view returns (string)']

function generateNFTSVG({ question, legends, consensus, tokenId, debateHashHex }) {
  const snippet = consensus.length > 220 ? consensus.slice(0, 220) + '…' : consensus
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
  const q = question.length > 55 ? question.slice(0, 55) + '…' : question
  const hashShort = debateHashHex ? debateHashHex.slice(0, 10) + '…' + debateHashHex.slice(-6) : ''

  const shown = (legends || []).slice(0, 3)
  const pillW = 148
  const pillGap = 12
  const totalPillW = shown.length * pillW + (shown.length - 1) * pillGap
  const pillStartX = (680 - totalPillW) / 2

  const pillsSVG = shown.map((name, i) => {
    const cx = pillStartX + i * (pillW + pillGap) + pillW / 2
    const safeName = String(name).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    return `<rect x="${pillStartX + i * (pillW + pillGap)}" y="228" width="${pillW}" height="26" rx="13" fill="#1A1408" stroke="#D4A843" stroke-opacity="0.4" stroke-width="0.5"/>
    <text x="${cx}" y="246" font-family="Georgia,serif" font-size="12" fill="#D4A843" text-anchor="middle">${safeName}</text>`
  }).join('\n')

  const consensusLines = textLines.map((line, i) => {
    const safe = String(line).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
    return `<tspan x="80" dy="${i === 0 ? 0 : 21}">${safe}</tspan>`
  }).join('')

  const safeQ = String(q).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 680" width="680" height="680">
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
  <text x="340" y="204" font-family="Georgia,serif" font-size="14" font-style="italic" fill="#F5EDD8" fill-opacity="0.6" text-anchor="middle">&quot;${safeQ}&quot;</text>
  ${pillsSVG}
  <line x1="80" y1="275" x2="600" y2="275" stroke="#D4A843" stroke-opacity="0.14" stroke-width="0.5"/>
  <text x="80" y="302" font-family="Georgia,serif" font-size="9" fill="#D4A843" fill-opacity="0.5" letter-spacing="4">CONSENSUS</text>
  <text font-family="Georgia,serif" font-size="13" fill="#F5EDD8" fill-opacity="0.82" x="80" y="326">${consensusLines}</text>
  <line x1="80" y1="450" x2="600" y2="450" stroke="#D4A843" stroke-opacity="0.14" stroke-width="0.5"/>
  <text x="80" y="476" font-family="Georgia,serif" font-size="11" fill="#D4A843" fill-opacity="0.7" letter-spacing="2">TOKEN #${tokenId ?? '—'}</text>
  <text x="600" y="476" font-family="Georgia,serif" font-size="11" fill="#A09880" text-anchor="end">${hashShort}</text>
  <text x="80" y="496" font-family="Georgia,serif" font-size="11" fill="#A09880">X Layer Testnet · 2026</text>
  <text x="600" y="496" font-family="Georgia,serif" font-size="11" fill="#A09880" text-anchor="end">Unlock: July 19, 2026</text>
  <line x1="80" y1="518" x2="318" y2="518" stroke="#D4A843" stroke-opacity="0.22" stroke-width="0.5"/>
  <rect x="335" y="513" width="10" height="10" transform="rotate(45 340 518)" fill="none" stroke="#D4A843" stroke-opacity="0.45" stroke-width="0.5"/>
  <line x1="362" y1="518" x2="600" y2="518" stroke="#D4A843" stroke-opacity="0.22" stroke-width="0.5"/>
  <text x="340" y="542" font-family="Georgia,serif" font-size="10" fill="#D4A843" fill-opacity="0.4" text-anchor="middle" letter-spacing="5">PANTHEON XI · 2026</text>
</svg>`
}

export default async function handler(req, res) {
  const { tokenId } = req.query
  if (!tokenId) return res.status(400).send('Missing tokenId')

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, TOKEN_URI_ABI, provider)
    const tokenURI = await contract.tokenURI(tokenId)

    // Decode base64 JSON metadata
    const base64 = tokenURI.replace('data:application/json;base64,', '')
    const json = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'))

    const question = json.attributes?.find(a => a.trait_type === 'Question')?.value ?? ''
    const legendsStr = json.attributes?.find(a => a.trait_type === 'Legends')?.value ?? ''
    const legends = legendsStr ? legendsStr.split(', ') : []
    const consensus = json.description ?? ''
    const debateHashHex = json.attributes?.find(a => a.trait_type === 'DebateHash')?.value ?? ''

    const svg = generateNFTSVG({ question, legends, consensus, tokenId, debateHashHex })

    res.setHeader('Content-Type', 'image/svg+xml')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.send(svg)
  } catch (e) {
    console.error(e)
    res.status(404).send('Token not found')
  }
}