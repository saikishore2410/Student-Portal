import { useState } from 'react';
import { Award, Zap, Clock, BookOpen } from 'lucide-react';

interface ChartDataPoint {
  label: string;
  value: number;
  secondary?: number;
}

export function PerformanceChart() {
  const [activeBar, setActiveBar] = useState<number | null>(null);

  const data: ChartDataPoint[] = [
    { label: 'Planck Physics', value: 95 },
    { label: 'Matrix algebra', value: 82 },
    { label: 'Dirac operators', value: 88 },
    { label: 'Bell State gates', value: 90 },
    { label: 'Big-O Analysis', value: 74 },
    { label: 'DP Knapsacks', value: 85 }
  ];

  const maxVal = 100;
  const height = 180;
  const barPadding = 16;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Quiz Performance Metrics</h3>
          <p className="text-xs text-slate-500">Comparing score output percentage against passing line (70%)</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Score Out</span>
        </div>
      </div>

      <div className="relative pt-4">
        {/* Y-axis values */}
        <div className="absolute top-4 left-0 flex h-[140px] flex-col justify-between text-[10px] font-mono text-slate-400">
          <span>100%</span>
          <span>70% (Pass)</span>
          <span>50%</span>
          <span>0%</span>
        </div>

        {/* Passing threshold dashed guidelines */}
        <div className="absolute left-10 right-0 top-[42%] border-t border-dashed border-rose-400/40 opacity-70"></div>
        <div className="absolute left-10 right-0 top-[14px] border-t border-slate-100 dark:border-slate-800"></div>
        <div className="absolute left-10 right-0 top-[70px] border-t border-slate-100 dark:border-slate-800"></div>
        <div className="absolute left-10 right-0 bottom-[40px] border-t border-slate-200 dark:border-slate-800"></div>

        {/* Dynamic SVG Bars Container */}
        <div className="ml-10 h-[140px] flex items-end justify-between px-2">
          {data.map((item, index) => {
            const pct = (item.value / maxVal) * 100;
            const barHeight = (item.value / maxVal) * 110; // offset scale
            return (
              <div 
                key={index} 
                className="group relative flex flex-col items-center flex-1 mx-1"
                onMouseEnter={() => setActiveBar(index)}
                onMouseLeave={() => setActiveBar(null)}
              >
                {/* Score hover tooltip */}
                {activeBar === index && (
                  <div className="absolute -top-10 left-1/2 z-10 -translate-x-1/2 rounded bg-slate-800 px-2 py-1 text-[10px] font-medium font-mono text-white shadow-md">
                    {item.value}%
                  </div>
                )}

                {/* Substantive Chart Bar */}
                <div 
                  className={`w-full rounded-t transition-all duration-300 ${
                    item.value >= 70 
                      ? 'bg-gradient-to-t from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300' 
                      : 'bg-gradient-to-t from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300'
                  } ${activeBar === index ? 'shadow-lg scale-x-105' : 'shadow-sm'}`}
                  style={{ height: `${barHeight}px` }}
                ></div>

                {/* Vertical label anchor */}
                <div className="mt-3 truncate text-[9px] font-mono font-medium text-slate-500 text-center w-full max-w-[55px]">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function StudyTrendLineChart() {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const points: ChartDataPoint[] = [
    { label: 'Mon', value: 1.5, secondary: 1.0 },
    { label: 'Tue', value: 2.8, secondary: 1.5 },
    { label: 'Wed', value: 3.5, secondary: 2.0 },
    { label: 'Thu', value: 1.2, secondary: 2.0 },
    { label: 'Fri', value: 4.2, secondary: 2.5 },
    { label: 'Sat', value: 5.5, secondary: 3.0 },
    { label: 'Sun', value: 3.0, secondary: 2.5 }
  ];

  const maxVal = 6.0;
  const width = 500;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  // Generate SVG coordinates based on values
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const dataCoords = points.map((p, i) => {
    const x = paddingLeft + (i / (points.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (p.value / maxVal) * chartHeight;
    return { x, y, label: p.label, val: p.value };
  });

  const secondaryCoords = points.map((p, i) => {
    const x = paddingLeft + (i / (points.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((p.secondary || 0) / maxVal) * chartHeight;
    return { x, y };
  });

  // Construct SVG Polyline paths
  const dPath = dataCoords.reduce((acc, c, i) => {
    return acc + (i === 0 ? `M ${c.x} ${c.y}` : ` L ${c.x} ${c.y}`);
  }, "");

  const dPathSec = secondaryCoords.reduce((acc, c, i) => {
    return acc + (i === 0 ? `M ${c.x} ${c.y}` : ` L ${c.x} ${c.y}`);
  }, "");

  // Create gradient shaded region boundary
  const dArea = dPath + ` L ${dataCoords[dataCoords.length - 1].x} ${height - paddingBottom} L ${dataCoords[0].x} ${height - paddingBottom} Z`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Study Habit Coherency</h3>
          <p className="text-xs text-slate-500">Tracking weekly study minutes compared with class recommendations</p>
        </div>
        <div className="flex gap-4 text-xs font-medium">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-violet-500"></span>
            <span className="text-slate-600 dark:text-slate-400">Actual Hours</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-slate-300"></span>
            <span className="text-slate-600 dark:text-slate-400 font-mono">Recommended</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0"/>
            </linearGradient>
          </defs>

          {/* Guidelines */}
          {[1, 2, 3, 4, 5].map((val, i) => {
            const hCoord = paddingTop + chartHeight - (val / maxVal) * chartHeight;
            return (
              <g key={i}>
                <line 
                  x1={paddingLeft} 
                  y1={hCoord} 
                  x2={width - paddingRight} 
                  y2={hCoord} 
                  className="stroke-slate-100 dark:stroke-slate-800" 
                  strokeDasharray="4 4"
                />
                <text 
                  x={paddingLeft - 8} 
                  y={hCoord + 4} 
                  className="fill-slate-400 font-mono text-[10px]" 
                  textAnchor="end"
                >
                  {val}h
                </text>
              </g>
            );
          })}

          {/* Gradients Area */}
          <path d={dArea} fill="url(#areaGrad)" />

          {/* Recommended Target Limit Line */}
          <path 
            d={dPathSec} 
            fill="none" 
            className="stroke-slate-300 dark:stroke-slate-700" 
            strokeWidth="2" 
            strokeDasharray="3 3"
          />

          {/* Actual Active Hours Line */}
          <path 
            d={dPath} 
            fill="none" 
            className="stroke-violet-500" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />

          {/* Interactivity Dots & Tooltips */}
          {dataCoords.map((c, i) => (
            <g 
              key={i} 
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              className="cursor-pointer"
            >
              {/* Invisible touch catcher */}
              <circle cx={c.x} cy={c.y} r="16" fill="transparent" />

              {/* Graphical Dot */}
              <circle 
                cx={c.x} 
                cy={c.y} 
                r={hoverIndex === i ? "8" : "5"} 
                className="fill-white stroke-violet-600 transition-all duration-150" 
                strokeWidth={hoverIndex === i ? "4" : "2.5"} 
              />

              {/* Bottom day labels */}
              <text 
                x={c.x} 
                y={height - 8} 
                className={`text-[10px] font-semibold transition-all ${hoverIndex === i ? 'fill-violet-600' : 'fill-slate-400'}`}
                textAnchor="middle"
              >
                {c.label}
              </text>

              {/* Dynamic tooltip popup */}
              {hoverIndex === i && (
                <g>
                  <rect 
                    x={c.x - 35} 
                    y={c.y - 36} 
                    width="70" 
                    height="24" 
                    rx="4" 
                    className="fill-slate-800 shadow" 
                  />
                  <text 
                    x={c.x} 
                    y={c.y - 20} 
                    className="fill-white font-mono text-[9px] font-semibold" 
                    textAnchor="middle"
                  >
                    {c.val} Study Hrs
                  </text>
                </g>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export function RadialCompletionHalo({ pct }: { pct: number }) {
  const radius = 50;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-3">
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2}>
          <circle
            stroke="#f1f5f9"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="dark:stroke-slate-800"
          />
          <circle
            stroke="url(#gradientCompleted)"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="origin-[50%_50%] -rotate-90 transition-all duration-700"
          />
          <defs>
            <linearGradient id="gradientCompleted" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100">{Math.round(pct)}%</span>
          <span className="text-[9px] font-medium tracking-wider text-slate-400 uppercase">Passed</span>
        </div>
      </div>
    </div>
  );
}

export function OverviewMetricsGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="rounded-lg bg-violet-100 p-3 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
          <Clock className="h-6 w-6" id="clock-metric-icon" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Study Time</p>
          <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">42.5 hrs</h4>
          <span className="text-[10px] text-emerald-500 font-medium">+4.2h this week</span>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="rounded-lg bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
          <Award className="h-6 w-6" id="award-metric-icon" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Avg Quiz Accuracy</p>
          <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">86.4%</h4>
          <span className="text-[10px] text-emerald-500 font-medium">Top 5% of Class</span>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="rounded-lg bg-amber-100 p-3 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
          <Zap className="h-6 w-6" id="zap-metric-icon" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Study Streak</p>
          <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">12 Days</h4>
          <span className="text-[10px] text-amber-500 font-medium">Daily Goal Unlocked</span>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="rounded-lg bg-blue-100 p-3 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
          <BookOpen className="h-6 w-6" id="book-metric-icon" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Durable Units</p>
          <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">4 / 6 Done</h4>
          <span className="text-[10px] text-slate-400">Next module available</span>
        </div>
      </div>
    </div>
  );
}
