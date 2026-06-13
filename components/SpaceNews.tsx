'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Article {
  id: number
  title: string
  url: string
  image_url: string
  news_site: string
  summary: string
  published_at: string
}

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = ['Latest', ...Array.from({ length: CURRENT_YEAR - 2010 }, (_, i) => String(CURRENT_YEAR - i))]

function ArticleCard({ article, index }: { article: Article; index: number }) {
  const [imgFailed, setImgFailed] = useState(false)
  const date = new Date(article.published_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  if (imgFailed) return null

  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease',
      }}
      whileHover={{
        borderColor: 'rgba(150,180,255,0.3)',
        boxShadow: '0 0 30px rgba(100,140,255,0.07)',
      }}
    >
      {/* Image */}
      <div style={{ height: '160px', overflow: 'hidden', flexShrink: 0, position: 'relative',
        background: 'linear-gradient(135deg, rgba(20,25,60,1) 0%, rgba(10,15,40,1) 50%, rgba(30,20,50,1) 100%)',
      }}>
        {article.image_url && (
          <img
            src={article.image_url}
            alt={article.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={() => setImgFailed(true)}
          />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 45%, rgba(4,7,20,0.75) 100%)',
        }} />
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px 18px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '9px', letterSpacing: '0.15em', color: 'rgba(140,170,255,0.7)', fontFamily: 'sans-serif' }}>
            {article.news_site}
          </span>
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.28)', fontFamily: 'sans-serif' }}>
            {date}
          </span>
        </div>

        <h3 style={{
          fontSize: '13px', fontWeight: 600, lineHeight: 1.5,
          color: 'rgba(255,255,255,0.85)', margin: 0,
          fontFamily: 'sans-serif',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        } as React.CSSProperties}>
          {article.title}
        </h3>

        <p style={{
          fontSize: '11px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.65,
          margin: 0, fontFamily: 'sans-serif',
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        } as React.CSSProperties}>
          {article.summary}
        </p>

        <div style={{ marginTop: 'auto', paddingTop: '8px', fontSize: '10px', color: 'rgba(140,170,255,0.45)', fontFamily: 'sans-serif', letterSpacing: '0.06em' }}>
          Read more →
        </div>
      </div>
    </motion.a>
  )
}

export default function SpaceNews() {
  const [year,     setYear]     = useState('Latest')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    setArticles([])

    const url = year === 'Latest' ? '/api/news' : `/api/news?year=${year}`

    fetch(url)
      .then(r => r.json())
      .then(data => {
        const raw: Article[] = data.articles ?? []
        const seenImages = new Set<string>()
        const deduped = raw.filter(a => {
          if (!a.image_url) return false
          if (seenImages.has(a.image_url)) return false
          seenImages.add(a.image_url)
          return true
        })
        setArticles(deduped)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [year])

  return (
    <section className="relative w-full z-10" style={{ padding: '80px 0 120px' }}>

      {/* Section header */}
      <div className="text-center" style={{ marginBottom: '48px' }}>
        <h2 className="font-heading text-4xl text-white/80 tracking-widest">SPACE NEWS</h2>
        <p className="text-white/40 mt-3 text-sm tracking-widest font-light">
          Latest missions, discoveries, and cosmic events
        </p>
      </div>

      {/* Year pills */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '48px', padding: '0 20px' }}>
        {YEAR_OPTIONS.map(y => {
          const active = y === year
          return (
            <button
              key={y}
              onClick={() => setYear(y)}
              style={{
                padding: '6px 18px', borderRadius: '20px',
                border: active ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.1)',
                background: active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(12px)',
                color: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                fontSize: '11px', letterSpacing: '0.12em',
                cursor: 'pointer', transition: 'all 0.2s ease',
                fontFamily: 'sans-serif',
                boxShadow: active ? '0 0 16px rgba(255,255,255,0.08)' : 'none',
              }}
            >
              {y}
            </button>
          )
        })}
      </div>

      {/* Spinner */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{
            width: '28px', height: '28px',
            border: '2px solid rgba(255,255,255,0.08)',
            borderTopColor: 'rgba(255,255,255,0.35)',
            borderRadius: '50%',
            animation: 'newsSpinner 0.8s linear infinite',
          }} />
          <style>{`@keyframes newsSpinner { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '12px', letterSpacing: '0.1em', padding: '60px 0' }}>
          COULD NOT LOAD ARTICLES
        </div>
      )}

      {/* Empty */}
      {!loading && !error && articles.length === 0 && (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '12px', letterSpacing: '0.1em', padding: '60px 0' }}>
          NO ARTICLES FOUND FOR {year}
        </div>
      )}

      {/* Grid */}
      {!loading && !error && articles.length > 0 && (
        <AnimatePresence mode="wait">
          <div
            key={year}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '20px',
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 24px',
            }}
          >
            {articles.map((article, i) => (
              <ArticleCard key={article.id} article={article} index={i} />
            ))}
          </div>
        </AnimatePresence>
      )}

    </section>
  )
}
