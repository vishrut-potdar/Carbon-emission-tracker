import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  INDUSTRIES_DATA, 
  REGIONAL_INTENSITIES, 
  TWELVE_MONTHS_TREND 
} from '../data/staticData';
import { IndustryCarbon, RegionalGridIntensity } from '../types';
import { 
  Globe, 
  Compass, 
  Flame, 
  Briefcase, 
  Sprout, 
  Tv, 
  Cpu, 
  Info,
  Calendar,
  CheckCircle,
  TrendingDown
} from 'lucide-react';
import { formatCarbon } from '../utils/carbonCalc';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ReferenceArea
} from 'recharts';

interface InsightsDomainProps {
  activityLogs: any[];
  offsetLogs?: any[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const emittedPayload = payload.find((p: any) => p.dataKey === "Emitted");
    const offsetPayload = payload.find((p: any) => p.dataKey === "Offset");
    const forecastedPayload = payload.find((p: any) => p.dataKey === "Forecasted");
    
    const isForecast = payload[0]?.payload?.isForecast;
    const isAnomaly = payload[0]?.payload?.isAnomaly;
    const deviationPercent = payload[0]?.payload?.deviationPercent;

    return (
      <div className="bg-white border border-paper-border/80 rounded-lg p-3 shadow-md space-y-1.5 text-[10px] font-mono">
        <p className="font-serif font-bold text-xs text-charcoal border-b border-paper-border pb-1">
          {label} {isForecast && <span className="text-[9px] text-amber-muted italic font-sans font-bold uppercase tracking-wider ml-1">(Forecast)</span>}
        </p>
        {!isForecast && emittedPayload && emittedPayload.value !== undefined && (
          <p className="text-rose-muted font-bold">
            Emitted: <span className="font-semibold text-charcoal">{emittedPayload.value} kg</span>
          </p>
        )}
        {!isForecast && offsetPayload && offsetPayload.value !== undefined && (
          <p className="text-emerald-deep font-bold">
            Offset: <span className="font-semibold text-charcoal">{offsetPayload.value} kg</span>
          </p>
        )}
        {forecastedPayload && forecastedPayload.value !== undefined && (
          <p className="text-amber-muted font-bold">
            Forecasted Emission: <span className="font-semibold text-charcoal">{forecastedPayload.value} kg</span>
          </p>
        )}
        {!isForecast && emittedPayload && offsetPayload && emittedPayload.value !== undefined && offsetPayload.value !== undefined && (
          <p className="text-earth-muted font-bold border-t border-dashed border-paper-border pt-1">
            Net: <span className="font-bold text-charcoal">{Math.max(0, emittedPayload.value - offsetPayload.value).toFixed(1)} kg</span>
          </p>
        )}
        {isAnomaly && (
          <div className="text-rose-muted font-bold text-[9px] bg-rose-light/50 border border-rose-muted/20 px-1.5 py-0.5 rounded-sm flex items-center gap-1 mt-1.5 uppercase">
            <span>⚠️ Anomaly: {deviationPercent > 0 ? `+${deviationPercent}%` : `${deviationPercent}%`} Deviation</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const AnomalyDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;

  const isAnomaly = payload?.isAnomaly;
  const isForecast = payload?.isForecast;

  if (isAnomaly) {
    return (
      <g>
        {/* Pulsing visual halo for the anomaly element */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={9}
          fill="none"
          stroke="var(--color-rose-muted)"
          strokeWidth={1.5}
          animate={{
            scale: [1, 2.2, 1],
            opacity: [0.75, 0, 0.75]
          }}
          transition={{
            repeat: Infinity,
            duration: 1.6,
            ease: "easeInOut"
          }}
        />
        {/* Inner core dot that breathes */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={5.5}
          fill="var(--color-rose-muted)"
          stroke="#fff"
          strokeWidth={1.5}
          className="cursor-pointer"
          animate={{
            scale: [1, 1.2, 1]
          }}
          transition={{
            repeat: Infinity,
            duration: 1.0,
            ease: "easeInOut"
          }}
        />
      </g>
    );
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={3.5}
      fill={isForecast ? 'var(--color-amber-muted)' : 'var(--color-earth-muted)'}
      stroke="#fff"
      strokeWidth={1}
    />
  );
};

const AnimatedBarShape = (props: any) => {
  const { fill, x, y, width, height, radius, index, activeIndex } = props;
  if (!width || !height || width <= 0 || height <= 0) return null;

  const isDimmed = activeIndex !== null && activeIndex !== undefined && index !== activeIndex;
  const isHighlighted = activeIndex !== null && activeIndex !== undefined && index === activeIndex;

  // Dim non-hovered bars by reducing their fill opacity
  const opacity = isDimmed ? 0.35 : 1.0;
  
  // Highlight hovered bar with a subtle border/stroke outline
  const strokeColor = isHighlighted ? 'var(--color-charcoal)' : 'none';
  const strokeWidth = isHighlighted ? 1 : 0;

  return (
    <motion.rect
      x={x}
      width={width}
      fill={fill}
      rx={radius ? radius[0] : 0}
      ry={radius ? radius[0] : 0}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      initial={{ y: y + height, height: 0, scaleY: 1 }}
      animate={{ 
        y: y, 
        height: height, 
        fillOpacity: opacity,
        strokeOpacity: isHighlighted ? 1 : 0,
        scaleY: isHighlighted ? [1, 1.05, 0.98, 1.01, 1] : 1
      }}
      style={{
        transformOrigin: "bottom",
      }}
      transition={{ 
        y: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: (index ?? 0) * 0.08 },
        height: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: (index ?? 0) * 0.08 },
        fillOpacity: { duration: 0.2, ease: "easeOut" },
        strokeOpacity: { duration: 0.2, ease: "easeOut" },
        scaleY: { duration: 0.45, ease: "easeInOut" }
      }}
    />
  );
};

const InsightsDomain: React.FC<InsightsDomainProps> = ({ activityLogs, offsetLogs = [] }) => {
  // Navigation inside Domain 2
  const [insightsSubTab, setInsightsSubTab] = useState<'industry' | 'map' | 'trend'>('industry');
  const [showWeeklySummary, setShowWeeklySummary] = useState<boolean>(false);
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);

  // Perceived performance initial loading state with shimmer loading skeleton
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 650);
    return () => clearTimeout(timer);
  }, []);

  // Responsive Doughnut sizing based on ResizeObserver
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(208); // matches default w-52 (208px)

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

  // Global category footprint distribution benchmark (independent of user journal inputs)
  const getCategoryEmissions = () => {
    // Standard Global individual baseline footprint shares (average annual data in kg per capita)
    const commute = 2200.0;     // kg CO2e
    const diet = 1850.0;        // kg CO2e
    const procurement = 1400.0;  // kg CO2e

    return [
      { name: 'Commute', value: commute, color: 'var(--color-rose-muted)', bgClass: 'bg-rose-muted' },
      { name: 'Diet', value: diet, color: 'var(--color-amber-muted)', bgClass: 'bg-amber-muted' },
      { name: 'Procurement', value: procurement, color: 'var(--color-emerald-deep)', bgClass: 'bg-emerald-deep' }
    ];
  };

  const categoryData = getCategoryEmissions();
  const totalEmissions = parseFloat(categoryData.reduce((sum, d) => sum + d.value, 0).toFixed(1));

  // Sub-tab 1: Industry Selection
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>(INDUSTRIES_DATA[0].id);
  const activeIndustry = INDUSTRIES_DATA.find(ind => ind.id === selectedIndustryId) || INDUSTRIES_DATA[0];

  // Sub-tab 2: Map Selection
  const [selectedRegionCode, setSelectedRegionCode] = useState<string>(REGIONAL_INTENSITIES[0].code);
  const activeRegion = REGIONAL_INTENSITIES.find(reg => reg.code === selectedRegionCode) || REGIONAL_INTENSITIES[0];

  // Sub-tab 3: Trend Hover Data
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);

  // Weekly summary calculation for current week vs previous week
  const getWeeklySummary = () => {
    const today = new Date();
    
    // Find Monday of this week
    const day = today.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    
    const curWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diffToMonday);
    curWeekStart.setHours(0, 0, 0, 0);
    
    const curWeekEnd = new Date(curWeekStart.getTime());
    curWeekEnd.setDate(curWeekEnd.getDate() + 6);
    curWeekEnd.setHours(23, 59, 59, 999);
    
    // Previous week
    const prevWeekStart = new Date(curWeekStart.getTime());
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    
    const prevWeekEnd = new Date(prevWeekStart.getTime());
    prevWeekEnd.setDate(prevWeekEnd.getDate() + 6);
    prevWeekEnd.setHours(23, 59, 59, 999);

    let curWeekEmitted = 0;
    let curWeekOffset = 0;
    let prevWeekEmitted = 0;
    let prevWeekOffset = 0;

    activityLogs.forEach(log => {
      const dateStr = log.date || (log.timestamp ? log.timestamp.split('T')[0] : '');
      if (dateStr) {
        const logDate = new Date(dateStr + 'T12:00:00');
        if (logDate >= curWeekStart && logDate <= curWeekEnd) {
          curWeekEmitted += log.carbonAmount;
        } else if (logDate >= prevWeekStart && logDate <= prevWeekEnd) {
          prevWeekEmitted += log.carbonAmount;
        }
      }
    });

    offsetLogs?.forEach(log => {
      const dateStr = log.timestamp ? log.timestamp.split('T')[0] : '';
      if (dateStr) {
        const logDate = new Date(dateStr + 'T12:00:00');
        if (logDate >= curWeekStart && logDate <= curWeekEnd) {
          curWeekOffset += log.offsetAmount;
        } else if (logDate >= prevWeekStart && logDate <= prevWeekEnd) {
          prevWeekOffset += log.offsetAmount;
        }
      }
    });

    // Aesthetic baseline seeds for perfect first-run wabi-sabi visuals
    const defaultPrevWeekEmitted = 34.5;
    const defaultPrevWeekOffset = 12.0;
    const defaultCurWeekEmitted = 28.2;
    const defaultCurWeekOffset = 15.0;

    const finalPrevEmitted = prevWeekEmitted === 0 ? defaultPrevWeekEmitted : prevWeekEmitted;
    const finalPrevOffset = prevWeekOffset === 0 ? defaultPrevWeekOffset : prevWeekOffset;
    const finalCurEmitted = curWeekEmitted === 0 ? defaultCurWeekEmitted : curWeekEmitted;
    const finalCurOffset = curWeekOffset === 0 ? defaultCurWeekOffset : curWeekOffset;

    return {
      prevStart: prevWeekStart,
      prevEnd: prevWeekEnd,
      curStart: curWeekStart,
      curEnd: curWeekEnd,
      prevEmitted: parseFloat(finalPrevEmitted.toFixed(1)),
      prevOffset: parseFloat(finalPrevOffset.toFixed(1)),
      curEmitted: parseFloat(finalCurEmitted.toFixed(1)),
      curOffset: parseFloat(finalCurOffset.toFixed(1))
    };
  };

  const formatDateRange = (start: Date, end: Date) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const startStr = `${months[start.getMonth()]} ${start.getDate()}`;
    const endStr = `${months[end.getMonth()]} ${end.getDate()}`;
    return `${startStr} - ${endStr}`;
  };

  const weeklyData = getWeeklySummary();
  const maxWeekEmitted = Math.max(weeklyData.prevEmitted, weeklyData.curEmitted, 40);

  // Dynamic calculations for the Recharts rolling 6-month bar chart
  const getLast6MonthsLabels = () => {
    const months = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const d = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const tempDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
      months.push({
        year: tempDate.getFullYear(),
        monthIndex: tempDate.getMonth(),
        label: `${monthNames[tempDate.getMonth()]} ${tempDate.getFullYear()}`,
        key: `${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, '0')}` // e.g. "2026-06"
      });
    }
    return months;
  };

  const last6Months = getLast6MonthsLabels();

  // Baseline seeds to anchor real-time progression beautifully with professional historical data
  const historicalSeed = [
    { emitted: 180.5, offset: 60.0 },  // 5 months ago
    { emitted: 195.2, offset: 80.0 },  // 4 months ago
    { emitted: 162.0, offset: 120.0 }, // 3 months ago
    { emitted: 145.4, offset: 90.0 },  // 2 months ago
    { emitted: 130.8, offset: 140.0 }, // 1 month ago
    { emitted: 0.0, offset: 0.0 }       // Current month starts pristine and aggregates actuals
  ];

  const barChartData = last6Months.map((m, idx) => {
    // Base seed values
    let emitted = historicalSeed[idx]?.emitted || 120;
    let offset = historicalSeed[idx]?.offset || 50;

    // Aggregate user activity logs for this month
    activityLogs.forEach(log => {
      const logDateStr = log.date || (log.timestamp ? log.timestamp.split('T')[0] : '');
      if (logDateStr && logDateStr.startsWith(m.key)) {
        emitted += log.carbonAmount;
      }
    });

    // Aggregate user offset logs for this month
    offsetLogs?.forEach(log => {
      const logDateStr = log.timestamp ? log.timestamp.split('T')[0] : '';
      if (logDateStr && logDateStr.startsWith(m.key)) {
        offset += log.offsetAmount;
      }
    });

    return {
      month: m.label,
      Emitted: parseFloat(emitted.toFixed(1)),
      Offset: parseFloat(offset.toFixed(1)),
    };
  });

  // Upcoming 3 Months labels for forecast estimate
  const getUpcoming3MonthsLabels = () => {
    const months = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const d = new Date();
    
    for (let i = 1; i <= 3; i++) {
      const tempDate = new Date(d.getFullYear(), d.getMonth() + i, 1);
      months.push({
        year: tempDate.getFullYear(),
        monthIndex: tempDate.getMonth(),
        label: `${monthNames[tempDate.getMonth()]} ${tempDate.getFullYear()}`,
        key: `${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, '0')}`
      });
    }
    return months;
  };

  const upcoming3Months = getUpcoming3MonthsLabels();

  // Linear Regression: y = mx + c where x is index [0..5] for existing barChartData
  const xValues = [0, 1, 2, 3, 4, 5];
  const yValues = barChartData.map(d => d.Emitted);
  const n = yValues.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += xValues[i];
    sumY += yValues[i];
    sumXY += xValues[i] * yValues[i];
    sumXX += xValues[i] * xValues[i];
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Anomaly Calculation based on historical norm
  const avgHistorical = n > 0 ? sumY / n : 0;
  const histVariance = n > 0 
    ? yValues.reduce((acc, val) => acc + Math.pow(val - avgHistorical, 2), 0) / n 
    : 0;
  const histStdDev = Math.sqrt(histVariance);

  // Define deviation threshold (e.g. 1.2 * standard deviation, or at least 12% of historical average)
  const deviationThreshold = Math.max(avgHistorical * 0.12, 1.15 * histStdDev);
  const anomalyUpperThreshold = parseFloat((avgHistorical + deviationThreshold).toFixed(1));
  const anomalyLowerThreshold = parseFloat(Math.max(0, avgHistorical - deviationThreshold).toFixed(1));

  // Combine historical and forecasted months with anomaly checks
  const combinedChartData = [
    ...barChartData.map((d, idx) => {
      const forecastedVal = parseFloat(Math.max(0, slope * idx + intercept).toFixed(1));
      const val = d.Emitted;
      const isAnomalyVal = Math.abs(val - avgHistorical) > deviationThreshold;
      return {
        ...d,
        isForecast: false,
        Forecasted: forecastedVal,
        isAnomaly: isAnomalyVal,
        deviationPercent: avgHistorical > 0 ? parseFloat((((val - avgHistorical) / avgHistorical) * 100).toFixed(1)) : 0
      };
    }),
    ...upcoming3Months.map((m, idx) => {
      const globalIdx = 6 + idx;
      const forecastedVal = parseFloat(Math.max(0, slope * globalIdx + intercept).toFixed(1));
      const isAnomalyVal = Math.abs(forecastedVal - avgHistorical) > deviationThreshold;
      return {
        month: m.label,
        Emitted: undefined,
        Offset: undefined,
        isForecast: true,
        Forecasted: forecastedVal,
        isAnomaly: isAnomalyVal,
        deviationPercent: avgHistorical > 0 ? parseFloat((((forecastedVal - avgHistorical) / avgHistorical) * 100).toFixed(1)) : 0
      };
    })
  ];

  // Industry Icon Dispatch
  const getIndustryIcon = (id: string, colorClass: string) => {
    switch (id) {
      case 'energy':
        return <Flame className={`w-5 h-5 ${colorClass}`} />;
      case 'transport':
        return <Compass className={`w-5 h-5 ${colorClass}`} />;
      case 'manufacturing':
        return <Cpu className={`w-5 h-5 ${colorClass}`} />;
      case 'agriculture':
        return <Sprout className={`w-5 h-5 ${colorClass}`} />;
      default:
        return <Briefcase className={`w-5 h-5 ${colorClass}`} />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in" id="insights-loading-skeleton">
        {/* Skeleton Sub tabs hierarchy */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-paper-border pb-1 gap-4">
          <div className="flex gap-6">
            <div className="w-24 h-5 animate-shimmer rounded bg-paper-border/20"></div>
            <div className="w-24 h-5 animate-shimmer rounded bg-paper-border/20"></div>
            <div className="w-28 h-5 animate-shimmer rounded bg-paper-border/20"></div>
          </div>
          <div className="w-32 h-6 animate-shimmer rounded bg-paper-border/20"></div>
        </div>

        {/* Skeleton Tab Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (selection cards) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="w-44 h-7 animate-shimmer rounded bg-paper-border/20"></div>
            <div className="w-full h-4 animate-shimmer rounded bg-paper-border/20"></div>
            
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="w-full h-[76px] animate-shimmer rounded-xl bg-paper-border/10 border border-paper-border/30 flex items-center justify-between p-4 bg-paper-card">
                  <div className="flex items-center gap-3 w-3/4">
                    <div className="w-10 h-10 rounded-lg bg-paper-border/20 animate-shimmer flex-shrink-0"></div>
                    <div className="space-y-1.5 w-full">
                      <div className="w-1/2 h-3.5 animate-shimmer rounded bg-paper-border/20"></div>
                      <div className="w-3/4 h-2.5 animate-shimmer rounded bg-paper-border/20"></div>
                    </div>
                  </div>
                  <div className="w-12 h-6 animate-shimmer rounded bg-paper-border/20"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (details panel) */}
          <div className="lg:col-span-7 bg-paper-card border border-paper-border rounded-xl p-6 space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-paper-border">
              <div className="space-y-1.5 w-1/3">
                <div className="w-full h-5 animate-shimmer rounded bg-paper-border/20"></div>
                <div className="w-2/3 h-3 animate-shimmer rounded bg-paper-border/20"></div>
              </div>
              <div className="w-16 h-8 animate-shimmer rounded bg-paper-border/20"></div>
            </div>

            <div className="w-full h-48 animate-shimmer rounded-lg bg-paper-border/10 border border-paper-border/20"></div>

            <div className="space-y-3 pt-2">
              <div className="w-1/4 h-4 animate-shimmer rounded bg-paper-border/20"></div>
              <div className="space-y-2">
                <div className="w-full h-3 animate-shimmer rounded bg-paper-border/20"></div>
                <div className="w-full h-3 animate-shimmer rounded bg-paper-border/20"></div>
                <div className="w-4/5 h-3 animate-shimmer rounded bg-paper-border/20"></div>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-paper-border pb-1 gap-4">
        <div className="flex gap-6">
          <button
            onClick={() => setInsightsSubTab('industry')}
            className={`font-serif text-[15px] pb-1.5 transition-all relative ${
              insightsSubTab === 'industry' 
                ? 'text-emerald-deep font-bold border-b-2 border-emerald-deep' 
                : 'text-earth-muted hover:text-charcoal'
            }`}
          >
            Global Impact
          </button>
          <button
            onClick={() => setInsightsSubTab('map')}
            className={`font-serif text-[15px] pb-1.5 transition-all relative ${
              insightsSubTab === 'map' 
                ? 'text-emerald-deep font-bold border-b-2 border-emerald-deep' 
                : 'text-earth-muted hover:text-charcoal'
            }`}
          >
            Regional Grids
          </button>
          <button
            onClick={() => setInsightsSubTab('trend')}
            className={`font-serif text-[15px] pb-1.5 transition-all relative ${
              insightsSubTab === 'trend' 
                ? 'text-emerald-deep font-bold border-b-2 border-emerald-deep' 
                : 'text-earth-muted hover:text-charcoal'
            }`}
          >
            Emissions Trend
          </button>
        </div>

        {/* Toggle Weekly Summary */}
        <button
          type="button"
          onClick={() => setShowWeeklySummary(!showWeeklySummary)}
          className={`font-mono text-[10px] uppercase tracking-wider font-bold py-1 px-3 rounded transition-all flex items-center gap-1.5 border ${
            showWeeklySummary 
              ? 'bg-emerald-deep text-paper border-emerald-deep shadow-sm' 
              : 'bg-paper text-earth-muted border-paper-border hover:text-charcoal hover:border-earth-muted'
          }`}
        >
          <Calendar className="w-3 h-3" />
          {showWeeklySummary ? 'Hide Weekly Summary' : 'Weekly Summary'}
        </button>
      </div>

      {/* Weekly Summary Collapsible Block */}
      {showWeeklySummary && (
        <div className="bg-paper-card border border-paper-border rounded-xl p-5 soft-shadow space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-paper-border/60 pb-2.5">
            <div>
              <h3 className="font-serif text-base font-bold text-clay">Weekly Balance Chronicle</h3>
              <p className="font-sans text-[11px] text-earth-muted italic">Comparing short-term weekly aggregate carbon outputs.</p>
            </div>
            <div className="text-right font-mono text-[9px]">
              <span className="text-earth-muted">Trend: </span>
              <strong className={`font-bold ${weeklyData.curEmitted < weeklyData.prevEmitted ? 'text-emerald-deep' : 'text-amber-muted'}`}>
                {weeklyData.curEmitted < weeklyData.prevEmitted ? 'EMISSIONS BALANCED (DOWN)' : 'EMISSIONS HIGHER'}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            {/* Direct Bar Visual comparison */}
            <div className="space-y-3.5">
              {/* Previous Week */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-earth-muted">Prev Week ({formatDateRange(weeklyData.prevStart, weeklyData.prevEnd)})</span>
                  <span className="font-semibold text-charcoal">{weeklyData.prevEmitted} kg</span>
                </div>
                <div className="h-4.5 bg-paper border border-paper-border/80 relative w-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-rose-muted/50 transition-all duration-700"
                    style={{ width: `${Math.min((weeklyData.prevEmitted / maxWeekEmitted) * 100, 100)}%` }}
                  />
                  {weeklyData.prevOffset > 0 && (
                    <div 
                      className="absolute top-0 h-full bg-emerald-deep/15 border-l border-emerald-deep/30"
                      style={{ 
                        left: `${Math.min((Math.max(0, weeklyData.prevEmitted - weeklyData.prevOffset) / maxWeekEmitted) * 100, 100)}%`,
                        width: `${Math.min((weeklyData.prevOffset / maxWeekEmitted) * 100, 100)}%`
                      }}
                    />
                  )}
                  <span className="absolute inset-y-0 left-2 flex items-center font-mono text-[9px] text-[#4c3535]/80 uppercase font-bold pointer-events-none">
                    Baseline Ledger
                  </span>
                </div>
              </div>

              {/* Current Week */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-earth-muted">This Week ({formatDateRange(weeklyData.curStart, weeklyData.curEnd)})</span>
                  <span className="font-semibold text-charcoal">{weeklyData.curEmitted} kg</span>
                </div>
                <div className="h-4.5 bg-paper border border-paper-border/80 relative w-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-rose-muted transition-all duration-700"
                    style={{ width: `${Math.min((weeklyData.curEmitted / maxWeekEmitted) * 100, 100)}%` }}
                  />
                  {weeklyData.curOffset > 0 && (
                    <div 
                      className="absolute top-0 h-full bg-emerald-deep/25 border-l border-emerald-deep/40"
                      style={{ 
                        left: `${Math.min((Math.max(0, weeklyData.curEmitted - weeklyData.curOffset) / maxWeekEmitted) * 100, 100)}%`,
                        width: `${Math.min((weeklyData.curOffset / maxWeekEmitted) * 100, 100)}%`
                      }}
                    />
                  )}
                  <span className="absolute inset-y-0 left-2 flex items-center font-mono text-[9px] text-emerald-deep uppercase font-bold pointer-events-none">
                    Active Chronicle
                  </span>
                </div>
              </div>
            </div>

            {/* Micro commentary */}
            <div className="bg-paper border border-paper-border/60 p-3.5 rounded-lg flex flex-col justify-center min-h-[95px]">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  weeklyData.curEmitted <= weeklyData.prevEmitted ? 'bg-emerald-deep/10 text-emerald-deep' : 'bg-amber-muted/10 text-amber-muted'
                }`}>
                  <TrendingDown className={`w-3.5 h-3.5 ${weeklyData.curEmitted > weeklyData.prevEmitted ? 'rotate-180' : ''}`} />
                </div>
                <span className="font-serif text-sm font-bold text-clay">Rolling Progression</span>
              </div>
              <p className="font-sans text-[11px] text-earth-muted leading-relaxed">
                {weeklyData.curEmitted <= weeklyData.prevEmitted ? (
                  <>
                    Carbon output decreased by <strong>{((1 - (weeklyData.curEmitted / weeklyData.prevEmitted)) * 100).toFixed(1)}%</strong> compared to last week. Mitigating utilities and active transportation preserves wabi-sabi balance.
                  </>
                ) : (
                  <>
                    Carbon output is elevated by <strong>{(((weeklyData.curEmitted / weeklyData.prevEmitted) - 1) * 100).toFixed(1)}%</strong>. Consider logging dynamic clean habits or supporting verified offsets.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Domain 2 - Part 1: Industry Insights */}
      {insightsSubTab === 'industry' && (
        <div className="space-y-8 animate-fade-in">
          {/* Top Row: Personal Impact Category Breakdown Doughnut Chart */}
          <div className="bg-paper-card border border-paper-border rounded-xl p-6 soft-shadow" id="personal-trace-doughnut-card">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-paper-border pb-4 mb-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-clay">Global Category Footprint Distribution</h3>
                <p className="font-sans text-xs text-earth-muted italic">A benchmark analysis of the average annual individual carbon footprint across core life categories globally.</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-[9px] uppercase tracking-wider text-earth-muted block font-bold">Annual Global Average</span>
                <span className="font-sans text-lg font-bold text-rose-muted">5,450 kg CO₂e</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Doughnut Chart representation */}
              <div className="md:col-span-5 flex justify-center py-4 relative">
                <div ref={containerRef} className="w-full max-w-[208px] h-52 relative animate-fade-in" id="category-doughnut">
                  {/* Center Text inside the Doughnut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 font-mono">
                    <span className={`uppercase tracking-wider text-earth-muted font-bold transition-all ${centerLabelSize}`}>Average</span>
                    <span className={`font-serif font-bold text-charcoal leading-none my-0.5 transition-all ${centerValueSize}`}>5,450</span>
                    <span className={`text-earth-muted transition-all ${centerLabelSize}`}>kg CO₂e</span>
                  </div>

                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--color-paper-card)" strokeWidth={1} />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }: any) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const percentage = totalEmissions > 0 ? ((data.value / totalEmissions) * 100).toFixed(1) : '0.0';
                            return (
                              <div className="bg-white border border-paper-border rounded-lg p-2.5 shadow-md font-mono text-[10px] space-y-1 z-50">
                                <p className="font-bold font-serif text-[11px] text-charcoal">{data.name}</p>
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

              {/* Dynamic explanations & interactive category details */}
              <div className="md:col-span-7 space-y-4">
                <h4 className="font-mono text-[10px] uppercase tracking-widest text-charcoal font-bold">Global per-capita distribution shares</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {categoryData.map((item, idx) => {
                    const percentage = totalEmissions > 0 ? ((item.value / totalEmissions) * 100).toFixed(1) : '0';
                    return (
                      <div 
                        key={idx} 
                        className="bg-paper rounded-lg border border-paper-border/70 p-3.5 space-y-2 flex flex-col justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 ${item.bgClass} rounded-full flex-shrink-0`} />
                          <span className="font-serif text-xs font-bold text-charcoal">{item.name}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="block font-mono text-base font-bold text-clay leading-none">{item.value.toLocaleString()} kg</span>
                          <span className="block font-sans text-[9px] text-earth-muted uppercase tracking-widest font-bold">
                            {percentage}% ratio
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-paper/50 rounded-lg p-3.5 border border-dashed border-paper-border flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-emerald-deep/10 text-emerald-deep mt-0.5 shrink-0">
                    <TrendingDown className="w-3.5 h-3.5" />
                  </div>
                  <p className="font-sans text-[11px] text-earth-muted leading-relaxed">
                    Analyzing global category weights reveals which domains dominate individual atmospheric impacts. Journeys and commutes currently represent the primary footprint sector internationally, demanding shift-changes to electric rail, mass transit, and battery cells. Shifting diets towards agricultural plant-centered protein represents the fastest secondary source of carbon relief, with quality procurement helping to scale-down textile and appliance manufacturing release.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Atmospheric Slicing Industrial Insights (2 columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
            {/* Industry Selection Column */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-serif text-xl font-bold text-clay mb-1">Atmospheric Slicing</h3>
              <p className="font-sans text-xs text-earth-muted mb-4 italic">Distributing global greenhouse emission drivers by aggregate industrial volume.</p>

              <div className="space-y-3">
                {INDUSTRIES_DATA.map((ind) => {
                  const isSelected = ind.id === selectedIndustryId;
                  return (
                    <button
                      key={ind.id}
                      id={`industry-select-${ind.id}`}
                      onClick={() => setSelectedIndustryId(ind.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'bg-paper-card border-emerald-deep/40 shadow-sm' 
                          : 'bg-paper border-paper-border/60 hover:bg-paper-card'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-emerald-deep/10 text-emerald-deep' : 'bg-paper-border/60 text-earth-muted'
                        }`}>
                          {getIndustryIcon(ind.id, isSelected ? 'text-emerald-deep' : 'text-earth-muted')}
                        </div>
                        <div>
                          <span className="block font-serif text-xs font-semibold text-charcoal">{ind.name}</span>
                          <span className="block font-sans text-[10px] text-earth-muted">Annual release: {ind.annualGigaTons} Gigatons</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-clay">{ind.percentage}%</span>
                        <span className="block font-sans text-[8px] uppercase tracking-wider text-earth-muted font-bold">of global total</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Editorial Breakdown */}
            <div className="lg:col-span-7 bg-paper-card border border-paper-border rounded-xl p-6 soft-shadow flex flex-col justify-between" id="industry-editorial-breakdown-card">
              <div className="space-y-6">
                <div className="flex justify-between items-start border-b border-paper-border pb-4">
                  <div>
                    <h4 className="font-serif text-2xl font-bold text-charcoal">{activeIndustry.name}</h4>
                    <p className="font-mono text-xs text-earth-muted tracking-wide">Primary sector aggregate study</p>
                  </div>
                  <div className="bg-paper border border-paper-border rounded px-4 py-1.5 text-center">
                    <span className="block font-mono text-xl font-bold text-emerald-deep">{activeIndustry.percentage}%</span>
                    <span className="block font-sans text-[8px] uppercase tracking-widest text-earth-muted font-bold">Aggregate weight</span>
                  </div>
                </div>

                {/* Editorial Description */}
                <div className="space-y-4">
                  <blockquote className="border-l-2 border-amber-muted pl-4 italic font-serif text-sm text-clay leading-relaxed">
                    "{activeIndustry.editorialDescription}"
                  </blockquote>
                </div>

                {/* Sub-Sectors Breakdown custom progress bars */}
                <div className="space-y-3">
                  <h5 className="font-mono text-[10px] uppercase tracking-wider text-earth-muted font-semibold">Subsector footprint ratio</h5>
                  {activeIndustry.subSectors.map((sub, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-serif text-clay">
                        <span>{sub.name}</span>
                        <span className="font-mono font-bold">{sub.percentage}%</span>
                      </div>
                      {/* Wabi sabi flat-ends progress bar */}
                      <div className="h-2 bg-paper border border-paper-border w-full relative overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-emerald-deep transition-all duration-1000"
                          style={{ width: `${sub.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-paper-border/80 flex items-center gap-2.5 text-earth-muted">
                <Info className="w-4 h-4 shrink-0 text-emerald-deep" />
                <span className="font-sans text-[11px] leading-relaxed">
                  Source citations draw from IPCC Climate Change Synthesis Report 2023 guidelines & global GHG emissions inventories.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Domain 2 - Part 2: Global Footprint Map */}
      {insightsSubTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Spatial Grid of Regions */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="font-serif text-xl font-bold text-clay">Spatial Grid of Intensity</h3>
            <p className="font-sans text-xs text-earth-muted italic">Selecting regional electricity grids to contextualize localized carbon emissions factor density.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {REGIONAL_INTENSITIES.map((reg) => {
                const isSelected = reg.code === selectedRegionCode;
                return (
                  <button
                    key={reg.code}
                    onClick={() => setSelectedRegionCode(reg.code)}
                    className={`text-left p-4 rounded-xl border transition-all space-y-3 ${
                      isSelected 
                        ? 'bg-paper-card border-emerald-deep/40 shadow-sm' 
                        : 'bg-paper border-paper-border/60 hover:bg-paper-card'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[9px] uppercase tracking-wider font-bold bg-paper px-1.5 py-0.5 rounded border border-paper-border/80 text-earth-muted">
                        {reg.code}
                      </span>
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        reg.status === 'decarbonized' ? 'bg-emerald-deep' :
                        reg.status === 'transitional' ? 'bg-amber-muted' : 'bg-rose-muted'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-serif text-xs font-bold text-charcoal">{reg.name}</h4>
                      <p className="font-mono text-sm font-semibold text-clay mt-1">{reg.carbonIntensity} g CO₂/kWh</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Regional Details Panel */}
          <div className="lg:col-span-6 bg-paper-card border border-paper-border rounded-xl p-6 soft-shadow flex flex-col justify-between">
            <div className="space-y-6">
              <div className="border-b border-paper-border pb-4">
                <span className="font-mono text-[10px] uppercase tracking-wider text-earth-muted block mb-1">Selected Regional Matrix</span>
                <h4 className="font-serif text-2xl font-bold text-charcoal">{activeRegion.name}</h4>
                <p className="font-sans text-[11px] text-earth-muted mt-1 italic">{activeRegion.description}</p>
              </div>

              {/* Grid Source Visualization */}
              <div className="space-y-4">
                <h5 className="font-mono text-[10px] uppercase tracking-wider text-earth-muted font-bold">Grid Generation Profile</h5>
                
                <div className="bg-paper p-4 rounded-lg border border-paper-border/60 space-y-3">
                  <div className="flex justify-between text-xs font-serif">
                    <span className="text-earth-muted">Primary Feed Sourcing</span>
                    <span className="font-semibold text-charcoal font-mono text-[11px]">{activeRegion.primarySource}</span>
                  </div>
                  <div className="flex justify-between text-xs font-serif">
                    <span className="text-earth-muted">Secondary backup Sourcing</span>
                    <span className="font-semibold text-charcoal font-mono text-[11px]">{activeRegion.secondarySource}</span>
                  </div>
                  <div className="flex justify-between text-xs font-serif">
                    <span className="text-earth-muted">Operational State status</span>
                    <span className={`font-mono text-[10px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded ${
                      activeRegion.status === 'decarbonized' ? 'bg-emerald-light text-emerald-deep' :
                      activeRegion.status === 'transitional' ? 'bg-amber-light text-amber-muted' :
                      'bg-rose-light text-rose-muted'
                    }`}>
                      {activeRegion.status}
                    </span>
                  </div>
                </div>

                {/* Conceptual map footprint explanation */}
                <div className="p-3 bg-paper border border-paper-border/55 rounded-lg flex items-start gap-2.5">
                  <Globe className="w-5 h-5 text-emerald-deep shrink-0 mt-0.5" />
                  <p className="font-sans text-[11px] text-earth-muted leading-relaxed">
                    Electricity in different latitudes carries unequal carbon loads. E.g. pulling 1 kWh of power in clean France releases just <strong>56 grams</strong> of carbon, whereas the coal-dominated block in Central India releases upwards of <strong>710 grams</strong>. Shifting power-heavy operations to low intensity zones or hours represents silent systemic genius.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-paper-border text-center">
              <span className="font-mono text-[10px] text-earth-muted">Citation indices derived from EPA EGRID 2022 & ENTSO-E power reports.</span>
            </div>
          </div>
        </div>
      )}

      {/* Domain 2 - Part 3: Annual Rolling Trend */}
      {insightsSubTab === 'trend' && (
        <motion.div 
          className="space-y-8"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Recharts 6-Month Emitted vs Offset Bar Chart */}
          <div className="bg-paper-card border border-paper-border rounded-xl p-6 soft-shadow space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-paper-border pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-clay">6-Month Ledger Progress Matrix & 3-Month Forecast</h3>
                <p className="font-sans text-xs text-earth-muted italic">Direct carbon emissions, aggregate verified offsets, and a predictive 3-month linear forecast trend.</p>
              </div>
              
              {/* Dynamic Anomaly Threshold Panel & Reference Legend */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 select-none flex-wrap">
                {/* Stats indicators */}
                <div className="flex gap-3 items-center bg-paper/50 border border-paper-border/60 rounded-lg px-2.5 py-1.5 font-mono text-[9px] uppercase font-bold text-earth-muted">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-muted" />
                    Max Norm: {anomalyUpperThreshold.toFixed(0)} kg
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-muted" />
                    Min Norm: {anomalyLowerThreshold.toFixed(0)} kg
                  </span>
                  {combinedChartData.filter(d => d.isForecast && d.isAnomaly).length > 0 ? (
                    <motion.span 
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="text-rose-muted font-bold flex items-center gap-1 bg-rose-light/50 border border-rose-muted/20 px-1.5 py-0.5 rounded cursor-help"
                      title="Forecasted emissions significantly deviate from historical baseline norms!"
                    >
                      ⚠️ {combinedChartData.filter(d => d.isForecast && d.isAnomaly).length} Forecast Anomaly
                    </motion.span>
                  ) : (
                    <span className="text-emerald-deep font-bold flex items-center gap-1 bg-emerald-light border border-emerald-deep/20 px-1.5 py-0.5 rounded">
                      ✓ Trend Stable
                    </span>
                  )}
                </div>

                {/* Legend matching previous styling with forecast extension */}
                <div className="flex gap-4 font-mono text-[10px] uppercase font-bold text-earth-muted flex-wrap">
                  <motion.div 
                    className="flex items-center gap-1.5 cursor-help"
                    animate={{
                      scale: activeBarIndex !== null ? 1.06 : 1.0,
                      color: activeBarIndex !== null ? 'var(--color-rose-muted)' : 'var(--color-earth-muted)'
                    }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <motion.span 
                      className="w-3 h-3 bg-rose-muted inline-block rounded-xs"
                      animate={{
                        scale: activeBarIndex !== null ? [1, 1.2, 1] : 1
                      }}
                      transition={{ repeat: activeBarIndex !== null ? Infinity : 0, repeatType: "reverse", duration: 1 }}
                    />
                    Carbon Emitted
                  </motion.div>
                  <motion.div 
                    className="flex items-center gap-1.5 cursor-help"
                    animate={{
                      scale: activeBarIndex !== null ? 1.06 : 1.0,
                      color: activeBarIndex !== null ? 'var(--color-emerald-deep)' : 'var(--color-earth-muted)'
                    }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <motion.span 
                      className="w-3 h-3 bg-emerald-deep inline-block rounded-xs"
                      animate={{
                        scale: activeBarIndex !== null ? [1, 1.2, 1] : 1
                      }}
                      transition={{ repeat: activeBarIndex !== null ? Infinity : 0, repeatType: "reverse", duration: 1, delay: 0.2 }}
                    />
                    Carbon Offset
                  </motion.div>
                  <motion.div 
                    className="flex items-center gap-1.5 cursor-help"
                    animate={{
                      scale: activeBarIndex !== null ? 1.06 : 1.0,
                      color: activeBarIndex !== null ? 'var(--color-amber-muted)' : 'var(--color-earth-muted)'
                    }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <motion.span 
                      className="w-4 h-0.5 bg-amber-muted inline-block border-t border-dashed border-amber-muted"
                      animate={{
                        scale: activeBarIndex !== null ? [1, 1.4, 1] : 1
                      }}
                      transition={{ repeat: activeBarIndex !== null ? Infinity : 0, repeatType: "reverse", duration: 1, delay: 0.4 }}
                    />
                    Forecast Trend
                  </motion.div>
                </div>
              </div>
            </div>
 
            {/* Recharts Bar/Line Composed Chart */}
            <div className="h-72 w-full font-mono text-[10px]" id="recharts-bar-progress">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={combinedChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  onMouseMove={(state) => {
                    if (state && state.activeTooltipIndex !== undefined && state.activeTooltipIndex !== null) {
                      setActiveBarIndex(state.activeTooltipIndex);
                    } else {
                      setActiveBarIndex(null);
                    }
                  }}
                  onMouseLeave={() => setActiveBarIndex(null)}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-paper-border)" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="var(--color-earth-muted)" 
                    tickLine={false}
                    axisLine={{ stroke: 'var(--color-paper-border)' }}
                    tick={{ fill: 'var(--color-earth-muted)', fontSize: 10 }}
                  />
                  <YAxis 
                    stroke="var(--color-earth-muted)" 
                    tickLine={false}
                    axisLine={{ stroke: 'var(--color-paper-border)' }}
                    tick={{ fill: 'var(--color-earth-muted)', fontSize: 10 }}
                    unit=" kg"
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-paper-border)', opacity: 0.15 }} />
                  
                  {/* Dynamic Visual Anomaly Threshold Lines */}
                  <ReferenceLine 
                    y={anomalyUpperThreshold} 
                    stroke="var(--color-rose-muted)" 
                    strokeDasharray="4 4" 
                    strokeWidth={1}
                    opacity={0.6}
                    label={{ 
                      value: 'Anomaly Max', 
                      fill: 'var(--color-rose-muted)', 
                      position: 'insideBottomRight', 
                      fontSize: 8,
                      fontWeight: 'bold',
                      fontFamily: 'monospace'
                    }} 
                  />
                  <ReferenceLine 
                    y={anomalyLowerThreshold} 
                    stroke="var(--color-amber-muted)" 
                    strokeDasharray="4 4" 
                    strokeWidth={1}
                    opacity={0.6}
                    label={{ 
                      value: 'Anomaly Min', 
                      fill: 'var(--color-amber-muted)', 
                      position: 'insideTopRight', 
                      fontSize: 8,
                      fontWeight: 'bold',
                      fontFamily: 'monospace'
                    }} 
                  />

                  <Bar dataKey="Emitted" fill="var(--color-rose-muted)" radius={[2, 2, 0, 0]} maxBarSize={45} shape={<AnimatedBarShape activeIndex={activeBarIndex} />} />
                  <Bar dataKey="Offset" fill="var(--color-emerald-deep)" radius={[2, 2, 0, 0]} maxBarSize={45} shape={<AnimatedBarShape activeIndex={activeBarIndex} />} />
                  <Line 
                    type="monotone" 
                    dataKey="Forecasted" 
                    stroke="var(--color-amber-muted)" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    dot={<AnomalyDot />}
                    activeDot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 12-Month Continuous Curve (SVG Chart) */}
          <div className="bg-paper-card border border-paper-border rounded-xl p-6 soft-shadow space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-paper-border pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-clay">12-Month Rolling Carbon Discipline</h3>
                <p className="font-sans text-xs text-earth-muted italic">Comparing unmitigated carbon baseline projection with disciplined personal records.</p>
              </div>
              
              {/* Legend indicators */}
              <div className="flex gap-4 font-mono text-[10px] uppercase font-bold text-earth-muted">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 bg-rose-muted inline-block" />
                  Unmitigated Baseline
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 bg-emerald-deep inline-block" />
                  Disciplined Track
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 bg-amber-muted inline-block" />
                  Offsets Balanced
                </div>
              </div>
            </div>

            {/* SVG Customized Curve / Chart */}
            <div className="relative">
              <svg 
                className="w-full h-64 md:h-80 overflow-visible" 
                viewBox="0 0 1000 300"
                preserveAspectRatio="none"
              >
                {/* Grid Lines */}
                <line x1="0" y1="50" x2="1000" y2="50" stroke="var(--color-paper-border)" strokeWidth="0.5" strokeDasharray="3,3" />
                <line x1="0" y1="125" x2="1000" y2="125" stroke="var(--color-paper-border)" strokeWidth="0.5" strokeDasharray="3,3" />
                <line x1="0" y1="200" x2="1000" y2="200" stroke="var(--color-paper-border)" strokeWidth="0.5" strokeDasharray="3,3" />
                <line x1="0" y1="275" x2="1000" y2="275" stroke="var(--color-paper-border)" strokeWidth="0.5" strokeDasharray="3,3" />

                {/* Y Axis Markers */}
                <text x="10" y="45" className="font-mono text-[9px] fill-earth-muted">1,200 kg</text>
                <text x="10" y="120" className="font-mono text-[9px] fill-earth-muted">800 kg</text>
                <text x="10" y="195" className="font-mono text-[9px] fill-earth-muted">400 kg</text>
                <text x="10" y="270" className="font-mono text-[9px] fill-earth-muted">0 kg</text>

                {/* Unmitigated Path (Rose) */}
                <path
                  d={`M ${TWELVE_MONTHS_TREND.map((d, index) => {
                    const x = (index / (TWELVE_MONTHS_TREND.length - 1)) * 950 + 25;
                    const y = 300 - (d.unmitigated / 1200) * 250 - 25;
                    return `${x} ${y}`;
                  }).join(' L ')}`}
                  fill="none"
                  stroke="var(--color-rose-muted)"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />

                {/* Disciplined Path (Emerald) */}
                <path
                  d={`M ${TWELVE_MONTHS_TREND.map((d, index) => {
                    const x = (index / (TWELVE_MONTHS_TREND.length - 1)) * 950 + 25;
                    const y = 300 - (d.disciplined / 1200) * 250 - 25;
                    return `${x} ${y}`;
                  }).join(' L ')}`}
                  fill="none"
                  stroke="var(--color-emerald-deep)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Offsets Net Path (Amber) */}
                <path
                  d={`M ${TWELVE_MONTHS_TREND.map((d, index) => {
                    const x = (index / (TWELVE_MONTHS_TREND.length - 1)) * 950 + 25;
                    const net = Math.max(0, d.disciplined - d.offsets);
                    const y = 300 - (net / 1200) * 250 - 25;
                    return `${x} ${y}`;
                  }).join(' L ')}`}
                  fill="none"
                  stroke="var(--color-amber-muted)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Interactive nodes and mouseovers */}
                {TWELVE_MONTHS_TREND.map((d, index) => {
                  const x = (index / (TWELVE_MONTHS_TREND.length - 1)) * 950 + 25;
                  const yDisciplined = 300 - (d.disciplined / 1200) * 250 - 25;
                  const isHovered = hoveredTrendIndex === index;

                  return (
                    <g key={index} className="cursor-pointer" onMouseEnter={() => setHoveredTrendIndex(index)} onMouseLeave={() => setHoveredTrendIndex(null)}>
                      {/* Circle indicators */}
                      <circle 
                        cx={x} 
                        cy={yDisciplined} 
                        r={isHovered ? 6 : 3.5} 
                        fill="var(--color-emerald-deep)" 
                        className="transition-all duration-200"
                      />
                      
                      {/* Text Month label */}
                      <text 
                        x={x} 
                        y="292" 
                        textAnchor="middle" 
                        className="font-mono text-[10px] fill-clay font-bold"
                      >
                        {d.month}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Custom overlay tooltip for hovered node */}
              {hoveredTrendIndex !== null && (() => {
                const dataPoint = TWELVE_MONTHS_TREND[hoveredTrendIndex];
                return (
                  <div 
                    className="absolute bg-paper border border-paper-border/80 rounded-lg p-3 shadow-md text-xs font-mono space-y-1 animate-fade-in"
                    style={{ 
                      left: `${(hoveredTrendIndex / (TWELVE_MONTHS_TREND.length - 1)) * 80 + 10}%`,
                      top: '20px'
                    }}
                  >
                    <div className="font-bold text-clay border-b border-paper-border pb-1 mb-1 font-serif text-sm">
                      Activity Chronicle: {dataPoint.month}
                    </div>
                    <div className="flex justify-between gap-6">
                      <span className="text-earth-muted">Unmitigated Target:</span>
                      <span className="font-bold text-rose-muted">{dataPoint.unmitigated} kg</span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span className="text-earth-muted">Disciplined Level:</span>
                      <span className="font-semibold text-emerald-deep">{dataPoint.disciplined} kg</span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span className="text-earth-muted">Committed Offsets:</span>
                      <span className="font-semibold text-emerald-deep">-{dataPoint.offsets} kg</span>
                    </div>
                    <div className="flex justify-between gap-6 border-t border-dashed border-paper-border pt-1 transition-all">
                      <span className="text-earth-muted">Net Atmosphere Balance:</span>
                      <span className="font-bold text-amber-muted">{Math.max(0, dataPoint.disciplined - dataPoint.offsets)} kg</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Quick takeaway summary */}
            <div className="bg-paper border border-paper-border p-4 rounded-xl flex items-start gap-3.5">
              <TrendingDown className="w-5 h-5 text-emerald-deep mt-0.5 shrink-0" />
              <div className="space-y-1">
                <h4 className="font-serif text-sm font-bold text-clay">Rolling Discipline Impact Analysis</h4>
                <p className="font-sans text-xs text-earth-muted leading-relaxed">
                  By maintaining a structured journaling habit and executing progressive fuel swaps (Transition to solar hot wash systems, local transit travel), disciplined emissions drop by an average of <strong>58.4%</strong> over the unmitigated baseline trajectory. Adding offsets creates Net Zero moments in late spring cycles.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default InsightsDomain;
