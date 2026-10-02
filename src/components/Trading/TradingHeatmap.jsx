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
    <div className="p-3.5 sm:p-5 rounded-3xl bg-card border border-gray-200/80 dark:border-darkBorder shadow-sm mb-6 select-none">
      
      {/* Heatmap Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3.5 pb-3 border-b border-gray-100 dark:border-darkBorder/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            <CalendarIcon size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-sm sm:text-base text-textMain leading-tight">
                {lang === 'en' ? 'Monthly PnL Heatmap' : 'Calendrier PnL Mensuel'}
              </h3>
              <span className="hidden sm:inline text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                TradeZella Style
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-textMuted font-medium mt-0.5 hidden xs:block">
              {lang === 'en' ? 'Color-coded daily consistency overview' : 'Consistance des journées de trading en direct'}
            </p>
          </div>
        </div>

        {/* Month Selector & Total */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end w-full sm:w-auto">
          <div className="px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-darkCard border border-gray-200/60 dark:border-darkBorder flex items-center gap-1.5">
            <span className="text-[9px] sm:text-[11px] font-bold text-textMuted uppercase whitespace-nowrap">
              {lang === 'en' ? 'Net Month :' : 'Net Mois :'}
            </span>
            <span className={`text-xs sm:text-sm font-black whitespace-nowrap ${isMonthPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
              {isMonthPositive ? '+' : ''}{monthPnL.toFixed(2)} $
            </span>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 dark:bg-darkCard p-1 rounded-xl border border-gray-200/60 dark:border-darkBorder">
            <button 
              onClick={onPrevMonth}
              className="min-h-[32px] min-w-[30px] flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-gray-800 text-textMuted hover:text-textMain transition-colors cursor-pointer"
              title="Mois précédent"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-1.5 text-xs font-bold text-textMain min-w-[85px] sm:min-w-[110px] text-center whitespace-nowrap">
              {monthLabel}
            </span>
            <button 
              onClick={onNextMonth}
              className="min-h-[32px] min-w-[30px] flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-gray-800 text-textMuted hover:text-textMain transition-colors cursor-pointer"
              title="Mois suivant"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 7 Columns Day Headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1.5 text-center">
        {daysHeader.map((d, idx) => (
          <div key={idx} className="text-[9px] sm:text-[10px] font-black text-textMuted tracking-wider py-0.5">
            {d}
          </div>
        ))}
      </div>

      {/* Grid of Cells */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((cell) => {
          if (cell.isEmpty) {
            return (
              <div 
                key={cell.id} 
                className="min-h-[56px] sm:min-h-[72px] sm:aspect-[4/3] rounded-xl sm:rounded-2xl bg-gray-50/50 dark:bg-darkCard/20 border border-transparent opacity-30" 
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
            cardStyle = 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:border-emerald-500/60 shadow-xs';
          } else if (isLossDay) {
            cardStyle = 'bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:border-rose-500/60 shadow-xs';
          } else if (isNeutralTradeDay) {
            cardStyle = 'bg-blue-500/10 dark:bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:border-blue-500/60';
          }

          // Format PnL text compactly so it never overflows or truncates
          const formattedPnL = Math.abs(cell.pnl) >= 100 
            ? `${isWinDay ? '+' : ''}${Math.round(cell.pnl)}$` 
            : `${isWinDay ? '+' : ''}${cell.pnl.toFixed(1)}$`;

          return (
            <button
              key={cell.id}
              onClick={() => onSelectDay && onSelectDay(cell)}
              className={`min-h-[56px] sm:min-h-[72px] sm:aspect-[4/3] p-1 sm:p-2 rounded-xl sm:rounded-2xl border flex flex-col justify-between text-left transition-all duration-150 relative overflow-hidden group cursor-pointer hover:scale-[1.02] ${cardStyle}`}
            >
              {/* Day number & compact trade count */}
              <div className="flex items-center justify-between w-full">
                <span className={`text-[10px] sm:text-xs font-black ${hasTrades ? 'text-textMain' : 'text-textMuted'}`}>
                  {cell.dayNum}
                </span>
                {hasTrades && (
                  <span className="text-[8px] sm:text-[9px] font-black px-1 sm:px-1.5 py-0.5 rounded-md bg-black/40 text-white/90 backdrop-blur-xs leading-none">
                    <span className="sm:hidden">{cell.tradeCount}</span>
                    <span className="hidden sm:inline">{cell.tradeCount} {cell.tradeCount > 1 ? 'trades' : 'trade'}</span>
                  </span>
                )}
              </div>

              {/* PnL amount in center/bottom */}
              {hasTrades ? (
                <div className="w-full mt-auto">
                  <div className={`text-[9.5px] sm:text-xs md:text-sm font-black tracking-tight leading-tight truncate ${isWinDay ? 'text-emerald-500' : 'text-rose-500'}`}>
                    <span className="sm:hidden">{formattedPnL}</span>
                    <span className="hidden sm:inline">{isWinDay ? '+' : ''}{cell.pnl.toFixed(2)} $</span>
                  </div>
                  <div className="text-[9px] font-bold opacity-75 truncate hidden sm:block">
                    {cell.trades[0]?.symbol || 'Gold'}
                  </div>
                </div>
              ) : (
                <div className="text-[8px] sm:text-[9px] text-textMuted/50 font-medium self-center mt-auto">
                  {cell.isWeekend ? 'Crypto' : '—'}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Heatmap Legend */}
      <div className="mt-3.5 pt-3 border-t border-gray-100 dark:border-darkBorder/60 flex flex-wrap items-center justify-between gap-2.5 text-[9px] sm:text-[10px] text-textMuted">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 inline-block" />
            <span>Journée Gagnante (Green)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-md bg-rose-500/20 border border-rose-500/40 inline-block" />
            <span>Journée Perdante (Red)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-md bg-gray-100 dark:bg-darkCard border border-gray-200 dark:border-darkBorder inline-block" />
            <span>Sans Trade</span>
          </div>
        </div>
        <span className="font-semibold italic">
          💡 Cliquez sur un jour pour ouvrir ses détails
        </span>
      </div>

    </div>
  );
};

export default TradingHeatmap;
