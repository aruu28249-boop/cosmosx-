import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { query } = await request.json()
    if (!query?.trim()) {
      return NextResponse.json({ error: 'No query provided' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
    }

    const prompt = `You are a comprehensive, accurate space history database.
The user searched for: "${query.trim()}"

Identify the single most iconic or relevant real space mission, event, or milestone that matches this search query.
If the query is vague (e.g., "moon", "mars"), pick the single most historically significant match.

CRITICAL: If the query is gibberish (like "egere" or "asdf"), entirely unrelated to space, or if no real space mission exists that matches, you MUST return exactly this JSON:
{ "error": "NOT_FOUND" }

Return ONLY valid JSON — no markdown, no explanation, no code fences. Exactly this structure:
{
  "title": "Full official mission or event name",
  "date": "4-digit year only (e.g. 1969)",
  "agency": "Space agency abbreviation(s), e.g. NASA / ESA",
  "desc": "One compelling sentence, max 15 words.",
  "detail": "3-4 sentences of accurate, specific historical detail about this milestone.",
  "facts": ["Concise fact 1", "Concise fact 2", "Concise fact 3"]
}`

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 450,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[timeline-search] Groq error:', err)
      return NextResponse.json({ error: 'AI service error' }, { status: 500 })
    }

    const data = await res.json()
    const raw = data?.choices?.[0]?.message?.content ?? ''

    // Extract the first valid JSON object from the response
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) {
      console.error('[timeline-search] No JSON in response:', raw)
      return NextResponse.json({ error: 'Could not parse AI response' }, { status: 500 })
    }

    const parsed = JSON.parse(match[0])

    if (parsed.error === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Validate required fields
    if (!parsed.title || !parsed.date) {
      return NextResponse.json({ error: 'Incomplete AI response' }, { status: 500 })
    }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('[timeline-search]', err)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
