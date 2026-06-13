import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { year } = await request.json()

    if (!year || isNaN(year)) {
      return NextResponse.json({ error: 'Invalid year.' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'AI is not configured yet. Add a GROQ_API_KEY to your .env.local file.',
          code: 'MISSING_API_KEY',
        },
        { status: 503 },
      )
    }

    const prompt = `You are the AI onboard computer of a futuristic spacecraft. 
The user has just set the time machine to the year ${year}. 
Provide a very brief, cinematic 2-3 sentence description of what the state of humanity, space exploration, or the solar system is like in the year ${year}. 
If it's in the past (e.g., 1969), mention a real historical space event. 
If it's in the future (e.g., 2150), make up a plausible sci-fi event (e.g., Martian terraforming, interstellar probes).
If it's way in the past (e.g. 1900), mention the dawn of modern astronomy.
Do not use markdown, just return the plain text. Keep it punchy and engaging.`

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 150,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[Groq Time Machine]', res.status, err)
      return NextResponse.json({ error: 'AI API error.' }, { status: 500 })
    }

    const data = await res.json()
    const raw = data?.choices?.[0]?.message?.content ?? 'Temporal analysis unavailable.'
    
    return NextResponse.json({ text: raw.trim() })
  } catch (err) {
    console.error('[Time Machine route]', err)
    return NextResponse.json({ error: 'Failed to process time machine request.' }, { status: 500 })
  }
}
