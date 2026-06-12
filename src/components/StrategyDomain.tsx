import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TIPS_STRATEGIES, 
  THE_SHIFT_PROTOCOL, 
  COMMUNITY_DISCOURSE 
} from '../data/staticData';
import { 
  DailyInsightTip, 
  SwapAlternative, 
  WisdomReflection 
} from '../types';
import { 
  Sparkles, 
  Check, 
  Zap, 
  FileText, 
  MessageSquare, 
  HelpCircle, 
  BookOpen, 
  ArrowRight,
  User,
  Heart,
  Plus
} from 'lucide-react';
import { formatCarbon } from '../utils/carbonCalc';

interface StrategyDomainProps {
  wisdomDiscourse: WisdomReflection[];
  setWisdomDiscourse: React.Dispatch<React.SetStateAction<WisdomReflection[]>>;
}

const StrategyDomain: React.FC<StrategyDomainProps> = ({
  wisdomDiscourse,
  setWisdomDiscourse
}) => {
  // Subdomain navigation switch
  const [strategySubTab, setStrategySubTab] = useState<'tips' | 'protocol' | 'discourse'>('tips');

  // Tip/Strategies Tracker (Simulator state)
  const [strategyStatus, setStrategyStatus] = useState<Record<string, 'Unscheduled' | 'Investigating' | 'Implemented'>>({});
  
  // Custom Shift Protocol Multiplier scale
  const [boilerHoursPct, setBoilerHoursPct] = useState<number>(100);
  const [commuteDistancePct, setCommuteDistancePct] = useState<number>(100);

  // Community discourse states
  const [authorName, setAuthorName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [reflectionText, setReflectionText] = useState('');

  // Shift Protocol simulation state
  const [simulatingId, setSimulatingId] = useState<string | null>(null);

  const handleSimulate = (swapId: string) => {
    setSimulatingId(swapId);
    // Auto-clear simulation highlight after 2.8 seconds
    const timer = setTimeout(() => {
      setSimulatingId(null);
    }, 2800);
  };

  // Handle strategy status cycle
  const cycleStrategyStatus = (id: string) => {
    setStrategyStatus(prev => {
      const current = prev[id] || 'Unscheduled';
      let next: 'Unscheduled' | 'Investigating' | 'Implemented' = 'Unscheduled';
      if (current === 'Unscheduled') next = 'Investigating';
      else if (current === 'Investigating') next = 'Implemented';
      return { ...prev, [id]: next };
    });
  };

  // Calculate simulated future annual carbon savings
  const totalSimulatedSavingsKg = TIPS_STRATEGIES.reduce((sum, tip) => {
    const status = strategyStatus[tip.id] || 'Unscheduled';
    if (status === 'Implemented') {
      return sum + tip.savingsKgYearly;
    } else if (status === 'Investigating') {
      return sum + (tip.savingsKgYearly * 0.4); // 40% value multiplier
    }
    return sum;
  }, 0);

  // Handle post public reflection
  const handlePostReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionText.trim()) return;

    const newReflection: WisdomReflection = {
      id: Math.random().toString(36).substr(2, 9),
      author: authorName.trim() || 'Anonymous Scribe',
      location: locationName.trim() || 'Temperate Zone',
      reflection: reflectionText.trim(),
      scribeDate: new Date().toISOString().split('T')[0],
      consensus: 1
    };

    setWisdomDiscourse(prev => [newReflection, ...prev]);
    setAuthorName('');
    setLocationName('');
    setReflectionText('');
  };

  // Upvote qualitative wisdom
  const upvoteDiscourse = (id: string) => {
    setWisdomDiscourse(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, consensus: item.consensus + 1 };
      }
      return item;
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Sub tabs hierarchy */}
      <div className="flex border-b border-paper-border pb-1 gap-6">
        <button
          onClick={() => setStrategySubTab('tips')}
          className={`font-serif text-[15px] pb-1.5 transition-all relative ${
            strategySubTab === 'tips' 
              ? 'text-emerald-deep font-bold border-b-2 border-emerald-deep' 
              : 'text-earth-muted hover:text-charcoal'
          }`}
        >
          Discipline Tips
        </button>
        <button
          onClick={() => setStrategySubTab('protocol')}
          className={`font-serif text-[15px] pb-1.5 transition-all relative ${
            strategySubTab === 'protocol' 
              ? 'text-emerald-deep font-bold border-b-2 border-emerald-deep' 
              : 'text-earth-muted hover:text-charcoal'
          }`}
        >
          Shift Protocol
        </button>
        <button
          onClick={() => setStrategySubTab('discourse')}
          className={`font-serif text-[15px] pb-1.5 transition-all relative ${
            strategySubTab === 'discourse' 
              ? 'text-emerald-deep font-bold border-b-2 border-emerald-deep' 
              : 'text-earth-muted hover:text-charcoal'
          }`}
        >
          Community Feed
        </button>
      </div>

      {/* Domain 3 - Part 1: Strategy Tips */}
      {strategySubTab === 'tips' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Active Sandbox Simulator details */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-paper-card border border-paper-border rounded-xl p-5 soft-shadow space-y-4">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-earth-muted block">Interactive Strategy Simulator</span>
                <h3 className="font-serif text-lg font-bold text-charcoal">Future Carbon Mitigation</h3>
                <p className="font-sans text-xs text-earth-muted mt-1 leading-relaxed italic">Cycle daily discipline statuses to visualizes projected long-term carbon avoidance.</p>
              </div>

              <div className="bg-paper p-4 rounded-lg border border-paper-border/80 text-center space-y-1">
                <span className="block font-mono text-2xl font-bold text-emerald-deep">
                  {totalSimulatedSavingsKg.toLocaleString()} kg
                </span>
                <span className="block font-mono text-[10px] text-earth-muted uppercase tracking-wider font-semibold">Projected Annual Savings</span>
              </div>

              {totalSimulatedSavingsKg > 0 ? (
                <div className="text-xs font-sans text-earth-muted bg-emerald-light/60 border border-emerald-deep/10 p-3 rounded-lg leading-relaxed">
                  Excellent! Implementing these strategies will avoid approximately <strong>{(totalSimulatedSavingsKg / 1000).toFixed(2)} Metric Tons</strong> of atmospheric pressure every fiscal cycle.
                </div>
              ) : (
                <div className="text-xs font-sans text-earth-muted bg-paper p-3 rounded-lg leading-relaxed text-center">
                  *Configure status indicators on the cards to model action plans.
                </div>
              )}
            </div>

            <div className="bg-emerald-light border border-emerald-deep/10 rounded-xl p-5 space-y-2">
              <h4 className="font-mono text-[10px] uppercase font-bold text-emerald-deep">Quiet Accountability Principle</h4>
              <p className="font-sans text-xs text-emerald-deep/95 leading-relaxed">
                We believe systemic change thrives first in personal intention. By identifying micro-adjustments in daily living (phantom load reductions, seasonal cold washes), we anchor planetary changes directly in our physical reach.
              </p>
            </div>
          </div>

          {/* Tips checklist column */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-paper-border">
              <h3 className="font-serif text-xl font-bold text-clay">Discipline Action Repository</h3>
              <span className="font-mono text-[10px] text-earth-muted">Select statuses to audit projections</span>
            </div>

            <div className="space-y-4">
              {TIPS_STRATEGIES.map((tip) => {
                const status = strategyStatus[tip.id] || 'Unscheduled';
                return (
                  <div 
                    key={tip.id} 
                    className="bg-paper-card border border-paper-border rounded-xl p-5 hover:shadow-sm transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="space-y-2 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded border border-paper-border bg-paper text-earth-muted">
                          {tip.category}
                        </span>
                        <span className="text-[11px] font-sans text-earth-muted">Cites: {tip.citation}</span>
                      </div>
                      <h4 className="font-serif text-base font-bold text-charcoal">{tip.title}</h4>
                      <p className="font-sans text-xs text-earth-muted leading-relaxed">{tip.actionRequired}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-paper-border">
                      <div className="text-left md:text-right">
                        <span className="block font-mono text-xs font-bold text-emerald-deep">-{tip.savingsKgYearly} kg CO₂e</span>
                        <span className="block font-mono text-[8px] uppercase tracking-wider text-earth-muted">Annual Avoidance</span>
                      </div>
                      <button
                        onClick={() => cycleStrategyStatus(tip.id)}
                        className={`font-mono text-[10px] tracking-wide font-semibold px-3 py-1.5 rounded transition-all ${
                          status === 'Unscheduled' ? 'bg-paper text-earth-muted border border-paper-border hover:bg-[#d6d4cf]' :
                          status === 'Investigating' ? 'bg-amber-light text-amber-muted border border-amber-muted/20 font-bold' :
                          'bg-emerald-deep text-paper font-bold'
                        }`}
                      >
                        {status.toUpperCase()}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Domain 3 - Part 2: The Shift Protocol (Swaps) */}
      {strategySubTab === 'protocol' && (
        <div className="space-y-8">
          <div className="max-w-2xl">
            <h3 className="font-serif text-2xl font-bold text-clay">The Shift Protocol (Asset Swaps)</h3>
            <p className="font-sans text-xs text-earth-muted mt-1 leading-relaxed">
              Modeling the long-term displacement of obsolete combustion systems with electrical thermo-transfer networks. Adjust active sliders to scale operational impacts across typical user cycles.
            </p>
          </div>

          {/* Parameter multipliers controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-paper-card border border-paper-border p-4 rounded-xl">
            <div>
              <div className="flex justify-between font-mono text-xs text-earth-muted mb-1">
                <span>Core Thermal Demand Scale</span>
                <span className="font-bold text-charcoal">{boilerHoursPct}% rating value</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                value={boilerHoursPct}
                onChange={(e) => setBoilerHoursPct(Number(e.target.value))}
                className="w-full accent-emerald-deep cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between font-mono text-xs text-earth-muted mb-1">
                <span>Core Kinetic Travel Scale</span>
                <span className="font-bold text-charcoal">{commuteDistancePct}% average mileage</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                value={commuteDistancePct}
                onChange={(e) => setCommuteDistancePct(Number(e.target.value))}
                className="w-full accent-emerald-deep cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {THE_SHIFT_PROTOCOL.map((swap) => {
              // Apply scaling factors dynamically
              const scale = swap.id.includes('heat') ? (boilerHoursPct / 100) : 
                            swap.id.includes('commute') ? (commuteDistancePct / 100) : 1;
              
              const scaledLegacy = Math.round(swap.legacyEmissionsYearly * scale);
              const scaledSwap = Math.round(swap.swapEmissionsYearly * scale);
              const savings = scaledLegacy - scaledSwap;
              const isSimulating = simulatingId === swap.id;

              return (
                <div key={swap.id} className={`bg-paper-card border rounded-xl p-6 soft-shadow flex flex-col justify-between transition-all duration-300 ${
                  isSimulating ? 'border-emerald-deep shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-deep/20' : 'border-paper-border'
                }`}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start border-b border-paper-border pb-3">
                      <div>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-amber-muted bg-amber-light px-2 py-0.5 rounded border border-amber-muted/10">
                          {swap.title}
                        </span>
                        <h4 className="font-serif text-lg font-bold text-charcoal mt-2">{swap.legacyName} vs. {swap.swapName}</h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center py-2 relative overflow-hidden">
                      <motion.div 
                        className="bg-rose-light/50 border border-rose-muted/10 p-3 rounded-lg relative overflow-hidden"
                        animate={isSimulating ? {
                          scale: [1, 0.96, 1],
                          borderColor: ['rgba(244,63,94,0.1)', 'rgba(244,63,94,0.4)', 'rgba(244,63,94,0.1)']
                        } : {}}
                        transition={{ duration: 1.4, ease: "easeInOut" }}
                      >
                        <span className="block font-sans text-[10px] text-earth-muted">Legacy Carbon Profile</span>
                        <span className="font-mono text-base font-bold text-rose-muted">{scaledLegacy.toLocaleString()} kg/yr</span>
                        {isSimulating && (
                          <motion.div 
                            className="absolute inset-0 bg-rose-muted/5 pointer-events-none"
                            animate={{ opacity: [0.2, 0.5, 0.2] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                          />
                        )}
                      </motion.div>
                      <motion.div 
                        className="bg-emerald-light border border-emerald-deep/10 p-3 rounded-lg relative overflow-hidden"
                        animate={isSimulating ? {
                          scale: [1, 1.04, 1],
                          borderColor: ['rgba(16,185,129,0.1)', 'rgba(16,185,129,0.5)', 'rgba(16,185,129,0.1)'],
                          boxShadow: ['0 0 0px rgba(16,185,129,0)', '0 0 8px rgba(16,185,129,0.15)', '0 0 0px rgba(16,185,129,0)']
                        } : {}}
                        transition={{ duration: 1.4, ease: "easeInOut" }}
                      >
                        <span className="block font-sans text-[10px] text-earth-muted">Sustainable Carbon Profile</span>
                        <span className="font-mono text-base font-bold text-emerald-deep">{scaledSwap.toLocaleString()} kg/yr</span>
                        {isSimulating && (
                          <motion.div 
                            className="absolute inset-0 bg-emerald-deep/10 pointer-events-none"
                            animate={{ opacity: [0.2, 0.5, 0.2] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                          />
                        )}
                      </motion.div>
                    </div>

                    {/* Integrated visual comparison bar showing emissions difference */}
                    <div className="relative h-7 bg-paper rounded-lg overflow-hidden border border-paper-border/80 p-0.5 flex items-center select-none">
                      <div 
                        className="bg-emerald-deep/80 rounded-l-md h-full flex items-center pl-2 font-mono text-[8.5px] font-bold text-white transition-all duration-500"
                        style={{ width: `${Math.max(12, Math.min(85, (scaledSwap / scaledLegacy) * 100))}%` }}
                      >
                        {Math.round((scaledSwap / scaledLegacy) * 100)}%
                      </div>
                      
                      <div 
                        className="relative h-full flex-1 flex items-center justify-end pr-2.5 overflow-hidden transition-all duration-500 bg-rose-muted/10 rounded-r-md"
                      >
                        {isSimulating && (
                          <>
                            <motion.div 
                              className="absolute inset-0 bg-gradient-to-r from-rose-muted/20 via-amber-muted/20 to-emerald-deep/20 mix-blend-screen"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0.4, 0.9, 0.4] }}
                              transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity }}
                            />
                            <motion.div 
                              className="absolute top-0 bottom-0 w-12 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
                              initial={{ left: "-30%" }}
                              animate={{ left: "135%" }}
                              transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity }}
                            />
                            <motion.div 
                              className="absolute inset-0 border border-emerald-deep/60 rounded-r-md shadow-[inset_0_0_8px_rgba(16,185,129,0.3)] pointer-events-none"
                              animate={{ opacity: [1, 0.4, 1] }}
                              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                            />
                          </>
                        )}
                        <span className="font-mono text-[10px] font-bold text-rose-muted relative z-10 flex items-center gap-1">
                          {isSimulating && (
                            <motion.span 
                              animate={{ scale: [1, 1.2, 1] }} 
                              transition={{ duration: 0.6, repeat: Infinity }} 
                              className="w-1.5 h-1.5 rounded-full bg-rose-muted inline-block"
                            />
                          )}
                          -{savings.toLocaleString()} kg diff
                        </span>
                      </div>
                    </div>

                    <p className="font-sans text-xs text-earth-muted leading-relaxed italic border-l-2 border-paper-border pl-3">
                      "{swap.wisdomQuote}"
                    </p>

                    {/* Simulation action trigger */}
                    <button
                      onClick={() => handleSimulate(swap.id)}
                      className={`w-full font-mono text-[10px] uppercase font-bold py-2 rounded-lg border transition-all flex items-center justify-center gap-2 focus:outline-none ${
                        isSimulating 
                          ? 'bg-emerald-deep text-white border-emerald-deep shadow-[0_0_12px_rgba(16,185,129,0.25)]' 
                          : 'bg-paper hover:bg-[#d6d4cf] border-paper-border text-charcoal'
                      }`}
                    >
                      <Zap className={`w-3.5 h-3.5 ${isSimulating ? 'text-amber-light animate-bounce' : 'text-amber-muted'}`} />
                      {isSimulating ? 'Simulating low-carbon cycle...' : 'Show Impact Simulation'}
                    </button>
                  </div>

                  <div className="mt-6 pt-4 border-t border-paper-border flex justify-between items-center">
                    <div>
                      <span className="block font-sans text-[9px] uppercase tracking-widest text-earth-muted font-bold">Annual Mitigation Profit</span>
                      <span className="font-mono text-lg font-bold text-emerald-deep">-{savings.toLocaleString()} kg CO₂e</span>
                    </div>
                    <div className="text-right">
                      <span className="block font-sans text-[9px] text-earth-muted font-semibold">Friction cost: {swap.financialCost}</span>
                      <span className="block font-sans text-[9px] text-earth-muted font-semibold">Adaptation effort: {swap.effortScale}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Domain 3 - Part 3: Community Discourse (Anonymous reflection space) */}
      {strategySubTab === 'discourse' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Submission of simple post */}
          <div className="lg:col-span-5 bg-paper-card border border-paper-border rounded-xl p-5 soft-shadow self-start">
            <h3 className="font-serif text-lg font-bold text-clay mb-2">Publish Scholarly Tip</h3>
            <p className="font-sans text-xs text-earth-muted mb-4 italic leading-relaxed">Ensure a serene, objective environmental tone. Write reflections on mended outfits, transit habits, or cooling offsets.</p>

            <form onSubmit={handlePostReflection} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-wider text-earth-muted mb-1">Scribe Initials</label>
                  <input
                    type="text"
                    placeholder="e.g. Liam K."
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full bg-paper border border-paper-border rounded-md px-3 py-1.5 text-xs font-serif text-charcoal focus:outline-emerald-deep"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-wider text-earth-muted mb-1">Local Base</label>
                  <input
                    type="text"
                    placeholder="e.g. Seattle, WA"
                    required
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full bg-paper border border-paper-border rounded-md px-3 py-1.5 text-xs font-serif text-charcoal focus:outline-emerald-deep"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[9px] uppercase tracking-wider text-earth-muted mb-1">Philosophical Reflection / Practical Tip</label>
                <textarea
                  rows={4}
                  placeholder="Share a quiet wabi-sabi low-carbon moment or direct reduction discovery..."
                  required
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  className="w-full bg-paper border border-paper-border rounded-md px-3 py-2 text-xs font-serif text-charcoal focus:outline-emerald-deep placeholder:italic"
                />
              </div>

              <button
                type="submit"
                id="btn-post-discourse"
                className="w-full bg-emerald-deep hover:bg-emerald-deep/90 text-paper py-2 rounded-md font-mono text-xs font-semibold tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                SCRIBE PUBLICATION
              </button>
            </form>
          </div>

          {/* Scrollable feed of qualitative wisdom posts */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-serif text-xl font-bold text-clay">Reflections on Simple Living</h3>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {wisdomDiscourse.map((ref) => (
                <div key={ref.id} className="bg-paper-card border border-paper-border rounded-xl p-5 soft-shadow space-y-3 relative">
                  <p className="font-serif text-sm italic text-clay leading-relaxed">
                    "{ref.reflection}"
                  </p>

                  <div className="flex justify-between items-center pt-3 border-t border-paper /60">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-paper border border-paper-border rounded-full flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-earth-muted" />
                      </div>
                      <div>
                        <span className="block font-serif text-xs font-bold text-charcoal leading-none">{ref.author}</span>
                        <span className="block font-sans text-[10px] text-earth-muted mt-0.5">{ref.location} • Scribed {ref.scribeDate}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => upvoteDiscourse(ref.id)}
                      className="flex items-center gap-1.5 font-mono text-[10px] text-earth-muted bg-paper px-2 py-1.5 rounded hover:bg-[#d6d4cf] border border-paper-border transition-all"
                    >
                      <Heart className="w-3 h-3 text-rose-muted fill-rose-muted" />
                      Consensus: <strong className="text-charcoal font-bold">{ref.consensus}</strong>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategyDomain;
