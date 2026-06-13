import { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ActivityLog, 
  OffsetLog, 
  ApplianceConfig, 
  LogCategory 
} from '../types';
import { 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle, 
  FileText, 
  Download,
  Mic,
  MicOff,
  Loader2,
  Calendar,
  TrendingDown,
  Info,
  Target
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { EMISSION_FACTORS, APPLIANCE_PRESETS } from '../data/staticData';
import { 
  calculateCommuteCarbon, 
  calculateDietCarbon, 
  calculateProcurementCarbon, 
  calculateApplianceMonthlyFootprint,
  formatUSD
} from '../utils/carbonCalc';

interface JournalDomainProps {
  activityLogs: ActivityLog[];
  setActivityLogs: Dispatch<SetStateAction<ActivityLog[]>>;
  offsetLogs: OffsetLog[];
  setOffsetLogs: Dispatch<SetStateAction<OffsetLog[]>>;
  appliances: ApplianceConfig[];
  setAppliances: Dispatch<SetStateAction<ApplianceConfig[]>>;
}

const JournalDomain = ({
  activityLogs,
  setActivityLogs,
  offsetLogs,
  setOffsetLogs,
  appliances,
  setAppliances
}: JournalDomainProps) => {
  // Navigation inside Domain 1
  const [journalSubTab, setJournalSubTab] = useState<'timeline' | 'offsets' | 'appliances'>('timeline');

  // Activity input state
  const [category, setCategory] = useState<LogCategory>('commute');
  const [description, setDescription] = useState('');
  
  // Details state
  const [distanceKm, setDistanceKm] = useState<number>(15);
  const [commuteType, setCommuteType] = useState<keyof typeof EMISSION_FACTORS.commute>('drive-ice');
  
  const [dietDays, setDietDays] = useState<number>(1);
  const [dietType, setDietType] = useState<keyof typeof EMISSION_FACTORS.diet>('vegetarian');
  
  const [procurementQty, setProcurementQty] = useState<number>(1);
  const [procurementType, setProcurementType] = useState<keyof typeof EMISSION_FACTORS.procurement>('garments');

  // Offset input state
  const [offsetProject, setOffsetProject] = useState<'reforestation' | 'renewable-solar' | 'cooking-stoves' | 'methane-capture'>('reforestation');
  const [offsetAmountKg, setOffsetAmountKg] = useState<number>(100);

  // Appliance input state
  const [selectedAppPresetId, setSelectedAppPresetId] = useState(APPLIANCE_PRESETS[0].id);
  const [applianceCustomName, setApplianceCustomName] = useState('');
  const [applianceHours, setApplianceHours] = useState<number>(5);
  const [applianceQuantity, setApplianceQuantity] = useState<number>(1);

  // Perceived performance loading state
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Date range filter states
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  // Helper for computing relative ISO date strings in YYYY-MM-DD
  const getRelativeDateStr = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 650);
    return () => clearTimeout(timer);
  }, []);

  // Voice transcription & AI parsing states
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [aiParsing, setAiParsing] = useState(false);
  const [parsedDraft, setParsedDraft] = useState<{
    category: LogCategory;
    description: string;
    distanceKm?: number;
    commuteType?: string;
    dietType?: string;
    dietDays?: number;
    procurementType?: string;
    quantity?: number;
  } | null>(null);

  const parseDictatedText = async (textToParse: string) => {
    if (!textToParse.trim()) return;
    setAiParsing(true);
    setSpeechError(null);
    setParsedDraft(null);

    // Offline pre-emptive validation
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSpeechError("Network Connection Offline: AI transcription parsing is unavailable. Please restore your connection or enter logs manually.");
      setAiParsing(false);
      return;
    }

    try {
      const response = await fetch("/api/gemini/parse-log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: textToParse }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Could not parse logging statements.");
      }

      const data = await response.json();
      if (data && data.category) {
        setParsedDraft(data);
      } else {
        setSpeechError("AI was unable to recognize carbon metrics in that text.");
      }
    } catch (err: any) {
      console.error(err);
      setSpeechError(err.message || "Failure analyzing dictation. Make sure API key is configured.");
    } finally {
      setAiParsing(false);
    }
  };

  const startListening = () => {
    setSpeechError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError("Browser lacks speech recognition. Try using Chrome or Safari.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event);
        setSpeechError(`Voice input error: ${event.error || 'unknown'}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setDescription(transcript);
          await parseDictatedText(transcript);
        }
      };

      recognition.start();
    } catch (err: any) {
      console.error(err);
      setSpeechError("Failed to initiate voice capture.");
      setIsListening(false);
    }
  };

  const applyParsedDraft = () => {
    if (!parsedDraft) return;

    setCategory(parsedDraft.category);
    setDescription(parsedDraft.description);

    if (parsedDraft.category === 'commute') {
      if (typeof parsedDraft.distanceKm === 'number') {
        setDistanceKm(parsedDraft.distanceKm);
      }
      if (parsedDraft.commuteType) {
        setCommuteType(parsedDraft.commuteType as any);
      }
    } else if (parsedDraft.category === 'diet') {
      if (typeof parsedDraft.dietDays === 'number') {
        setDietDays(parsedDraft.dietDays);
      }
      if (parsedDraft.dietType) {
        setDietType(parsedDraft.dietType as any);
      }
    } else if (parsedDraft.category === 'procurement') {
      if (typeof parsedDraft.quantity === 'number') {
        setProcurementQty(parsedDraft.quantity);
      }
      if (parsedDraft.procurementType) {
        setProcurementType(parsedDraft.procurementType as any);
      }
    }

    setParsedDraft(null);
  };

  // Daily budget restriction states
  const [dailyBudget, setDailyBudget] = useState<number>(10);
  const [showConfirmClear, setShowConfirmClear] = useState<boolean>(false);
  const [isGuardExpanded, setIsGuardExpanded] = useState<boolean>(false);

  // Monthly Budget Goal Tracker states & calculations
  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => {
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem('ecoslate_monthly_budget') : null;
      return stored ? Number(stored) : 500;
    } catch {
      return 500;
    }
  });
  const [isMonthlyGoalExpanded, setIsMonthlyGoalExpanded] = useState<boolean>(false);

  const updateMonthlyBudget = (val: number) => {
    setMonthlyBudget(val);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('ecoslate_monthly_budget', String(val));
      }
    } catch (e) {
      // Graceful fallback for incognito mode sandbox
    }
  };

  const currentYearMonth = new Date().toISOString().slice(0, 7);
  const currentMonthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  let currentMonthEmissions = 0;
  activityLogs.forEach(log => {
    const d = log.date || new Date(log.timestamp).toISOString().split('T')[0];
    if (d && d.startsWith(currentYearMonth)) {
      currentMonthEmissions += log.carbonAmount;
    }
  });

  let currentMonthOffsets = 0;
  offsetLogs.forEach(log => {
    const d = new Date(log.timestamp).toISOString().split('T')[0];
    if (d && d.startsWith(currentYearMonth)) {
      currentMonthOffsets += log.offsetAmount;
    }
  });

  const netCurrentMonthEmissions = Math.max(0, currentMonthEmissions - currentMonthOffsets);

  // Group activity logs by date and calculate sum of carbonAmount for each date
  const dailyTotals: Record<string, number> = {};
  activityLogs.forEach(log => {
    const d = log.date || new Date(log.timestamp).toISOString().split('T')[0];
    dailyTotals[d] = (dailyTotals[d] || 0) + log.carbonAmount;
  });

  // Identify any dates that exceed the daily budget limit
  const overbudgetDays = Object.entries(dailyTotals)
    .filter(([_, sum]) => sum > dailyBudget)
    .map(([date, sum]) => ({ date, sum }));

  // Calculate today's emissions
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTotal = dailyTotals[todayStr] || 0;

  // Filtered logs based on selected date range criteria
  const filteredLogs = activityLogs.filter(log => {
    const logDate = log.date || new Date(log.timestamp).toISOString().split('T')[0];
    if (filterStartDate && logDate < filterStartDate) return false;
    if (filterEndDate && logDate > filterEndDate) return false;
    return true;
  });

  // Clear Activity Logs Handler
  const handleClearLogs = () => {
    setActivityLogs([]);
    setShowConfirmClear(false);
  };

  // Export as CSV
  const handleExportCSV = () => {
    if (activityLogs.length === 0) return;
    
    // Headers matching professional wabi-sabi journal ledger
    const headers = ['ID', 'Timestamp', 'Date', 'Category', 'Description', 'Carbon Amount (kg CO2e)'];
    
    const rows = activityLogs.map(log => [
      log.id,
      log.timestamp,
      log.date,
      log.category,
      `"${(log.description || '').replace(/"/g, '""')}"`,
      log.carbonAmount
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", encodedUri);
    downloadLink.setAttribute("download", `eco_slate_activities_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Export as JSON
  const handleExportJSON = () => {
    if (activityLogs.length === 0) return;
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activityLogs, null, 2));
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", dataStr);
    downloadLink.setAttribute("download", `eco_slate_activities_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Active ledger stats
  const totalEmitted = activityLogs.reduce((acc, log) => acc + log.carbonAmount, 0);
  const totalOffset = offsetLogs.reduce((acc, log) => acc + log.offsetAmount, 0);
  const netBalance = totalEmitted - totalOffset;

  // Responsive container observer for carbon distribution graph
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(208);

  useEffect(() => {
    if (isLoading || !containerRef.current) return;
    const element = containerRef.current;

    let resizeTimer: any;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;

      // Debounce updates for rapid window resizing
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setContainerWidth(width);
      }, 50);
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
      clearTimeout(resizeTimer);
    };
  }, [isLoading]);

  // Dynamic radius based on measured container width, preventing clipping on extra small devices
  const innerRadius = Math.max(38, Math.min(containerWidth * 0.32, 68));
  const outerRadius = Math.max(52, Math.min(containerWidth * 0.44, 92));

  // Dynamic font sizing for center text label/value
  const centerLabelSize = containerWidth < 160 ? 'text-[8px]' : 'text-[9px]';
  const centerValueSize = containerWidth < 160 ? 'text-lg' : containerWidth < 200 ? 'text-xl' : 'text-2xl';

  // Dynamic breakdown of logged footprints by category ('commute', 'diet', 'procurement')
  const getCategoryEmissions = () => {
    let commute = 0;
    let diet = 0;
    let procurement = 0;

    activityLogs.forEach((log) => {
      const cat = log.category;
      if (cat === 'commute') {
        commute += log.carbonAmount || 0;
      } else if (cat === 'diet') {
        diet += log.carbonAmount || 0;
      } else if (cat === 'procurement') {
        procurement += log.carbonAmount || 0;
      }
    });

    return [
      { name: 'Commute', value: parseFloat(commute.toFixed(1)), color: 'var(--color-rose-muted)', bgClass: 'bg-rose-muted' },
      { name: 'Diet', value: parseFloat(diet.toFixed(1)), color: 'var(--color-amber-muted)', bgClass: 'bg-amber-muted' },
      { name: 'Procurement', value: parseFloat(procurement.toFixed(1)), color: 'var(--color-emerald-deep)', bgClass: 'bg-emerald-deep' }
    ];
  };

  const userCategoryData = getCategoryEmissions();
  const totalUserEmissions = parseFloat(userCategoryData.reduce((sum, d) => sum + d.value, 0).toFixed(1));

  // Add Log Handler
  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    
    let computedAmount = 0;
    let descSuffix = '';

    if (category === 'commute') {
      computedAmount = calculateCommuteCarbon(distanceKm, commuteType);
      const vehicleLabels: Record<string, string> = {
        'drive-ice': 'Gasoline Sedan',
        'drive-ev': 'Electrical Vehicle',
        'rail': 'Passenger Rail',
        'bus': 'Transit Bus',
        'flight-domestic': 'Domestic Flight Corridor',
        'flight-intl': 'International Flight Pass'
      };
      descSuffix = `(${distanceKm} km via ${vehicleLabels[commuteType]})`;
    } else if (category === 'diet') {
      computedAmount = calculateDietCarbon(dietDays, dietType);
      const dietLabels: Record<string, string> = {
        'vegan': 'Vegan Sourced Diet',
        'vegetarian': 'Standard Vegetarian Diet',
        'mediterranean': 'Mediterranean Balance',
        'poultry-centric': 'Poultry Sustenance',
        'beef-centric': 'Beef or Heavy Methane Proteins'
      };
      descSuffix = `(${dietDays} day of ${dietLabels[dietType]})`;
    } else if (category === 'procurement') {
      computedAmount = calculateProcurementCarbon(procurementQty, procurementType);
      const procLabels: Record<string, string> = {
        'garments': 'Physical Garments',
        'electronics': 'Assembled Electronic Unit',
        'books': 'Scholarly Printed Volume',
        'appliances': 'Manufactured Appliance',
        'furniture': 'Constructed Furniture Item',
        'general': 'Sundays general utility items'
      };
      descSuffix = `(${procurementQty}x ${procLabels[procurementType]})`;
    }

    const finalDesc = description.trim() 
      ? `${description.trim()} ${descSuffix}` 
      : `${category.toUpperCase()} Entry ${descSuffix}`;

    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      category,
      description: finalDesc,
      carbonAmount: computedAmount,
      details: {
        distanceKm: category === 'commute' ? distanceKm : undefined,
        commuteType: category === 'commute' ? commuteType : undefined,
        dietType: category === 'diet' ? dietType : undefined,
        procurementType: category === 'procurement' ? procurementType : undefined,
        quantity: category === 'procurement' ? procurementQty : undefined,
      }
    };

    setActivityLogs(prev => [newLog, ...prev]);
    setDescription('');
  };

  // Add Offset Handler
  const handleAddOffset = (e: React.FormEvent) => {
    e.preventDefault();

    const priceRates = {
      'reforestation': 0.12,    // $0.12 per kg carbon offset ($120/ton)
      'renewable-solar': 0.08,  // $0.08 per kg carbon offset
      'cooking-stoves': 0.05,   // $0.05 per kg carbon offset
      'methane-capture': 0.15   // $0.15 per kg carbon offset
    };

    const projectNames = {
      'reforestation': 'Cascadian Mountain Reforestation Initiative',
      'renewable-solar': 'Sahara Solar Grid Addition Sector V',
      'cooking-stoves': 'Clean Mechanical Cookstoves for Coastal Villages',
      'methane-capture': 'Landfill Methane Bio-Capture Alliance'
    };

    const cost = Number((offsetAmountKg * priceRates[offsetProject]).toFixed(2));

    const newOffset: OffsetLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      projectType: offsetProject,
      projectName: projectNames[offsetProject],
      offsetAmount: offsetAmountKg,
      costUSD: cost
    };

    setOffsetLogs(prev => [newOffset, ...prev]);
  };

  // Delete Handlers
  const deleteActivity = (id: string) => {
    setActivityLogs(prev => prev.filter(item => item.id !== id));
  };

  const deleteOffset = (id: string) => {
    setOffsetLogs(prev => prev.filter(item => item.id !== id));
  };

  // Appliance Management
  const handleAddAppliance = (e: React.FormEvent) => {
    e.preventDefault();
    const preset = APPLIANCE_PRESETS.find(p => p.id === selectedAppPresetId) || APPLIANCE_PRESETS[0];
    const customWatts = preset.watts;
    const computedMonthly = calculateApplianceMonthlyFootprint(
      customWatts,
      applianceHours,
      applianceQuantity,
      preset.typicalMultiplier
    );

    const newApp: ApplianceConfig = {
      id: Math.random().toString(36).substr(2, 9),
      applianceTypeId: preset.id,
      customName: applianceCustomName.trim() || preset.name,
      watts: customWatts,
      dailyHours: applianceHours,
      count: applianceQuantity,
      monthlyFootprint: computedMonthly
    };

    setAppliances(prev => [...prev, newApp]);
    setApplianceCustomName('');
  };

  const deleteAppliance = (id: string) => {
    setAppliances(prev => prev.filter(app => app.id !== id));
  };

  const totalApplianceMonthlyKg = appliances.reduce((sum, app) => sum + app.monthlyFootprint, 0);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in" id="journal-loading-skeleton">
        {/* Top summary row matching the actual ledger status layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(idx => (
            <div key={idx} className="bg-paper-card border border-paper-border rounded-xl p-4.5 flex items-center justify-between soft-shadow">
              <div className="space-y-1.5 w-1/2">
                <div className="w-16 h-3 animate-shimmer rounded bg-paper-border/20"></div>
                <div className="w-20 h-6 animate-shimmer rounded bg-paper-border/20"></div>
              </div>
              <div className="w-9 h-9 rounded-full bg-paper-border/10 animate-shimmer flex-shrink-0"></div>
            </div>
          ))}
        </div>

        {/* Two column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Input Form Card */}
          <div className="lg:col-span-7 bg-paper-card border border-paper-border rounded-xl p-6 soft-shadow space-y-6">
            <div className="space-y-1">
              <div className="w-48 h-6 animate-shimmer rounded bg-paper-border/20"></div>
              <div className="w-72 h-3.5 animate-shimmer rounded bg-paper-border/20"></div>
            </div>

            {/* Category selection bar */}
            <div className="grid grid-cols-3 gap-2 bg-paper p-1 rounded-md border border-paper-border/60">
              {[1, 2, 3].map(idx => (
                <div key={idx} className="h-8 animate-shimmer rounded bg-paper-border/20"></div>
              ))}
            </div>

            {/* Input fields */}
            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <div className="w-32 h-3 animate-shimmer rounded bg-paper-border/20"></div>
                <div className="w-full h-8.5 animate-shimmer rounded bg-paper-border/20"></div>
              </div>
              <div className="space-y-1.5">
                <div className="w-28 h-3 animate-shimmer rounded bg-paper-border/20"></div>
                <div className="w-full h-20 animate-shimmer rounded bg-paper-border/20"></div>
              </div>
            </div>

            <div className="h-10 animate-shimmer rounded bg-paper-border/20 w-full animate-pulse"></div>
          </div>

          {/* Right: History List / Metrics card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-paper-card border border-paper-border rounded-xl p-5 soft-shadow space-y-4">
              <div className="flex justify-between items-center border-b border-paper-border pb-3">
                <div className="w-32 h-5 animate-shimmer rounded bg-paper-border/20"></div>
                <div className="w-12 h-4 animate-shimmer rounded bg-paper-border/20"></div>
              </div>
              <div className="space-y-3 pb-1">
                {[1, 2, 3].map(idx => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-lg border border-paper-border/40 bg-paper/30">
                    <div className="space-y-1.5 w-2/3">
                      <div className="w-1/2 h-3.5 animate-shimmer rounded bg-paper-border/20"></div>
                      <div className="w-3/4 h-2.5 animate-shimmer rounded bg-paper-border/20"></div>
                    </div>
                    <div className="w-7 h-7 animate-shimmer rounded bg-paper-border/20"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Sub tabs hierarchy */}
      <div className="flex border-b border-paper-border pb-1 gap-6">
        <button
          onClick={() => setJournalSubTab('timeline')}
          className={`font-serif text-[15px] pb-1.5 transition-all relative ${
            journalSubTab === 'timeline' 
              ? 'text-emerald-deep font-bold border-b-2 border-emerald-deep' 
              : 'text-earth-muted hover:text-charcoal'
          }`}
        >
          Activity Slate
        </button>
        <button
          onClick={() => setJournalSubTab('offsets')}
          className={`font-serif text-[15px] pb-1.5 transition-all relative ${
            journalSubTab === 'offsets' 
              ? 'text-emerald-deep font-bold border-b-2 border-emerald-deep' 
              : 'text-earth-muted hover:text-charcoal'
          }`}
        >
          Offsets Slate
        </button>
        <button
          onClick={() => setJournalSubTab('appliances')}
          className={`font-serif text-[15px] pb-1.5 transition-all relative ${
            journalSubTab === 'appliances' 
              ? 'text-emerald-deep font-bold border-b-2 border-emerald-deep' 
              : 'text-earth-muted hover:text-charcoal'
          }`}
        >
          Appliances Slate
        </button>
      </div>

      {/* Domain 1 - Part 1: Timeline Logger */}
      {journalSubTab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Timeline Submission Side-Engine & Distribution Chart */}
          <div className="lg:col-span-5 space-y-6 self-start">
            <div className="bg-paper-card border border-paper-border rounded-xl p-6 soft-shadow">
              <h3 className="font-serif text-lg font-bold text-charcoal mb-1">Scribe Daily Action</h3>
            <p className="font-sans text-xs text-earth-muted mb-4 italic">Quantifying environmental weight with scholarly rigor.</p>
            
            <form onSubmit={handleAddActivity} className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-earth-muted mb-1">Impact Domain</label>
                <div className="grid grid-cols-3 gap-2 bg-paper border border-paper-border p-1 rounded-lg">
                  {(['commute', 'diet', 'procurement'] as LogCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`py-1.5 px-2 text-[10px] font-mono rounded tracking-tight capitalize transition-all ${
                        category === cat 
                          ? 'bg-emerald-deep text-paper font-semibold' 
                          : 'text-earth-muted hover:text-charcoal'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category-Specific Form Elements */}
              {category === 'commute' && (
                <div className="space-y-3 bg-paper/50 p-3 rounded-lg border border-paper-border/60">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-earth-muted mb-1">Vehicle Mode</label>
                    <select
                      value={commuteType}
                      onChange={(e) => setCommuteType(e.target.value as any)}
                      className="w-full bg-paper-card border border-paper-border rounded-md px-3 py-1.5 text-xs font-mono text-charcoal focus:outline-emerald-deep"
                    >
                      <option value="drive-ice">Gasoline Combustion Car (ICE)</option>
                      <option value="drive-ev">Electric Battery Vehicle (BEV)</option>
                      <option value="rail">Commuter Rail Corridor</option>
                      <option value="bus">Urban Omnibus / Public Bus</option>
                      <option value="flight-domestic">Aero Pass (Domestic Flight)</option>
                      <option value="flight-intl">Inter-Continental Air Pass</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between font-mono text-[10px] text-earth-muted mb-1">
                      <span>Distance Commuted</span>
                      <span className="font-semibold text-charcoal">{distanceKm} km</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="150"
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(Number(e.target.value))}
                      className="w-full accent-emerald-deep cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {category === 'diet' && (
                <div className="space-y-3 bg-paper/50 p-3 rounded-lg border border-paper-border/60">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-earth-muted mb-1">Provisions Profile</label>
                    <select
                      value={dietType}
                      onChange={(e) => setDietType(e.target.value as any)}
                      className="w-full bg-paper-card border border-paper-border rounded-md px-3 py-1.5 text-xs font-mono text-charcoal focus:outline-emerald-deep"
                    >
                      <option value="vegan">Pure Plant Crop Cycle (Vegan)</option>
                      <option value="vegetarian">Standard Dairy/Egg Crop (Vegetarian)</option>
                      <option value="mediterranean">Temperate Sea & Pulse Balance</option>
                      <option value="poultry-centric">Avian Protein & Grain Focus</option>
                      <option value="beef-centric">Red Ruminant Beef Focus</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between font-mono text-[10px] text-earth-muted mb-1">
                      <span>Sustenance Range</span>
                      <span className="font-semibold text-charcoal">{dietDays} {dietDays === 1 ? 'Day' : 'Days'}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={dietDays}
                      onChange={(e) => setDietDays(Number(e.target.value))}
                      className="w-full accent-emerald-deep cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {category === 'procurement' && (
                <div className="space-y-3 bg-paper/50 p-3 rounded-lg border border-paper-border/60">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-earth-muted mb-1">Procured Item Category</label>
                    <select
                      value={procurementType}
                      onChange={(e) => setProcurementType(e.target.value as any)}
                      className="w-full bg-paper-card border border-paper-border rounded-md px-3 py-1.5 text-xs font-mono text-charcoal focus:outline-emerald-deep"
                    >
                      <option value="garments">Fabric Apparel & Garment Piece</option>
                      <option value="electronics">Microchip Appliance (Laptop, Phone)</option>
                      <option value="books">Bound Printed Book Volume</option>
                      <option value="appliances">Heavy Household Mechanical Piece</option>
                      <option value="furniture">Assembled Timber/Steel Furniture</option>
                      <option value="general">Generic Procurement Materials</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between font-mono text-[10px] text-earth-muted mb-1">
                      <span>Quantity Acquired</span>
                      <span className="font-semibold text-charcoal">{procurementQty}x units</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={procurementQty}
                      onChange={(e) => setProcurementQty(Number(e.target.value))}
                      className="w-full accent-emerald-deep cursor-pointer"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-earth-muted mb-1">Journal Reflection Description</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    id="input-activity-description"
                    placeholder="e.g. Morning commute to university; custom eco linen knit purchase"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-paper-card border border-paper-border rounded-md pl-3 pr-20 py-2 text-xs font-serif text-charcoal focus:outline-emerald-deep placeholder:italic"
                  />
                  <div className="absolute right-1.5 flex items-center gap-1">
                    <button
                      type="button"
                      id="btn-dictate-mic"
                      onClick={startListening}
                      disabled={isListening}
                      className={`p-1.5 rounded transition-all flex items-center justify-center ${
                        isListening 
                          ? 'bg-rose-muted text-paper animate-pulse' 
                          : 'bg-paper hover:bg-paper-border text-earth-muted hover:text-charcoal'
                      }`}
                      title={isListening ? "Listening..." : "Dictate with microphone"}
                    >
                      {isListening ? (
                        <MicOff className="w-3.5 h-3.5" />
                      ) : (
                        <Mic className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      id="btn-ai-parse"
                      onClick={() => parseDictatedText(description)}
                      disabled={aiParsing || !description.trim()}
                      className={`p-1.5 rounded transition-all flex items-center justify-center ${
                        aiParsing 
                          ? 'bg-emerald-deep/20 text-emerald-deep' 
                          : 'bg-paper hover:bg-paper-border text-earth-muted hover:text-charcoal'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                      title="AI Analyze text"
                    >
                      {aiParsing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Voice / AI analysis assistance displays */}
                {speechError && (
                  <div className="mt-2 text-[10px] font-mono text-rose-muted bg-rose-light/50 border border-rose-muted/20 px-2.5 py-1.5 rounded-lg animate-fade-in" id="voice-error-indicator">
                    {speechError}
                  </div>
                )}

                {isListening && (
                  <div className="mt-2 text-[10px] font-mono text-emerald-deep bg-emerald-light/50 border border-emerald-deep/10 px-2.5 py-1.5 rounded-lg animate-pulse" id="voice-listening-indicator">
                    Listening for voice narration... speak naturally. When you stop speaking, analysis automatically begins.
                  </div>
                )}

                {aiParsing && (
                  <div className="mt-3 bg-emerald-light/30 dark:bg-emerald-light/10 border border-emerald-deep/20 rounded-lg p-3 space-y-3 animate-fade-in" id="ai-parsing-shimmer">
                    <div className="flex justify-between items-center pb-2 border-b border-emerald-deep/10">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 text-emerald-deep animate-spin" />
                        <span className="font-serif text-[11px] font-bold text-emerald-deep">AI Transfusing Slate...</span>
                      </div>
                      <div className="w-14 h-4.5 animate-shimmer rounded bg-emerald-deep/15"></div>
                    </div>
                    <div className="space-y-2 pt-1">
                      <div className="w-4/5 h-3.5 animate-shimmer rounded bg-paper-border/30"></div>
                      <div className="w-full h-3 animate-shimmer rounded bg-paper-border/30"></div>
                      <div className="w-2/3 h-3.5 animate-shimmer rounded bg-paper-border/30"></div>
                    </div>
                  </div>
                )}

                {parsedDraft && (
                  <div className="mt-3 bg-emerald-light/60 dark:bg-emerald-light/10 border border-emerald-deep/20 rounded-lg p-3 space-y-2 animate-fade-in" id="ai-draft-card">
                    <div className="flex justify-between items-center border-b border-emerald-deep/10 pb-1.5">
                      <span className="font-serif text-xs font-bold text-emerald-deep flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-deep animate-bounce" />
                        AI Decoded Slate Draft
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-wider bg-emerald-deep text-paper px-1.5 py-0.5 rounded font-bold">
                        {parsedDraft.category}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="font-serif italic text-charcoal">
                        "{parsedDraft.description}"
                      </p>
                      <div className="font-mono text-[10px] text-earth-muted space-y-0.5">
                        {parsedDraft.category === 'commute' && (
                          <>
                            <div>Vehicle Mode: <span className="font-bold text-charcoal">{parsedDraft.commuteType || 'Unspecified'}</span></div>
                            <div>Suggested Distance: <span className="font-bold text-charcoal">{parsedDraft.distanceKm || 'Unspecified'} km</span></div>
                          </>
                        )}
                        {parsedDraft.category === 'diet' && (
                          <>
                            <div>Diet Profile: <span className="font-bold text-charcoal">{parsedDraft.dietType || 'Unspecified'}</span></div>
                            <div>Duration Range: <span className="font-bold text-charcoal">{parsedDraft.dietDays || 1} day(s)</span></div>
                          </>
                        )}
                        {parsedDraft.category === 'procurement' && (
                          <>
                            <div>Material Domain: <span className="font-bold text-charcoal">{parsedDraft.procurementType || 'Unspecified'}</span></div>
                            <div>Quantity: <span className="font-bold text-charcoal">{parsedDraft.quantity || 1} unit(s)</span></div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        id="btn-ai-draft-dismiss"
                        onClick={() => setParsedDraft(null)}
                        className="font-mono text-[9px] px-2 py-1 border border-paper-border rounded bg-paper-card text-earth-muted hover:text-charcoal transition-all font-semibold"
                      >
                        DISMISS
                      </button>
                      <button
                        type="button"
                        id="btn-ai-draft-apply"
                        onClick={applyParsedDraft}
                        className="font-mono text-[9px] px-2.5 py-1 bg-emerald-deep text-paper rounded hover:opacity-90 font-bold tracking-wide transition-all"
                      >
                        APPLY DETAILS
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Estimate Preview */}
              <div className="p-3 bg-emerald-light rounded-lg border border-emerald-deep/10 flex justify-between items-center">
                <div>
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-emerald-deep font-semibold">Projected Footprint Weight</span>
                  <span className="font-mono text-sm font-bold text-emerald-deep">
                    {category === 'commute' && `${calculateCommuteCarbon(distanceKm, commuteType)} kg CO₂e`}
                    {category === 'diet' && `${calculateDietCarbon(dietDays, dietType)} kg CO₂e`}
                    {category === 'procurement' && `${calculateProcurementCarbon(procurementQty, procurementType)} kg CO₂e`}
                  </span>
                </div>
                <button
                  type="submit"
                  id="btn-add-activity"
                  className="bg-emerald-deep hover:bg-emerald-deep/90 text-paper font-mono text-xs px-3 py-2 rounded-md font-semibold tracking-wide flex items-center gap-1 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  SCRIBE
                </button>
              </div>
            </form>
          </div>

          {/* Personal Category Footprint Distribution Chart */}
          {isLoading ? (
            <div className="bg-paper-card border border-paper-border rounded-xl p-6 soft-shadow h-60 flex items-center justify-center">
              <span className="font-mono text-xs text-earth-muted">Calculating personal distribution...</span>
            </div>
          ) : (
            <div className="bg-paper-card border border-paper-border rounded-xl p-6 soft-shadow animate-fade-in" id="personal-trace-doughnut-card">
              <div className="border-b border-paper-border pb-3 mb-4">
                <h3 className="font-serif text-base font-bold text-clay">Category Footprint Distribution</h3>
                <p className="font-sans text-[11px] text-earth-muted italic">Breakdown of your journaled carbon footprint across core categories.</p>
              </div>

              {totalUserEmissions === 0 ? (
                <div className="space-y-3 py-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-deep/5 flex items-center justify-center mx-auto text-emerald-deep">
                    <Info className="w-5 h-5" />
                  </div>
                  <p className="font-serif text-xs text-charcoal italic px-4">
                    The carbon ledger is clear.
                  </p>
                  <p className="font-sans text-[10px] text-earth-muted leading-relaxed px-4">
                    Your real-time footprint breakdown will distribute dynamically once you scribe habits and activities above.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Doughnut representation */}
                  <div className="flex justify-center py-2 relative">
                    <div ref={containerRef} className="w-full max-w-[190px] h-44 relative animate-fade-in" id="category-doughnut">
                      {/* Center Text inside the Doughnut */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 font-mono">
                        <span className={`uppercase tracking-wider text-earth-muted font-bold transition-all ${centerLabelSize}`}>Total</span>
                        <span className={`font-serif font-bold text-charcoal leading-none my-0.5 transition-all ${centerValueSize}`}>{totalUserEmissions.toLocaleString()}</span>
                        <span className={`text-earth-muted transition-all ${centerLabelSize}`}>kg CO₂e</span>
                      </div>

                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={userCategoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={innerRadius}
                            outerRadius={outerRadius}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {userCategoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--color-paper-card)" strokeWidth={1} />
                            ))}
                          </Pie>
                          <Tooltip 
                            content={({ active, payload }: any) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                const percentage = totalUserEmissions > 0 ? ((data.value / totalUserEmissions) * 100).toFixed(1) : '0.0';
                                return (
                                  <div className="bg-white border border-paper-border rounded-lg p-2 shadow-md font-mono text-[9px] space-y-1 z-50">
                                    <p className="font-bold font-serif text-[10px] text-charcoal">{data.name}</p>
                                    <p className="text-earth-muted">
                                      Volume: <span className="font-semibold text-charcoal">{data.value} kg</span>
                                    </p>
                                    <p className="text-emerald-deep font-bold">
                                      Ratio: <span className="font-bold">{percentage}%</span>
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Breakdown indices */}
                  <div className="grid grid-cols-3 gap-2">
                    {userCategoryData.map((item, idx) => {
                      const percentage = totalUserEmissions > 0 ? ((item.value / totalUserEmissions) * 100).toFixed(1) : '0';
                      return (
                        <div 
                          key={idx} 
                          className="bg-paper rounded border border-paper-border/60 p-2 text-center flex flex-col justify-between"
                        >
                          <div className="flex items-center gap-1.5 justify-center">
                            <span className={`w-2 h-2 ${item.bgClass} rounded-full`} />
                            <span className="font-serif text-[10px] font-bold text-charcoal">{item.name}</span>
                          </div>
                          <div className="mt-1">
                            <span className="block font-mono text-[11px] font-bold text-clay leading-none">{item.value} kg</span>
                            <span className="block font-sans text-[8px] text-earth-muted uppercase font-bold mt-0.5">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Simple smart insight */}
                  <div className="bg-paper border border-dashed border-paper-border/80 rounded-lg p-2.5 flex items-start gap-2">
                    <div className="p-1 rounded-full bg-emerald-deep/5 text-emerald-deep shrink-0 mt-0.5 animate-pulse">
                      <TrendingDown className="w-3 h-3" />
                    </div>
                    <p className="font-sans text-[10px] text-earth-muted leading-relaxed">
                      {userCategoryData[0].value >= Math.max(userCategoryData[1].value, userCategoryData[2].value) ? (
                        <>Your commutes represent your primary carbon footprint slice. Shift trips to rail, public buses, or EV drives where possible.</>
                      ) : userCategoryData[1].value >= Math.max(userCategoryData[0].value, userCategoryData[2].value) ? (
                        <>Diet selections represent your largest logged emission category. Incorporating plant-based whole meals creates immense offset relief.</>
                      ) : (
                        <>Procurement transactions represent your primary relative impact area. Mindful purchase cycles and repair extend ownership lifetime.</>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timeline View list */}
        <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-paper-border pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-clay">Scribed Activities Chronology</h3>
                <span className="font-mono text-xs text-earth-muted tracking-wide block sm:inline mt-0.5 sm:mt-0">
                  {filterStartDate || filterEndDate ? (
                    <>Showing {filteredLogs.length} of {activityLogs.length} active logs</>
                  ) : (
                    <>{activityLogs.length} Atmospheric {activityLogs.length === 1 ? 'log' : 'logs'} active</>
                  )}
                </span>
              </div>
              
              {activityLogs.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-auto">
                  {/* Export Controls */}
                  <button
                    onClick={handleExportCSV}
                    className="bg-paper border border-paper-border hover:bg-[#d6d4cf] text-charcoal font-mono text-[10px] px-2 py-1 rounded flex items-center gap-1 transition-all font-semibold"
                    title="Export logs as Excel/CSV Spreadsheet"
                    id="btn-export-csv"
                  >
                    <Download className="w-3 h-3 text-earth-muted" />
                    CSV
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="bg-paper border border-paper-border hover:bg-[#d6d4cf] text-charcoal font-mono text-[10px] px-2 py-1 rounded flex items-center gap-1 transition-all font-semibold"
                    title="Export logs as JSON file"
                    id="btn-export-json"
                  >
                    <Download className="w-3 h-3 text-earth-muted" />
                    JSON
                  </button>

                  <div className="h-4 w-[1px] bg-paper-border mx-1" />

                  {/* Clear Controls */}
                  {showConfirmClear ? (
                    <div className="flex items-center gap-1.5 animate-pulse">
                      <button
                        onClick={handleClearLogs}
                        className="bg-rose-muted hover:opacity-95 text-white font-mono text-[9px] px-2 py-1 rounded font-bold transition-all"
                        id="btn-confirm-clear"
                      >
                        CONFIRM
                      </button>
                      <button
                        onClick={() => setShowConfirmClear(false)}
                        className="bg-paper border border-paper-border hover:bg-[#d6d4cf] text-charcoal font-mono text-[9px] px-1.5 py-1 rounded transition-all font-semibold"
                        id="btn-cancel-clear"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowConfirmClear(true)}
                      className="bg-paper border border-paper-border hover:border-rose-muted/30 text-rose-muted font-mono text-[10px] px-2.5 py-1 rounded flex items-center gap-1 transition-all hover:bg-rose-light font-semibold"
                      title="Clear activity log"
                      id="btn-clear-logs"
                    >
                      <Trash2 className="w-3 h-3" />
                      CLEAR ALL
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Temporal Ledger Filtering Widget */}
            <div className="bg-paper-card border border-paper-border/60 rounded-xl p-4 space-y-3 transition-all animate-fade-in" id="temporal-ledger-filter">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-charcoal">
                  <Calendar className="w-3.5 h-3.5 text-emerald-deep" />
                  <span>Temporal Ledger Filtering</span>
                </div>
                {(filterStartDate || filterEndDate) && (
                  <button
                    type="button"
                    onClick={() => { setFilterStartDate(''); setFilterEndDate(''); }}
                    className="font-mono text-[9px] text-rose-muted hover:text-rose-muted/80 font-bold uppercase cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-1 border-b border-paper-border pb-2">
                <button
                  type="button"
                  onClick={() => { setFilterStartDate(''); setFilterEndDate(''); }}
                  className={`px-2 py-0.5 text-[9px] font-mono rounded border transition-all cursor-pointer ${
                    !filterStartDate && !filterEndDate
                      ? 'bg-emerald-deep/10 border-emerald-deep/30 text-emerald-deep font-bold'
                      : 'bg-paper border-paper-border/60 text-earth-muted hover:text-charcoal'
                  }`}
                >
                  ALL TIME
                </button>
                <button
                  type="button"
                  onClick={() => { 
                    const todayStr = new Date().toISOString().split('T')[0];
                    setFilterStartDate(todayStr); 
                    setFilterEndDate(todayStr); 
                  }}
                  className={`px-2 py-0.5 text-[9px] font-mono rounded border transition-all cursor-pointer ${
                    filterStartDate === new Date().toISOString().split('T')[0] && filterEndDate === new Date().toISOString().split('T')[0]
                      ? 'bg-emerald-deep/10 border-emerald-deep/30 text-emerald-deep font-bold'
                      : 'bg-paper border-paper-border/60 text-earth-muted hover:text-charcoal'
                  }`}
                >
                  TODAY
                </button>
                <button
                  type="button"
                  onClick={() => { 
                    const todayStr = new Date().toISOString().split('T')[0];
                    const prevStr = getRelativeDateStr(7);
                    setFilterStartDate(prevStr); 
                    setFilterEndDate(todayStr); 
                  }}
                  className={`px-2 py-0.5 text-[9px] font-mono rounded border transition-all cursor-pointer ${
                    filterStartDate === getRelativeDateStr(7) && filterEndDate === new Date().toISOString().split('T')[0]
                      ? 'bg-emerald-deep/10 border-emerald-deep/30 text-emerald-deep font-bold'
                      : 'bg-paper border-paper-border/60 text-earth-muted hover:text-charcoal'
                  }`}
                >
                  LAST 7 DAYS
                </button>
                <button
                  type="button"
                  onClick={() => { 
                    const todayStr = new Date().toISOString().split('T')[0];
                    const prevStr = getRelativeDateStr(30);
                    setFilterStartDate(prevStr); 
                    setFilterEndDate(todayStr); 
                  }}
                  className={`px-2 py-0.5 text-[9px] font-mono rounded border transition-all cursor-pointer ${
                    filterStartDate === getRelativeDateStr(30) && filterEndDate === new Date().toISOString().split('T')[0]
                      ? 'bg-emerald-deep/10 border-emerald-deep/30 text-emerald-deep font-bold'
                      : 'bg-paper border-paper-border/60 text-earth-muted hover:text-charcoal'
                  }`}
                >
                  LAST 30 DAYS
                </button>
              </div>

              {/* Input range selectors */}
              <div className="grid grid-cols-2 gap-3.5 pt-0.5">
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-wider text-earth-muted mb-1">From Date</label>
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="w-full bg-paper border border-paper-border rounded px-2.5 py-1 text-[11px] font-mono text-charcoal focus:outline-emerald-deep"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-wider text-earth-muted mb-1">To Date</label>
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="w-full bg-paper border border-paper-border rounded px-2.5 py-1 text-[11px] font-mono text-charcoal focus:outline-emerald-deep"
                  />
                </div>
              </div>
            </div>

            {/* Atmospheric Monthly Goal & Progress Tracker */}
            <div className="bg-paper-card border border-paper-border rounded-xl p-4 space-y-3.5 transition-all animate-fade-in" id="monthly-goal-tracker">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-clay">
                  <Target className="w-3.5 h-3.5 text-emerald-deep" />
                  <span>{currentMonthLabel} Carbon Target</span>
                </div>
                
                <button
                  type="button"
                  onClick={() => setIsMonthlyGoalExpanded(!isMonthlyGoalExpanded)}
                  className="font-mono text-[10px] text-emerald-deep hover:text-[#b58d4a] transition-all font-bold uppercase tracking-wider"
                >
                  {isMonthlyGoalExpanded ? 'Close Config' : 'Set Monthly Goal →'}
                </button>
              </div>

              {/* Collapsible Monthly Goal Budget Setting */}
              {isMonthlyGoalExpanded && (
                <div className="space-y-4 border-t border-paper-border/30 pt-3 animate-fade-in">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <p className="font-sans text-[11px] text-earth-muted">
                      Configure custom monthly emission thresholds. Positive offsets expand your buffer dynamically.
                    </p>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-between">
                      <span className="text-xs font-mono text-earth-muted">
                        Goal: <strong className="text-charcoal font-bold">{monthlyBudget} kg CO₂e</strong>
                      </span>
                      <input
                        type="range"
                        min="100"
                        max="2000"
                        step="50"
                        value={monthlyBudget}
                        onChange={(e) => updateMonthlyBudget(Number(e.target.value))}
                        className="w-28 accent-emerald-deep cursor-pointer"
                        title="Drag to customize monthly budget limit"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Summary Cards */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-paper rounded border border-paper-border/60 p-2 text-center">
                  <span className="block font-sans text-[8px] text-earth-muted uppercase tracking-wider font-bold">Gross Logs</span>
                  <span className="font-mono text-[11px] font-bold text-clay leading-none mt-1 block">
                    {currentMonthEmissions.toFixed(1)} kg
                  </span>
                </div>
                <div className="bg-paper rounded border border-paper-border/60 p-2 text-center">
                  <span className="block font-sans text-[8px] text-earth-muted uppercase tracking-wider font-bold">Month Offsets</span>
                  <span className="font-mono text-[11px] font-bold text-emerald-deep leading-none mt-1 block font-semibold">
                    -{currentMonthOffsets.toFixed(1)} kg
                  </span>
                </div>
                <div className="bg-paper rounded border border-paper-border/60 p-2 text-center">
                  <span className="block font-sans text-[8px] text-earth-muted uppercase tracking-wider font-bold">Limit Left</span>
                  <span className={`font-mono text-[11px] font-bold leading-none mt-1 block ${
                    (monthlyBudget - netCurrentMonthEmissions) < 0 ? 'text-rose-muted animate-pulse font-extrabold' : 'text-charcoal'
                  }`}>
                    {(monthlyBudget - netCurrentMonthEmissions).toFixed(1)} kg
                  </span>
                </div>
              </div>

              {/* Monthly Progress Meter */}
              <div className="space-y-1.5 pt-0.5">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-earth-muted flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      netCurrentMonthEmissions > monthlyBudget ? 'bg-rose-muted animate-ping' :
                      netCurrentMonthEmissions > monthlyBudget * 0.8 ? 'bg-amber-muted animate-pulse' :
                      'bg-emerald-deep'
                    }`} />
                    Net Month Footprint Progress
                  </span>
                  <span className="font-bold text-charcoal">
                    {netCurrentMonthEmissions.toFixed(1)} / {monthlyBudget} kg ({Math.round((netCurrentMonthEmissions / monthlyBudget) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-paper-border/30 rounded-full overflow-hidden relative">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      netCurrentMonthEmissions > monthlyBudget ? 'bg-rose-muted' :
                      netCurrentMonthEmissions > monthlyBudget * 0.8 ? 'bg-amber-muted' :
                      'bg-emerald-deep'
                    }`}
                    style={{ width: `${Math.min((netCurrentMonthEmissions / monthlyBudget) * 100, 100)}%` }}
                  />
                </div>

                {/* Recommendations and advisory notices */}
                {netCurrentMonthEmissions > monthlyBudget ? (
                  <p className="font-sans text-[10px] text-rose-muted italic leading-relaxed pt-0.5">
                    ⚠️ Month target exceeded! Log restorative actions in offsets to restore equilibrium.
                  </p>
                ) : netCurrentMonthEmissions > monthlyBudget * 0.8 ? (
                  <p className="font-sans text-[10px] text-amber-muted italic leading-relaxed pt-0.5">
                    💡 Approaching target ceiling. Consider whole-food diet selections or commuter rail lines to maintain a safe buffer.
                  </p>
                ) : (
                  <p className="font-sans text-[10px] text-earth-muted italic leading-relaxed pt-0.5">
                    🌿 Inside standard atmospheric boundaries. Your combined offset actions preserve local ecological wellness.
                  </p>
                )}
              </div>
            </div>

            {/* Daily Budget Guard Configuration Widget */}
            <div className="bg-paper/40 border border-paper-border/60 rounded-xl p-4 space-y-3 transition-all animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-charcoal">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-deep" />
                  <span>Atmospheric Daily Budget Guard</span>
                  {overbudgetDays.length > 0 && (
                    <span className="font-mono text-[9px] bg-rose-light text-rose-muted px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">
                      {overbudgetDays.length} alerts pending
                    </span>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={() => setIsGuardExpanded(!isGuardExpanded)}
                  className="font-mono text-[10px] text-emerald-deep hover:text-[#b58d4a] transition-all font-bold uppercase tracking-wider"
                >
                  {isGuardExpanded ? 'Close Controls' : 'Adjust Limit & Alerts →'}
                </button>
              </div>

              {/* Collapsible range selectors and detailed overbudget lists */}
              {isGuardExpanded && (
                <div className="space-y-4 border-t border-paper-border/30 pt-3 animate-fade-in">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <p className="font-sans text-[11px] text-earth-muted">
                      Configure custom budget thresholds to trigger warnings for heavy emissions days.
                    </p>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-between">
                      <span className="text-xs font-mono text-earth-muted">
                        Cap: <strong className="text-charcoal font-bold">{dailyBudget} kg CO₂e</strong>
                      </span>
                      <input
                        type="range"
                        min="2"
                        max="40"
                        step="1"
                        value={dailyBudget}
                        onChange={(e) => setDailyBudget(Number(e.target.value))}
                        className="w-24 accent-emerald-deep cursor-pointer"
                        title="Drag to custom daily limit"
                      />
                    </div>
                  </div>

                  {/* Daily Carbon Warning Alerts */}
                  {overbudgetDays.length > 0 && (
                    <div className="bg-rose-light/50 border border-rose-muted/25 rounded-xl p-3.5 space-y-2 text-rose-muted">
                      <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-muted shrink-0" />
                        <span>Decarbonization Overdraft Log</span>
                      </div>
                      <div className="space-y-1 max-h-[100px] overflow-y-auto pr-1">
                        {overbudgetDays.map(({ date, sum }) => (
                          <div key={date} className="flex justify-between items-center text-[10px] bg-white/85 border border-rose-muted/10 rounded px-2 py-1 font-mono">
                            <span className="font-medium text-[#4c3535]">{date}</span>
                            <span className="font-bold text-rose-muted">
                              {sum.toFixed(2)} kg CO₂e ({((sum / dailyBudget) * 100).toFixed(0)}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dynamic Today's Real-time Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-earth-muted flex items-center gap-1">
                    <span className={`w-1.2 h-1.2 rounded-full ${
                      todayTotal > dailyBudget ? 'bg-rose-muted animate-ping' :
                      todayTotal > dailyBudget * 0.70 ? 'bg-amber-muted' :
                      'bg-emerald-deep'
                    }`} />
                    Today's Ledger
                  </span>
                  <span className="font-bold text-charcoal">
                    {todayTotal.toFixed(2)} / {dailyBudget} kg ({Math.round((todayTotal / dailyBudget) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-paper-border/30 rounded-full overflow-hidden relative">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      todayTotal > dailyBudget ? 'bg-rose-muted' :
                      todayTotal > dailyBudget * 0.70 ? 'bg-amber-muted' :
                      'bg-emerald-deep'
                    }`}
                    style={{ width: `${Math.min((todayTotal / dailyBudget) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {activityLogs.length === 0 ? (
              <div className="border border-dashed border-paper-border text-center py-12 px-6 rounded-xl bg-paper-card">
                <p className="font-serif text-lg text-earth-muted italic mb-2">The slate is currently empty.</p>
                <p className="font-sans text-xs text-earth-muted">Log your daily commutes, provisions, or procurements to chart your atmospheric weight.</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="border border-dashed border-paper-border text-center py-12 px-6 rounded-xl bg-paper-card">
                <p className="font-serif text-lg text-earth-muted italic mb-2">No matching entries.</p>
                <p className="font-sans text-xs text-earth-muted">No atmospheric logs match the selected date range ({filterStartDate} to {filterEndDate}).</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {filteredLogs.map((log) => (
                    <motion.div 
                      key={log.id} 
                      layout
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -15, scale: 0.96 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 380, 
                        damping: 28,
                        layout: { duration: 0.25 }
                      }}
                      className="bg-paper-card border border-paper-border/80 rounded-xl p-4 flex justify-between items-center hover:shadow-sm transition-all relative overflow-hidden group"
                    >
                      {/* Visual left color bar for domain identification */}
                      <div className={`absolute top-0 left-0 w-1 h-full ${
                        log.category === 'commute' ? 'bg-[#98b2cd]' : 
                        log.category === 'diet' ? 'bg-amber-muted' : 'bg-rose-muted'
                      }`} />

                      <div className="pl-2 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded font-bold bg-paper text-earth-muted border border-paper-border/60">
                            {log.category}
                          </span>
                          <span className="font-mono text-[9px] text-earth-muted">{log.date}</span>
                        </div>
                        <p className="font-serif text-sm text-charcoal">{log.description}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-mono text-xs font-bold text-clay text-right">
                          {log.carbonAmount} kg
                        </span>
                        <button
                          onClick={() => deleteActivity(log.id)}
                          className="text-earth-muted hover:text-rose-muted transition-colors p-1"
                          title="Erase log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Scholarly citation disclaimer */}
            <div className="bg-paper border border-paper-border p-3.5 rounded-lg flex items-start gap-3">
              <FileText className="w-4 h-4 text-emerald-deep mt-0.5 shrink-0" />
              <p className="font-sans text-[11px] text-earth-muted leading-relaxed">
                <strong>Transparent Methodology Footnote:</strong> These activities compute live estimated equivalence weights drawing direct emission coefficients from the <strong>EPA eGRID (2022 v2)</strong> databases & the British <strong>DEFRA greenhouse gas reporting standard (2023)</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Domain 1 - Part 2: Data Journal with Offsets */}
      {journalSubTab === 'offsets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Submission and project info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-paper-card border border-paper-border rounded-xl p-6 soft-shadow">
              <h3 className="font-serif text-lg font-bold text-charcoal mb-1">Reciprocate Carbon Burden</h3>
              <p className="font-sans text-xs text-earth-muted mb-4 italic">Commit funding to organic climate offsets to return back to atmospheric balance.</p>

              <form onSubmit={handleAddOffset} className="space-y-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-earth-muted mb-1">Verified Offset Venture</label>
                  <select
                    value={offsetProject}
                    onChange={(e) => setOffsetProject(e.target.value as any)}
                    className="w-full bg-paper border border-paper-border rounded-md px-3 py-2 text-xs font-mono text-charcoal focus:outline-emerald-deep"
                  >
                    <option value="reforestation">Cascadian Reforestation Projects ($120 / Ton CO₂e)</option>
                    <option value="renewable-solar">Sahara Desert Smart Photovoltaics ($80 / Ton CO₂e)</option>
                    <option value="cooking-stoves">Sub-Saharan Village Clean Cookstoves ($50 / Ton CO₂e)</option>
                    <option value="methane-capture">Municipal Methane Bio-Capture Alliance ($150 / Ton CO₂e)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between font-mono text-[10px] text-earth-muted mb-1">
                    <span>Mitigation Goal Intensity</span>
                    <span className="font-semibold text-charcoal">{offsetAmountKg} kg CO₂e</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={offsetAmountKg}
                    onChange={(e) => setOffsetAmountKg(Number(e.target.value))}
                    className="w-full accent-emerald-deep cursor-pointer"
                  />
                </div>

                {/* Simulated Cost Breakdown */}
                <div className="p-3 bg-paper border border-paper-border rounded-lg space-y-2">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-earth-muted">Projected Cost Equivalency</span>
                    <span className="font-bold text-charcoal">
                      {offsetProject === 'reforestation' && formatUSD(offsetAmountKg * 0.12)}
                      {offsetProject === 'renewable-solar' && formatUSD(offsetAmountKg * 0.08)}
                      {offsetProject === 'cooking-stoves' && formatUSD(offsetAmountKg * 0.05)}
                      {offsetProject === 'methane-capture' && formatUSD(offsetAmountKg * 0.15)}
                    </span>
                  </div>
                  <div className="text-[10px] font-sans text-earth-muted leading-relaxed italic">
                    {offsetProject === 'reforestation' && "*Supports planting native cedar and spruce saplings across Oregon's wildfire scars."}
                    {offsetProject === 'renewable-solar' && "*Supplies critical local solar units displacing heavy fuel-oil combustion grids."}
                    {offsetProject === 'cooking-stoves' && "*Empowers rural villages to reduce woody biomass usage, protecting surrounding biospheres."}
                    {offsetProject === 'methane-capture' && "*Inhibits methane gas escaping into active global pressure zones."}
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-add-offset"
                  className="w-full bg-clay hover:opacity-95 text-paper px-4 py-2 text-xs font-mono font-semibold tracking-wider rounded-md flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-deep" />
                  DISBURSE RECIPROCATION
                </button>
              </form>
            </div>

            {/* Educational Offset Insights */}
            <div className="bg-emerald-light border border-emerald-deep/10 rounded-xl p-5 space-y-2">
              <h4 className="font-serif text-sm font-bold text-emerald-deep flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 shrink-0" />
                The Offset Reciprocal Balance
              </h4>
              <p className="font-sans text-xs text-emerald-deep/95 leading-relaxed">
                Monetary offsets are a valuable transitional buffer. At Eco Slate, we prioritize direct physical <strong>reduction</strong>, treating offsets as an active form of global restoration stewardship rather than a free license to high carbon consumption.
              </p>
            </div>
          </div>

          {/* Ledger audit table */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-serif text-xl font-bold text-clay">Personal Carbon Balance Ledger</h3>
            
            <div className="bg-paper-card border border-paper-border rounded-xl p-5 soft-shadow space-y-4">
              <div className="grid grid-cols-3 gap-4 border-b border-paper-border pb-4 text-center">
                <div>
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-earth-muted mb-0.5">Total Burdens</span>
                  <span className="font-mono text-sm font-semibold text-rose-muted">{totalEmitted.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-earth-muted mb-0.5">Total Offsets</span>
                  <span className="font-mono text-sm font-semibold text-emerald-deep">- {totalOffset.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-earth-muted mb-0.5">Slate Balance</span>
                  <span className={`font-mono text-sm font-bold ${netBalance <= 0 ? 'text-emerald-deep' : 'text-amber-muted'}`}>
                    {netBalance <= 0 ? '' : '+'}{netBalance.toLocaleString()} kg
                  </span>
                </div>
              </div>

              {offsetLogs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="font-serif text-sm text-earth-muted italic mb-1">No offsets committed yet.</p>
                  <p className="font-sans text-[11px] text-earth-muted">Utilize the form to input reforestation commits or solar grid investments.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {offsetLogs.map((offset) => (
                    <div 
                      key={offset.id} 
                      className="bg-paper border border-paper-border/60 rounded-lg p-3 flex justify-between items-center text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-charcoal">{offset.projectName}</span>
                          <span className="font-mono text-[9px] text-emerald-deep bg-emerald-light px-1.5 py-0.5 rounded font-bold uppercase">
                            - {offset.offsetAmount} kg
                          </span>
                        </div>
                        <span className="font-sans text-[10px] text-earth-muted italic">
                          Stewardship investment: {formatUSD(offset.costUSD)}
                        </span>
                      </div>

                      <button
                        onClick={() => deleteOffset(offset.id)}
                        className="text-earth-muted hover:text-rose-muted transition-colors p-1"
                        title="Void investment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Domain 1 - Part 3: Appliance Ledger */}
      {journalSubTab === 'appliances' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Submission and pre-calculations */}
          <div className="lg:col-span-5 bg-paper-card border border-paper-border rounded-xl p-6 soft-shadow self-start">
            <h3 className="font-serif text-lg font-bold text-charcoal mb-1">Anchor Household Machinery</h3>
            <p className="font-sans text-xs text-earth-muted mb-4 italic">Register static appliances to project mechanical base footprint.</p>

            <form onSubmit={handleAddAppliance} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-earth-muted mb-1">Mechanical Preset Template</label>
                <select
                  value={selectedAppPresetId}
                  onChange={(e) => {
                    setSelectedAppPresetId(e.target.value);
                  }}
                  className="w-full bg-paper border border-paper-border rounded-md px-3 py-2 text-xs font-mono text-charcoal focus:outline-emerald-deep"
                >
                  {APPLIANCE_PRESETS.map(preset => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name} ({preset.watts}W)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-earth-muted mb-1">Custom Asset Label (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Master Bedroom Heat Pump, Main Scholarly PC"
                  value={applianceCustomName}
                  onChange={(e) => setApplianceCustomName(e.target.value)}
                  className="w-full bg-paper border border-paper-border rounded-md px-3 py-2 text-xs font-serif text-charcoal focus:outline-emerald-deep"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-earth-muted mb-1">Usage (Hours/Day)</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={applianceHours}
                    onChange={(e) => setApplianceHours(Number(e.target.value))}
                    className="w-full bg-paper border border-paper-border rounded-md px-3 py-1.5 text-xs font-mono text-charcoal focus:outline-emerald-deep"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-earth-muted mb-1">Quantity Count</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={applianceQuantity}
                    onChange={(e) => setApplianceQuantity(Number(e.target.value))}
                    className="w-full bg-paper border border-paper-border rounded-md px-3 py-1.5 text-xs font-mono text-charcoal focus:outline-emerald-deep"
                  />
                </div>
              </div>

              {/* Monthly Footprint Live Preview */}
              {(() => {
                const preset = APPLIANCE_PRESETS.find(p => p.id === selectedAppPresetId) || APPLIANCE_PRESETS[0];
                const previewKg = calculateApplianceMonthlyFootprint(
                  preset.watts,
                  applianceHours,
                  applianceQuantity,
                  preset.typicalMultiplier
                );
                return (
                  <div className="p-3.5 bg-paper border border-paper-border rounded-lg flex justify-between items-center">
                    <div>
                      <span className="block font-mono text-[9px] uppercase tracking-wider text-earth-muted">Projected Monthly Burden</span>
                      <span className="font-mono text-sm font-bold text-clay">{previewKg} kg CO₂e / Month</span>
                    </div>
                    <button
                      type="submit"
                      id="btn-add-appliance"
                      className="bg-emerald-deep hover:bg-emerald-deep/90 text-paper font-mono text-xs px-3.5 py-2 rounded-md font-semibold tracking-wider transition-all"
                    >
                      REGISTER
                    </button>
                  </div>
                );
              })()}
            </form>
          </div>

          {/* Registered mechanical list */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-xl font-bold text-clay">Household Registered Grid Liabilities</h3>
              {totalApplianceMonthlyKg > 0 && (
                <div className="font-mono text-xs text-rose-muted bg-rose-light border border-rose-muted/10 px-2.5 py-1 rounded">
                  Monthly Baseline: {totalApplianceMonthlyKg.toFixed(1)} kg CO₂e
                </div>
              )}
            </div>

            {appliances.length === 0 ? (
              <div className="border border-dashed border-paper-border text-center py-12 px-6 rounded-xl bg-paper-card">
                <p className="font-serif text-lg text-earth-muted italic mb-2">No background household assets added yet.</p>
                <p className="font-sans text-xs text-earth-muted">Map your major residential drawing blocks (HVAC, Heat Pumps, Lights, Server Computes) to project baseline structural weight of your domicile.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appliances.map((app) => (
                  <div 
                    key={app.id} 
                    className="bg-paper-card border border-paper-border/80 rounded-xl p-4 flex justify-between items-center transition-all hover:shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-charcoal text-sm">{app.customName}</span>
                        <span className="font-mono text-[9px] text-earth-muted bg-paper border border-paper-border px-1.5 py-0.5 rounded">
                          {app.watts} Watts
                        </span>
                      </div>
                      <p className="font-sans text-xs text-earth-muted">
                        Operating {app.dailyHours} hrs/day × {app.count} unit{app.count > 1 ? 's' : ''} • Daily Draw: {((app.watts * app.dailyHours * app.count) / 1000).toFixed(2)} kWh
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="block font-mono text-xs font-bold text-rose-muted">+{app.monthlyFootprint} kg</span>
                        <span className="block font-sans text-[9px] text-earth-muted">Monthly</span>
                      </div>
                      <button
                        onClick={() => deleteAppliance(app.id)}
                        className="text-earth-muted hover:text-rose-muted transition-colors p-1"
                        title="Dismount asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalDomain;
