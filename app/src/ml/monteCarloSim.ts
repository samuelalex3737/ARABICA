/**
 * Monte Carlo Simulator for ML Training Data
 * 
 * Generates capital budgeting scenarios using a seeded PRNG.
 */
import { runAllCalculations } from '../engine/calculations.js';

// Seeded PRNG (Mulberry32)
export function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

// Global seeded RNG instance for training
let random = mulberry32(42);

// Normal distribution using Box-Muller transform
export function randomNormal(mean, stdDev) {
  let u = 0, v = 0;
  while(u === 0) u = random(); // Converting [0,1) to (0,1)
  while(v === 0) v = random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * stdDev + mean;
}

export function randomUniform(min, max) {
  return random() * (max - min) + min;
}

export function randomInt(min, max) {
  return Math.floor(randomUniform(min, max + 1));
}

/**
 * Generates N samples of capital budgeting scenarios.
 * Returns an array of feature objects and an array of binary labels (1 if NPV > 0).
 */
export function generateTrainingData(n_samples = 50000) {
  const features = [];
  const labels = [];
  
  // Re-seed to ensure reproducibility
  random = mulberry32(42);

  for (let i = 0; i < n_samples; i++) {
    // 1. Generate random inputs based on realistic distributions
    const inputs = {
      equipmentCost: randomUniform(0, 8000000),
      // We'll treat installation as ~15-20% of equipment cost to be realistic
      installationCost: 0, 
      workingCapital: randomUniform(100000, 600000),
      projectLife: randomInt(4, 12),
      annualRevenue: Math.max(500000, randomNormal(3200000, 640000)),
      fixedCosts: Math.max(100000, randomNormal(680000, 136000)),
      variableCostPct: randomUniform(25, 65), // 25% to 65%
      taxRate: randomUniform(0, 20), // 0% to 20%
      salvageValue: 0, // calculated below
      wacc: randomUniform(5, 20) // 5% to 20%
    };
    
    // Correlated variables
    inputs.installationCost = inputs.equipmentCost * randomUniform(0.1, 0.25);
    const salvagePct = randomUniform(0, 0.25);
    inputs.salvageValue = (inputs.equipmentCost + inputs.installationCost) * salvagePct;
    
    // 2. Calculate NPV
    const results = runAllCalculations(inputs);
    const npv = results.npv;
    
    // 3. Store raw feature array for the model
    // Order: [initialInv, annualRev, varCostPct, fixedCosts, wacc, projLife, salvagePct, taxRate]
    const initialInv = inputs.equipmentCost + inputs.installationCost + inputs.workingCapital;
    
    features.push([
      initialInv,
      inputs.annualRevenue,
      inputs.variableCostPct,
      inputs.fixedCosts,
      inputs.wacc,
      inputs.projectLife,
      salvagePct,
      inputs.taxRate
    ]);
    
    // 4. Store label (1 if Accept, 0 if Reject)
    labels.push(npv > 0 ? 1 : 0);
  }
  
  return { features, labels };
}
