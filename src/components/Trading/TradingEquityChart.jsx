import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine, 
  CartesianGrid 
} from 'recharts';
import { TrendingUp, Target, Flag } from 'lucide-react';
import { getEquityCurveData } from '../../data/tradingJournalEngine';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card/95 backdrop-blur-md p-3 rounded-2xl border border-gray-200 dark:border-darkBorder shadow-xl text-xs">
        <p className="font-extrabold text-textMain mb-1">{data.event || `Date: ${label}`}</p>
        <div className="flex items-center gap-2">
          <span className="text-textMuted">Capital :</span>
          <span className="font-black text-primary text-sm">{data.capital.toFixed(2)} $</span>
        </div>
        {data.pnl !== undefined && data.pnl !== 0 && (
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-textMuted">PnL Trade :</span>
            <span className={`font-bold ${data.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {data.pnl >= 0 ? '+' : ''}{data.pnl.toFixed(2)} $
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const TradingEquityChart = ({ data, kpis }) => {
  const chartData = getEquityCurveData(data);

  return (
    <div className="p-5 rounded-3xl bg-card border border-gray-200/80 dark:border-darkBorder shadow-sm mb-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-darkBorder/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-textMain leading-tight">
              Courbe d'Équité Cumulative (Equity Curve)
            </h3>
            <span className="text-xs text-textMuted font-medium">
              Trajectoire de capital depuis la reprise en main (173 $ ➔ 330 $ ➔ 500 $)
            </span>
          </div>
        </div>

        {/* Milestones badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold flex items-center gap-1.5">
            <Flag size={12} />
            Cap Breakeven : 330.00 $
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold flex items-center gap-1.5">
            <Target size={12} />
            Cap Retrait : 500.00 $
          </span>
        </div>
      </div>

      {/* Chart container */}
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 15, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.15} vertical={false} />

            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} 
              axisLine={false}
              tickLine={false}
            />

            <YAxis 
              domain={[150, 360]} 
              tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}$`}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Target Line 1: Breakeven 330 $ */}
            <ReferenceLine 
              y={330} 
              stroke="#F59E0B" 
              strokeDasharray="4 4" 
              strokeWidth={1.5}
              label={{ 
                value: 'Cap Breakeven (330 $)', 
                position: 'insideTopRight', 
                fill: '#F59E0B', 
                fontSize: 10, 
                fontWeight: 700 
              }} 
            />

            <Area 
              type="monotone" 
              dataKey="capital" 
              stroke="#10B981" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#equityGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-textMuted px-2">
        <span>Capital Initial : <strong>{kpis.startingCapital.toFixed(2)} $</strong></span>
        <span>Capital Actuel : <strong className="text-emerald-500 font-extrabold">{kpis.currentCapital.toFixed(2)} $</strong> (+{kpis.grossProfit.toFixed(2)} $ de plus-value nette)</span>
      </div>

    </div>
  );
};

export default TradingEquityChart;
