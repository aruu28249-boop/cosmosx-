import Link from 'next/link'
import SimulatorClient from '@/components/SimulatorClient'

export const metadata = {
  title: 'CosmosX | Simulator',
  description: 'Simulate cosmic events in real-time — Jupiter vanishing, asteroid impacts, Earth with two moons.',
}

export default function SimulatePage() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 30% 20%, #0d1433 0%, #050816 55%, #000 100%)',
      }}
    >
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        zIndex: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 28px',
        background: 'linear-gradient(to bottom, rgba(5,8,22,0.85) 0%, transparent 100%)',
        pointerEvents: 'none',
      }}>
        <Link
          href="/"
          style={{
            pointerEvents: 'auto',
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 18px',
            borderRadius: '30px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(12px)',
            color: 'rgba(255,255,255,0.88)',
            fontSize: '12px',
            letterSpacing: '0.1em',
            textDecoration: 'none',
            transition: 'all 0.25s ease',
          }}
        >
          ‹ HOME
        </Link>

        <div style={{
          fontFamily: 'var(--font-syne), serif',
          fontSize: '18px',
          letterSpacing: '0.3em',
          color: 'rgba(255,255,255,0.95)',
          fontWeight: 600,
        }}>
          COSMOSX · SIMULATOR
        </div>

        <div style={{ width: '100px' }} />
      </div>

      {/* ── 3D canvas + scenario panel (client-side, with loading fallback) ── */}
      <SimulatorClient />
    </div>
  )
}
