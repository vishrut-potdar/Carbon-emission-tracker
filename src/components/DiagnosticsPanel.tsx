import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wifi, 
  WifiOff, 
  Database, 
  Cpu, 
  Download, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  FileText,
  Trash2,
  FileCheck
} from 'lucide-react';

interface DiagnosticsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isOfflineSimulated: boolean;
  setIsOfflineSimulated: (val: boolean) => void;
  isOnline: boolean;
  isLocalStorageAvailable: boolean;
  activityLogs: any[];
  offsetLogs: any[];
  appliances: any[];
  onImportBackup: (data: { activityLogs: any[], offsetLogs: any[], appliances: any[] }) => void;
  onClearAll: () => void;
}

export default function DiagnosticsPanel({
  isOpen,
  onClose,
  isOfflineSimulated,
  setIsOfflineSimulated,
  isOnline,
  isLocalStorageAvailable,
  activityLogs,
  offsetLogs,
  appliances,
  onImportBackup,
  onClearAll
}: DiagnosticsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');

  // Calculate stats
  const totalRecords = activityLogs.length + offsetLogs.length + appliances.length;
  const rawJSON = JSON.stringify({ activityLogs, offsetLogs, appliances });
  const storageBytes = new Blob([rawJSON]).size;
  const storageKb = (storageBytes / 1024).toFixed(2);

  // Backup exporter
  const handleExportBackup = () => {
    try {
      const backupData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        activityLogs,
        offsetLogs,
        appliances
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eco-slate-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(`Export failed: ${e.message}`);
    }
  };

  // Backup importer
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        // Validation check for logs structure
        const validatedActivities = Array.isArray(parsed.activityLogs) ? parsed.activityLogs : [];
        const validatedOffsets = Array.isArray(parsed.offsetLogs) ? parsed.offsetLogs : [];
        const validatedAppliances = Array.isArray(parsed.appliances) ? parsed.appliances : [];

        if (validatedActivities.length === 0 && validatedOffsets.length === 0 && validatedAppliances.length === 0) {
          throw new Error("No valid database structure found in backup file.");
        }

        onImportBackup({
          activityLogs: validatedActivities,
          offsetLogs: validatedOffsets,
          appliances: validatedAppliances
        });

        setImportStatus('success');
        setImportMessage(`Imported ${validatedActivities.length} logs, ${validatedOffsets.length} offsets, and ${validatedAppliances.length} appliance profiles.`);
        setTimeout(() => setImportStatus('idle'), 5000);
      } catch (err: any) {
        console.error(err);
        setImportStatus('error');
        setImportMessage(err.message || "Failed to process backup file. Verify JSON syntax.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-[2px]"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-paper border-l border-paper-border z-50 overflow-y-auto font-sans shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-6 border-b border-paper-border flex items-center justify-between bg-paper-card">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-amber-muted" />
                <div>
                  <h3 className="font-serif text-lg font-extrabold text-clay">System Diagnostics</h3>
                  <p className="text-[10px] text-earth-muted font-mono tracking-widest uppercase">Incognito & Connection Sandbox</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-paper-border flex items-center justify-center text-earth-muted hover:text-charcoal hover:bg-paper transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Space */}
            <div className="p-6 flex-grow space-y-6">
              
              {/* Connection Status & Simulation Section */}
              <div className="border border-paper-border rounded-xl p-4 space-y-3.5 bg-paper-card shadow-sm">
                <h4 className="font-serif text-sm font-bold text-clay flex items-center gap-1.5">
                  <Wifi className="w-4 h-4 text-emerald-deep" /> Connectivity Architecture
                </h4>
                
                {/* Visual state badges */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="border border-paper-border px-3 py-2 rounded-lg flex flex-col justify-center">
                    <span className="text-[9px] text-earth-muted uppercase">Hardware Link</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-deep animate-pulse' : 'bg-rose-muted'}`} />
                      <span className="font-bold text-charcoal">{isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                  </div>

                  <div className="border border-paper-border px-3 py-2 rounded-lg flex flex-col justify-center">
                    <span className="text-[9px] text-earth-muted uppercase">Logic Mode</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-2 h-2 rounded-full ${isOfflineSimulated ? 'bg-amber-muted' : 'bg-emerald-deep'}`} />
                      <span className="font-bold text-charcoal">
                        {isOfflineSimulated ? 'Simulated Offline' : 'Connected'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-earth-muted leading-relaxed">
                  Toggle simulated offline mode to test how Eco Slate's client-side carbon calculation engine operates autonomously without any external WAN capabilities.
                </div>

                <div className="pt-1.5">
                  <button
                    onClick={() => setIsOfflineSimulated(!isOfflineSimulated)}
                    className={`w-full py-2 px-4 rounded-lg font-mono text-[11px] font-bold uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${
                      isOfflineSimulated 
                        ? 'bg-amber-light text-amber-muted border-amber-muted/40 hover:bg-amber-light/80' 
                        : 'bg-emerald-deep text-paper border-transparent hover:bg-emerald-deep/90'
                    }`}
                  >
                    {isOfflineSimulated ? (
                      <>
                        <WifiOff className="w-3.5 h-3.5 animate-bounce" />
                        Restore Network Connection
                      </>
                    ) : (
                      <>
                        <Wifi className="w-3.5 h-3.5" />
                        Simulate Offline State
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Incognito Diagnostics */}
              <div className="border border-paper-border rounded-xl p-4 space-y-3 bg-paper-card shadow-sm">
                <h4 className="font-serif text-sm font-bold text-clay flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-[#b58d4a]" /> Persistence Sandbox Diagnostics
                </h4>

                <div className="flex items-start gap-3 border border-paper-border rounded-lg p-3">
                  <div className="p-1.5 bg-paper rounded">
                    {isLocalStorageAvailable ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-deep" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-muted animate-pulse" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-mono text-xs font-bold text-charcoal">
                      LocalStorage: {isLocalStorageAvailable ? 'Writable & Operational' : 'Restricted (Blocked/Sandbox)'}
                    </div>
                    <div className="text-[10px] text-earth-muted leading-relaxed">
                      {isLocalStorageAvailable 
                        ? 'Persistent local caching is active. Session data remains across system restarts and private epochs.' 
                        : 'Safe In-Memory sandbox active. Data is kept inside state memory and will flush when browser closes.'}
                    </div>
                  </div>
                </div>

                {/* Storage Health Metrics */}
                <div className="space-y-2 pt-1 font-mono text-[11px]">
                  <div className="flex justify-between border-b border-paper-border/50 pb-1">
                    <span className="text-earth-muted uppercase text-[9px] font-bold">Total Ledgers Cached</span>
                    <span className="text-charcoal font-bold">{totalRecords} Records</span>
                  </div>
                  <div className="flex justify-between border-b border-paper-border/50 pb-1">
                    <span className="text-earth-muted uppercase text-[9px] font-bold">Estimated Storage Weight</span>
                    <span className="text-charcoal font-bold">{storageKb} KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-earth-muted uppercase text-[9px] font-bold">Telemetry Health</span>
                    <span className="text-emerald-deep font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-deep rounded-full" /> Stable CJS
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Import & Export Backup */}
              <div className="border border-paper-border rounded-xl p-4 space-y-3 bg-paper-card shadow-sm">
                <h4 className="font-serif text-sm font-bold text-clay flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-rose-muted" /> JSON Ledger Migrator
                </h4>
                
                <div className="text-[11px] text-earth-muted leading-relaxed pb-1">
                  Safeguard your carbon ledger measurements. Export your logs to a JSON data file, or upload an existing backup to load your historical slate on this device. Perfect for incognito tests!
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 font-mono text-[10px]">
                  <button
                    onClick={handleExportBackup}
                    className="py-2.5 px-3 border border-paper-border rounded-lg text-charcoal hover:bg-paper hover:text-emerald-deep hover:border-emerald-deep/40 transition-all font-bold flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    EXPORT DATA
                  </button>

                  <button
                    onClick={handleImportClick}
                    className="py-2.5 px-3 border border-paper-border rounded-lg text-charcoal hover:bg-paper hover:text-[#b58d4a] hover:border-[#b58d4a]/40 transition-all font-bold flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    IMPORT BACKUP
                  </button>
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".json" 
                  className="hidden" 
                />

                {/* Import Status Messages */}
                {importStatus === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2 border border-emerald-deep/20 bg-emerald-light/40 rounded text-emerald-deep font-mono text-[10px] flex items-start gap-1.5"
                  >
                    <FileCheck className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{importMessage}</span>
                  </motion.div>
                )}

                {importStatus === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2 border border-rose-muted/20 bg-rose-light/40 rounded text-rose-muted font-mono text-[10px] flex items-start gap-1.5"
                  >
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{importMessage}</span>
                  </motion.div>
                )}
              </div>

            </div>

            {/* Clear All Data Option */}
            <div className="p-6 border-t border-paper-border bg-paper-card">
              <button
                onClick={onClearAll}
                className="w-full py-2.5 px-4 rounded-lg bg-rose-light text-rose-muted hover:bg-rose-muted hover:text-paper font-mono text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-rose-muted/20"
              >
                <Trash2 className="w-4 h-4" />
                DANGEROUS: WIPE ALL LOGS
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
