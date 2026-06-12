import { NextResponse } from 'next/server'
import { prompts, buildCustomPrompt } from '@/data/prompts'

export async function POST(request) {
  try {
    const { scenarioId, customQuestion } = await request.json()

    let prompt
    if (customQuestion?.trim()) {
      prompt = buildCustomPrompt(customQuestion.trim())
    } else if (scenarioId && prompts[scenarioId]) {
      prompt = prompts[scenarioId]
    } else {
      return NextResponse.json({ error: 'Invalid scenario.' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'AI is not configured yet. Add a GROQ_API_KEY to your .env.local file to enable scenario analysis.',
          code: 'MISSING_API_KEY',
        },
        { status: 503 },
      )
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 600,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[Groq]', res.status, err)
      return NextResponse.json({ error: 'AI API error.' }, { status: 500 })
    }

    const data = await res.json()
    const raw = data?.choices?.[0]?.message?.content ?? ''
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
    const parsed = JSON.parse(cleaned)
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('[Gemini route]', err)
    return NextResponse.json({ error: 'Failed to process scenario.' }, { status: 500 })
  }
}
