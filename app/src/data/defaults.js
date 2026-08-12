export const scenarios = {
  alpha: {
    id: 'alpha',
    name: 'Full Automation (Alpha)',
    equipmentCost: 4034000,
    installationCost: 770000,
    workingCapital: 480000,
    projectLife: 8,
    annualRevenue: 3200000,
    fixedCosts: 680000,
    variableCostPct: 42,
    taxRate: 9,
    salvageValue: 600000,
    wacc: 11
  },
  beta: {
    id: 'beta',
    name: 'Semi-Automation (Beta)',
    equipmentCost: 1556000,
    installationCost: 344000,
    workingCapital: 320000,
    projectLife: 8,
    annualRevenue: 2088000,
    fixedCosts: 520000,
    variableCostPct: 48,
    taxRate: 9,
    salvageValue: 280000,
    wacc: 11
  },
  gamma: {
    id: 'gamma',
    name: 'Status Quo (Gamma)',
    equipmentCost: 0,
    installationCost: 0,
    workingCapital: 200000,
    projectLife: 8, // Modeled as 8 years for comparability
    annualRevenue: 1152000,
    fixedCosts: 380000,
    variableCostPct: 55,
    taxRate: 9,
    salvageValue: 0,
    wacc: 11
  }
};

export const defaultScenario = scenarios.alpha;
