export function buildCustomPrompt(question) {
  return `You are a strict space scientist evaluating hypothetical cosmic scenarios. 

User's scenario: "${question}"

First, determine if this scenario is a valid, coherent question related to space, astronomy, physics, or planetary science. 
If the scenario is complete gibberish (e.g. keyboard smashes), unrelated to space (e.g. politics, pop culture, food, pizza), or entirely nonsensical, you MUST reject it by responding with this exact JSON:
{
  "error": "I can only simulate scientific space scenarios. Please ask something related to astronomy, planets, or physics!"
}

If the scenario IS a valid space/astronomy question, respond in this exact JSON format:
{
  "explanation": "2-3 sentence scientific explanation",
  "impact": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"],
  "timeline": {
    "oneYear": "What happens in the first year",
    "tenYears": "What changes over 10 years",
    "hundredYears": "The long-term outcome after 100 years"
  },
  "howItCouldHappen": ["real scientific mechanism or event that could cause this", "another plausible trigger", "theoretical possibility"]
}

Be scientific but readable. Focus on physics, astronomy, and effects on life.`
}

export const prompts = {
  'two-moons': `You are a space scientist. Answer this scenario: "What if Earth had two moons?"

Respond in this exact JSON format:
{
  "explanation": "2-3 sentence scientific explanation of the immediate effects",
  "impact": ["bullet point 1", "bullet point 2", "bullet point 3", "bullet point 4"],
  "timeline": {
    "oneYear": "What happens in the first year",
    "tenYears": "What changes over 10 years",
    "hundredYears": "What Earth looks like after 100 years"
  },
  "howItCouldHappen": ["A large Mars-sized body collides with early Earth, splitting off two separate moons", "A captured asteroid enters a stable co-orbital resonance with the existing Moon", "A rogue dwarf planet from the outer solar system is gravitationally captured into Earth orbit"]
}

Be scientific but readable. Focus on tidal forces, orbital mechanics, and effects on life.`,

  'jupiter-disappear': `You are a space scientist. Answer this scenario: "What if Jupiter suddenly disappeared?"

Respond in this exact JSON format:
{
  "explanation": "2-3 sentence scientific explanation of the immediate effects",
  "impact": ["bullet point 1", "bullet point 2", "bullet point 3", "bullet point 4"],
  "timeline": {
    "oneYear": "What happens in the first year",
    "tenYears": "What changes over 10 years",
    "hundredYears": "What the solar system looks like after 100 years"
  },
  "howItCouldHappen": ["A runaway antimatter reaction could theoretically annihilate Jupiter's mass instantly", "Collision with a rogue black hole passing through the solar system", "In theoretical physics, quantum vacuum decay could destabilize a planetary body of sufficient mass"]
}

Be scientific but readable. Focus on asteroid belt destabilisation, comet trajectories, and Earth's exposure to impacts.`,

  'asteroid-hit-mars': `You are a space scientist. Answer this scenario: "What if a massive asteroid hit Mars?"

Respond in this exact JSON format:
{
  "explanation": "2-3 sentence scientific explanation of the immediate effects",
  "impact": ["bullet point 1", "bullet point 2", "bullet point 3", "bullet point 4"],
  "timeline": {
    "oneYear": "What happens in the first year",
    "tenYears": "What changes over 10 years",
    "hundredYears": "What Mars looks like after 100 years"
  },
  "howItCouldHappen": ["A Ceres-class asteroid perturbed from the main belt by Jupiter resonance could reach Mars-crossing orbit within thousands of years", "A long-period comet from the Oort Cloud with an unfortunate trajectory, statistically possible on geological timescales", "Jupiter's gravity occasionally ejects large objects from the asteroid belt onto planet-crossing trajectories"]
}

Be scientific but readable. Focus on ejecta, atmospheric changes, seismic activity, and implications for future Mars missions.`,

  'sun-brighter': `You are a space scientist. Answer this scenario: "What if the Sun suddenly became 20% brighter?"

Respond in this exact JSON format:
{
  "explanation": "2-3 sentence scientific explanation of the immediate effects",
  "impact": ["bullet point 1", "bullet point 2", "bullet point 3", "bullet point 4"],
  "timeline": {
    "oneYear": "What happens in the first year",
    "tenYears": "What changes over 10 years",
    "hundredYears": "What Earth and the solar system look like after 100 years"
  },
  "howItCouldHappen": ["The Sun naturally brightens ~1% every 100 million years. A sudden jump could occur if the core fusion rate spiked due to unknown instability", "A large stellar flare or series of superflares could temporarily boost luminosity by this margin", "Theoretical: injection of exotic matter into the solar core could accelerate the proton-proton chain reaction"]
}

Be scientific but readable. Focus on solar radiation, Earth's temperature, ocean evaporation, and habitability.`,

  'rogue-planet': `You are a space scientist. Answer this scenario: "What if a rogue planet entered our solar system?"

Respond in this exact JSON format:
{
  "explanation": "2-3 sentence scientific explanation of the immediate effects",
  "impact": ["bullet point 1", "bullet point 2", "bullet point 3", "bullet point 4"],
  "timeline": {
    "oneYear": "What happens in the first year",
    "tenYears": "What changes over 10 years",
    "hundredYears": "What the solar system looks like after 100 years"
  },
  "howItCouldHappen": ["Rogue planets — ejected from their home systems during formation — are estimated to outnumber stars in the galaxy; one could be on a trajectory toward our solar system", "A close stellar encounter billions of years ago could have scattered a distant planet onto a hyperbolic path that only now intersects our system", "Gravitational lensing surveys suggest rogue planets are common, and statistical probability over 5 billion years makes a close encounter plausible"]
}

Be scientific but readable. Focus on gravitational disruption, orbital chaos, potential collisions, and long-term solar system destabilisation.`,

  'sun-dies': `You are a space scientist. Answer this scenario: "What if the Sun started dying and expanding into a red giant?"

Respond in this exact JSON format:
{
  "explanation": "2-3 sentence scientific explanation of the immediate effects",
  "impact": ["bullet point 1", "bullet point 2", "bullet point 3", "bullet point 4"],
  "timeline": {
    "oneYear": "What happens in the first year",
    "tenYears": "What changes over 10 years",
    "hundredYears": "What Earth and the solar system look like after 100 years"
  },
  "howItCouldHappen": ["In approximately 5 billion years the Sun will naturally exhaust its hydrogen fuel, causing core contraction and outer layer expansion into a red giant that engulfs Mercury and Venus", "A sudden decrease in core fusion efficiency — perhaps from exotic particle interactions — could accelerate the transition to a subgiant phase over centuries instead of billions of years", "Theoretical: a macroscopic quantum tunneling event in the stellar core could trigger premature helium flash, rapidly changing the Sun's energy output and radius"]
}

Be scientific but readable. Focus on solar luminosity changes, orbital shifts, habitability loss, and the fate of Earth.`,

  'earth-stops': `You are a space scientist. Answer this scenario: "What if Earth suddenly stopped rotating?"

Respond in this exact JSON format:
{
  "explanation": "2-3 sentence scientific explanation of the immediate effects",
  "impact": ["bullet point 1", "bullet point 2", "bullet point 3", "bullet point 4"],
  "timeline": {
    "oneYear": "What happens in the first year",
    "tenYears": "What changes over 10 years",
    "hundredYears": "What Earth looks like after 100 years"
  },
  "howItCouldHappen": ["A near-miss with a rogue planet or large brown dwarf could tidally lock Earth through extreme angular momentum transfer", "Theoretical: a sufficiently powerful directed-energy weapon or mass driver operating over decades could gradually brake Earth's rotation", "In the far future, tidal friction from the Moon is already slowly decelerating Earth's rotation — if this process accelerated dramatically it could halt rotation within millennia"]
}

Be scientific but readable. Focus on 6-month days and nights, atmospheric redistribution, magnetic field collapse, and the effect on life.`,

  'solar-flare': `You are a space scientist. Answer this scenario: "What if a massive solar flare hit Earth directly?"

Respond in this exact JSON format:
{
  "explanation": "2-3 sentence scientific explanation of the immediate effects",
  "impact": ["bullet point 1", "bullet point 2", "bullet point 3", "bullet point 4"],
  "timeline": {
    "oneYear": "What happens in the first year",
    "tenYears": "What changes over 10 years",
    "hundredYears": "What Earth looks like after 100 years"
  },
  "howItCouldHappen": ["The 1859 Carrington Event demonstrated that X-class solar flares can send coronal mass ejections strong enough to destroy telegraph infrastructure; a repeat today would be catastrophic", "During solar maximum, active sunspot regions can produce X20+ flares; a direct Earth-strike from such an event occurs roughly every few centuries", "Theoretical: a solar energetic particle storm combined with a Carrington-class CME could compress Earth's magnetosphere to within geosynchronous orbit, exposing the surface to direct particle radiation"]
}

Be scientific but readable. Focus on EMP effects, power grid destruction, satellite loss, radiation exposure, and long-term civilisation impact.`,
}
