import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const TasksCard = ({ completedCount = 0, totalCount = 0 }) => {
  const { t } = useLanguage();
  const remainingCount = Math.max(0, totalCount - completedCount);
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  return (
    <div className="bg-card dark:bg-darkCard rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-darkBorder flex flex-col justify-between h-full transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs md:text-sm font-bold text-textMuted dark:text-darkTextMuted md:block hidden uppercase tracking-wider">{t('tasksTitle')}</span>
        <div className="hidden md:flex text-textMuted/60"><CheckCircle2 size={18} /></div>
        <div className="w-9 h-9 rounded-2xl bg-secondary/10 dark:bg-secondary/20 text-secondary flex items-center justify-center md:hidden"><CheckCircle2 size={18} /></div>
      </div>
      <div className="my-2 md:my-3">
        <div className="hidden md:flex items-baseline gap-1.5">
          <span className="text-3xl lg:text-4xl font-extrabold text-textMain dark:text-darkTextMain">{completedCount}</span>
          <span className="text-xl font-bold text-textMuted dark:text-darkTextMuted">/{totalCount}</span>
        </div>
        <p className="hidden md:block text-xs text-textMuted dark:text-darkTextMuted mt-0.5 font-medium">{t('tasksCompleted')}</p>
        <div className="md:hidden flex flex-col">
          <span className="text-2xl font-bold text-textMain dark:text-darkTextMain">{remainingCount}</span>
          <span className="text-xs font-medium text-textMuted dark:text-darkTextMuted mt-1">{t('tasksRemaining')}</span>
        </div>
      </div>
      <div className="hidden md:block w-full bg-gray-100 dark:bg-darkBorder h-2 rounded-full overflow-hidden mt-2">
        <div className="h-full bg-primary rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }} />
      </div>
    </div>
  );
};
export default TasksCard;