import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Navigation from './components/Navigation';
import JournalDomain from './components/JournalDomain';
import InsightsDomain from './components/InsightsDomain';
import StrategyDomain from './components/StrategyDomain';
import { ActivityLog, OffsetLog, ApplianceConfig, WisdomReflection } from './types';
import { COMMUNITY_DISCOURSE } from './data/staticData';
import { BookOpen, Compass, ShieldAlert, Sparkles, RefreshCw, Feather, Flame, AlertCircle } from 'lucide-react';

const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act-sample-1',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    date: new Date(Date.now() - 3600000 * 24).toISOString().split('T')[0],
    category: 'commute',
    description: 'Bypassed highway congestions via High-speed Commuter Rail',
    carbonAmount: 1.25,
    details: { distanceKm: 42, commuteType: 'rail' }
  },
  {
    id: 'act-sample-2',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
    date: new Date(Date.now() - 3600000 * 48).toISOString().split('T')[0],
    category: 'diet',
    description: 'Committed fully vegetarian home harvest diet',
    carbonAmount: 1.3,
    details: { dietType: 'vegetarian' }
  }
];

const INITIAL_OFFSETS: OffsetLog[] = [
  {
    id: 'offset-sample-1',
    timestamp: new Date(Date.now() - 3600000 * 30).toISOString(),
    projectType: 'reforestation',
    projectName: 'Cascadian Old-Growth Cedar SOW Program',
    offsetAmount: 120,
    costUSD: 14.40
  }
];

const INITIAL_APPLIANCES: ApplianceConfig[] = [
  {
    id: 'app-sample-1',
    applianceTypeId: 'fridge',
    customName: 'E-Star Low Draw Kitchen Fridge',
    watts: 180,
    dailyHours: 24,
    count: 1,
    monthlyFootprint: 49.25
  },
  {
    id: 'app-sample-2',
    applianceTypeId: 'lighting-led',
    customName: 'Efficacy living-room LED Array',
    watts: 80,
    dailyHours: 6,
    count: 1,
    monthlyFootprint: 5.48
  }
];

export default function App() {
  // Domain switcher
  const [activeDomain, setActiveDomain] = useState<'journal' | 'insights' | 'strategy'>('journal');

  // Theme state ('light' | 'dark')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('ecoslate_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Keep HTML class in sync with theme state
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('ecoslate_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Persistence States
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [offsetLogs, setOffsetLogs] = useState<OffsetLog[]>([]);
  const [appliances, setAppliances] = useState<ApplianceConfig[]>([]);
  const [wisdomDiscourse, setWisdomDiscourse] = useState<WisdomReflection[]>([]);

  // Initial loading effect
  useEffect(() => {
    try {
      const storedActivities = localStorage.getItem('ecoslate_activities');
      setActivityLogs(storedActivities ? JSON.parse(storedActivities) : INITIAL_ACTIVITIES);

      const storedOffsets = localStorage.getItem('ecoslate_offsets');
      setOffsetLogs(storedOffsets ? JSON.parse(storedOffsets) : INITIAL_OFFSETS);

      const storedApps = localStorage.getItem('ecoslate_appliances');
      setAppliances(storedApps ? JSON.parse(storedApps) : INITIAL_APPLIANCES);

      const storedDiscourse = localStorage.getItem('ecoslate_discourse');
      setWisdomDiscourse(storedDiscourse ? JSON.parse(storedDiscourse) : COMMUNITY_DISCOURSE);
    } catch (e) {
      console.error('Failed to parse localStorage elements', e);
      // Fallback
      setActivityLogs(INITIAL_ACTIVITIES);
      setOffsetLogs(INITIAL_OFFSETS);
      setAppliances(INITIAL_APPLIANCES);
      setWisdomDiscourse(COMMUNITY_DISCOURSE);
    }
  }, []);

  // Syncing states to localStorage
  useEffect(() => {
    if (activityLogs.length > 0) {
      localStorage.setItem('ecoslate_activities', JSON.stringify(activityLogs));
    }
  }, [activityLogs]);

  useEffect(() => {
    if (offsetLogs.length > 0) {
      localStorage.setItem('ecoslate_offsets', JSON.stringify(offsetLogs));
    }
  }, [offsetLogs]);

  useEffect(() => {
    if (appliances.length > 0) {
      localStorage.setItem('ecoslate_appliances', JSON.stringify(appliances));
    }
  }, [appliances]);

  useEffect(() => {
    if (wisdomDiscourse.length > 0) {
      localStorage.setItem('ecoslate_discourse', JSON.stringify(wisdomDiscourse));
    }
  }, [wisdomDiscourse]);

  // Global totals computation
  const totalEmittedKg = activityLogs.reduce((sum, item) => sum + item.carbonAmount, 0);
  const totalOffsetKg = offsetLogs.reduce((sum, item) => sum + item.offsetAmount, 0);
  const netBalanceKg = Math.max(0, Number((totalEmittedKg - totalOffsetKg).toFixed(1)));

  // Wipe Slate function
  const handleClearSlate = () => {
    if (window.confirm('Are you sure you want to clean your Carbon Ledger Slate? This action is irreversible.')) {
      setActivityLogs([]);
      setOffsetLogs([]);
      setAppliances([]);
      localStorage.removeItem('ecoslate_activities');
      localStorage.removeItem('ecoslate_offsets');
      localStorage.removeItem('ecoslate_appliances');
    }
  };

  return (
    <div className="min-h-screen bg-paper text-charcoal font-narrative selection:bg-emerald-light flex flex-col justify-between">
      {/* Top Banner Navigation */}
      <Navigation
        activeDomain={activeDomain}
        setActiveDomain={setActiveDomain}
        netBalanceKg={netBalanceKg}
        totalEmittedKg={totalEmittedKg}
        totalOffsetKg={totalOffsetKg}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-8 flex-grow w-full relative">
        {/* Dynamic header summary panel depending on domain */}
        <div className="mb-8 border-b border-paper-border pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-1">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#b58d4a] font-bold">
              Domain / {activeDomain.toUpperCase()}
            </span>
            <h2 className="font-serif text-3xl font-extrabold text-clay">
              {activeDomain === 'journal' && 'Personal Accountability Slate'}
              {activeDomain === 'insights' && 'Macro Atmospheric Insights'}
              {activeDomain === 'strategy' && 'Actionable Shift Wisdom'}
            </h2>
            <p className="font-sans text-xs text-earth-muted italic">
              {activeDomain === 'journal' && 'Recording the direct atomic weight of daily orbits.'}
              {activeDomain === 'insights' && 'Placing local lifestyle choices inside the global industrial footprint.'}
              {activeDomain === 'strategy' && 'Strategic swaps modeling physical lifestyle modifications.'}
            </p>
          </div>

          {/* Quick reset actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClearSlate}
              className="px-3 py-1.5 font-mono text-[10px] text-rose-muted hover:text-rose-deep border border-paper-border hover:bg-rose-light/40 transition-all rounded"
              title="Reset ledger elements back to empty"
            >
              CLEAR LEDGER ONLY
            </button>
          </div>
        </div>

        {/* Dynamic Domain Renderers */}
        <div className="min-h-[500px]">
          {activeDomain === 'journal' && (
            <motion.div
              key="journal-slug"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <JournalDomain
                activityLogs={activityLogs}
                setActivityLogs={setActivityLogs}
                offsetLogs={offsetLogs}
                setOffsetLogs={setOffsetLogs}
                appliances={appliances}
                setAppliances={setAppliances}
              />
            </motion.div>
          )}

          {activeDomain === 'insights' && (
            <motion.div
              key="insights-slug"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <InsightsDomain
                activityLogs={activityLogs}
                offsetLogs={offsetLogs}
              />
            </motion.div>
          )}

          {activeDomain === 'strategy' && (
            <motion.div
              key="strategy-slug"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <StrategyDomain
                wisdomDiscourse={wisdomDiscourse}
                setWisdomDiscourse={setWisdomDiscourse}
              />
            </motion.div>
          )}
        </div>
      </main>

      {/* Wabi Sabi Footer */}
      <footer className="border-t border-paper-border bg-paper-card py-8 px-6 mt-16 text-center md:text-left transition-all">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-serif text-earth-muted">
          <div>
            <p className="font-bold text-charcoal text-sm font-serif">Eco Slate</p>
            <p className="font-sans text-[11px] mt-1 text-earth-muted">
              Built under high environmental transparency standards. Continuous local persistence enabled.
            </p>
          </div>

          <div className="flex gap-6 font-mono text-[10px] tracking-wider uppercase font-semibold">
            <span className="hover:text-emerald-deep cursor-help" title="Based on IPCC/EPA calculations">Calculations eGRID 2022</span>
            <span>Refractive Wabi-Sabi Aesthetics</span>
            <span className="text-rose-muted font-bold">Atmosphere Balance</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
