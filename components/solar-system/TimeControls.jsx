'use client'
import { useState, useEffect, useRef } from 'react'
import { Pause, Play, Zap, Rocket, X } from 'lucide-react'

const CONTROLS = [
  {
    icon: <Pause size={15} />, title: 'Pause', value: 0,
    text: 'Everything stops. In reality, halting planetary motion is physically impossible. The gravitational forces holding orbits together never rest. If time truly froze, all living things would hang suspended mid-breath. No star would burn. No atom would decay. The universe would simply wait, forever.',
    modal: {
      title: 'Time Frozen',
      heroImage: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1280&q=80',
      body: [
        `What you're looking at right now, the planets drifting in silence and the Sun burning at the centre, has all stopped. Not slowed. Stopped. Every photon that left the Sun 8 minutes ago is frozen mid-journey. Every heartbeat of every animal on Earth is suspended between one beat and the next. The oceans are glassy, motionless. Wind does not move. Dust does not fall.`,
        `In physics, nothing like this can actually happen. Time is not a river that can be dammed. It is woven into the fabric of space itself. According to Einstein's general relativity, time flows differently depending on gravity and velocity, but it cannot reach zero without infinite energy. Near a black hole, time slows to a near crawl from the outside observer's perspective, but it never fully stops, not even there.`,
        `The closest thing we have to frozen time in nature is a neutron star, an object so dense that its surface gravity is 200 billion times stronger than Earth's. A clock on the surface of a neutron star runs about 30% slower than one in open space. But even there, time flows. Atoms decay. Things change. The universe insists on moving forward.`,
        `If you could somehow freeze time for everything except yourself, you would be the only thing in existence experiencing time. You would walk through a universe of statues. Light would be frozen mid-ray. You could hold a beam of sunlight in your hands, a stream of photons going nowhere. You could stand between two colliding galaxies and feel nothing, because the collision would never arrive.`,
        `But the moment you unfroze time, everything would resume exactly where it left off. No memory of the pause. No evidence it happened. The universe doesn't leave footprints in stopped time.`,
      ],
      midImage: 'https://images.unsplash.com/photo-1446941611757-91d2c3bd3d45?w=1280&q=80',
      verdict: 'impossible',
      verdictText: 'Time cannot stop. This defies every known law of physics. But it reveals something profound: the universe is not a stage on which time passes. Time is the universe itself, moving forward whether we want it to or not.',
    },
  },
  {
    icon: <Play size={15} />, title: 'Real Time', value: 1,
    text: 'This is our reality. Earth drifts at 107,000 km/h through space, yet we feel nothing. Life evolved perfectly tuned to this rhythm. We exist in an extraordinarily narrow window of cosmic luck.',
    modal: {
      title: 'Real Time',
      heroImage: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1280&q=80',
      body: [
        `Right now, you are moving at 107,000 kilometres per hour around the Sun. The Sun itself is hurtling at 828,000 km/h around the Milky Way. The entire galaxy is rushing toward the Great Attractor at roughly 2.2 million km/h. And you feel absolutely none of it. That is perhaps the most astonishing fact in all of physics: the universe is screaming past us, and we sit here sipping coffee.`,
        `Earth's orbit is not the only thing tuned for life. The Moon is precisely large enough and precisely far away to stabilise Earth's axial tilt between 22.1° and 24.5°, a narrow range that keeps our seasons predictable over millions of years. Without the Moon, Earth's tilt would chaotically swing between 0° and 85° on timescales of tens of millions of years. Ice would periodically cover everything, then everything would bake. Complex life would almost certainly never emerge.`,
        `Jupiter, the giant behind us, acts as a gravitational shield. Its enormous mass flings incoming asteroids and comets out of the inner solar system before they can reach us. Scientists estimate that without Jupiter, Earth would suffer catastrophic asteroid impacts 1,000 times more frequently. Life might not survive long enough to become complex.`,
        `Even the Sun's position in the galaxy matters. We orbit at roughly 26,000 light-years from the galactic centre, far enough to avoid the dense radiation storms of the core and close enough to have accumulated the heavy elements (iron, carbon, oxygen) that complex chemistry requires. Stars near the core are blasted with gamma radiation. Stars at the outer edge lack the metals life needs. We are in the Goldilocks lane of the galaxy itself.`,
        `All of it, the Moon's size, Jupiter's position, Earth's distance from the Sun, our position in the Milky Way, could have been different. The probability of all of it aligning is staggeringly small. Which means that this moment, this exact speed, this exact configuration is either an extraordinary accident, or we're missing something profound about why the universe produces life.`,
      ],
      midImage: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=1280&q=80',
      verdict: 'thriving',
      verdictText: 'Life doesn\'t just survive at this speed. It explodes into extraordinary complexity. But the margin is razor thin. Change Earth\'s distance from the Sun by 5%, or remove the Moon, or move Earth to the galactic core, and we simply never exist.',
    },
  },
  {
    icon: <Zap size={15} />, title: '10× Speed', value: 10,
    text: 'At this rate a human lifetime compresses into under 8 years of observation. You would watch ecosystems collapse and regrow through ice ages. The Moon slowly drifts further. Life adapts, or perishes.',
    modal: {
      title: '10× Speed',
      heroImage: 'https://images.unsplash.com/photo-1477601263568-180e2c6d046e?w=1280&q=80',
      body: [
        `At 10× speed, a human lifetime of 80 years passes in 8 years of watching. Generations flash by. Forests grow and are cleared and grow again. But stretch this out to the scales that matter — 10,000 years, 100,000 years — and the Earth becomes unrecognisable. This is the timescale of ice ages, of the rise and fall of entire civilisations, of species carving new ecological niches out of catastrophe.`,
        `Ice ages are perhaps the most dramatic feature of this timescale. They are not random — they follow Milankovitch cycles, predictable wobbles in Earth's orbit and axial tilt that shift how much solar energy reaches the high latitudes. Roughly every 100,000 years, glaciers advance from the poles and cover much of North America and Europe in ice a kilometre thick. Sea levels drop 120 metres as water locks into ice sheets. Britain becomes joined to mainland Europe. The Sahara fills with grass and lakes.`,
        `The last ice age ended just 11,700 years ago, a blink in cosmic time. Human civilisation, every empire, every city, every war, fits entirely within this brief warm interlude between ice ages. We live in what geologists call the Holocene, an unusually stable period that allowed agriculture, which allowed cities, which allowed everything else. Without this stability, we'd still be following herds across frozen tundra.`,
        `74,000 years ago, the Toba supervolcano in Indonesia erupted with the force of 2.8 million Hiroshima bombs. It ejected 2,800 cubic kilometres of ash into the atmosphere, triggering a volcanic winter that may have lasted a decade. Genetic evidence suggests the human population collapsed to somewhere between 3,000 and 10,000 individuals. We nearly went extinct. The entire living human family — every person who has ever lived since — descends from those survivors.`,
        `At this timescale, the Moon is slowly drifting away from Earth at 3.8 cm per year. In 600 million years it will be too far away to cause total solar eclipses. In 1 to 2 billion years, tidal forces will have slowed Earth's rotation to a 30-hour day. The tides will be weaker. Ocean circulation will change. Life will adapt, as it always has, or it won't.`,
      ],
      midImage: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1280&q=80',
      verdict: 'vulnerable',
      verdictText: 'Life persists, but it is repeatedly broken and rebuilt. 99% of all species that have ever existed are already extinct. At this timescale, mass extinction is not a possibility. It is a recurring fact. What survives is what adapts fastest.',
    },
  },
  {
    icon: <Rocket size={15} />, title: '100× Speed', value: 100,
    text: 'A century passes every year of watching. You witness continental drift, the slow death of oceans, and ultimately the Sun swelling to swallow the inner planets. Everything ends.',
    modal: {
      title: '100× Speed',
      heroImage: 'https://images.unsplash.com/photo-1532798369041-b33eb576ef16?w=1280&q=80',
      body: [
        `At 100× speed, a century of real time passes every year you watch. The entire span of recorded human history — 5,000 years from ancient Sumer to the present — would pass in 50 years of observation. Every empire, every revolution, every technological leap compressed into an afternoon. And then the real changes begin.`,
        `The continents are moving. Right now, Africa is colliding with Europe at roughly the speed your fingernails grow, about 2 centimetres per year. At 100×, that becomes 2 metres per year, and over millions of years you would watch the Mediterranean Sea close entirely as the two continents crunch together, throwing up a new mountain range comparable to the Himalayas. In 250 million years, all land masses converge into a new supercontinent geologists have named Pangaea Proxima.`,
        `The Sun is the real story. It has been brightening for 4.5 billion years at roughly 1% per 100 million years — a tiny change, but compounding relentlessly. In 500 million years the Sun will be bright enough that average temperatures on Earth exceed 50°C permanently. CO₂ levels will collapse as carbonate rocks form faster than volcanoes can replenish the gas. Plants — which need a minimum of ~150 ppm CO₂ — will begin dying. Without plants, the food chain collapses from the bottom up.`,
        `In 1 billion years, the oceans begin to evaporate. Water vapour rises into the stratosphere, where UV radiation splits it into hydrogen (which escapes to space) and oxygen. The oceans do not return. Earth's surface temperature climbs past 70°C, then 100°C, then higher. The planet that birthed every living thing that has ever existed becomes a scorched rock — indistinguishable from Venus, which underwent the same runaway greenhouse process billions of years earlier.`,
        `In 5 billion years, the Sun exhausts the hydrogen in its core. It swells into a red giant, expanding to perhaps 200 times its current diameter. Mercury and Venus are certainly vaporised. Whether Earth is swallowed depends on models that differ by a few percent — but even if Earth survives physically, its surface will be molten. The oceans are long gone. The atmosphere is long gone. Nothing remains. And 2 billion years after that, the Sun's outer layers drift away as a planetary nebula, and all that remains is a dim white dwarf the size of Earth, slowly cooling for trillions of years in the dark.`,
      ],
      midImage: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1280&q=80',
      verdict: 'doomed',
      verdictText: 'At this timescale, Earth\'s destruction is not a risk to be managed. It is a scheduled event. The only open question is whether anything that emerged from this planet will be somewhere else when it happens.',
    },
  },
]

const VERDICT_STYLES = {
  impossible: { color: '#a78bfa', label: 'VERDICT: PHYSICALLY IMPOSSIBLE' },
  thriving:   { color: '#34d399', label: 'VERDICT: LIFE THRIVES' },
  vulnerable: { color: '#f59e0b', label: 'VERDICT: LIFE IS VULNERABLE' },
  doomed:     { color: '#ef4444', label: 'VERDICT: EARTH IS DOOMED' },
}

function LearnMoreModal({ ctrl, onClose }) {
  const m = ctrl.modal
  const verdict = VERDICT_STYLES[m.verdict]

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div style={{
        width: '820px', maxWidth: '95vw', maxHeight: '90vh',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.1) transparent',
        background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(32px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '20px', overflowY: 'auto', overflowX: 'hidden',
        fontFamily: 'sans-serif', color: 'white',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
      }}>

        {/* Hero image */}
        <div style={{ position: 'relative', width: '100%', height: '280px', flexShrink: 0 }}>
          <img
            src={m.heroImage} alt={m.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { e.target.style.display = 'none' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)',
          }} />
          {/* Close button */}
          <button onClick={onClose} style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '10px', color: 'rgba(255,255,255,0.8)',
            width: '36px', height: '36px', cursor: 'pointer', fontSize: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}><X size={14} /></button>
          {/* Title overlay */}
          <div style={{ position: 'absolute', bottom: '24px', left: '32px' }}>
            <div style={{ fontSize: '30px', fontWeight: 700, letterSpacing: '0.03em', lineHeight: 1.2 }}>{m.title}</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {m.body.map((para, i) => (
            <div key={i}>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.85, margin: 0 }}>{para}</p>
              {/* Mid image after 3rd paragraph */}
              {i === 2 && m.midImage && (
                <div style={{ margin: '20px 0 0' }}>
                  <img
                    src={m.midImage} alt="related"
                    style={{ width: '100%', borderRadius: '10px', objectFit: 'cover', maxHeight: '220px', display: 'block' }}
                    onError={e => { e.target.parentElement.style.display = 'none' }}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Verdict */}
          <div style={{
            marginTop: '8px', padding: '18px 22px', borderRadius: '12px',
            background: `${verdict.color}10`,
            border: `1px solid ${verdict.color}40`,
          }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.18em', color: verdict.color, marginBottom: '10px', fontWeight: 600 }}>
              {verdict.label}
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.88)', lineHeight: 1.75 }}>
              {m.verdictText}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FloatingWords({ text, onLearnMore }) {
  const [visible, setVisible] = useState([])
  const [showBtn, setShowBtn] = useState(false)
  const words = text.split(' ')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible([])
    setShowBtn(false)
    const timers = words.map((_, i) =>
      setTimeout(() => setVisible(v => [...v, i]), i * 110)
    )
    const btnTimer = setTimeout(() => setShowBtn(true), words.length * 110 + 400)
    return () => { timers.forEach(clearTimeout); clearTimeout(btnTimer) }
  }, [text])

  return (
    <div style={{
      position: 'absolute', top: '80px', left: '50%',
      transform: 'translateX(-50%)', width: '700px',
      textAlign: 'center', pointerEvents: 'none', zIndex: 25,
      lineHeight: 2.1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px',
    }}>
      <div>
        {words.map((word, i) => (
          <span key={i} style={{
            display: 'inline-block', marginRight: '8px',
            fontSize: '20px', fontFamily: 'sans-serif', letterSpacing: '0.03em',
            color: 'rgba(255,255,255,0.92)',
            opacity: visible.includes(i) ? 1 : 0,
            transform: visible.includes(i) ? 'translateY(0px)' : 'translateY(12px)',
            transition: 'opacity 0.4s ease, transform 0.5s ease',
            textShadow: '0 0 30px rgba(255,255,255,0.25)',
          }}>{word}</span>
        ))}
      </div>
      <button
        onClick={onLearnMore}
        style={{
          pointerEvents: showBtn ? 'auto' : 'none',
          opacity: showBtn ? 1 : 0,
          transform: showBtn ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
          padding: '9px 22px', borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.25)',
          background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)',
          color: 'rgba(255,255,255,0.85)', fontSize: '12px',
          letterSpacing: '0.1em', cursor: 'pointer',
        }}
      >
        LEARN MORE ›
      </button>
    </div>
  )
}

export default function TimeControls({ multiplier, setMultiplier }) {
  const [activeCtrl, setActiveCtrl] = useState(null)
  const [modalCtrl,  setModalCtrl]  = useState(null)
  const clearRef = useRef(null)

  const handleClick = (ctrl) => {
    setMultiplier(ctrl.value)
    setActiveCtrl(ctrl)
    if (clearRef.current) clearTimeout(clearRef.current)
    const wordCount = ctrl.text.split(' ').length
    clearRef.current = setTimeout(() => setActiveCtrl(null), wordCount * 110 + 6000)
  }

  const dismissExplanation = () => {
    if (clearRef.current) clearTimeout(clearRef.current)
    setActiveCtrl(null)
  }

  return (
    <>
      {activeCtrl && (
        <>
          {/* Backdrop — click anywhere to dismiss */}
          <div
            onClick={dismissExplanation}
            style={{
              position: 'absolute', inset: 0,
              zIndex: 24,
              cursor: 'default',
            }}
          />
          <div style={{ position: 'absolute', inset: 0, zIndex: 25, pointerEvents: 'none' }}>
            <FloatingWords
              text={activeCtrl.text}
              onLearnMore={() => { setModalCtrl(activeCtrl); setActiveCtrl(null) }}
            />
          </div>
        </>
      )}
      {modalCtrl && (
        <LearnMoreModal ctrl={modalCtrl} onClose={() => setModalCtrl(null)} />
      )}
      <div style={{
        position: 'absolute', bottom: '24px', left: '50%',
        transform: 'translateX(-50%)', zIndex: 30,
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '6px 10px', borderRadius: '40px',
        background: 'rgba(5,8,22,0.75)', backdropFilter: 'blur(16px)',
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
            <button key={ctrl.value} onClick={() => handleClick(ctrl)} title={ctrl.title} style={{
              width: '38px', height: '38px', borderRadius: '50%',
              border: isActive ? '1.5px solid rgba(255,255,255,0.5)' : '1px solid rgba(255,255,255,0.1)',
              backgroundColor: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.75)',
              cursor: 'pointer', fontSize: '15px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease',
              boxShadow: isActive ? '0 0 12px rgba(255,255,255,0.2)' : 'none',
            }}>
              {ctrl.icon}
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
    </>
  )
}
