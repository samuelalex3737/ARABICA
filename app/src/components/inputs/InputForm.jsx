import React, { useState } from 'react';
import { scenarios } from '../../data/defaults';
import { formatCurrency, formatPercent, formatNumber } from '../../engine/formatters';
import { Settings, TrendingUp, DollarSign, Package } from 'lucide-react';

const InputGroup = ({ title, icon, children }) => (
  <div className="mb-8">
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h3 className="text-xl font-semibold text-[var(--accent-gold)]">{title}</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {children}
    </div>
  </div>
);

const NumberInput = ({ label, value, onChange, prefix, suffix, min, max, step }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm text-[var(--text-muted)] font-medium">{label}</label>
    <div className="relative flex items-center">
      {prefix && <span className="absolute left-3 text-[var(--text-muted)]">{prefix}</span>}
      <input 
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className={`w-full bg-[var(--bg-elevated)] border border-[var(--glass-border)] rounded-lg py-2 ${prefix ? 'pl-14' : 'pl-3'} ${suffix ? 'pr-14' : 'pr-3'} text-white focus:outline-none focus:border-[var(--accent-copper)] transition-colors`}
      />
      {suffix && <span className="absolute right-3 text-[var(--text-muted)]">{suffix}</span>}
    </div>
  </div>
);

export default function InputForm({ inputs, setInputs }) {
  const [activeTab, setActiveTab] = useState(inputs.id);

  const handleScenarioChange = (scenarioId) => {
    setActiveTab(scenarioId);
    setInputs({ ...scenarios[scenarioId] });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="glass-panel p-8 w-full max-w-4xl mx-auto">
      {/* Scenario Selector */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 p-1 bg-[var(--bg-secondary)] rounded-xl">
        {Object.values(scenarios).map(s => (
          <button
            key={s.id}
            onClick={() => handleScenarioChange(s.id)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === s.id 
                ? 'bg-[var(--accent-copper)] text-[var(--bg-primary)] shadow-lg scale-[1.02]' 
                : 'text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-elevated)]'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Investment */}
        <div>
          <InputGroup title="Initial Investment" icon={<DollarSign className="text-[var(--accent-copper)]" size={20} />}>
            <NumberInput 
              label="Equipment Cost" 
              value={inputs.equipmentCost} 
              onChange={(v) => handleInputChange('equipmentCost', v)}
              prefix="AED"
              step={1000}
            />
            <NumberInput 
              label="Installation Cost" 
              value={inputs.installationCost} 
              onChange={(v) => handleInputChange('installationCost', v)}
              prefix="AED"
              step={1000}
            />
            <NumberInput 
              label="Working Capital" 
              value={inputs.workingCapital} 
              onChange={(v) => handleInputChange('workingCapital', v)}
              prefix="AED"
              step={1000}
            />
            <NumberInput 
              label="Salvage Value" 
              value={inputs.salvageValue} 
              onChange={(v) => handleInputChange('salvageValue', v)}
              prefix="AED"
              step={1000}
            />
          </InputGroup>

          <InputGroup title="Project Parameters" icon={<Settings className="text-[var(--accent-copper)]" size={20} />}>
            <NumberInput 
              label="Project Life" 
              value={inputs.projectLife} 
              onChange={(v) => handleInputChange('projectLife', v)}
              suffix="Years"
              min={1}
              max={20}
              step={1}
            />
            <NumberInput 
              label="Discount Rate (WACC)" 
              value={inputs.wacc} 
              onChange={(v) => handleInputChange('wacc', v)}
              suffix="%"
              step={0.1}
            />
          </InputGroup>
        </div>

        {/* Right Column: Operations */}
        <div>
          <InputGroup title="Operating Cash Flows" icon={<TrendingUp className="text-[var(--accent-copper)]" size={20} />}>
            <NumberInput 
              label="Annual Revenue" 
              value={inputs.annualRevenue} 
              onChange={(v) => handleInputChange('annualRevenue', v)}
              prefix="AED"
              step={1000}
            />
            <div className="col-span-1 md:col-span-2">
              <label className="text-sm text-[var(--text-muted)] font-medium mb-1 block">Variable Costs (% of Revenue)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={inputs.variableCostPct} 
                  onChange={(e) => handleInputChange('variableCostPct', Number(e.target.value))}
                  className="w-full accent-[var(--accent-copper)] h-2 rounded-lg bg-[var(--bg-elevated)] appearance-none"
                />
                <span className="font-mono w-16 text-right">{inputs.variableCostPct}%</span>
              </div>
              <div className="text-xs text-[var(--accent-gold)] mt-1 text-right">
                = {formatCurrency(inputs.annualRevenue * (inputs.variableCostPct / 100))}
              </div>
            </div>
            
            <NumberInput 
              label="Fixed Operating Costs" 
              value={inputs.fixedCosts} 
              onChange={(v) => handleInputChange('fixedCosts', v)}
              prefix="AED"
              step={1000}
            />
            <NumberInput 
              label="Corporate Tax Rate" 
              value={inputs.taxRate} 
              onChange={(v) => handleInputChange('taxRate', v)}
              suffix="%"
              step={0.1}
            />
          </InputGroup>
        </div>
      </div>
    </div>
  );
}
