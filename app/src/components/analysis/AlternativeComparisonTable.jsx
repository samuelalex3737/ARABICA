import React from 'react';
import { scenarios } from '../../data/defaults';
import { runAllCalculations } from '../../engine/calculations';
import { formatCurrency, formatPercent } from '../../engine/formatters';

export default function AlternativeComparisonTable() {
  // Pre-calculate all three scenarios
  const alphaResults = runAllCalculations(scenarios.alpha);
  const betaResults = runAllCalculations(scenarios.beta);
  const gammaResults = runAllCalculations(scenarios.gamma);

  const tableData = [
    {
      label: 'Initial Investment',
      alpha: -(alphaResults.initialCashFlow),
      beta: -(betaResults.initialCashFlow),
      gamma: -(gammaResults.initialCashFlow),
      format: (v) => formatCurrency(v, 0)
    },
    {
      label: 'Annual Revenue',
      alpha: scenarios.alpha.annualRevenue,
      beta: scenarios.beta.annualRevenue,
      gamma: scenarios.gamma.annualRevenue,
      format: (v) => formatCurrency(v, 0)
    },
    {
      label: 'Variable Cost %',
      alpha: scenarios.alpha.variableCostPct,
      beta: scenarios.beta.variableCostPct,
      gamma: scenarios.gamma.variableCostPct,
      format: (v) => formatPercent(v)
    },
    {
      label: 'Net Present Value (NPV)',
      alpha: alphaResults.npv,
      beta: betaResults.npv,
      gamma: gammaResults.npv,
      format: (v) => formatCurrency(v, 0),
      highlight: true
    },
    {
      label: 'Internal Rate of Return (IRR)',
      alpha: alphaResults.irr,
      beta: betaResults.irr,
      gamma: gammaResults.irr,
      format: (v) => formatPercent(v),
      highlight: true
    },
    {
      label: 'Profitability Index (PI)',
      alpha: alphaResults.pi,
      beta: betaResults.pi,
      gamma: gammaResults.pi,
      format: (v) => v.toFixed(2),
      highlight: true
    },
    {
      label: 'Payback Period',
      alpha: alphaResults.paybackPeriod,
      beta: betaResults.paybackPeriod,
      gamma: gammaResults.paybackPeriod,
      format: (v) => v ? v.toFixed(1) + ' yrs' : 'N/A'
    }
  ];

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-[var(--glass-border)]">
            <th className="py-4 px-6 text-[var(--text-muted)] font-medium">Metric</th>
            <th className="py-4 px-6 text-white font-bold bg-[var(--bg-elevated)]/50">Alpha (Full Auto)</th>
            <th className="py-4 px-6 text-white font-bold">Beta (Semi-Auto)</th>
            <th className="py-4 px-6 text-white font-bold">Gamma (Status Quo)</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, i) => (
            <tr key={i} className={`border-b border-[var(--glass-border)] ${row.highlight ? 'bg-[var(--accent-copper)]/5' : ''}`}>
              <td className="py-4 px-6 font-medium text-[var(--text-muted)]">{row.label}</td>
              <td className={`py-4 px-6 font-mono ${row.highlight ? 'text-[var(--accent-gold)] font-bold' : 'text-white'} bg-[var(--bg-elevated)]/30`}>
                {row.format(row.alpha)}
              </td>
              <td className={`py-4 px-6 font-mono ${row.highlight ? 'text-white font-bold' : 'text-white'}`}>
                {row.format(row.beta)}
              </td>
              <td className={`py-4 px-6 font-mono ${row.highlight ? 'text-white font-bold' : 'text-white'}`}>
                {row.format(row.gamma)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
