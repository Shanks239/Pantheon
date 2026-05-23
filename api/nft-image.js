// Node.js runtime (no edge config) — @vercel/og works here

const CONTRACT_ADDRESS = '0x7D7D338BAb8e19bad2c0959f15fe5d7ad6737708'
const RPC_URL = 'https://testrpc.xlayer.tech'

function encodeTokenURICall(tokenId) {
  const selector = '0xc87b56dd'
  const padded = BigInt(tokenId).toString(16).padStart(64, '0')
  return selector + padded
}

function decodeString(hex) {
  const data = hex.startsWith('0x') ? hex.slice(2) : hex
  const offset = parseInt(data.slice(0, 64), 16) * 2
  const length = parseInt(data.slice(offset, offset + 64), 16) * 2
  const strHex = data.slice(offset + 64, offset + 64 + length)
  return Buffer.from(strHex, 'hex').toString('utf8')
}

export default async function handler(req, res) {
  const tokenId = req.query?.tokenId
  if (!tokenId) return res.status(400).send('Missing tokenId')

  try {
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
    const json = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'))

    const question = json.attributes?.find(a => a.trait_type === 'Question')?.value ?? ''
    const legendsStr = json.attributes?.find(a => a.trait_type === 'Legends')?.value ?? ''
    const legends = legendsStr ? legendsStr.split(', ').slice(0, 3) : []
    const consensus = (json.description ?? '').replace(/\*\*/g, '').replace(/\*/g, '')
    const debateHashHex = json.attributes?.find(a => a.trait_type === 'DebateHash')?.value ?? ''
    const hashShort = debateHashHex ? debateHashHex.slice(0, 10) + '…' + debateHashHex.slice(-6) : ''
    const snippet = consensus.length > 180 ? consensus.slice(0, 180) + '…' : consensus
    const q = question.length > 55 ? question.slice(0, 52) + '…' : question

    // Generate SVG and serve as PNG via @vercel/og
    const { ImageResponse } = await import('@vercel/og')

    const React = (await import('react')).default

    const image = new ImageResponse(
      React.createElement('div', {
        style: { width: '680px', height: '680px', background: '#08080C', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', fontFamily: 'serif' }
      }, [
        React.createElement('div', { key: 'border', style: { position: 'absolute', top: 36, left: 36, right: 36, bottom: 36, border: '1px solid rgba(212,168,67,0.45)', borderRadius: 2, background: '#0D0B08', display: 'flex' } }),
        React.createElement('div', { key: 'content', style: { position: 'absolute', top: 36, left: 36, right: 36, bottom: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 44px' } }, [
          React.createElement('div', { key: 'title', style: { fontSize: 26, fontWeight: 700, color: '#D4A843', letterSpacing: 8, marginBottom: 6 } }, 'PANTHEON'),
          React.createElement('div', { key: 'xi', style: { fontSize: 12, color: 'rgba(212,168,67,0.4)', letterSpacing: 10, marginBottom: 18 } }, 'XI'),
          React.createElement('div', { key: 'div1', style: { width: '100%', height: 1, background: 'rgba(212,168,67,0.18)', marginBottom: 12 } }),
          React.createElement('div', { key: 'label', style: { fontSize: 9, color: 'rgba(212,168,67,0.55)', letterSpacing: 5, marginBottom: 14 } }, 'THE VERDICT'),
          React.createElement('div', { key: 'q', style: { fontSize: 14, fontStyle: 'italic', color: 'rgba(245,237,216,0.6)', marginBottom: 18, textAlign: 'center' } }, `"${q}"`),
          React.createElement('div', { key: 'pills', style: { display: 'flex', gap: 8, marginBottom: 18 } },
            legends.map((name, i) => React.createElement('div', { key: i, style: { background: '#1A1408', border: '1px solid rgba(212,168,67,0.4)', borderRadius: 13, padding: '4px 14px', fontSize: 12, color: '#D4A843' } }, name))
          ),
          React.createElement('div', { key: 'div2', style: { width: '100%', height: 1, background: 'rgba(212,168,67,0.14)', marginBottom: 14 } }),
          React.createElement('div', { key: 'clabel', style: { fontSize: 9, color: 'rgba(212,168,67,0.5)', letterSpacing: 4, alignSelf: 'flex-start', marginBottom: 10 } }, 'CONSENSUS'),
          React.createElement('div', { key: 'consensus', style: { fontSize: 13, color: 'rgba(245,237,216,0.82)', lineHeight: 1.65, alignSelf: 'flex-start' } }, snippet),
          React.createElement('div', { key: 'spacer', style: { flex: 1 } }),
          React.createElement('div', { key: 'div3', style: { width: '100%', height: 1, background: 'rgba(212,168,67,0.14)', marginBottom: 12 } }),
          React.createElement('div', { key: 'meta1', style: { width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: 6 } }, [
            React.createElement('div', { key: 'tid', style: { fontSize: 11, color: 'rgba(212,168,67,0.7)', letterSpacing: 2 } }, `TOKEN #${tokenId}`),
            React.createElement('div', { key: 'hash', style: { fontSize: 11, color: '#A09880' } }, hashShort),
          ]),
          React.createElement('div', { key: 'meta2', style: { width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: 16 } }, [
            React.createElement('div', { key: 'net', style: { fontSize: 11, color: '#A09880' } }, 'X Layer Testnet · 2026'),
            React.createElement('div', { key: 'unlock', style: { fontSize: 11, color: '#A09880' } }, 'Unlock: July 19, 2026'),
          ]),
          React.createElement('div', { key: 'stamp', style: { fontSize: 10, color: 'rgba(212,168,67,0.4)', letterSpacing: 5 } }, 'PANTHEON XI · 2026'),
        ])
      ]),
      { width: 680, height: 680 }
    )

    const buffer = Buffer.from(await image.arrayBuffer())
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.send(buffer)
  } catch (e) {
    console.error(e)
    res.status(500).send('Error: ' + e.message)
  }
}