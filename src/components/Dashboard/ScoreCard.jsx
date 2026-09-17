import React from 'react';
import { ArrowUpRight, Activity } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const ScoreCard = ({ score = 0, completedCount = 0, totalCount = 0 }) => {
  const { t } = useLanguage();
  const getDynamicColors = (val) => {
    if (val < 50) return { text: 'text-danger', bg: 'bg-danger' };
    if (val <= 70) return { text: 'text-warning', bg: 'bg-warning' };
    return { text: 'text-secondary', bg: 'bg-secondary' };
  };
  const colors = getDynamicColors(score);
  return (
    <div className="bg-card dark:bg-darkCard rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-darkBorder flex flex-col justify-between h-full transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs md:text-sm font-bold text-textMuted dark:text-darkTextMuted md:block hidden uppercase tracking-wider">{t('scoreTitle')}</span>
        <div className="w-9 h-9 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center md:hidden"><Activity size={18} /></div>
      </div>
      <div className="my-2 md:my-3 flex items-baseline gap-2">
        <div className="hidden md:flex items-baseline gap-2">
          <span className={`text-3xl lg:text-4xl font-extrabold ${colors.text}`}>{Math.round(score)}%</span>
        </div>
        <div className="md:hidden flex flex-col">
          <div className="flex items-baseline"><span className="text-2xl font-bold text-textMain dark:text-darkTextMain">{Math.round(score)}</span><span className="text-sm font-normal text-textMuted dark:text-darkTextMuted">/100</span></div>
          <span className="text-xs font-medium text-textMuted dark:text-darkTextMuted mt-1">{t('scoreTitle')}</span>
        </div>
      </div>
      <div className="hidden md:block w-full bg-gray-100 dark:bg-darkBorder h-2 rounded-full overflow-hidden mt-2">
        <div className={`h-full transition-all duration-500 ease-out rounded-full ${colors.bg}`} style={{ width: `${Math.min(100, Math.max(0, score))}%` }} />
      </div>
    </div>
  );
};
export default ScoreCard;