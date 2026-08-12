import React, { useState, useEffect } from 'react';
import { Cpu, Loader2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function ClaudeInsights({ inputs, results, mlProbability }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Re-run analysis when inputs change substantially (debounced conceptually, here we use a manual trigger or useEffect)
  // For this app, we will add a button to generate the report so we don't spam the API on every slider tweak.
  
  const generateAnalysis = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      // In development (Vite), this needs to hit the API route if hosted, or mock it locally.
      // We will hit the /api/analyze endpoint which works on Vercel.
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs, results, mlProbability })
      });

      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch analysis');
        }
        setAnalysis(data);
      } else {
        // Fallback for local Vite dev server (Vercel API routes don't work locally without Vercel CLI)
        setTimeout(() => {
          setAnalysis({
            recommendation: "Accept",
            confidence: "High",
            narrative: "This is a simulated AI response for local development since the Vercel API route is not running. Based on the robust NPV, favorable IRR, and the AI model's high probability score, this scenario presents strong financial viability. The capital expenditure is well-justified by the operational cost savings over the project life.",
            keyDrivers: ["Strong NPV Margin", "Operational Efficiency", "AI Probability Score"],
            risks: ["Market volatility", "Equipment depreciation"]
          });
          setLoading(false);
        }, 1500);
        return;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (rec) => {
    switch(rec?.toLowerCase()) {
      case 'accept': return <CheckCircle className="text-[var(--accent-green)]" size={32} />;
      case 'reject': return <XCircle className="text-[var(--accent-burgundy)]" size={32} />;
      case 'hold': return <AlertTriangle className="text-[var(--accent-gold)]" size={32} />;
      default: return null;
    }
  };

  return (
    <div className="glass-panel p-8 w-full">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--glass-border)]">
        <div className="flex items-center gap-3">
          <Cpu className="text-[var(--accent-copper)]" size={28} />
          <h2 className="text-2xl font-bold text-white">Claude AI Analyst</h2>
        </div>
        
        <button 
          onClick={generateAnalysis}
          disabled={loading}
          className="px-6 py-2 bg-[var(--accent-copper)] hover:bg-[var(--accent-gold)] text-[var(--bg-primary)] font-bold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <><Loader2 className="animate-spin" size={18} /> Analyzing...</>
          ) : 'Generate Executive Summary'}
        </button>
      </div>

      {!analysis && !loading && !error && (
        <div className="text-center py-12 text-[var(--text-muted)]">
          Click "Generate Executive Summary" to receive a comprehensive AI-driven analysis of this scenario.
        </div>
      )}

      {error && (
        <div className="p-4 bg-[var(--accent-burgundy)]/20 border border-[var(--accent-burgundy)] rounded-lg text-[var(--text-primary)]">
          <strong>Error generating analysis:</strong> {error}
        </div>
      )}

      {analysis && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-6 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--glass-border)]">
            {getRecommendationIcon(analysis.recommendation)}
            <div>
              <div className="text-[var(--text-muted)] text-sm uppercase tracking-wider mb-1">Recommendation</div>
              <div className="text-3xl font-bold font-heading">{analysis.recommendation}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-[var(--text-muted)] text-sm uppercase tracking-wider mb-1">Confidence</div>
              <div className={`text-xl font-bold ${
                analysis.confidence === 'High' ? 'text-[var(--accent-green)]' : 
                analysis.confidence === 'Medium' ? 'text-[var(--accent-gold)]' : 'text-[var(--accent-burgundy)]'
              }`}>{analysis.confidence}</div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-4">Executive Narrative</h3>
            <div className="text-[var(--text-primary)] leading-relaxed space-y-4">
              {analysis.narrative.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--accent-green)]/30">
              <h3 className="text-lg font-bold text-[var(--accent-green)] mb-4">Key Value Drivers</h3>
              <ul className="space-y-2">
                {analysis.keyDrivers.map((driver, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[var(--accent-green)] mt-1">•</span>
                    <span>{driver}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--accent-burgundy)]/30">
              <h3 className="text-lg font-bold text-[var(--accent-burgundy)] mb-4">Primary Risks</h3>
              <ul className="space-y-2">
                {analysis.risks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[var(--accent-burgundy)] mt-1">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
