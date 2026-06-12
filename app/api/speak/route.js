import { NextResponse } from 'next/server'

export async function POST(request) {
  const { text } = await request.json()
  if (!text) return NextResponse.json({ error: 'No text provided' }, { status: 400 })

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    console.error('[ElevenLabs]', res.status, err)
    return NextResponse.json({ error: 'TTS failed' }, { status: 500 })
  }

  const audioBuffer = await res.arrayBuffer()
  return new NextResponse(audioBuffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.byteLength.toString(),
    },
  })
}
