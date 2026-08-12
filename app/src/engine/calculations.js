/**
 * Financial Calculation Engine for ARABICA
 * 
 * Contains pure functions for all 13 required capital budgeting outputs.
 * Formulas are fully documented in standard math notation for verification.
 */

/**
 * 1. Initial Project Cash Flow (CF0)
 * CF0 = -(Equipment + Installation + Net Working Capital)
 */
export const calculateInitialCashFlow = (inputs) => {
  return -(inputs.equipmentCost + inputs.installationCost + inputs.workingCapital);
};

/**
 * 2. Annual Operating Cash Flow (CFt)
 * CFt = (Revenue - FixedCosts - VariableCosts - Depreciation) * (1 - TaxRate) + Depreciation
 * We calculate the flat depreciation first.
 */
export const calculateDepreciation = (inputs) => {
  return (inputs.equipmentCost + inputs.installationCost - inputs.salvageValue) / inputs.projectLife;
};

export const calculateAnnualOperatingCashFlow = (inputs) => {
  const variableCosts = inputs.annualRevenue * (inputs.variableCostPct / 100);
  const depreciation = calculateDepreciation(inputs);
  
  const ebit = inputs.annualRevenue - inputs.fixedCosts - variableCosts - depreciation;
  // UAE Corporate Tax applies at 9%.
  const tax = ebit > 0 ? ebit * (inputs.taxRate / 100) : 0;
  
  return (ebit - tax) + depreciation;
};

/**
 * 3. Terminal-Year Cash Flow (CFn)
 * CFn = SalvageValue - TaxRate * (SalvageValue - BookValue) + WorkingCapitalRecovery
 * Note: Under straight-line to salvage, BookValue = SalvageValue, so tax on salvage is 0.
 * But we include the general formula for completeness.
 */
export const calculateTerminalCashFlow = (inputs) => {
  const bookValue = inputs.salvageValue; // Fully depreciated to salvage
  const gainOnSale = Math.max(0, inputs.salvageValue - bookValue);
  const taxOnSalvage = gainOnSale * (inputs.taxRate / 100);
  
  return inputs.salvageValue - taxOnSalvage + inputs.workingCapital;
};

/**
 * Generate full cash flow array [CF0, CF1, ..., CFn]
 */
export const generateCashFlowArray = (inputs) => {
  const cf0 = calculateInitialCashFlow(inputs);
  const ocf = calculateAnnualOperatingCashFlow(inputs);
  const tcf = calculateTerminalCashFlow(inputs);
  
  const cashFlows = [cf0];
  for (let i = 1; i <= inputs.projectLife; i++) {
    let cf = ocf;
    if (i === inputs.projectLife) {
      cf += tcf;
    }
    cashFlows.push(cf);
  }
  return cashFlows;
};

/**
 * 4. Payback Period
 * Iterates cumulative undiscounted cash flows.
 */
export const calculatePaybackPeriod = (cashFlows) => {
  let cumulative = cashFlows[0];
  for (let i = 1; i < cashFlows.length; i++) {
    const nextCumulative = cumulative + cashFlows[i];
    if (nextCumulative >= 0) {
      // Fraction of the year needed to break even
      return (i - 1) + Math.abs(cumulative) / cashFlows[i];
    }
    cumulative = nextCumulative;
  }
  return null; // Never pays back
};

/**
 * 5. Discounted Payback Period
 * Same logic, but using discounted cash flows.
 */
export const calculateDiscountedPaybackPeriod = (cashFlows, waccPct) => {
  const r = waccPct / 100;
  const dcf = cashFlows.map((cf, t) => cf / Math.pow(1 + r, t));
  
  let cumulative = dcf[0];
  for (let i = 1; i < dcf.length; i++) {
    const nextCumulative = cumulative + dcf[i];
    if (nextCumulative >= 0) {
      return (i - 1) + Math.abs(cumulative) / dcf[i];
    }
    cumulative = nextCumulative;
  }
  return null;
};

/**
 * 6. Accounting Rate of Return (ARR)
 * ARR = (Average Annual Accounting Profit) / (Average Investment)
 */
export const calculateARR = (inputs) => {
  const variableCosts = inputs.annualRevenue * (inputs.variableCostPct / 100);
  const depreciation = calculateDepreciation(inputs);
  const ebit = inputs.annualRevenue - inputs.fixedCosts - variableCosts - depreciation;
  const tax = ebit > 0 ? ebit * (inputs.taxRate / 100) : 0;
  const netIncome = ebit - tax;
  
  const initialInvestment = Math.abs(calculateInitialCashFlow(inputs));
  const avgInvestment = (initialInvestment + inputs.salvageValue) / 2;
  
  return (netIncome / avgInvestment) * 100;
};

/**
 * 7. Net Present Value (NPV)
 * NPV = Sum(CFt / (1+r)^t)
 */
export const calculateNPV = (cashFlows, waccPct) => {
  const r = waccPct / 100;
  return cashFlows.reduce((npv, cf, t) => npv + (cf / Math.pow(1 + r, t)), 0);
};

/**
 * 8. Internal Rate of Return (IRR)
 * Solves NPV = 0 using Newton-Raphson, fallback to bisection.
 */
export const calculateIRR = (cashFlows) => {
  // Check if IRR exists (need at least one sign change)
  if (cashFlows[0] >= 0 || cashFlows.slice(1).every(cf => cf <= 0)) {
    return null;
  }

  const getNPV = (r) => cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + r, t), 0);
  
  // Bisection method fallback (more stable than NR for this use case)
  let low = -0.5; // -50%
  let high = 5.0; // 500%
  
  // If NPV is still positive at high rate, expand bound
  if (getNPV(high) > 0) high = 100.0;
  
  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const npv = getNPV(mid);
    
    if (Math.abs(npv) < 0.01) return mid * 100;
    
    // Normal cash flows: NPV decreases as r increases
    if (npv > 0) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return ((low + high) / 2) * 100;
};

/**
 * 9. Modified Internal Rate of Return (MIRR)
 */
export const calculateMIRR = (cashFlows, waccPct) => {
  const r = waccPct / 100;
  const n = cashFlows.length - 1;
  
  let pvNegative = 0;
  let fvPositive = 0;
  
  cashFlows.forEach((cf, t) => {
    if (cf < 0) {
      pvNegative += cf / Math.pow(1 + r, t);
    } else {
      fvPositive += cf * Math.pow(1 + r, n - t);
    }
  });
  
  if (pvNegative === 0) return null;
  
  const mirr = Math.pow(fvPositive / Math.abs(pvNegative), 1 / n) - 1;
  return mirr * 100;
};

/**
 * 10. Profitability Index (PI)
 * PI = PV of future cash flows / Initial Investment
 */
export const calculatePI = (cashFlows, waccPct) => {
  const r = waccPct / 100;
  const pvFuture = cashFlows.slice(1).reduce((sum, cf, t) => sum + cf / Math.pow(1 + r, t + 1), 0);
  return pvFuture / Math.abs(cashFlows[0]);
};

/**
 * 11. Break-Even Analysis (Accounting, Cash, Financial)
 */
export const calculateBreakEven = (inputs) => {
  // Since we don't have explicit unit price/var cost per unit for all products combined,
  // we compute Break-Even in terms of Revenue (AED).
  // Contribution Margin Ratio = 1 - (Variable Cost % / 100)
  const cmRatio = 1 - (inputs.variableCostPct / 100);
  const depreciation = calculateDepreciation(inputs);
  
  // Accounting BE Revenue = (Fixed Costs + Depreciation) / CM Ratio
  const accountingBE = (inputs.fixedCosts + depreciation) / cmRatio;
  
  // Cash BE Revenue = Fixed Costs / CM Ratio
  const cashBE = inputs.fixedCosts / cmRatio;
  
  // Financial BE (EAA approach)
  // Find revenue where NPV = 0
  const r = inputs.wacc / 100;
  const n = inputs.projectLife;
  const initialInv = -(calculateInitialCashFlow(inputs));
  
  // Equivalent Annual Annuity of initial investment minus PV of salvage
  const pvSalvage = (inputs.salvageValue + inputs.workingCapital) / Math.pow(1 + r, n);
  const netPvRequired = initialInv - pvSalvage;
  
  // Annuity factor
  const pviFA = (1 - Math.pow(1 + r, -n)) / r;
  const requiredOCF = netPvRequired / pviFA;
  
  // We need OCF = requiredOCF
  // OCF = (Rev - FC - VC - Depr)*(1-T) + Depr
  // OCF = (Rev - FC - Rev*VCPct - Depr)*(1-T) + Depr
  // OCF = (Rev*(1-VCPct) - FC - Depr)*(1-T) + Depr
  // (OCF - Depr)/(1-T) = Rev*CMRatio - FC - Depr
  // Rev = [ (OCF - Depr)/(1-T) + FC + Depr ] / CMRatio
  
  const taxRate = inputs.taxRate / 100;
  const financialBE = ( (requiredOCF - depreciation) / (1 - taxRate) + inputs.fixedCosts + depreciation ) / cmRatio;
  
  return {
    accountingBE,
    cashBE,
    financialBE
  };
};

/**
 * Main calculation runner - takes inputs and returns all 13 metric outputs
 */
export const runAllCalculations = (inputs) => {
  const cashFlows = generateCashFlowArray(inputs);
  const bep = calculateBreakEven(inputs);
  
  return {
    initialCashFlow: cashFlows[0],
    annualOperatingCashFlow: calculateAnnualOperatingCashFlow(inputs),
    terminalCashFlow: cashFlows[cashFlows.length - 1],
    cashFlowSeries: cashFlows,
    paybackPeriod: calculatePaybackPeriod(cashFlows),
    discountedPaybackPeriod: calculateDiscountedPaybackPeriod(cashFlows, inputs.wacc),
    arr: calculateARR(inputs),
    npv: calculateNPV(cashFlows, inputs.wacc),
    irr: calculateIRR(cashFlows),
    mirr: calculateMIRR(cashFlows, inputs.wacc),
    pi: calculatePI(cashFlows, inputs.wacc),
    breakEven: bep
  };
};
