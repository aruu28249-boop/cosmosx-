export default function InfoPanel({ planet, onClose, onExploreSurface }) {
  if (!planet) return null

  const accentColors = {
    Earth:   '#2979ff',
    Mars:    '#ff3d00',
    Jupiter: '#ff9800',
  }
  const accent = accentColors[planet.name] ?? '#aaaaff'

  return (
    <div style={{
      position: 'absolute',
      top: '16px',
      right: '16px',
      zIndex: 30,
      width: '270px',
      borderRadius: '18px',
      overflow: 'hidden',
      background: 'rgba(5,8,22,0.92)',
      backdropFilter: 'blur(20px)',
      border: `1px solid ${accent}55`,
      boxShadow: `0 0 40px ${accent}33, 0 20px 60px rgba(0,0,0,0.6)`,
      color: 'white',
      fontFamily: 'sans-serif',
      animation: 'panelIn 0.3s ease',
    }}>
      <style>{`
        @keyframes panelIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>

      {/* Coloured header bar */}
      <div style={{
        padding: '14px 18px 12px',
        background: `linear-gradient(135deg, ${accent}22 0%, transparent 100%)`,
        borderBottom: `1px solid ${accent}33`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: '11px', letterSpacing: '0.15em', opacity: 0.5, marginBottom: '3px' }}>
            PLANET
          </div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: accent }}>
            {planet.name}
          </h2>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '14px',
            width: '32px', height: '32px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          padding: '10px 14px',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}>
          <span style={{ fontSize: '11px', opacity: 0.5, letterSpacing: '0.1em' }}>DISTANCE FROM SUN</span>
          <span style={{ fontSize: '12px', textAlign: 'right', maxWidth: '120px', opacity: 0.9 }}>
            {planet.distanceFromSun}
          </span>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 14px',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}>
          <span style={{ fontSize: '11px', opacity: 0.5, letterSpacing: '0.1em' }}>RADIUS (3D)</span>
          <span style={{ fontSize: '12px', opacity: 0.9 }}>{planet.size} units</span>
        </div>

        <div style={{
          padding: '12px 14px',
          borderRadius: '10px',
          background: `${accent}12`,
          border: `1px solid ${accent}33`,
          fontSize: '12px',
          lineHeight: '1.65',
          color: 'rgba(255,255,255,0.8)',
        }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.12em', marginBottom: '6px', color: accent, opacity: 0.8 }}>
            ✦ FUN FACT
          </div>
          {planet.funFact}
        </div>

        {/* Explore Surface button */}
        <button
          onClick={() => onExploreSurface?.(planet.name)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '10px',
            border: `1px solid ${accent}55`,
            background: `${accent}18`,
            color: accent,
            fontSize: '11px',
            letterSpacing: '0.12em',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'sans-serif',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${accent}30` }}
          onMouseLeave={e => { e.currentTarget.style.background = `${accent}18` }}
        >
          ⬡ EXPLORE SURFACE
        </button>
      </div>
    </div>
  )
}
