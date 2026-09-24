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
        <span className="text-xs md:text-sm font-bold text-textMuted dark:text-darkTextMuted uppercase tracking-wider">{t('tasksTitle')}</span>
        <div className="w-9 h-9 rounded-2xl bg-secondary/10 dark:bg-secondary/20 text-secondary flex items-center justify-center md:w-auto md:h-auto md:bg-transparent md:text-textMuted/60"><CheckCircle2 size={18} /></div>
      </div>
      <div className="my-2 md:my-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-textMain dark:text-darkTextMain">{completedCount}</span>
          <span className="text-lg md:text-xl font-bold text-textMuted dark:text-darkTextMuted">/{totalCount}</span>
        </div>
        <p className="text-xs text-textMuted dark:text-darkTextMuted mt-0.5 font-medium">{t('tasksCompleted')}</p>
      </div>
      <div className="w-full bg-gray-100 dark:bg-darkBorder h-2 rounded-full overflow-hidden mt-2">
        <div className="h-full bg-primary rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }} />
      </div>
    </div>
  );
};
export default TasksCard;