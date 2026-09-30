import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { getMonthlyHeatmapDays } from '../../data/tradingJournalEngine';

const DAYS_HEADER_FR = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
const DAYS_HEADER_EN = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const TradingHeatmap = ({ 
  year, 
  monthZeroIndexed, 
  trades = [], 
  onPrevMonth, 
  onNextMonth, 
  onSelectDay,
  lang = 'fr' 
}) => {
  const days = getMonthlyHeatmapDays(year, monthZeroIndexed, trades);
  const daysHeader = lang === 'en' ? DAYS_HEADER_EN : DAYS_HEADER_FR;

  const monthNamesFr = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthLabel = lang === 'en' ? `${monthNamesEn[monthZeroIndexed]} ${year}` : `${monthNamesFr[monthZeroIndexed]} ${year}`;

  // Month total PnL
  const monthPnL = trades
    .filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === monthZeroIndexed;
    })
    .reduce((acc, t) => acc + (t.pnl || 0), 0);

  const isMonthPositive = monthPnL >= 0;

  return (
    <div className="p-5 rounded-3xl bg-card border border-gray-200/80 dark:border-darkBorder shadow-sm mb-6">
      
      {/* Heatmap Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-darkBorder/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-textMain leading-tight">
              {lang === 'en' ? 'Monthly PnL Heatmap' : 'Calendrier PnL Mensuel (Style TradeZella)'}
            </h3>
            <span className="text-xs text-textMuted font-medium">
              {lang === 'en' ? 'Color-coded daily consistency overview' : 'Consistance des journées de trading en direct'}
            </span>
          </div>
        </div>

        {/* Month Selector & Total */}
        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between">
          <div className="px-3 py-1.5 rounded-2xl bg-gray-100 dark:bg-darkCard border border-gray-200/60 dark:border-darkBorder flex items-center gap-2">
            <span className="text-[11px] font-bold text-textMuted uppercase">
              {lang === 'en' ? 'Net Month :' : 'Net du Mois :'}
            </span>
            <span className={`text-xs font-black ${isMonthPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
              {isMonthPositive ? '+' : ''}{monthPnL.toFixed(2)} $
            </span>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 dark:bg-darkCard p-1 rounded-2xl border border-gray-200/60 dark:border-darkBorder">
            <button 
              onClick={onPrevMonth}
              className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-gray-800 text-textMuted hover:text-textMain transition-colors"
              title="Mois précédent"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 text-xs font-bold text-textMain min-w-[110px] text-center">
              {monthLabel}
            </span>
            <button 
              onClick={onNextMonth}
              className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-gray-800 text-textMuted hover:text-textMain transition-colors"
              title="Mois suivant"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 7 Columns Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {daysHeader.map((d, idx) => (
          <div key={idx} className="text-center text-[10px] font-black text-textMuted tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grid of Cells */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((cell) => {
          if (cell.isEmpty) {
            return (
              <div 
                key={cell.id} 
                className="aspect-[1/1] sm:aspect-[4/3] rounded-2xl bg-gray-50/50 dark:bg-darkCard/20 border border-transparent opacity-30" 
              />
            );
          }

          const hasTrades = cell.hasTrade;
          const isWinDay = cell.pnl > 0;
          const isLossDay = cell.pnl < 0;
          const isNeutralTradeDay = hasTrades && cell.pnl === 0;

          // Card styles based on PnL
          let cardStyle = 'bg-gray-50 dark:bg-darkCard/40 border-gray-200/50 dark:border-darkBorder/40 text-textMuted';
          if (isWinDay) {
            cardStyle = 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:border-emerald-500/60 shadow-sm';
          } else if (isLossDay) {
            cardStyle = 'bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:border-rose-500/60 shadow-sm';
          } else if (isNeutralTradeDay) {
            cardStyle = 'bg-blue-500/10 dark:bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:border-blue-500/60';
          }

          return (
            <button
              key={cell.id}
              onClick={() => onSelectDay && onSelectDay(cell)}
              className={`aspect-[1/1] sm:aspect-[4/3] p-1.5 sm:p-2 rounded-2xl border flex flex-col justify-between text-left transition-all duration-200 relative group cursor-pointer hover:scale-[1.02] ${cardStyle}`}
            >
              {/* Day number & weekend indicator */}
              <div className="flex items-center justify-between w-full">
                <span className={`text-[10px] sm:text-xs font-black ${hasTrades ? 'text-textMain' : 'text-textMuted'}`}>
                  {cell.dayNum}
                </span>
                {hasTrades && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-white/70 dark:bg-black/30 backdrop-blur-xs">
                    {cell.tradeCount} {cell.tradeCount > 1 ? 'trades' : 'trade'}
                  </span>
                )}
              </div>

              {/* PnL amount in center/bottom */}
              {hasTrades ? (
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-black truncate leading-tight">
                    {isWinDay ? '+' : ''}{cell.pnl.toFixed(2)} $
                  </div>
                  <div className="text-[9px] font-bold opacity-80 truncate hidden sm:block">
                    {cell.trades[0]?.symbol || 'Gold'}
                  </div>
                </div>
              ) : (
                <div className="text-[9px] text-textMuted/60 font-medium self-center">
                  {cell.isWeekend ? (lang === 'en' ? 'Crypto 24/7' : 'Crypto') : '—'}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Heatmap Legend */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-darkBorder/60 flex flex-wrap items-center justify-between gap-3 text-[10px] text-textMuted">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500/20 border border-emerald-500/40 inline-block" />
            <span>Journée Gagnante (Green Day)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-rose-500/20 border border-rose-500/40 inline-block" />
            <span>Journée Perdante (Red Day)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-gray-100 dark:bg-darkCard border border-gray-200 dark:border-darkBorder inline-block" />
            <span>Sans Trade / Repos</span>
          </div>
        </div>
        <span className="font-semibold italic">
          💡 Cliquez sur un jour pour voir les détails et notes du trade
        </span>
      </div>

    </div>
  );
};

export default TradingHeatmap;
