import React, { useMemo } from 'react';
import { Sparkles, Clock, Check, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getSmartSlotSuggestions } from '../../data/smartSchedulerAI';

export const SmartSlotSuggestions = ({
  title = '',
  subtitle = '',
  targetDate = '',
  existingBlocks = [],
  ignoreBlockId = null,
  dailyRoutines = [],
  isRoutine = false,
  currentStart = '',
  currentEnd = '',
  onSelectSlot
}) => {
  const { lang, t } = useLanguage();

  const smartData = useMemo(() => {
    return getSmartSlotSuggestions({
      title,
      subtitle,
      targetDate,
      existingBlocks,
      ignoreBlockId,
      dailyRoutines,
      isRoutine
    });
  }, [title, subtitle, targetDate, existingBlocks, ignoreBlockId, dailyRoutines, isRoutine]);

  const { analysis, isToday, currentAbidjanTimeStr, suggestions } = smartData;

  const categoryLabel = lang === 'en' ? analysis.labelEn : analysis.labelFr;
  const durationLabel = lang === 'en' ? analysis.durationLabelEn : analysis.durationLabelFr;

  return (
    <div className="bg-gradient-to-r from-primary/5 via-indigo-500/5 to-purple-500/5 border border-primary/25 dark:border-primary/30 rounded-2xl p-3.5 space-y-3 transition-all shadow-xs">
      
      {/* Header bar: AI badge & Detected Task Nature */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles size={12} className="animate-pulse" />
          </div>
          <span className="text-xs font-black text-textMain dark:text-darkTextMain">
            {t('aiSmartSchedulerTitle')}
          </span>
        </div>

        {/* Task category pill */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-card dark:bg-darkCard border border-primary/20 text-[11px] font-bold text-primary shadow-xs">
          <span>{analysis.icon}</span>
          <span>{categoryLabel}</span>
          <span className="opacity-60">•</span>
          <span>{durationLabel}</span>
        </div>
      </div>

      {/* Contextual rationale & Time note */}
      <div className="text-[11px] text-textMuted flex items-center justify-between gap-2">
        <p className="line-clamp-1">
          {lang === 'en' ? analysis.reasonEn : analysis.reasonFr}
        </p>
        {isToday && currentAbidjanTimeStr && (
          <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md flex-shrink-0">
            {lang === 'en' ? `Upcoming after ${currentAbidjanTimeStr}` : `À venir après ${currentAbidjanTimeStr}`}
          </span>
        )}
      </div>

      {/* Suggestions List / Cards */}
      {suggestions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {suggestions.map((slot) => {
            const isSelected = currentStart === slot.start && currentEnd === slot.end;
            const tag = lang === 'en' ? slot.tagEn : slot.tagFr;
            const reason = lang === 'en' ? slot.reasonEn : slot.reasonFr;

            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => onSelectSlot && onSelectSlot({ start: slot.start, end: slot.end })}
                className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between gap-1.5 active:scale-95 ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/25 ring-2 ring-primary/40'
                    : slot.isRecommended
                      ? 'bg-card dark:bg-darkCard border-primary/40 hover:border-primary text-textMain hover:shadow-sm'
                      : 'bg-card dark:bg-darkCard border-gray-200/80 dark:border-darkBorder hover:border-primary/40 text-textMain hover:shadow-sm'
                }`}
              >
                {/* Top: Tag + Selected indicator */}
                <div className="flex items-center justify-between gap-1 w-full">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : slot.isRecommended
                        ? 'bg-primary/15 text-primary dark:text-white font-extrabold'
                        : 'bg-gray-100 dark:bg-darkBorder text-textMuted'
                  }`}>
                    {tag}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-white text-primary flex items-center justify-center flex-shrink-0">
                      <Check size={11} strokeWidth={3} />
                    </span>
                  )}
                </div>

                {/* Time Range */}
                <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm">
                  <Clock size={13} className={isSelected ? 'text-white' : 'text-primary'} />
                  <span>{slot.start} - {slot.end}</span>
                  <span className={`text-[10px] font-medium ${isSelected ? 'text-white/80' : 'text-textMuted'}`}>
                    ({lang === 'en' ? slot.durationLabelEn : slot.durationLabelFr})
                  </span>
                </div>

                {/* Human Reason */}
                <p className={`text-[10px] font-medium line-clamp-1 ${
                  isSelected ? 'text-white/90' : 'text-textMuted'
                }`}>
                  {reason}
                </p>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
          <AlertCircle size={15} className="flex-shrink-0" />
          <span className="text-[11px] font-medium">
            {t('aiNoSlotsToday')}
          </span>
        </div>
      )}

    </div>
  );
};

export default SmartSlotSuggestions;
