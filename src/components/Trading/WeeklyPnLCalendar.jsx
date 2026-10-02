import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { getWeeklyPnLDays } from '../../data/tradingJournalEngine';

const WeeklyPnLCalendar = ({ trades = [], onSelectDay }) => {
  // Current selected reference date string (YYYY-MM-DD), default to today or last trade date
  const [selectedDate, setSelectedDate] = useState(() => {
    // If today has no trades, pick the date of the latest trade, otherwise today
    const todayStr = new Date().toISOString().slice(0, 10);
    if (trades.length > 0) {
      const sorted = [...trades].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      return sorted[0]?.date || todayStr;
    }
    return todayStr;
  });

  // Calculate week days matrix based on selectedDate
  const weekData = useMemo(() => {
    return getWeeklyPnLDays(selectedDate, trades);
  }, [selectedDate, trades]);

  // Handle navigate previous / next week
  const handlePrevWeek = () => {
    const d = new Date(weekData.mondayDateStr);
    d.setDate(d.getDate() - 7);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleNextWeek = () => {
    const d = new Date(weekData.mondayDateStr);
    d.setDate(d.getDate() + 7);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleResetToToday = () => {
    setSelectedDate(new Date().toISOString().slice(0, 10));
  };

  const isPositiveWeek = weekData.totalWeekPnL >= 0;

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-card border border-gray-200/80 dark:border-darkBorder shadow-sm mb-6 select-none">
      
      {/* Top Header & Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5 pb-3.5 sm:pb-4 border-b border-gray-100 dark:border-darkBorder/60">
        
        {/* Title */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold shrink-0">
            <CalendarIcon size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h3 className="font-extrabold text-sm sm:text-lg text-textMain leading-tight">
                Calendrier PnL Journalier
              </h3>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                Lundi — Dimanche
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-textMuted font-medium mt-0.5 hidden xs:block">
              Visualisation claire du gain ou de la perte généré chaque jour de la semaine choisie.
            </p>
          </div>
        </div>

        {/* Date Selector & Week Nav */}
        <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto justify-between lg:justify-end w-full lg:w-auto">
          
          {/* Week Label & Nav */}
          <div className="flex items-center gap-1 bg-gray-100/80 dark:bg-darkCard px-1.5 py-1 rounded-2xl border border-gray-200/60 dark:border-darkBorder">
            <button
              onClick={handlePrevWeek}
              className="min-h-[36px] min-w-[32px] flex items-center justify-center p-1 rounded-xl hover:bg-card text-textMuted hover:text-textMain transition-all cursor-pointer active:scale-[0.96]"
              title="Semaine précédente"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs font-bold text-textMain px-1.5 whitespace-nowrap">
              {weekData.weekLabel}
            </span>

            <button
              onClick={handleNextWeek}
              className="min-h-[36px] min-w-[32px] flex items-center justify-center p-1 rounded-xl hover:bg-card text-textMuted hover:text-textMain transition-all cursor-pointer active:scale-[0.96]"
              title="Semaine suivante"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Direct Date Picker & Reset */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="min-h-[38px] text-xs font-bold bg-gray-100/80 dark:bg-darkCard border border-gray-200/80 dark:border-darkBorder text-textMain rounded-2xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
              title="Sélectionner une date pour charger sa semaine"
            />

            <button
              onClick={handleResetToToday}
              className="min-h-[38px] min-w-[38px] flex items-center justify-center p-2 rounded-2xl bg-gray-100/80 dark:bg-darkCard hover:bg-card border border-gray-200/60 dark:border-darkBorder text-textMuted hover:text-primary transition-all text-xs font-bold cursor-pointer active:scale-[0.96]"
              title="Revenir à aujourd'hui"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Week Total PnL Badge */}
          <div className={`min-h-[38px] px-3 py-1.5 rounded-2xl border flex items-center gap-1.5 ${
            isPositiveWeek && weekData.totalWeekTrades > 0
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
              : weekData.totalWeekTrades > 0 && !isPositiveWeek
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
              : 'bg-gray-100 dark:bg-darkCard border-gray-200/60 dark:border-darkBorder text-textMuted'
          }`}>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-textMuted">
              Net Semaine :
            </span>
            <span className="text-xs sm:text-sm font-black whitespace-nowrap">
              {isPositiveWeek ? '+' : ''}{weekData.totalWeekPnL.toFixed(2)} $
            </span>
          </div>

        </div>

      </div>

      {/* 7 Daily Cases (Lundi au Dimanche) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
        {weekData.days.map((day, idx) => {
          const isPos = day.pnl > 0.001;
          const isNeg = day.pnl < -0.001;
          const hasActivity = day.hasTrades;
          const isSunday = idx === 6;

          return (
            <motion.div
              key={day.dateStr}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              onClick={() => {
                if (onSelectDay && hasActivity) {
                  onSelectDay({
                    dateStr: day.dateStr,
                    dayNum: day.dayNum,
                    pnl: day.pnl,
                    tradeCount: day.count,
                    trades: day.trades
                  });
                }
              }}
              className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all relative overflow-hidden min-h-[96px] ${
                isSunday ? 'col-span-2 sm:col-span-1' : ''
              } ${
                hasActivity ? 'cursor-pointer hover:shadow-md active:scale-[0.98]' : 'cursor-default opacity-85'
              } ${
                day.isToday ? 'ring-2 ring-primary/60 dark:ring-primary/80' : ''
              } ${
                isPos
                  ? 'bg-emerald-500/[0.04] border-emerald-500/30 dark:border-emerald-500/30'
                  : isNeg
                  ? 'bg-rose-500/[0.04] border-rose-500/30 dark:border-rose-500/30'
                  : 'bg-card border-gray-200/70 dark:border-darkBorder/80'
              }`}
            >
              {/* Day Header */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${
                    day.isToday ? 'text-primary' : 'text-textMuted'
                  }`}>
                    {day.dayShort}
                  </span>
                  
                  {day.isToday && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-primary text-white">
                      Auj.
                    </span>
                  )}
                  {day.isWeekend && !day.isToday && (
                    <span className="text-[9px] font-bold text-textMuted opacity-70">
                      WE
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold text-textMain mb-2.5">
                  {day.dayNum} {day.monthLabel}
                </div>

                {/* Day Net PnL Box */}
                <div className="mb-2">
                  <div className="text-[10px] font-semibold text-textMuted uppercase tracking-wider mb-0.5">
                    PnL Jour
                  </div>
                  <div className={`text-base sm:text-lg font-black tracking-tight ${
                    isPos ? 'text-emerald-500' : isNeg ? 'text-rose-500' : 'text-textMuted'
                  }`}>
                    {isPos ? '+' : ''}{day.pnl.toFixed(2)} $
                  </div>
                </div>
              </div>

              {/* Day Sub-Stats */}
              <div className="pt-2 border-t border-gray-100 dark:border-darkBorder/40 flex items-center justify-between text-[10px] font-semibold">
                <span className="text-textMuted">
                  {day.count} {day.count === 1 ? 'trade' : 'trades'}
                </span>

                {hasActivity ? (
                  <span className={`flex items-center gap-0.5 font-bold ${
                    isPos ? 'text-emerald-500' : isNeg ? 'text-rose-500' : 'text-textMuted'
                  }`}>
                    {isPos ? <ArrowUpRight size={11} /> : isNeg ? <ArrowDownRight size={11} /> : null}
                    {day.winRate}% WR
                  </span>
                ) : (
                  <span className="text-textMuted/60 italic text-[9px]">
                    Repos
                  </span>
                )}
              </div>

            </motion.div>
          );
        })}
      </div>

      {/* Footer Info Tip */}
      <div className="mt-3.5 pt-3 border-t border-gray-100 dark:border-darkBorder/40 flex items-center justify-between text-[11px] text-textMuted font-medium">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-emerald-500" />
          <span>Cliquez sur une case active pour ouvrir le détail chirurgical des trades du jour.</span>
        </span>
        <span className="hidden sm:inline text-[10px]">
          Totaux synchronisés avec MoonX & Jarvis Sentinel
        </span>
      </div>

    </div>
  );
};

export default WeeklyPnLCalendar;
