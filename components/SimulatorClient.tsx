'use client'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// ssr:false is only valid inside a Client Component in Next.js 15
const SolarSystem       = dynamic(() => import('@/components/SolarSystem'),       { ssr: false })
const ScenarioSimulator = dynamic(() => import('@/components/ScenarioSimulator'), { ssr: false })

function CosmosLoader() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 30% 20%, #0d1433 0%, #050816 55%, #000 100%)',
      gap: '24px',
    }}>
      {/* Animated orbital ring loader */}
      <div style={{ position: 'relative', width: '80px', height: '80px' }}>
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: '2px solid transparent',
          borderTopColor: 'rgba(99,102,241,0.85)',
          borderRightColor: 'rgba(139,92,246,0.4)',
          animation: 'cosmosSpinA 1.2s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: '14px',
          borderRadius: '50%',
          border: '2px solid transparent',
          borderTopColor: 'rgba(167,139,250,0.9)',
          borderLeftColor: 'rgba(99,102,241,0.3)',
          animation: 'cosmosSpinB 0.8s linear infinite reverse',
        }} />
        {/* Centre glow — the mini sun */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: '10px', height: '10px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #fff8e0 0%, #ffa020 60%, transparent 100%)',
          boxShadow: '0 0 14px 5px rgba(255,180,30,0.65)',
        }} />
      </div>

      <div style={{
        fontFamily: 'var(--font-syne, serif)',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '11px',
        letterSpacing: '0.35em',
        textTransform: 'uppercase',
        animation: 'cosmosPulse 2s ease-in-out infinite',
      }}>
        Initialising Cosmos…
      </div>

      <style>{`
        @keyframes cosmosSpinA { to { transform: rotate(360deg);  } }
        @keyframes cosmosSpinB { to { transform: rotate(-360deg); } }
        @keyframes cosmosPulse { 0%,100%{ opacity:.35 } 50%{ opacity:1 } }
      `}</style>
    </div>
  )
}

export default function SimulatorClient() {
  return (
    <>
      <div style={{ position: 'absolute', inset: 0 }}>
        <Suspense fallback={<CosmosLoader />}>
          <SolarSystem />
        </Suspense>
      </div>
      <Suspense fallback={null}>
        <ScenarioSimulator />
      </Suspense>
    </>
  )
}
