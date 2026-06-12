import { NextResponse } from 'next/server'

export async function POST(request) {
  const { text } = await request.json()
  if (!text) return NextResponse.json({ error: 'No text provided' }, { status: 400 })
  const safeText = text.length > 1999 ? text.slice(0, 1999) : text

  const res = await fetch('https://api.deepgram.com/v1/speak?model=aura-2-pluto-en', {
    method: 'POST',
    headers: {
      Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: safeText }),
  })

  if (!res.ok) {
    console.error('[Deepgram]', res.status, await res.text())
    return NextResponse.json({ error: 'TTS failed' }, { status: 500 })
  }

  // Stream the audio back as it arrives instead of buffering the whole thing
  return new NextResponse(res.body, {
    headers: { 'Content-Type': 'audio/mpeg' },
  })
}
