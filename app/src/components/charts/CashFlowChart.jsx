import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { formatCurrency } from '../../engine/formatters';

export default function CashFlowChart({ cashFlowSeries }) {
  if (!cashFlowSeries || cashFlowSeries.length === 0) return null;

  // Prepare data for Recharts
  let cumulative = 0;
  const data = cashFlowSeries.map((cf, year) => {
    cumulative += cf;
    return {
      year: `Year ${year}`,
      cashFlow: cf,
      cumulative: cumulative
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-4 text-sm shadow-2xl border-[var(--accent-copper)]">
          <p className="font-bold text-white mb-2">{label}</p>
          <div className="flex flex-col gap-1">
            <p className="text-[var(--text-primary)]">
              <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: payload[0].color }}></span>
              Annual CF: <span className="font-mono ml-2 font-bold">{formatCurrency(payload[0].value, 0)}</span>
            </p>
            <p className="text-[var(--text-primary)]">
              <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: payload[1].color }}></span>
              Cumulative CF: <span className="font-mono ml-2 font-bold">{formatCurrency(payload[1].value, 0)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          
          <XAxis 
            dataKey="year" 
            tick={{ fill: 'var(--text-muted)' }} 
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            tickLine={false}
          />
          
          <YAxis 
            tickFormatter={(value) => `${value / 1000000}M`}
            tick={{ fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" />
          
          <Bar dataKey="cashFlow" name="Annual Cash Flow" radius={[4, 4, 0, 0]} maxBarSize={60}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.cashFlow >= 0 ? 'var(--accent-green)' : 'var(--accent-burgundy)'} />
            ))}
          </Bar>
          
          <Line 
            type="monotone" 
            dataKey="cumulative" 
            name="Cumulative Cash Flow" 
            stroke="var(--accent-copper)" 
            strokeWidth={3}
            dot={{ r: 4, fill: 'var(--bg-primary)', stroke: 'var(--accent-copper)', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: 'var(--accent-copper)', stroke: 'white' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
