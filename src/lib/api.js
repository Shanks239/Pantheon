import { ANTHROPIC_MODEL } from './constants.js'

const ENDPOINT = '/api/chat'  // Vercel serverless proxy (see api/chat.js)

export async function callLegend(legendId, persona, content) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1000,
      system: persona + ' Keep your response to 2–3 sentences. No preamble.',
      messages: [{ role: 'user', content }],
    }),
  })
  const data = await res.json()
  return data.content?.[0]?.text ?? '...'
}

export async function callConsensus(question, messages, legendMap) {
  const transcript = messages
    .map(m => `${legendMap[m.legendId]?.name ?? 'User'}: ${m.content}`)
    .join('\n')

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1000,
      system: 'Distill this football legend debate into one verdict. State who they predict wins 2026 and the core reason. Note the sharpest disagreement if any. 3–4 sentences, no preamble.',
      messages: [{ role: 'user', content: `Question: "${question}"\n\nDebate:\n${transcript}\n\nVerdict:` }],
    }),
  })
  const data = await res.json()
  return data.content?.[0]?.text ?? 'No consensus reached.'
}
