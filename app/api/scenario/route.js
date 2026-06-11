import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { scenario } = body

    if (!scenario) {
      return NextResponse.json({ explanation: 'No scenario provided.' }, { status: 400 })
    }

    const prompt = `You are a dramatic space scientist narrator. A user is simulating: "${scenario}"
Explain in 2-3 vivid, accurate sentences what would scientifically happen. Be compelling and dramatic. Under 75 words.`

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:       'llama-3.1-8b-instant',   // ← updated: llama3-8b-8192 was decommissioned
        messages:    [{ role: 'user', content: prompt }],
        max_tokens:  130,
        temperature: 0.85,
      }),
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      console.error('[Groq] HTTP', groqRes.status, errText)
      return NextResponse.json({
        explanation: `⚠️ AI service error (${groqRes.status}). The visual effect is still running above.`
      })
    }

    const data = await groqRes.json()
    const explanation = data?.choices?.[0]?.message?.content?.trim()
      ?? 'The cosmos stirs — no words can capture what just unfolded.'

    return NextResponse.json({ explanation })

  } catch (err) {
    console.error('[Scenario API]', err)
    return NextResponse.json({
      explanation: '⚠️ Could not reach the AI service. Watch the visual effect playing above!'
    })
  }
}