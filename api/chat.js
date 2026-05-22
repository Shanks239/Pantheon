export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const body = await req.json()
  const { model, system, messages, max_tokens } = body

  const openRouterMessages = [
    ...(system ? [{ role: 'system', content: system }] : []),
    ...messages,
  ]

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://pantheon-ebon.vercel.app',
      'X-Title': 'Pantheon XI',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4-5',
      messages: openRouterMessages,
      max_tokens: max_tokens ?? 1000,
    }),
  })

  const data = await res.json()

  // Return full OpenRouter response for debugging
  if (!data.choices?.[0]?.message?.content) {
    return new Response(JSON.stringify({ error: data, content: [{ type: 'text', text: JSON.stringify(data) }] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const text = data.choices[0].message.content
  return new Response(
    JSON.stringify({ content: [{ type: 'text', text }] }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}