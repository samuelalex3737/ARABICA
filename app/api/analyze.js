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

    // Use Grok API key from environment variable
    const apiKey = process.env.XAI_API_KEY;
    
    if (!apiKey) {
      // Return a simulated response if API key is missing (e.g., local dev)
      return res.status(200).json({
        recommendation: "Accept",
        confidence: "High",
        narrative: "This is a placeholder response because the XAI_API_KEY environment variable is not set. In production, this would be a detailed analysis from Grok AI. The project appears favorable based on the NPV and IRR metrics provided. The positive NPV of AED " + (results.npv ? Math.round(results.npv).toLocaleString() : 'N/A') + " indicates that the investment would add value to the firm. The IRR exceeds the hurdle rate (WACC), further supporting acceptance.",
        keyDrivers: ["Positive NPV exceeding hurdle rate", "Strong IRR vs WACC spread", "Favorable Profitability Index"],
        risks: ["Revenue sensitivity to market conditions", "High initial capital commitment", "Equipment obsolescence risk"]
      });
    }

    const systemPrompt = `You are a Senior Corporate Finance Analyst advising the CFO of Hajar Coffee Co., a premium B2B coffee roaster in Dubai, UAE, on a capital budgeting decision.
Analyze the provided financial data and provide a recommendation.
Your response MUST be a raw JSON object matching this schema exactly (no markdown formatting, no code blocks, no explanation outside the JSON):
{
  "recommendation": "Accept" | "Reject" | "Hold",
  "confidence": "High" | "Medium" | "Low",
  "narrative": "A 2-3 paragraph professional analysis explaining the rationale, referencing specific metrics.",
  "keyDrivers": ["Array of 3 key value drivers"],
  "risks": ["Array of 2-3 key risks"]
}`;

    const userPrompt = `Please analyze this capital budgeting scenario for Hajar Coffee Co.:
    
Scenario Name: ${inputs.name || 'Full Automation (Alpha)'}
Initial Investment: AED ${(inputs.equipmentCost + inputs.installationCost + inputs.workingCapital).toLocaleString()}
Equipment Cost: AED ${inputs.equipmentCost?.toLocaleString()}
Installation Cost: AED ${inputs.installationCost?.toLocaleString()}
Working Capital: AED ${inputs.workingCapital?.toLocaleString()}
Project Life: ${inputs.projectLife} years
WACC (Discount Rate): ${inputs.wacc}%
Annual Revenue: AED ${inputs.annualRevenue?.toLocaleString()}
Variable Cost %: ${inputs.variableCostPct}%
Fixed Operating Costs: AED ${inputs.fixedCosts?.toLocaleString()}
Tax Rate: ${inputs.taxRate}%
Salvage Value: AED ${inputs.salvageValue?.toLocaleString()}

Calculated Outputs:
NPV: AED ${Math.round(results.npv)?.toLocaleString()}
IRR: ${results.irr}%
MIRR: ${results.mirr}%
Payback Period: ${results.paybackPeriod} years
Profitability Index: ${results.pi}
ML Model Accept Probability: ${(mlProbability * 100).toFixed(1)}%

Provide your analysis in the requested JSON format only.`;

    // Grok uses OpenAI-compatible API format
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'grok-3-mini',
        temperature: 0.3,
        max_tokens: 1000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Grok API Error:', response.status, errorBody);
      throw new Error(`Grok API returned status ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content;

    if (!rawText) {
      throw new Error('Empty response from Grok API');
    }

    try {
      const parsedJson = JSON.parse(rawText);
      return res.status(200).json(parsedJson);
    } catch (parseError) {
      // In case Grok returns markdown-wrapped JSON
      const cleanedText = rawText.replace(/```json\n?|\n?```/g, '').trim();
      return res.status(200).json(JSON.parse(cleanedText));
    }

  } catch (error) {
    console.error('AI Analysis Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate analysis',
      details: error.message 
    });
  }
}
