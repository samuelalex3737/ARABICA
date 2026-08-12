import React, { useState, Component } from 'react';
import { Cpu, Loader2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

// Local Error Boundary so if this component crashes, only this panel shows the error
class InsightsErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, errorMsg: error?.message || 'Unknown render error' };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-panel p-8 w-full">
          <div className="p-4 bg-[var(--accent-burgundy)]/20 border border-[var(--accent-burgundy)] rounded-lg text-[var(--text-primary)]">
            <strong>AI Analyst encountered a rendering error:</strong> {this.state.errorMsg}
            <br />
            <button
              onClick={() => this.setState({ hasError: false, errorMsg: '' })}
              className="mt-4 px-4 py-2 bg-[var(--accent-copper)] text-[var(--bg-primary)] rounded-full font-bold text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ClaudeInsightsInner({ inputs, results, mlProbability }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateAnalysis = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs, results, mlProbability })
      });

      // Read response as text first so we never fail on .json()
      const rawText = await response.text();

      if (!response.ok) {
        // Try to extract a detailed message
        try {
          const errData = JSON.parse(rawText);
          throw new Error(errData.details || errData.error || `Server error ${response.status}`);
        } catch {
          throw new Error(rawText || `Server error ${response.status}`);
        }
      }

      // Parse JSON safely
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error('Server returned invalid JSON: ' + rawText.substring(0, 200));
      }

      // Normalize the response — no matter what shape Groq returns, force it into our expected schema
      const normalized = {
        recommendation: String(data.recommendation || data.decision || data.verdict || 'N/A'),
        confidence: String(data.confidence || data.confidence_level || 'Medium'),
        narrative: '',
        keyDrivers: [],
        risks: []
      };

      // Normalize narrative
      if (typeof data.narrative === 'string') {
        normalized.narrative = data.narrative;
      } else if (Array.isArray(data.narrative)) {
        normalized.narrative = data.narrative.join('\n\n');
      } else if (typeof data.analysis === 'string') {
        normalized.narrative = data.analysis;
      } else if (typeof data.summary === 'string') {
        normalized.narrative = data.summary;
      } else {
        normalized.narrative = 'AI analysis completed successfully but returned an unexpected format.';
      }

      // Helper: extract a readable string from an item that might be a string or an object
      const toReadableString = (item) => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null) {
          // Try common property names the LLM might use
          return item.title || item.name || item.description || item.driver || item.risk || item.text || item.value || JSON.stringify(item);
        }
        return String(item);
      };

      // Normalize keyDrivers
      const rawDrivers = data.keyDrivers || data.key_drivers || data.drivers || data.keyValueDrivers || data.key_value_drivers || [];
      if (Array.isArray(rawDrivers)) {
        normalized.keyDrivers = rawDrivers.map(toReadableString);
      }

      // Normalize risks
      const rawRisks = data.risks || data.key_risks || data.primaryRisks || data.primary_risks || [];
      if (Array.isArray(rawRisks)) {
        normalized.risks = rawRisks.map(toReadableString);
      }

      setAnalysis(normalized);
    } catch (err) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (rec) => {
    const r = (rec || '').toLowerCase();
    if (r.includes('accept')) return <CheckCircle className="text-[var(--accent-green)]" size={32} />;
    if (r.includes('reject')) return <XCircle className="text-[var(--accent-burgundy)]" size={32} />;
    if (r.includes('hold')) return <AlertTriangle className="text-[var(--accent-gold)]" size={32} />;
    return null;
  };

  return (
    <div className="glass-panel p-8 w-full">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--glass-border)]">
        <div className="flex items-center gap-3">
          <Cpu className="text-[var(--accent-copper)]" size={28} />
          <h2 className="text-2xl font-bold text-white">Groq AI Analyst</h2>
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
        <div className="space-y-8">
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
            {analysis.keyDrivers.length > 0 && (
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
            )}
            
            {analysis.risks.length > 0 && (
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClaudeInsights(props) {
  return (
    <InsightsErrorBoundary>
      <ClaudeInsightsInner {...props} />
    </InsightsErrorBoundary>
  );
}
