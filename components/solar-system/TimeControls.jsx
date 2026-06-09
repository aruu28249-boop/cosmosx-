const CONTROLS = [
  { label: '⏸ Pause', value: 0 },
  { label: '▶ Play',  value: 1 },
  { label: '⚡ 10×',  value: 10 },
  { label: '🚀 100×', value: 100 },
]

export default function TimeControls({ multiplier, setMultiplier }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10,
      display: 'flex',
      gap: '10px'
    }}>
      {CONTROLS.map((ctrl) => (
        <button
          key={ctrl.value}
          onClick={() => setMultiplier(ctrl.value)}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            border: multiplier === ctrl.value
              ? '2px solid white'
              : '1px solid rgba(255,255,255,0.3)',
            backgroundColor: multiplier === ctrl.value
              ? 'rgba(255,255,255,0.2)'
              : 'rgba(0,0,0,0.6)',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontFamily: 'sans-serif'
          }}
        >
          {ctrl.label}
        </button>
      ))}
    </div>
  )
}