import { runAllCalculations } from './calculations';

/**
 * Generate Sensitivity Analysis Data (Tornado Chart)
 */
export const generateSensitivityAnalysis = (baseInputs) => {
  const variables = [
    { key: 'annualRevenue', name: 'Annual Revenue' },
    { key: 'variableCostPct', name: 'Variable Cost %', inverse: true }, // Higher cost = lower NPV
    { key: 'wacc', name: 'Discount Rate (WACC)', inverse: true },
    { key: 'equipmentCost', name: 'Initial Equipment Cost', inverse: true },
    { key: 'salvageValue', name: 'Salvage Value' },
    { key: 'projectLife', name: 'Project Life' }
  ];

  const baseNPV = runAllCalculations(baseInputs).npv;
  const results = [];

  variables.forEach(variable => {
    // -20%, -10%, +10%, +20%
    const variations = [-0.2, -0.1, 0.1, 0.2];
    const seriesData = { name: variable.name, baseNPV };
    
    variations.forEach(pct => {
      const inputs = { ...baseInputs };
      
      // Handle project life specially to keep it an integer
      if (variable.key === 'projectLife') {
        inputs.projectLife = Math.round(baseInputs.projectLife * (1 + pct));
      } else {
        inputs[variable.key] = baseInputs[variable.key] * (1 + pct);
      }
      
      const res = runAllCalculations(inputs);
      const label = pct > 0 ? `plus${Math.round(pct*100)}` : `minus${Math.round(Math.abs(pct)*100)}`;
      seriesData[label] = res.npv;
    });
    
    // Impact = absolute difference between -20% and +20%
    seriesData.impact = Math.abs(seriesData.plus20 - seriesData.minus20);
    results.push(seriesData);
  });

  // Sort by highest impact
  return results.sort((a, b) => b.impact - a.impact);
};

/**
 * Generate Best, Base, Worst Scenario comparison
 */
export const generateScenarioAnalysis = (baseInputs) => {
  // Best Scenario: Revenue +20%, Var Cost -20%, WACC -20%, Salvage +20%
  const bestInputs = {
    ...baseInputs,
    annualRevenue: baseInputs.annualRevenue * 1.2,
    variableCostPct: baseInputs.variableCostPct * 0.8,
    wacc: baseInputs.wacc * 0.8,
    salvageValue: baseInputs.salvageValue * 1.2
  };
  
  // Worst Scenario: Revenue -20%, Var Cost +20%, WACC +20%, Salvage -20%
  const worstInputs = {
    ...baseInputs,
    annualRevenue: baseInputs.annualRevenue * 0.8,
    variableCostPct: baseInputs.variableCostPct * 1.2,
    wacc: baseInputs.wacc * 1.2,
    salvageValue: baseInputs.salvageValue * 0.8
  };

  return {
    best: runAllCalculations(bestInputs),
    base: runAllCalculations(baseInputs),
    worst: runAllCalculations(worstInputs)
  };
};
