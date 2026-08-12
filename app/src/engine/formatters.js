/**
 * Formatters for the UI
 */

export const formatCurrency = (value, showDecimals = 0) => {
  if (value === null || value === undefined) return '-';
  
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: showDecimals,
    maximumFractionDigits: showDecimals
  }).format(value);
};

export const formatPercent = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(decimals)}%`;
};

export const formatNumber = (value, decimals = 1) => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

export const formatYears = (value) => {
  if (value === null || value === undefined) return 'Does not payback';
  return `${value.toFixed(2)} years`;
};

/**
 * Validation Logic
 */
export const validateInputs = (inputs) => {
  const errors = {};
  
  if (inputs.equipmentCost < 0) errors.equipmentCost = 'Cannot be negative';
  if (inputs.installationCost < 0) errors.installationCost = 'Cannot be negative';
  if (inputs.workingCapital < 0) errors.workingCapital = 'Cannot be negative';
  
  if (inputs.projectLife <= 0 || !Number.isInteger(inputs.projectLife)) {
    errors.projectLife = 'Must be a positive integer';
  }
  
  if (inputs.annualRevenue < 0) errors.annualRevenue = 'Cannot be negative';
  if (inputs.fixedCosts < 0) errors.fixedCosts = 'Cannot be negative';
  
  if (inputs.variableCostPct < 0 || inputs.variableCostPct > 100) {
    errors.variableCostPct = 'Must be between 0 and 100';
  }
  
  if (inputs.taxRate < 0 || inputs.taxRate > 100) {
    errors.taxRate = 'Must be between 0 and 100';
  }
  
  if (inputs.wacc <= 0 || inputs.wacc > 100) {
    errors.wacc = 'Must be between 0 and 100';
  }
  
  if (inputs.salvageValue < 0) {
    errors.salvageValue = 'Cannot be negative';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
