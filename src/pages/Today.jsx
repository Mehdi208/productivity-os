import React from 'react';
import { Sparkles, Check, Brain, Play, Calendar as CalendarIcon, Droplet, Plus } from 'lucide-react';
import ScoreCard from '../components/Dashboard/ScoreCard';
import TasksCard from '../components/Dashboard/TasksCard';
import StreakCard from '../components/Dashboard/StreakCard';
import HydrationCard from '../components/Dashboard/HydrationCard';
import { recommendFocusTechnique } from '../data/focusTechniques';
import { NotificationBannerPrompt } from '../components/ui/NotificationBannerPrompt';
import { useLanguage } from '../context/LanguageContext';

const Today = ({ 
  score = 0, 
  completedCount = 0, 
  totalCount = 0, 
  streak = 0, 
  hydrationMl = 0, 
  onAddWater, 
  todayBlocks = [], 
  onToggleCheckBlock, 
  weekBlocksByDay = {},
  onOpenFocusWithTask,
  onOpenDailyBriefing,
  onOpenCoach
}) => {
  const { lang, t } = useLanguage();

  const getCategoryBadge = (title = '') => {
    const lower = title.toLowerCase();
    if (lower.includes('sport') || lower.includes('gym') || lower.includes('wellness') || lower.includes('bien-être')) {
      return { label: lang === 'en' ? 'Wellness' : 'Bien-être', bg: 'bg-emerald-600 text-white font-bold shadow-sm' };
    }
    if (lower.includes('routine') || lower.includes('lunch') || lower.includes('déjeuner') || lower.includes('break')) {
      return { label: 'Routine', bg: 'bg-slate-500 text-white font-semibold shadow-sm' };
    }
    return { label: 'Focus', bg: 'bg-indigo-600 text-white font-bold shadow-sm' };
  };

  // Real Dynamic Date Calculation
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday...
  const currentDayIndex = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

  // Monday of the current week
  const monday = new Date(now);
  monday.setDate(now.getDate() - currentDayIndex);

  const daysLabels = lang === 'en' 
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const daysOfWeek = daysLabels.map((label, idx) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + idx);
    return {
      label,
      idx,
      dayNumber: dayDate.getDate(),
      isToday: idx === currentDayIndex,
      fullDate: dayDate
    };
  });

  const monthYearStr = now.toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', { month: 'long', year: 'numeric' });
  const formattedMonthYear = monthYearStr.charAt(0).toUpperCase() + monthYearStr.slice(1);

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8 pb-24 md:pb-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <header className="bg-card p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-darkBorder flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-textMain tracking-tight">
              {t('greeting')}
            </h1>
            <span className="bg-gradient-to-r from-pink-500/15 to-violet-500/15 text-pink-700 dark:text-pink-300 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles size={13} /> {t('badgeTag')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-textMuted mt-1">
            {t('greetingSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenDailyBriefing}
            className="bg-background hover:bg-gray-100 dark:hover:bg-gray-800 text-textMain border border-gray-200/80 dark:border-darkBorder font-bold px-3.5 py-2.5 rounded-2xl flex items-center gap-2 text-xs transition-all active:scale-95 shadow-sm"
          >
            <Sparkles size={14} className="text-primary" />
            <span>{t('navBriefing')}</span>
          </button>
          
          <button
            onClick={() => onOpenFocusWithTask && onOpenFocusWithTask(null)}
            className="bg-primary hover:bg-primary/90 text-white font-bold px-3.5 py-2.5 rounded-2xl flex items-center gap-2 shadow-sm shadow-primary/25 text-xs transition-all active:scale-95"
          >
            <Play size={14} className="fill-white" />
            <span>{t('navFocus')}</span>
          </button>
        </div>
      </header>

      {/* Pop-up System Notification Prompt Banner */}
      <NotificationBannerPrompt />

      {/* Metric Cards Row (Responsive Grid: 2 cols on mobile, 4 on desktop) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        <ScoreCard score={score} completedCount={completedCount} totalCount={totalCount} />
        <TasksCard completedCount={completedCount} totalCount={totalCount} />
        <StreakCard streak={streak} />
        <HydrationCard currentMl={hydrationMl} targetMl={1925} onAddWater={onAddWater} />
      </section>

      {/* Main Content Grid: Today's Tasks + Mini Week Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        
        {/* Left 2 Cols: Today's Scheduled Blocks */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-textMain">{t('todaySchedule')}</h2>
              <p className="text-xs text-textMuted">{t('blocksCount', todayBlocks.length)}</p>
            </div>
            {totalCount > 0 && (
              <span className="text-xs font-bold text-secondary bg-secondary/15 px-3 py-1 rounded-xl">
                {t('validatedCount', completedCount, totalCount)}
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            {todayBlocks.length === 0 ? (
              <div className="bg-card rounded-3xl p-8 border border-dashed border-gray-200 dark:border-darkBorder text-center flex flex-col items-center justify-center space-y-3 my-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <CalendarIcon size={24} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-textMain">{t('noTasksToday')}</h3>
                  <p className="text-xs text-textMuted max-w-xs mt-1">{t('noTasksTodaySubtitle')}</p>
                </div>
              </div>
            ) : (
              todayBlocks.map((block) => {
                const badge = getCategoryBadge(block.title);
                const technique = recommendFocusTechnique(block.title);

                return (
                  <div 
                    key={block.id} 
                    className={`bg-card rounded-2xl p-3.5 sm:p-4 shadow-sm border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      block.checked 
                        ? 'border-gray-200/60 dark:border-darkBorder bg-gray-50/50 dark:bg-darkCardElevated/50 opacity-75' 
                        : 'border-gray-100 dark:border-darkBorder hover:border-primary/40 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {block.checkable ? (
                        <button
                          type="button"
                          onClick={() => onToggleCheckBlock && onToggleCheckBlock(block.checkId || block.id)}
                          className={`w-7 h-7 sm:w-6 sm:h-6 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all active:scale-90 ${
                            block.checked 
                              ? 'bg-primary border-primary text-white shadow-sm' 
                              : 'border-gray-300 dark:border-darkBorder bg-background hover:border-primary'
                          }`}
                          aria-label={t('markDone')}
                        >
                          {block.checked && <Check size={14} strokeWidth={3} />}
                        </button>
                      ) : (
                        <div className="w-6 h-6 rounded-xl bg-gray-100 dark:bg-darkBorder flex items-center justify-center flex-shrink-0">
                          <span className="w-2 h-2 rounded-full bg-gray-400" />
                        </div>
                      )}
                      
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`font-bold text-sm text-textMain truncate ${block.checked ? 'line-through text-textMuted' : ''}`}>
                            {block.title}
                          </h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-lg ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-xs text-textMuted font-medium mt-0.5">
                          🕒 {block.start} - {block.end} {block.subtitle ? `• ${block.subtitle}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Focus Action */}
                    <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                      {block.checkable && !block.checked && (
                        <button
                          onClick={() => onOpenFocusWithTask && onOpenFocusWithTask(block)}
                          className="px-3 py-1.5 bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                          title={`Launch in ${technique.name}`}
                        >
                          <Brain size={13} />
                          <span>{t('startFocus')}</span>
                          <Play size={10} className="fill-current" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right 1 Col: Weekly Mini Calendar & Dynamic Highlights */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base sm:text-lg font-bold text-textMain">{t('navWeek')}</h2>
            <span className="text-xs text-textMuted font-medium">{formattedMonthYear}</span>
          </div>

          <div className="bg-card rounded-3xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-darkBorder space-y-4 transition-colors">
            {/* Real Days grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {daysOfWeek.map((d) => (
                <div 
                  key={d.label}
                  className={`p-1.5 sm:p-2 rounded-2xl border transition-all ${
                    d.isToday 
                      ? 'bg-primary text-white border-primary shadow-md font-bold scale-[1.03]' 
                      : 'bg-background border-gray-100 dark:border-darkBorder text-textMuted hover:border-gray-200'
                  }`}
                >
                  <span className="text-[10px] font-bold block">{d.label}</span>
                  <span className="text-xs font-extrabold mt-0.5 block">{d.dayNumber}</span>
                </div>
              ))}
            </div>

            {/* Today Summary */}
            <div className="pt-3 border-t border-gray-100 dark:border-darkBorder">
              <div className="bg-background/80 p-3.5 rounded-2xl border border-gray-100 dark:border-darkBorder flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider block">
                    {lang === 'en' ? "Today's Status" : "Statut du Jour"}
                  </span>
                  <span className="text-xs font-extrabold text-textMain mt-0.5 block truncate">
                    {todayBlocks.length === 0 
                      ? (lang === 'en' ? 'Clean Slate • Rest or Plan' : 'Planning libre • Repos ou Plan') 
                      : t('validatedCount', completedCount, totalCount)}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {streak}🔥
                </div>
              </div>
            </div>

          </div>
        </section>

      </div>

    </div>
  );
};

export default Today;
