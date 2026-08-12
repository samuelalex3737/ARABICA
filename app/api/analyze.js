import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { inputs, results, mlProbability } = req.body;

    if (!inputs || !results) {
      return res.status(400).json({ error: 'Missing inputs or results data.' });
    }

    // Use environment variable, fallback to dummy string if not set (for local dev without key)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      // Return a simulated response if API key is missing (e.g., local dev)
      return res.status(200).json({
        recommendation: "Accept",
        confidence: "High",
        narrative: "This is a placeholder response because the ANTHROPIC_API_KEY environment variable is not set. In production, this would be a detailed analysis from Claude 3.5 Sonnet. The project appears favorable based on the NPV and IRR metrics provided.",
        keyDrivers: ["Revenue Growth", "Low Variable Costs"],
        risks: ["Market saturation", "Equipment depreciation"]
      });
    }

    const anthropic = new Anthropic({ apiKey });

    const systemPrompt = `You are a Senior Corporate Finance Analyst advising the CFO of Hajar Coffee Co. on a capital budgeting decision.
Analyze the provided financial data and provide a recommendation.
Your response MUST be a raw JSON object matching this schema exactly (no markdown formatting, no code blocks):
{
  "recommendation": "Accept" | "Reject" | "Hold",
  "confidence": "High" | "Medium" | "Low",
  "narrative": "A 2-3 paragraph professional analysis explaining the rationale.",
  "keyDrivers": ["Array", "of", "3", "key", "drivers"],
  "risks": ["Array", "of", "2-3", "key", "risks"]
}`;

    const userPrompt = `Please analyze this capital budgeting scenario:
    
Scenario Name: ${inputs.name}
Initial Investment: AED ${inputs.equipmentCost + inputs.installationCost + inputs.workingCapital}
Project Life: ${inputs.projectLife} years
WACC: ${inputs.wacc}%

Outputs:
NPV: AED ${results.npv}
IRR: ${results.irr}%
MIRR: ${results.mirr}%
Payback Period: ${results.paybackPeriod} years
PI: ${results.pi}
ML Model Accept Probability: ${(mlProbability * 100).toFixed(1)}%

Provide your analysis in the requested JSON format.`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      temperature: 0.2,
      system: systemPrompt,
      messages: [
        { role: "user", content: userPrompt }
      ]
    });

    const rawText = response.content[0].text;
    
    try {
      const parsedJson = JSON.parse(rawText);
      return res.status(200).json(parsedJson);
    } catch (parseError) {
      // In case Claude returns markdown wrapped json
      const cleanedText = rawText.replace(/```json\n?|\n?```/g, '');
      return res.status(200).json(JSON.parse(cleanedText));
    }

  } catch (error) {
    console.error('Claude API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate analysis',
      details: error.message 
    });
  }
}
