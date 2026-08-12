import React, { useEffect, useRef } from 'react';
import { formatCurrency, formatPercent, formatNumber, formatYears } from '../../engine/formatters';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const MetricCard = ({ title, value, status, description }) => {
  // Status: 'success', 'warning', 'danger', 'neutral'
  const getStatusColor = () => {
    switch(status) {
      case 'success': return 'text-[var(--accent-green)]';
      case 'warning': return 'text-[var(--accent-gold)]';
      case 'danger': return 'text-[var(--accent-burgundy)]';
      default: return 'text-white';
    }
  };

  const getStatusIcon = () => {
    switch(status) {
      case 'success': return <CheckCircle2 size={24} className="text-[var(--accent-green)]" />;
      case 'danger': return <AlertCircle size={24} className="text-[var(--accent-burgundy)]" />;
      default: return null;
    }
  };

  return (
    <div className="glass-panel p-6 flex flex-col justify-between hover:border-[var(--accent-copper)] transition-colors duration-300 group">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-[var(--text-muted)] font-medium text-sm tracking-wider uppercase">{title}</h3>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
             <div className="group/tooltip relative">
               <Info size={16} className="text-[var(--text-muted)] cursor-help" />
               <div className="absolute right-0 top-6 w-48 p-2 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded shadow-xl text-xs z-50 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity">
                 {description}
               </div>
             </div>
          </div>
        </div>
        <div className={`text-3xl lg:text-4xl font-mono font-bold ${getStatusColor()}`}>
          {value}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end">
        {getStatusIcon()}
      </div>
    </div>
  );
};

export default function MetricsDashboard({ results, inputs }) {
  // Determine statuses based on standard capital budgeting rules
  const npvStatus = results.npv > 0 ? 'success' : 'danger';
  
  const irrStatus = results.irr === null ? 'danger' 
                  : results.irr > inputs.wacc ? 'success' 
                  : 'danger';
                  
  const mirrStatus = results.mirr === null ? 'danger'
                   : results.mirr > inputs.wacc ? 'success'
                   : 'danger';
                   
  const piStatus = results.pi > 1.0 ? 'success' : 'danger';
  
  // Payback period rule of thumb: < half project life is good
  const ppStatus = results.paybackPeriod === null ? 'danger'
                 : results.paybackPeriod < (inputs.projectLife / 2) ? 'success'
                 : results.paybackPeriod < inputs.projectLife ? 'warning'
                 : 'danger';

  // ARR rule of thumb: > WACC is acceptable
  const arrStatus = results.arr > inputs.wacc ? 'success' : 'warning';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
      <MetricCard 
        title="Net Present Value (NPV)" 
        value={formatCurrency(results.npv, 0)} 
        status={npvStatus}
        description="The difference between the present value of cash inflows and outflows. A positive NPV means the investment adds value."
      />
      
      <MetricCard 
        title="Internal Rate of Return (IRR)" 
        value={results.irr ? formatPercent(results.irr) : 'N/A'} 
        status={irrStatus}
        description="The discount rate that makes NPV equal zero. Must exceed the WACC (hurdle rate) to be accepted."
      />
      
      <MetricCard 
        title="Modified IRR (MIRR)" 
        value={results.mirr ? formatPercent(results.mirr) : 'N/A'} 
        status={mirrStatus}
        description="Assumes positive cash flows are reinvested at the firm's cost of capital, offering a more realistic return measure than IRR."
      />
      
      <MetricCard 
        title="Profitability Index (PI)" 
        value={formatNumber(results.pi, 2)} 
        status={piStatus}
        description="Ratio of PV of future cash flows to initial investment. PI > 1.0 indicates a profitable project."
      />
      
      <MetricCard 
        title="Payback Period" 
        value={formatYears(results.paybackPeriod)} 
        status={ppStatus}
        description="Time required to recover the initial investment from nominal cash flows."
      />
      
      <MetricCard 
        title="Accounting Rate of Return" 
        value={formatPercent(results.arr)} 
        status={arrStatus}
        description="Average annual net income divided by average investment. Does not account for time value of money."
      />
    </div>
  );
}
