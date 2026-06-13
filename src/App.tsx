import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Navigation from './components/Navigation';
import JournalDomain from './components/JournalDomain';
import InsightsDomain from './components/InsightsDomain';
import StrategyDomain from './components/StrategyDomain';
import DiagnosticsPanel from './components/DiagnosticsPanel';
import { ActivityLog, OffsetLog, ApplianceConfig, WisdomReflection } from './types';
import { COMMUNITY_DISCOURSE } from './data/staticData';
import { WifiOff } from 'lucide-react';

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

const inMemoryStore: Record<string, string> = {};

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'SecurityError') {
        console.warn(`Local storage security block during getItem for key '${key}'. Reverting to secure mock memory.`);
      } else if (err instanceof Error) {
        console.warn(`Error reading key '${key}' from storage: ${err.message}`);
      } else {
        console.warn(`Unknown storage getItem exception for key '${key}'`);
      }
      return inMemoryStore[key] || null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'SecurityError') {
        console.warn(`Local storage security block during setItem for key '${key}'. Reverting to secure mock memory.`);
      } else if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        console.error("Local storage quota exceeded inside safeStorage engine.");
      } else if (err instanceof Error) {
        console.warn(`Error saving key '${key}' to storage: ${err.message}`);
      } else {
        console.warn(`Unknown storage setItem exception for key '${key}'`);
      }
      inMemoryStore[key] = value;
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'SecurityError') {
        console.warn(`Local storage security block during removeItem for key '${key}'. Reverting to secure mock memory.`);
      } else if (err instanceof Error) {
        console.warn(`Error removing key '${key}' from storage: ${err.message}`);
      } else {
        console.warn(`Unknown storage removeItem exception for key '${key}'`);
      }
      delete inMemoryStore[key];
    }
  },
  isAvailable: (): boolean => {
    try {
      const test = '__eco_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'SecurityError') {
        console.log("Local storage is disabled due to iframe sandbox policy or user preferences");
      } else if (err instanceof Error) {
        console.log(`Local storage is not active or offline fallback utilized: ${err.message}`);
      } else {
        console.log("Unknown local storage availability check anomaly");
      }
      return false;
    }
  }
};

export default function App() {
  // Domain switcher
  const [activeDomain, setActiveDomain] = useState<'journal' | 'insights' | 'strategy'>('journal');

  // Storage & Connection diagnostics states
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isOfflineSimulated, setIsOfflineSimulated] = useState(false);
  const [isLocalStorageAvailable] = useState(() => safeStorage.isAvailable());

  // Hardware connection event handler
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Theme state ('light' | 'dark')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = safeStorage.getItem('ecoslate_theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
          return savedTheme;
        }
      } catch (err) {
        if (err instanceof Error) {
          console.warn(`Could not restore saved theme due to standard error: ${err.message}`);
        } else {
          console.warn("Could not restore saved theme due to an unknown storage error.");
        }
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
    try {
      safeStorage.setItem('ecoslate_theme', theme);
    } catch (err) {
      if (err instanceof Error) {
        console.error(`Theme persistence failed: ${err.message}`);
      } else {
        console.error("Theme persistence failed with an unknown error class.");
      }
    }
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
      const storedActivities = safeStorage.getItem('ecoslate_activities');
      setActivityLogs(storedActivities ? JSON.parse(storedActivities) : INITIAL_ACTIVITIES);

      const storedOffsets = safeStorage.getItem('ecoslate_offsets');
      setOffsetLogs(storedOffsets ? JSON.parse(storedOffsets) : INITIAL_OFFSETS);

      const storedApps = safeStorage.getItem('ecoslate_appliances');
      setAppliances(storedApps ? JSON.parse(storedApps) : INITIAL_APPLIANCES);

      const storedDiscourse = safeStorage.getItem('ecoslate_discourse');
      setWisdomDiscourse(storedDiscourse ? JSON.parse(storedDiscourse) : COMMUNITY_DISCOURSE);
    } catch (e) {
      if (e instanceof SyntaxError) {
        console.error('JSON syntax parsing failure when retrieving local storage logs:', e.message);
      } else if (e instanceof Error) {
        console.error('Failed to parse storage elements:', e.message);
      } else {
        console.error('An unknown error class blocked storage initialization:', e);
      }
      // Fallback
      setActivityLogs(INITIAL_ACTIVITIES);
      setOffsetLogs(INITIAL_OFFSETS);
      setAppliances(INITIAL_APPLIANCES);
      setWisdomDiscourse(COMMUNITY_DISCOURSE);
    }
  }, []);

  // Syncing states to SafeStorage (only if initialized or has content)
  useEffect(() => {
    if (activityLogs.length > 0) {
      try {
        safeStorage.setItem('ecoslate_activities', JSON.stringify(activityLogs));
      } catch (err) {
        if (err instanceof Error) {
          console.error(`Activities log store synced failure: ${err.message}`);
        } else {
          console.error("Activities log store synced failure with unknown error type.");
        }
      }
    }
  }, [activityLogs]);

  useEffect(() => {
    if (offsetLogs.length > 0) {
      try {
        safeStorage.setItem('ecoslate_offsets', JSON.stringify(offsetLogs));
      } catch (err) {
        if (err instanceof Error) {
          console.error(`Offsets log store synced failure: ${err.message}`);
        } else {
          console.error("Offsets log store synced failure with unknown error type.");
        }
      }
    }
  }, [offsetLogs]);

  useEffect(() => {
    if (appliances.length > 0) {
      try {
        safeStorage.setItem('ecoslate_appliances', JSON.stringify(appliances));
      } catch (err) {
        if (err instanceof Error) {
          console.error(`Appliances config store synced failure: ${err.message}`);
        } else {
          console.error("Appliances config store synced failure with unknown error type.");
        }
      }
    }
  }, [appliances]);

  useEffect(() => {
    if (wisdomDiscourse.length > 0) {
      try {
        safeStorage.setItem('ecoslate_discourse', JSON.stringify(wisdomDiscourse));
      } catch (err) {
        if (err instanceof Error) {
          console.error(`Discourse list store synced failure: ${err.message}`);
        } else {
          console.error("Discourse list store synced failure with unknown error type.");
        }
      }
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
      safeStorage.removeItem('ecoslate_activities');
      safeStorage.removeItem('ecoslate_offsets');
      safeStorage.removeItem('ecoslate_appliances');
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
        isOnline={isOnline}
        isOfflineSimulated={isOfflineSimulated}
        isLocalStorageAvailable={isLocalStorageAvailable}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
      />

      {/* Offline Mode Indicator banner */}
      {(!isOnline || isOfflineSimulated) && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-light border-b border-amber-muted/20 px-6 py-2.5 text-center text-xs text-[#b58d4a] font-mono flex items-center justify-center gap-2 select-none"
        >
          <WifiOff className="w-4 h-4 shrink-0 animate-pulse text-[#b58d4a]" />
          <span>
            Eco Slate is in <strong>{isOfflineSimulated ? 'Simulated Offline Autonomy' : 'Offline Mode'}</strong>. All calculations and ledger entries are persisting securely to client state storage.
          </span>
        </motion.div>
      )}

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
              id="journal-panel"
              role="tabpanel"
              aria-labelledby="nav-tab-journal"
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
              id="insights-panel"
              role="tabpanel"
              aria-labelledby="nav-tab-insights"
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
              id="strategy-panel"
              role="tabpanel"
              aria-labelledby="nav-tab-strategy"
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
            <p className="font-bold text-charcoal text-sm font-serif flex items-center gap-2">
              Eco Slate
              <span className="font-mono text-[8px] uppercase tracking-widest font-bold px-1.5 py-0.5 border border-[#b58d4a]/20 text-[#b58d4a] rounded bg-[#b58d4a]/5">
                DEMO VERSION
              </span>
            </p>
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

      {/* System Diagnostics Drawer Component */}
      <DiagnosticsPanel
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        isOfflineSimulated={isOfflineSimulated}
        setIsOfflineSimulated={setIsOfflineSimulated}
        isOnline={isOnline}
        isLocalStorageAvailable={isLocalStorageAvailable}
        activityLogs={activityLogs}
        offsetLogs={offsetLogs}
        appliances={appliances}
        onImportBackup={({ activityLogs: act, offsetLogs: off, appliances: app }) => {
          setActivityLogs(act);
          setOffsetLogs(off);
          setAppliances(app);
        }}
        onClearAll={() => {
          if (window.confirm('IRREVERSIBLE WORKSPACE WIPE: Are you sure you want to hard reset all of your local ledger registries and stored backup cache?')) {
            setActivityLogs([]);
            setOffsetLogs([]);
            setAppliances([]);
            safeStorage.removeItem('ecoslate_activities');
            safeStorage.removeItem('ecoslate_offsets');
            safeStorage.removeItem('ecoslate_appliances');
            setIsDiagnosticsOpen(false);
          }
        }}
      />
    </div>
  );
}
