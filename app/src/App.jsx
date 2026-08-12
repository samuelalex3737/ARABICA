import React, { useState, useMemo } from 'react';
import { defaultScenario } from './data/defaults';
import { runAllCalculations } from './engine/calculations';
import { predictAcceptProbability, checkOutOfDistribution } from './ml/inference';
import CoffeeBeanScene from './components/webgl/CoffeeBeanScene';
import SidebarNavigation from './components/navigation/SidebarNavigation';
import InputForm from './components/inputs/InputForm';
import MetricsDashboard from './components/metrics/MetricsDashboard';
import MLGauge from './components/ml/MLGauge';
import CashFlowChart from './components/charts/CashFlowChart';
import SensitivityTornado from './components/charts/SensitivityTornado';
import ScenarioAnalysis from './components/analysis/ScenarioAnalysis';
import BreakEvenChart from './components/charts/BreakEvenChart';
import AlternativeComparisonTable from './components/analysis/AlternativeComparisonTable';
import ClaudeInsights from './components/ai/ClaudeInsights';
import RecommendationSection from './components/ai/RecommendationSection';
import './index.css';

// Placeholder sections - to be implemented fully later
const HeroSection = () => {
  const scrollToInputs = () => {
    document.getElementById('inputs')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="min-h-screen flex flex-col items-center justify-center relative z-10 text-center px-4">
      <div className="glass-panel p-12 max-w-3xl flex flex-col items-center">
        <h1 className="text-6xl md:text-8xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-copper)] via-[var(--accent-gold)] to-[var(--accent-cream)] mb-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          ARABICA
        </h1>
        <p className="text-xl md:text-2xl text-[var(--text-muted)] mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          AI-Powered Capital Budgeting Engine
        </p>
        <button 
          onClick={scrollToInputs}
          className="px-8 py-4 bg-[var(--accent-copper)] hover:bg-[var(--accent-gold)] text-[var(--bg-primary)] font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(201,123,58,0.4)] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300"
        >
          Begin Analysis
        </button>
      </div>
    </section>
  );
};

const InputSection = ({ inputs, setInputs }) => (
  <section id="inputs" className="min-h-screen py-20 px-4 md:px-12 relative z-10">
    <h2 className="text-4xl font-bold mb-12 text-center text-[var(--accent-copper)]">Configure Investment Scenario</h2>
    <InputForm inputs={inputs} setInputs={setInputs} />
  </section>
);

const MetricsSection = ({ results, mlProbability, isOOD, inputs }) => (
  <section id="metrics" className="min-h-screen py-20 px-4 md:px-12 relative z-10 bg-[var(--bg-secondary)]/80">
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-bold text-[var(--accent-copper)] mb-2">Decision Metrics</h2>
          <p className="text-[var(--text-muted)]">Real-time capital budgeting analysis for the selected scenario.</p>
        </div>
        
        <div className="w-64">
          <MLGauge probability={mlProbability} isOOD={isOOD} />
        </div>
      </div>
      
      <MetricsDashboard results={results} inputs={inputs} />
    </div>
  </section>
);

const CashFlowSection = ({ results, inputs }) => (
  <section id="cashflow" className="min-h-screen py-20 px-4 md:px-12 relative z-10">
    <div className="max-w-6xl mx-auto space-y-12">
      <div>
        <h2 className="text-4xl font-bold text-[var(--accent-copper)] mb-8">Cash Flow Projections</h2>
        <div className="glass-panel p-8">
          <CashFlowChart cashFlowSeries={results.cashFlowSeries} />
        </div>
      </div>
      
      <div>
        <h2 className="text-4xl font-bold text-[var(--accent-copper)] mb-8">Break-Even Analysis</h2>
        <div className="glass-panel p-8">
          <BreakEvenChart inputs={inputs} />
        </div>
      </div>
    </div>
  </section>
);

const AnalysisSection = ({ inputs }) => (
  <section id="analysis" className="min-h-screen py-20 px-4 md:px-12 relative z-10 bg-[var(--bg-secondary)]/80">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-[var(--accent-copper)] mb-12">Risk & Sensitivity Analysis</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Tornado Chart (NPV Sensitivity)</h3>
          <p className="text-[var(--text-muted)] mb-8">Measures the impact of ±20% variations in single variables on the Base NPV.</p>
          <SensitivityTornado inputs={inputs} />
        </div>
        
        <div className="glass-panel p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Scenario Analysis</h3>
          <p className="text-[var(--text-muted)] mb-8">Comparing Best, Base, and Worst case outcomes.</p>
          <ScenarioAnalysis inputs={inputs} />
        </div>
      </div>

      <div className="mt-12 glass-panel p-8">
        <h3 className="text-2xl font-bold text-white mb-6">Alternative Investment Comparison</h3>
        <p className="text-[var(--text-muted)] mb-8">Side-by-side comparison of the three mutually exclusive alternatives for Hajar Coffee Co.</p>
        <AlternativeComparisonTable />
      </div>
    </div>
  </section>
);

const AISection = ({ inputs, results, mlProbability }) => (
  <section id="ai-insights" className="min-h-screen py-20 px-4 md:px-12 relative z-10">
    <div className="max-w-6xl mx-auto space-y-16">
      <ClaudeInsights inputs={inputs} results={results} mlProbability={mlProbability} />
      <RecommendationSection />
    </div>
  </section>
);

function App() {
  const [inputs, setInputs] = useState(defaultScenario);
  
  // Memoize calculations so they only run when inputs change
  const results = useMemo(() => runAllCalculations(inputs), [inputs]);
  const mlProbability = useMemo(() => predictAcceptProbability(inputs), [inputs]);
  const isOOD = useMemo(() => checkOutOfDistribution(inputs), [inputs]);

  return (
    <div className="relative bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen font-body">
      <SidebarNavigation />

      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <CoffeeBeanScene />
      </div>

      {/* Main Content (scrolls over fixed background) */}
      <main className="relative z-10 pb-32 pl-0 xl:pl-24">
        <HeroSection />
        <InputSection inputs={inputs} setInputs={setInputs} />
        <MetricsSection results={results} mlProbability={mlProbability} isOOD={isOOD} inputs={inputs} />
        <CashFlowSection results={results} inputs={inputs} />
        <AnalysisSection inputs={inputs} />
        <AISection inputs={inputs} results={results} mlProbability={mlProbability} />
      </main>
    </div>
  );
}

export default App;
