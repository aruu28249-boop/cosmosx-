import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const year = searchParams.get('year')

  const dateFilter = year
    ? `&published_at_gte=${year}-01-01T00:00:00Z&published_at_lte=${year}-12-31T23:59:59Z`
    : ''

  const base = 'https://api.spaceflightnewsapi.net/v4'
  const params = `?limit=30&ordering=-published_at${dateFilter}`

  try {
    const [articlesRes, blogsRes] = await Promise.all([
      fetch(`${base}/articles/${params}`),
      fetch(`${base}/blogs/${params}`),
    ])

    const [articlesData, blogsData] = await Promise.all([
      articlesRes.ok ? articlesRes.json() : { results: [] },
      blogsRes.ok ? blogsRes.json() : { results: [] },
    ])

    const merged = [
      ...(articlesData.results ?? []),
      ...(blogsData.results ?? []),
    ].sort((a, b) => new Date(b.published_at) - new Date(a.published_at))

    return NextResponse.json({ articles: merged })
  } catch (err) {
    console.error('[News]', err)
    return NextResponse.json({ error: 'Failed to fetch news.' }, { status: 500 })
  }
}
