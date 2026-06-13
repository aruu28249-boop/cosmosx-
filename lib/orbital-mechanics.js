// Simplified mean-longitude orbital mechanics (~1° accuracy)
// Using mean orbital elements at J2000.0 epoch (Jan 1.5, 2000)

const J2000 = 2451545.0

// L0: mean longitude at J2000 (degrees), n: mean motion (degrees/day)
const ELEMENTS = {
  Mercury: { L0: 252.2509, n: 4.092335 },
  Venus:   { L0: 181.9798, n: 1.602136 },
  Earth:   { L0: 100.4664, n: 0.985647 },
  Mars:    { L0: 355.4533, n: 0.524071 },
  Jupiter: { L0:  34.3515, n: 0.083056 },
  Saturn:  { L0:  50.0774, n: 0.033459 },
  Uranus:  { L0: 314.0550, n: 0.011730 },
  Neptune: { L0: 304.3487, n: 0.005980 },
}

function toJulianDate(date) {
  const y = date.getUTCFullYear()
  const m = date.getUTCMonth() + 1
  const d = date.getUTCDate()
  const A = Math.floor((14 - m) / 12)
  const Y = y + 4800 - A
  const M = m + 12 * A - 3
  return (
    d +
    Math.floor((153 * M + 2) / 5) +
    365 * Y +
    Math.floor(Y / 4) -
    Math.floor(Y / 100) +
    Math.floor(Y / 400) -
    32045
  )
}

// Returns angles in radians for all 8 planets for a given Date
export function getPlanetAngles(date) {
  const d = date instanceof Date ? date : new Date(date)
  const jd = toJulianDate(d)
  const T = jd - J2000
  const result = {}
  for (const [name, el] of Object.entries(ELEMENTS)) {
    const L = el.L0 + el.n * T
    result[name] = (L * Math.PI) / 180
  }
  return result
}
