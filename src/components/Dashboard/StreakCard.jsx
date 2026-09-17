import React from 'react';
import { Flame } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const StreakCard = ({ streak = 0 }) => {
  const { t } = useLanguage();
  return (
    <>
      <div className="hidden md:flex bg-card dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-3xl p-5 shadow-sm flex-col items-center justify-center text-center h-full transition-all hover:shadow-md">
        <div className="text-3xl mb-1 filter drop-shadow-sm animate-bounce-slow">🔥</div>
        <span className="text-xs font-bold text-textMuted dark:text-darkTextMuted uppercase tracking-wider mb-1">{t('streakTitle')}</span>
        <span className="text-2xl lg:text-3xl font-extrabold text-warning">{streak} {streak > 1 ? t('days') : t('day')}</span>
      </div>
      <div className="md:hidden bg-card dark:bg-darkCard rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-darkBorder flex flex-col justify-between h-full">
        <div className="w-9 h-9 rounded-2xl bg-warning/10 text-warning flex items-center justify-center"><Flame size={18} className="fill-warning/20" /></div>
        <div className="my-2 flex flex-col">
          <div className="flex items-baseline gap-1"><span className="text-2xl font-bold text-textMain dark:text-darkTextMain">{streak}</span><span className="text-sm font-normal text-textMuted dark:text-darkTextMuted">{streak > 1 ? t('days') : t('day')}</span></div>
          <span className="text-xs font-medium text-textMuted dark:text-darkTextMuted mt-1">{t('streakCurrent')}</span>
        </div>
      </div>
    </>
  );
};
export default StreakCard;