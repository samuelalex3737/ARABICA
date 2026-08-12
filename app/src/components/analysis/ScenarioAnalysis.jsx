import React from 'react';
import { generateScenarioAnalysis } from '../../engine/scenarios';
import { formatCurrency, formatPercent } from '../../engine/formatters';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';

const ScenarioCard = ({ type, data, isBase }) => {
  const getStyling = () => {
    switch (type) {
      case 'Best Case':
        return { color: 'text-[var(--accent-green)]', icon: <ArrowUpRight className="text-[var(--accent-green)]" />, border: 'border-[var(--accent-green)]' };
      case 'Worst Case':
        return { color: 'text-[var(--accent-burgundy)]', icon: <ArrowDownRight className="text-[var(--accent-burgundy)]" />, border: 'border-[var(--accent-burgundy)]' };
      default:
        return { color: 'text-[var(--accent-copper)]', icon: <ArrowRight className="text-white" />, border: 'border-[var(--glass-border)]' };
    }
  };

  const style = getStyling();

  return (
    <div className={`p-4 rounded-xl border ${style.border} ${isBase ? 'bg-[var(--bg-elevated)]' : 'bg-[var(--bg-secondary)]'}`}>
      <div className="flex items-center gap-2 mb-4">
        {style.icon}
        <h4 className="font-bold text-lg text-white">{type}</h4>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[var(--text-muted)] text-sm">NPV</span>
          <span className={`font-mono font-bold ${style.color}`}>
            {formatCurrency(data.npv, 0)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-[var(--text-muted)] text-sm">IRR</span>
          <span className="font-mono text-white">
            {formatPercent(data.irr)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-[var(--text-muted)] text-sm">Payback</span>
          <span className="font-mono text-white">
            {data.paybackPeriod ? data.paybackPeriod.toFixed(1) + ' yrs' : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function ScenarioAnalysis({ inputs }) {
  const scenarios = generateScenarioAnalysis(inputs);
  
  return (
    <div className="flex flex-col gap-4">
      <ScenarioCard type="Best Case" data={scenarios.best} />
      <ScenarioCard type="Base Case" data={scenarios.base} isBase={true} />
      <ScenarioCard type="Worst Case" data={scenarios.worst} />
      
      <div className="mt-4 p-4 bg-[var(--bg-secondary)] rounded-lg text-sm text-[var(--text-muted)]">
        <p><strong>Methodology:</strong> The Best/Worst scenarios simultaneously adjust all major variables by ±20% (Revenue, Variable Cost, WACC, Salvage). This represents extreme multi-variate outcomes.</p>
      </div>
    </div>
  );
}
