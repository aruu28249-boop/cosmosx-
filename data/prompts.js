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
  }
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
  }
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
  }
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
  }
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
  }
}

Be scientific but readable. Focus on solar radiation, Earth's temperature, ocean evaporation, and habitability.`,
}
