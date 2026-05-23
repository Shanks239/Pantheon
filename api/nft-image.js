import { ImageResponse } from '@vercel/og'
import { ethers } from 'ethers'

export const config = { runtime: 'edge' }

const CONTRACT_ADDRESS = '0x7D7D338BAb8e19bad2c0959f15fe5d7ad6737708'
const RPC_URL = 'https://testrpc.xlayer.tech'
const TOKEN_URI_ABI = ['function tokenURI(uint256 tokenId) view returns (string)']

export default async function handler(req) {
  const { searchParams } = new URL(req.url)
  const tokenId = searchParams.get('tokenId')
  if (!tokenId) return new Response('Missing tokenId', { status: 400 })

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, TOKEN_URI_ABI, provider)
    const tokenURI = await contract.tokenURI(tokenId)

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
        <div style={{
          width: '680px', height: '680px',
          background: '#08080C',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'flex-start',
          padding: '0',
          fontFamily: 'Georgia, serif',
        }}>
          {/* Card border */}
          <div style={{
            position: 'absolute', top: 36, left: 36,
            right: 36, bottom: 36,
            border: '0.5px solid rgba(212,168,67,0.45)',
            borderRadius: 2,
            background: '#0D0B08',
            display: 'flex',
          }} />

          {/* Content */}
          <div style={{
            position: 'absolute', top: 36, left: 36, right: 36, bottom: 36,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', padding: '40px 44px',
          }}>
            {/* Title */}
            <div style={{ fontSize: 26, fontWeight: 700, color: '#D4A843', letterSpacing: 8, marginBottom: 6 }}>
              PANTHEON
            </div>
            <div style={{ fontSize: 12, color: 'rgba(212,168,67,0.4)', letterSpacing: 10, marginBottom: 18 }}>
              XI
            </div>

            {/* Divider */}
            <div style={{ width: '100%', height: 1, background: 'rgba(212,168,67,0.18)', marginBottom: 12 }} />

            {/* Verdict label */}
            <div style={{ fontSize: 9, color: 'rgba(212,168,67,0.55)', letterSpacing: 5, marginBottom: 14 }}>
              THE VERDICT
            </div>

            {/* Question */}
            <div style={{ fontSize: 14, fontStyle: 'italic', color: 'rgba(245,237,216,0.6)', marginBottom: 18, textAlign: 'center' }}>
              "{q}"
            </div>

            {/* Legend pills */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              {legends.slice(0, 3).map((name, i) => (
                <div key={i} style={{
                  background: '#1A1408',
                  border: '0.5px solid rgba(212,168,67,0.4)',
                  borderRadius: 13, padding: '4px 14px',
                  fontSize: 12, color: '#D4A843',
                }}>
                  {name}
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ width: '100%', height: 1, background: 'rgba(212,168,67,0.14)', marginBottom: 14 }} />

            {/* Consensus label */}
            <div style={{ fontSize: 9, color: 'rgba(212,168,67,0.5)', letterSpacing: 4, alignSelf: 'flex-start', marginBottom: 10 }}>
              CONSENSUS
            </div>

            {/* Consensus text */}
            <div style={{ fontSize: 13, color: 'rgba(245,237,216,0.82)', lineHeight: 1.65, alignSelf: 'flex-start' }}>
              {snippet}
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Divider */}
            <div style={{ width: '100%', height: 1, background: 'rgba(212,168,67,0.14)', marginBottom: 12 }} />

            {/* Metadata */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 11, color: 'rgba(212,168,67,0.7)', letterSpacing: 2 }}>TOKEN #{tokenId}</div>
              <div style={{ fontSize: 11, color: '#A09880' }}>{hashShort}</div>
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#A09880' }}>X Layer Testnet · 2026</div>
              <div style={{ fontSize: 11, color: '#A09880' }}>Unlock: July 19, 2026</div>
            </div>

            {/* Bottom stamp */}
            <div style={{ fontSize: 10, color: 'rgba(212,168,67,0.4)', letterSpacing: 5 }}>
              PANTHEON XI · 2026
            </div>
          </div>
        </div>
      ),
      {
        width: 680,
        height: 680,
      }
    )
  } catch (e) {
    console.error(e)
    return new Response('Token not found: ' + e.message, { status: 404 })
  }
}