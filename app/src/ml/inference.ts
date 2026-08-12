/**
 * ML Inference for the Client
 */
import trainedModel from './trainedWeights.json';

// Sigmoid
function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

// Dot product
function dotProduct(a, b) {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

// Normalize a single input vector
function normalize(inputsArray, scaler) {
  return inputsArray.map((val, j) => (val - scaler.mean[j]) / scaler.std[j]);
}

/**
 * Predict Probability of Accept (NPV > 0)
 * @param {Object} inputs Form inputs object
 * @returns {number} Probability between 0 and 1
 */
export function predictAcceptProbability(inputs) {
  // Reconstruct feature array in the exact same order as training
  // Order: [initialInv, annualRev, varCostPct, fixedCosts, wacc, projLife, salvagePct, taxRate]
  
  const initialInv = inputs.equipmentCost + inputs.installationCost + inputs.workingCapital;
  // Compute implied salvage percentage based on equipment + install cost
  const baseCost = inputs.equipmentCost + inputs.installationCost;
  const salvagePct = baseCost > 0 ? (inputs.salvageValue / baseCost) : 0;
  
  const featureArray = [
    initialInv,
    inputs.annualRevenue,
    inputs.variableCostPct,
    inputs.fixedCosts,
    inputs.wacc,
    inputs.projectLife,
    salvagePct,
    inputs.taxRate
  ];
  
  // Normalize
  const scaled = normalize(featureArray, trainedModel.scaler);
  
  // Inference
  const z = dotProduct(scaled, trainedModel.weights) + trainedModel.bias;
  
  return sigmoid(z);
}

/**
 * Checks if the current inputs are significantly outside the training distribution.
 * Flags if any feature is > 3.5 standard deviations from the training mean.
 */
export function checkOutOfDistribution(inputs) {
  const initialInv = inputs.equipmentCost + inputs.installationCost + inputs.workingCapital;
  const baseCost = inputs.equipmentCost + inputs.installationCost;
  const salvagePct = baseCost > 0 ? (inputs.salvageValue / baseCost) : 0;
  
  const featureArray = [
    initialInv,
    inputs.annualRevenue,
    inputs.variableCostPct,
    inputs.fixedCosts,
    inputs.wacc,
    inputs.projectLife,
    salvagePct,
    inputs.taxRate
  ];
  
  const scaled = normalize(featureArray, trainedModel.scaler);
  // OOD if any feature's z-score is > 3.5
  return scaled.some(z => Math.abs(z) > 3.5);
}

// Export metrics for the UI to display in the Model Card
export const modelMetrics = trainedModel.metrics;
export const modelConfig = trainedModel.training_config;
