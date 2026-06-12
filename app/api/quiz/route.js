import { NextResponse } from 'next/server'
import { getPlanetAngles } from '@/lib/orbital-mechanics'

// Real orbital radii in AU
const ORBIT_AU = { Earth: 1.000, Mars: 1.524, Jupiter: 5.203 }

function distAU(a1, a2, r1, r2) {
  return Math.sqrt(
    (Math.cos(a1) * r1 - Math.cos(a2) * r2) ** 2 +
    (Math.sin(a1) * r1 - Math.sin(a2) * r2) ** 2
  )
}

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10)
    const angles = getPlanetAngles(new Date())

    const emAU   = distAU(angles.Earth, angles.Mars,    ORBIT_AU.Earth, ORBIT_AU.Mars)
    const ejAU   = distAU(angles.Earth, angles.Jupiter, ORBIT_AU.Earth, ORBIT_AU.Jupiter)
    const emMin  = (emAU  * 8.317).toFixed(1)
    const ejMin  = (ejAU  * 8.317).toFixed(1)

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'API key missing' }, { status: 500 })

    const prompt = `Today is ${today}. Real-time solar system data:
- Earth → Mars: ${emAU.toFixed(3)} AU (light takes ${emMin} minutes)
- Earth → Jupiter: ${ejAU.toFixed(2)} AU (light takes ${ejMin} minutes)

Generate one engaging multiple-choice space quiz question. Optionally use this real data for a calculation question (e.g. "How long does a signal take to reach Mars right now?"), or pick any fascinating space topic.

Respond ONLY with this JSON (no markdown):
{
  "question": "Your question here?",
  "options": ["A", "B", "C", "D"],
  "correct": 0,
  "explanation": "1-2 sentence explanation of why the answer is correct",
  "fact": "One fascinating related space fact"
}

"correct" is the 0-based index of the correct answer. Make it specific and educational.`

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.65,
        max_tokens: 400,
      }),
    })

    if (!res.ok) {
      console.error('[Quiz]', res.status, await res.text())
      return NextResponse.json({ error: 'AI error' }, { status: 500 })
    }

    const data = await res.json()
    const raw  = data?.choices?.[0]?.message?.content ?? ''
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
    const parsed  = JSON.parse(cleaned)

    return NextResponse.json({
      ...parsed,
      date: today,
      earthMarsAU:  emAU.toFixed(3),
      earthMarsMin: emMin,
      earthJupiterAU:  ejAU.toFixed(2),
      earthJupiterMin: ejMin,
    })
  } catch (err) {
    console.error('[Quiz route]', err)
    return NextResponse.json({ error: 'Failed to generate quiz.' }, { status: 500 })
  }
}
