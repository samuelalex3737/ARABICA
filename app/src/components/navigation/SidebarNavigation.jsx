import React, { useEffect, useState } from 'react';
import { Home, Settings, BarChart2, TrendingUp, Compass, Cpu } from 'lucide-react';

const navItems = [
  { id: 'hero', label: 'Home', icon: Home },
  { id: 'inputs', label: 'Configuration', icon: Settings },
  { id: 'metrics', label: 'Decision Metrics', icon: BarChart2 },
  { id: 'cashflow', label: 'Cash Flows', icon: TrendingUp },
  { id: 'analysis', label: 'Analysis', icon: Compass },
  { id: 'ai-insights', label: 'AI Insights', icon: Cpu },
];

export default function SidebarNavigation() {
  const [activeId, setActiveId] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      // Find the section that is currently most visible
      let currentActive = 'hero';
      let minDistance = Infinity;

      navItems.forEach(item => {
        const element = document.getElementById(item.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Distance from the top third of the viewport
          const distance = Math.abs(rect.top - window.innerHeight / 3);
          
          if (distance < minDistance) {
            minDistance = distance;
            currentActive = item.id;
          }
        }
      });

      setActiveId(currentActive);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed left-0 top-1/2 -translate-y-1/2 z-50 pl-4 hidden xl:block">
      <div className="glass-panel py-6 px-3 flex flex-col gap-6 rounded-3xl bg-[var(--bg-primary)]/40">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="group relative flex items-center justify-center p-2 rounded-full transition-all duration-300"
              aria-label={item.label}
            >
              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-1 bg-[var(--bg-elevated)] border border-[var(--glass-border)] rounded-md text-sm whitespace-nowrap opacity-0 -translate-x-4 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                {item.label}
              </div>
              
              {/* Active Background Pill */}
              {isActive && (
                <div className="absolute inset-0 bg-[var(--accent-copper)] rounded-full -z-10" />
              )}
              
              <Icon 
                size={20} 
                className={`transition-colors duration-300 ${isActive ? 'text-[var(--bg-primary)]' : 'text-[var(--text-muted)] group-hover:text-white'}`} 
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
