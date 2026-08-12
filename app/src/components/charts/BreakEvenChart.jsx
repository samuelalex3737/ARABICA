import React from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot
} from 'recharts';
import { calculateBreakEven, calculateDepreciation } from '../../engine/calculations';
import { formatCurrency } from '../../engine/formatters';

export default function BreakEvenChart({ inputs }) {
  const bep = calculateBreakEven(inputs);
  const depreciation = calculateDepreciation(inputs);
  
  // We want to plot from 0 revenue to 2x current revenue
  const maxRevenue = inputs.annualRevenue * 2;
  const steps = 10;
  const stepSize = maxRevenue / steps;
  
  const data = [];
  const cmRatio = 1 - (inputs.variableCostPct / 100);
  
  for (let i = 0; i <= steps; i++) {
    const revenue = i * stepSize;
    // Total costs (accounting) = Fixed Costs + Depreciation + Variable Costs
    const variableCosts = revenue * (inputs.variableCostPct / 100);
    const totalCosts = inputs.fixedCosts + depreciation + variableCosts;
    
    data.push({
      revenue,
      totalCosts,
      fixedCosts: inputs.fixedCosts + depreciation,
      sales: revenue
    });
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-4 text-sm">
          <p className="font-bold text-white mb-2">At Revenue: {formatCurrency(label, 0)}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="font-mono">
              {entry.name}: {formatCurrency(entry.value, 0)}
            </p>
          ))}
          <div className="mt-2 pt-2 border-t border-[var(--glass-border)]">
            <p className={payload[0].value > payload[1].value ? "text-[var(--accent-green)]" : "text-[var(--accent-burgundy)]"}>
              Net: {formatCurrency(payload[0].value - payload[1].value, 0)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 40, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          
          <XAxis 
            dataKey="revenue" 
            tickFormatter={(value) => `${value / 1000000}M`}
            tick={{ fill: 'var(--text-muted)' }} 
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            label={{ value: 'Revenue (AED)', position: 'bottom', offset: 0, fill: 'var(--text-muted)' }}
          />
          
          <YAxis 
            tickFormatter={(value) => `${value / 1000000}M`}
            tick={{ fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
          />
          
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: "25px" }} />
          
          <Line 
            type="monotone" 
            dataKey="sales" 
            name="Total Revenue" 
            stroke="var(--accent-green)" 
            strokeWidth={3} 
            dot={false} 
          />
          <Line 
            type="monotone" 
            dataKey="totalCosts" 
            name="Total Costs" 
            stroke="var(--accent-burgundy)" 
            strokeWidth={3} 
            dot={false} 
          />
          <Line 
            type="monotone" 
            dataKey="fixedCosts" 
            name="Fixed Costs + Depr." 
            stroke="var(--text-muted)" 
            strokeWidth={2} 
            strokeDasharray="5 5"
            dot={false} 
          />
          
          {/* Break-Even Point intersection */}
          {bep.accountingBE <= maxRevenue && (
            <ReferenceDot 
              x={bep.accountingBE} 
              y={bep.accountingBE} 
              r={6} 
              fill="var(--accent-gold)" 
              stroke="white"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      <div className="text-center mt-4">
        <p className="text-[var(--text-muted)] text-sm">
          Accounting Break-Even Revenue: <strong className="text-[var(--accent-gold)]">{formatCurrency(bep.accountingBE, 0)}</strong>
        </p>
        <p className="text-[var(--text-muted)] text-sm">
          Current Projected Revenue: <strong className="text-white">{formatCurrency(inputs.annualRevenue, 0)}</strong>
        </p>
      </div>
    </div>
  );
}
