import React from 'react';
import { Download, ArrowRight, FileText } from 'lucide-react';

export default function RecommendationSection() {
  return (
    <div className="glass-panel p-12 text-center w-full max-w-4xl mx-auto relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-gold)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--accent-copper)]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
      
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--bg-elevated)] border border-[var(--accent-copper)] mb-6 text-[var(--accent-copper)]">
        <FileText size={40} />
      </div>
      
      <h2 className="text-4xl font-bold text-white mb-6">Final Recommendation</h2>
      
      <p className="text-lg text-[var(--text-primary)] mb-8 max-w-2xl mx-auto leading-relaxed">
        Based on the comprehensive financial analysis, Monte Carlo simulation, and AI narrative insights, 
        <strong className="text-[var(--accent-gold)]"> Alternative Alpha (Full Automation) </strong> 
        is the optimal capital budgeting decision for Hajar Coffee Co.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-left">
        <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--glass-border)]">
          <h4 className="text-[var(--accent-gold)] font-bold mb-2">Highest NPV</h4>
          <p className="text-sm text-[var(--text-muted)]">Maximizes absolute shareholder value despite the highest initial capital outlay.</p>
        </div>
        <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--glass-border)]">
          <h4 className="text-[var(--accent-gold)] font-bold mb-2">Robust to Shock</h4>
          <p className="text-sm text-[var(--text-muted)]">Tornado analysis shows NPV remains positive even if revenue drops by 20%.</p>
        </div>
        <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--glass-border)]">
          <h4 className="text-[var(--accent-gold)] font-bold mb-2">Strategic Fit</h4>
          <p className="text-sm text-[var(--text-muted)]">Scalable wholesale capacity secures Hajar's competitive advantage in B2B hospitality.</p>
        </div>
      </div>

      <a 
        href="/Report.pdf" 
        download="ARABICA_Capital_Budgeting_Report.pdf"
        className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--accent-copper)] hover:bg-[var(--accent-gold)] text-[var(--bg-primary)] font-bold text-lg rounded-full transition-colors group"
      >
        Download Full Report (PDF)
        <Download size={20} className="group-hover:-translate-y-1 transition-transform" />
      </a>
    </div>
  );
}
