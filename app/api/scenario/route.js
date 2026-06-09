import { NextResponse } from 'next/server'

export async function POST(request) {
  const { scenario } = await request.json()

  const prompt = `
    You are a space scientist. A user is simulating this scenario: "${scenario}"
    In 3-4 sentences, explain what would scientifically happen.
    Be dramatic but accurate. Keep it under 80 words.
  `

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`   // 👈 key goes in header, not URL
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',   // fast & free on Groq
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150
    })
  })

  const data = await response.json()
  const explanation = data.choices?.[0]?.message?.content
    ?? 'Unable to generate explanation.'

  return NextResponse.json({ explanation })
}