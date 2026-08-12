import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function MLGauge({ probability, isOOD }) {
  // Determine color based on probability
  const getColor = (p) => {
    if (p >= 0.7) return 'var(--accent-green)'; // Green
    if (p >= 0.4) return 'var(--accent-gold)';  // Amber
    return 'var(--accent-burgundy)';            // Red
  };

  const getLabel = (p) => {
    if (p >= 0.7) return 'Strong Accept';
    if (p >= 0.4) return 'Marginal';
    return 'High Risk / Reject';
  };

  const color = getColor(probability);
  const percentage = (probability * 100).toFixed(1);
  
  // SVG Arc calculation
  // We draw a semi-circle from left to right.
  const radius = 80;
  const strokeWidth = 16;
  const circumference = Math.PI * radius; // Half circle
  
  // Offset calculations for dasharray
  const fillAmount = probability * circumference;
  const emptyAmount = circumference - fillAmount;

  return (
    <div className="flex flex-col items-center justify-center p-6 glass-panel relative overflow-hidden group">
      {/* Background glow effect based on probability */}
      <div 
        className="absolute inset-0 opacity-10 transition-colors duration-1000"
        style={{ backgroundColor: color }}
      ></div>

      <div className="relative w-48 h-28 overflow-hidden flex items-end justify-center">
        {/* Background track arc */}
        <svg className="absolute top-0" width="192" height="96" viewBox="0 0 192 96">
          <path
            d="M 16,96 A 80,80 0 0,1 176,96"
            fill="none"
            stroke="var(--bg-elevated)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Foreground progress arc */}
          <path
            d="M 16,96 A 80,80 0 0,1 176,96"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${fillAmount} ${emptyAmount}`}
            style={{ 
              transition: 'stroke-dasharray 1s ease-out, stroke 0.5s ease-out'
            }}
          />
        </svg>

        {/* Value text inside the gauge */}
        <div className="absolute bottom-0 flex flex-col items-center">
          <span className="text-4xl font-bold font-mono" style={{ color }}>
            {percentage}%
          </span>
        </div>
      </div>
      
      <div className="mt-4 text-center z-10">
        <div className="text-[var(--text-muted)] text-sm tracking-widest uppercase mb-1">AI Recommendation</div>
        <div className="font-bold text-lg" style={{ color }}>{getLabel(probability)}</div>
      </div>
      
      {/* Out of Distribution Warning Flag */}
      {isOOD && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[var(--accent-burgundy)]/20 border border-[var(--accent-burgundy)] text-[var(--text-primary)] text-[10px] px-2 py-1 rounded-full whitespace-nowrap z-20">
          <AlertTriangle size={12} className="text-[var(--accent-burgundy)]" />
          <span>Out of Training Range</span>
        </div>
      )}
    </div>
  );
}
