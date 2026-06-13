import { motion } from 'motion/react';
import { BookOpen, Compass, Library, Feather, Sun, Moon } from 'lucide-react';

interface NavigationProps {
  activeDomain: 'journal' | 'insights' | 'strategy';
  setActiveDomain: (domain: 'journal' | 'insights' | 'strategy') => void;
  netBalanceKg: number;
  totalEmittedKg: number;
  totalOffsetKg: number;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isOnline: boolean;
  isOfflineSimulated: boolean;
  isLocalStorageAvailable: boolean;
  onOpenDiagnostics: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  activeDomain,
  setActiveDomain,
  netBalanceKg,
  totalEmittedKg,
  totalOffsetKg,
  theme,
  toggleTheme,
  isOnline,
  isOfflineSimulated,
  isLocalStorageAvailable,
  onOpenDiagnostics
}) => {
  return (
    <header className="border-b border-paper-border bg-paper/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-deep flex items-center justify-center rounded-lg shadow-sm">
            <Feather className="text-paper w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-tight text-charcoal flex items-center gap-1.5">
              Eco Slate 
              <span className="font-mono text-[9px] uppercase tracking-widest font-semibold px-1.5 py-0.2 border border-emerald-deep/20 text-emerald-deep rounded bg-emerald-light">
                No. 01
              </span>
            </h1>
            <p className="font-sans text-[10px] text-earth-muted tracking-wide italic">Personal Carbon Ledger</p>
          </div>
        </div>

        {/* Compact, Clean Balance Pill */}
        <div className="hidden lg:flex items-center gap-4 bg-paper-card border border-paper-border/80 rounded-full px-4 py-1.5 text-[11px] font-mono shadow-sm">
          <div className="flex items-center gap-1">
            <span className="text-earth-muted font-medium">Emitted:</span>
            <span className="font-bold text-charcoal">{totalEmittedKg.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</span>
          </div>
          <span className="text-paper-border font-light">|</span>
          <div className="flex items-center gap-1">
            <span className="text-earth-muted font-medium">Offset:</span>
            <span className="font-bold text-emerald-deep">-{totalOffsetKg.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</span>
          </div>
          <span className="text-paper-border font-light">|</span>
          <div className="flex items-center gap-1">
            <span className="text-[#b58d4a]/90 font-bold">Net:</span>
            <span className={`font-bold ${netBalanceKg <= 0 ? 'text-emerald-deep' : 'text-amber-muted'}`}>
              {netBalanceKg <= 0 ? '' : '+'}{netBalanceKg.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg
            </span>
          </div>
        </div>

        {/* Navigation & Theme Toggle Row */}
        <div className="flex items-center gap-3">
          {/* Primary Domains Navigation Switches */}
          <div className="flex bg-paper-card border border-paper-border p-1 rounded-lg soft-shadow relative">
            <button
              id="nav-tab-journal"
              onClick={() => setActiveDomain('journal')}
              className={`relative flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-md transition-colors duration-300 z-10 ${
                activeDomain === 'journal'
                  ? 'text-charcoal font-semibold'
                  : 'text-earth-muted hover:text-charcoal'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              JOURNAL
              {activeDomain === 'journal' && (
                <motion.div
                  layoutId="active-domain-pill"
                  className="absolute inset-0 bg-paper-border rounded-md shadow-sm -z-10"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}
            </button>
            
            <button
              id="nav-tab-insights"
              onClick={() => setActiveDomain('insights')}
              className={`relative flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-md transition-colors duration-300 z-10 ${
                activeDomain === 'insights'
                  ? 'text-charcoal font-semibold'
                  : 'text-earth-muted hover:text-charcoal'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              INSIGHTS
              {activeDomain === 'insights' && (
                <motion.div
                  layoutId="active-domain-pill"
                  className="absolute inset-0 bg-paper-border rounded-md shadow-sm -z-10"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}
            </button>

            <button
              id="nav-tab-strategy"
              onClick={() => setActiveDomain('strategy')}
              className={`relative flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-md transition-colors duration-300 z-10 ${
                activeDomain === 'strategy'
                  ? 'text-charcoal font-semibold'
                  : 'text-earth-muted hover:text-charcoal'
              }`}
            >
              <Library className="w-3.5 h-3.5" />
              STRATEGY
              {activeDomain === 'strategy' && (
                <motion.div
                  layoutId="active-domain-pill"
                  className="absolute inset-0 bg-paper-border rounded-md shadow-sm -z-10"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}
            </button>
          </div>

          {/* Diagnostics Status Pill & Trigger */}
          <button
            onClick={onOpenDiagnostics}
            className="h-9 px-3 flex items-center gap-2 rounded-lg bg-paper-card border border-paper-border text-xs text-earth-muted hover:text-charcoal transition-all soft-shadow font-mono"
            title="Open Sandbox Storage & Connection Diagnostics"
          >
            <span className={`w-2 h-2 rounded-full ${(!isOnline || isOfflineSimulated) ? 'bg-[#b58d4a] animate-pulse' : 'bg-emerald-deep'}`} />
            <span className="hidden sm:inline font-bold">
              {!isOnline || isOfflineSimulated ? 'OFFLINE' : isLocalStorageAvailable ? 'SECURE' : 'MEM_SAND'}
            </span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-paper-card border border-paper-border text-earth-muted hover:text-charcoal transition-all soft-shadow"
            title={theme === 'light' ? 'Switch to Charcoal Mode' : 'Switch to Paper Mode'}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-earth-muted hover:scale-105 transition-all" />
            ) : (
              <Sun className="w-4 h-4 text-amber-muted hover:scale-105 transition-all" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
