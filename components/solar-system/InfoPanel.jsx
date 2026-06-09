export default function InfoPanel({ planet, onClose }) {
  if (!planet) return null

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: 10,
      backgroundColor: 'rgba(0,0,0,0.85)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '12px',
      padding: '20px',
      width: '260px',
      color: 'white',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '22px' }}>{planet.name}</h2>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>
      <hr style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '12px 0' }} />
      <p style={{ margin: '8px 0', fontSize: '14px' }}>
        <strong>Distance from Sun:</strong><br />{planet.distanceFromSun}
      </p>
      <p style={{ margin: '8px 0', fontSize: '14px' }}>
        <strong>Size (radius):</strong><br />{planet.size} units
      </p>
      <p style={{ margin: '8px 0', fontSize: '14px', color: '#aef' }}>
        <strong>Fun Fact:</strong><br />{planet.funFact}
      </p>
    </div>
  )
}