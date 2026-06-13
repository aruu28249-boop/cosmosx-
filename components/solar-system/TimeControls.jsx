const CONTROLS = [
  { label: '⏸', title: 'Pause',      value: 0   },
  { label: '▶', title: 'Play',       value: 1   },
  { label: '⚡', title: '10× Speed', value: 10  },
  { label: '🚀', title: '100× Speed', value: 100 },
]

export default function TimeControls({ multiplier, setMultiplier }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 30,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 10px',
      borderRadius: '40px',
      background: 'rgba(5,8,22,0.75)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.10)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <span style={{
        fontSize: '9px', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.7)',
        fontFamily: 'sans-serif', paddingRight: '6px',
        borderRight: '1px solid rgba(255,255,255,0.2)', marginRight: '2px', whiteSpace: 'nowrap',
      }}>TIME</span>

      {CONTROLS.map((ctrl) => {
        const isActive = multiplier === ctrl.value
        return (
          <button key={ctrl.value} onClick={() => setMultiplier(ctrl.value)} title={ctrl.title} style={{
            width: '38px', height: '38px', borderRadius: '50%',
            border: isActive ? '1.5px solid rgba(255,255,255,0.5)' : '1px solid rgba(255,255,255,0.1)',
            backgroundColor: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
            color: isActive ? '#fff' : 'rgba(255,255,255,0.75)',
            cursor: 'pointer', fontSize: '15px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxShadow: isActive ? '0 0 12px rgba(255,255,255,0.2)' : 'none',
          }}>
            {ctrl.label}
          </button>
        )
      })}

      <span style={{
        fontSize: '10px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.8)',
        fontFamily: 'monospace', paddingLeft: '6px',
        borderLeft: '1px solid rgba(255,255,255,0.2)', marginLeft: '2px',
        minWidth: '36px', whiteSpace: 'nowrap',
      }}>
        {multiplier === 0 ? 'PAUSED' : multiplier === 1 ? '1×' : `${multiplier}×`}
      </span>
    </div>
  )
}
