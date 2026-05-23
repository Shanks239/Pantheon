import { ImageResponse } from '@vercel/og'

export const config = { runtime: 'edge' }

const CONTRACT_ADDRESS = '0x7D7D338BAb8e19bad2c0959f15fe5d7ad6737708'
const RPC_URL = 'https://testrpc.xlayer.tech'

// ABI-encode tokenURI(uint256) call without ethers
function encodeTokenURICall(tokenId) {
  const selector = '0xc87b56dd'
  const padded = BigInt(tokenId).toString(16).padStart(64, '0')
  return selector + padded
}

// Decode ABI-encoded string response
function decodeString(hex) {
  const data = hex.startsWith('0x') ? hex.slice(2) : hex
  const offset = parseInt(data.slice(0, 64), 16) * 2
  const length = parseInt(data.slice(offset, offset + 64), 16) * 2
  const strHex = data.slice(offset + 64, offset + 64 + length)
  return decodeURIComponent(
    strHex.match(/.{1,2}/g).map(b => '%' + b).join('')
  )
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url)
  const tokenId = searchParams.get('tokenId')
  if (!tokenId) return new Response('Missing tokenId', { status: 400 })

  try {
    // Call tokenURI via raw JSON-RPC — no ethers needed
    const rpcRes = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1,
        method: 'eth_call',
        params: [{ to: CONTRACT_ADDRESS, data: encodeTokenURICall(tokenId) }, 'latest'],
      }),
    })
    const rpcData = await rpcRes.json()
    const tokenURI = decodeString(rpcData.result)

    const base64 = tokenURI.replace('data:application/json;base64,', '')
    const json = JSON.parse(atob(base64))

    const question = json.attributes?.find(a => a.trait_type === 'Question')?.value ?? ''
    const legendsStr = json.attributes?.find(a => a.trait_type === 'Legends')?.value ?? ''
    const legends = legendsStr ? legendsStr.split(', ') : []
    const consensus = json.description ?? ''
    const debateHashHex = json.attributes?.find(a => a.trait_type === 'DebateHash')?.value ?? ''
    const hashShort = debateHashHex ? debateHashHex.slice(0, 10) + '…' + debateHashHex.slice(-6) : ''
    const snippet = consensus.length > 180 ? consensus.slice(0, 180) + '…' : consensus
    const q = question.length > 55 ? question.slice(0, 52) + '…' : question

    return new ImageResponse(
      (
        <div style={{ width: '680px', height: '680px', background: '#08080C', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', fontFamily: 'serif' }}>
          <div style={{ position: 'absolute', top: 36, left: 36, right: 36, bottom: 36, border: '1px solid rgba(212,168,67,0.45)', borderRadius: 2, background: '#0D0B08', display: 'flex' }} />
          <div style={{ position: 'absolute', top: 36, left: 36, right: 36, bottom: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 44px' }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#D4A843', letterSpacing: 8, marginBottom: 6 }}>PANTHEON</div>
            <div style={{ fontSize: 12, color: 'rgba(212,168,67,0.4)', letterSpacing: 10, marginBottom: 18 }}>XI</div>
            <div style={{ width: '100%', height: 1, background: 'rgba(212,168,67,0.18)', marginBottom: 12 }} />
            <div style={{ fontSize: 9, color: 'rgba(212,168,67,0.55)', letterSpacing: 5, marginBottom: 14 }}>THE VERDICT</div>
            <div style={{ fontSize: 14, fontStyle: 'italic', color: 'rgba(245,237,216,0.6)', marginBottom: 18, textAlign: 'center' }}>"{q}"</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              {legends.slice(0, 3).map((name, i) => (
                <div key={i} style={{ background: '#1A1408', border: '1px solid rgba(212,168,67,0.4)', borderRadius: 13, padding: '4px 14px', fontSize: 12, color: '#D4A843' }}>{name}</div>
              ))}
            </div>
            <div style={{ width: '100%', height: 1, background: 'rgba(212,168,67,0.14)', marginBottom: 14 }} />
            <div style={{ fontSize: 9, color: 'rgba(212,168,67,0.5)', letterSpacing: 4, alignSelf: 'flex-start', marginBottom: 10 }}>CONSENSUS</div>
            <div style={{ fontSize: 13, color: 'rgba(245,237,216,0.82)', lineHeight: 1.65, alignSelf: 'flex-start' }}>{snippet}</div>
            <div style={{ flex: 1 }} />
            <div style={{ width: '100%', height: 1, background: 'rgba(212,168,67,0.14)', marginBottom: 12 }} />
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 11, color: 'rgba(212,168,67,0.7)', letterSpacing: 2 }}>TOKEN #{tokenId}</div>
              <div style={{ fontSize: 11, color: '#A09880' }}>{hashShort}</div>
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#A09880' }}>X Layer Testnet · 2026</div>
              <div style={{ fontSize: 11, color: '#A09880' }}>Unlock: July 19, 2026</div>
            </div>
            <div style={{ fontSize: 10, color: 'rgba(212,168,67,0.4)', letterSpacing: 5 }}>PANTHEON XI · 2026</div>
          </div>
        </div>
      ),
      { width: 680, height: 680 }
    )
  } catch (e) {
    return new Response('Error: ' + e.message, { status: 500 })
  }
}