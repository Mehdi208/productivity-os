import React, { useState } from 'react';
import { 
  CheckSquare, Clock, AlertTriangle, RefreshCw, Calendar as CalendarIcon, 
  Plus, Check, Trash2, Edit3, ChevronDown, ChevronUp, CheckCircle2, Circle 
} from 'lucide-react';
import { PRIORITY_LEVELS, autoPriority } from '../../data/priorityEngine';
import { useLanguage } from '../../context/LanguageContext';

const ProjectCard = ({ 
  project, 
  onToggleSubtask, 
  onAddSubtask, 
  onDeleteSubtask, 
  onEditProject 
}) => {
  const { lang, t } = useLanguage();
  const { 
    id, 
    name, 
    subtitle, 
    description, 
    status = 'In Progress', 
    statusType = 'primary', 
    iconColor = 'text-primary bg-primary/15', 
    deadline,
    completedAt,
    priorityKey,
    subtasks = [] 
  } = project;

  const [showTasksList, setShowTasksList] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter(t => t.completed || t.status === 'done').length;
  const computedProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : (status === 'Done' ? 100 : 0);

  const priority = (priorityKey && PRIORITY_LEVELS[priorityKey.toUpperCase()]) || project.priority || autoPriority(project);

  const getTheme = (type, currentStatus) => {
    if (currentStatus === 'Done') {
      return { 
        badge: 'bg-emerald-600 text-white font-bold shadow-sm', 
        bar: 'bg-emerald-600', 
        icon: CheckCircle2 
      };
    }
    if (currentStatus === 'Not Started' || type === 'slate') {
      return {
        badge: 'bg-slate-600 text-white font-bold shadow-sm',
        bar: 'bg-slate-500',
        icon: Clock
      };
    }
    switch (type) {
      case 'danger': 
        return { 
          badge: 'bg-red-600 text-white font-bold shadow-sm', 
          bar: 'bg-red-600', 
          icon: AlertTriangle 
        };
      case 'secondary': 
        return { 
          badge: 'bg-emerald-600 text-white font-bold shadow-sm', 
          bar: 'bg-emerald-600', 
          icon: Check 
        };
      case 'warning': 
        return { 
          badge: 'bg-amber-500 text-white font-bold shadow-sm', 
          bar: 'bg-amber-500', 
          icon: RefreshCw 
        };
      default: 
        return { 
          badge: 'bg-indigo-600 text-white font-bold shadow-sm', 
          bar: 'bg-indigo-600', 
          icon: RefreshCw 
        };
    }
  };

  const theme = getTheme(statusType, status);
  const StatusIcon = theme.icon;

  const getStatusLabel = (st) => {
    if (st === 'Not Started') return t('statusNotStarted');
    if (st === 'In Progress') return t('statusInProgress');
    if (st === 'Overdue') return t('statusOverdue');
    if (st === 'Done') return t('statusDone');
    return st;
  };

  const formatDeadlineDate = (dStr, isCompleted, finishDateStr) => {
    if (!dStr) return null;
    try {
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return { formatted: dStr, countdown: '' };
      const formatted = d.toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
      
      const deadlineDate = new Date(d);
      deadlineDate.setHours(0, 0, 0, 0);

      // 1. If project is completed (Done)
      if (isCompleted) {
        const finishDate = finishDateStr ? new Date(finishDateStr) : new Date();
        finishDate.setHours(0, 0, 0, 0);
        const diffDays = Math.round((deadlineDate - finishDate) / (1000 * 60 * 60 * 24));
        
        let countdown = '';
        let countdownStyle = 'text-white bg-emerald-600 font-bold';

        if (diffDays > 0) {
          countdown = t('finishedEarly', diffDays);
          countdownStyle = 'text-white bg-emerald-600 font-bold';
        } else if (diffDays === 0) {
          countdown = t('finishedOnTime');
          countdownStyle = 'text-white bg-emerald-600 font-bold';
        } else {
          const lateDays = Math.abs(diffDays);
          countdown = t('finishedLate', lateDays);
          countdownStyle = 'text-white bg-indigo-600 font-bold';
        }

        return { formatted, countdown, countdownStyle };
      }

      // 2. If project is still in progress / overdue
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
      
      let countdown = '';
      let countdownStyle = 'text-textMuted bg-gray-100 dark:bg-darkBorder';
      if (diffDays < 0) {
        countdown = t('overdueBy', Math.abs(diffDays));
        countdownStyle = 'text-white bg-red-600 font-bold';
      } else if (diffDays === 0) {
        countdown = t('dueToday');
        countdownStyle = 'text-white bg-amber-500 font-bold';
      } else if (diffDays <= 7) {
        countdown = t('dueInDays', diffDays);
        countdownStyle = 'text-white bg-indigo-600 font-bold';
      } else {
        countdown = t('dueInDays', diffDays);
      }

      return { formatted, countdown, countdownStyle };
    } catch {
      return { formatted: dStr, countdown: '' };
    }
  };

  const isDone = status === 'Done';
  const deadlineInfo = formatDeadlineDate(deadline, isDone, completedAt);

  const handleCreateSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    onAddSubtask(id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  const getPriorityLabel = (key) => {
    if (key === 'urgent') return t('priorityUrgent');
    if (key === 'important') return t('priorityImportant');
    if (key === 'normal') return t('priorityNormal');
    if (key === 'low') return t('priorityLow');
    return priority.label;
  };

  return (
    <div className={`bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border ${isDone ? 'border-emerald-500/30' : 'border-gray-100 dark:border-darkBorder'} flex flex-col justify-between hover:shadow-md transition-all duration-200`}>
      
      {/* Card Header */}
      <div>
        <div className="flex items-start justify-between gap-2.5 sm:gap-3">
          {/* Avatar Icon + Project Name */}
          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0 shadow-sm ${isDone ? 'bg-emerald-500/15 text-emerald-600' : iconColor}`}>
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm sm:text-base md:text-lg text-textMain leading-snug break-words">
                {name}
              </h3>
              {(subtitle || description) && (
                <p className="text-xs text-textMuted mt-0.5 line-clamp-2 leading-relaxed">
                  {subtitle || description}
                </p>
              )}
            </div>
          </div>
          
          {/* Edit Project Button */}
          <button
            type="button"
            onClick={() => onEditProject && onEditProject(project)}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-textMuted hover:text-textMain hover:bg-gray-100 dark:hover:bg-darkBorder transition-colors flex-shrink-0 active:scale-95"
            title={t('editProjectModalTitle')}
            aria-label={t('editProjectModalTitle')}
          >
            <Edit3 size={15} />
          </button>
        </div>

        {/* Badges & Meta Row */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3 pt-2.5 border-t border-gray-100/80 dark:border-darkBorder/60">
          {/* Status Badge */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-xl text-[11px] font-bold ${theme.badge}`}>
            <StatusIcon size={12} strokeWidth={2.5} />
            <span>{getStatusLabel(status)}</span>
          </span>

          {/* Solid High-Contrast Priority Badge */}
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 sm:py-1 rounded-xl shadow-sm ${priority.bg} ${priority.color}`}>
            <span>{priority.emoji}</span>
            <span>{getPriorityLabel(priority.key)}</span>
          </span>

          {/* Countdown badge if present */}
          {deadlineInfo?.countdown && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm ${deadlineInfo.countdownStyle}`}>
              <span>{deadlineInfo.countdown}</span>
            </span>
          )}
        </div>
      </div>

      {/* Dynamic Automatic Progress Bar */}
      <div className="my-3 sm:my-4 bg-background p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-darkBorder">
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
          <span className="text-textMuted">{t('progress')}</span>
          <span className="font-extrabold text-textMain text-xs sm:text-sm">{computedProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-darkBorder h-2 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ease-out ${theme.bar}`} 
            style={{ width: `${computedProgress}%` }} 
          />
        </div>
      </div>

      {/* Subtasks Accordion Section & Deadline */}
      <div className="space-y-2 pt-0.5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowTasksList(!showTasksList)}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline flex-shrink-0 py-1"
          >
            <CheckSquare size={14} />
            <span>{t('tasksCount', completedSubtasks, totalSubtasks)}</span>
            {showTasksList ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {deadlineInfo?.formatted && (
            <span className="text-textMuted text-[11px] flex items-center gap-1 truncate">
              <CalendarIcon size={12} className="flex-shrink-0" />
              <span>{deadlineInfo.formatted}</span>
            </span>
          )}
        </div>

        {/* Subtasks List */}
        {showTasksList && (
          <div className="bg-background rounded-2xl p-3.5 border border-gray-100 dark:border-darkBorder space-y-2 animate-in fade-in duration-200">
            {subtasks.length === 0 ? (
              <p className="text-[11px] text-textMuted text-center py-1">
                {t('noTasksYet')}
              </p>
            ) : (
              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {subtasks.map((task) => {
                  const taskStatus = task.status || (task.completed ? 'done' : 'not_started');
                  const isSubDone = taskStatus === 'done';
                  const isSubInProgress = taskStatus === 'in_progress';
                  const isSubNotStarted = taskStatus === 'not_started';

                  return (
                    <div 
                      key={task.id} 
                      className={`flex items-center justify-between gap-2 p-2 rounded-xl border text-xs transition-all ${
                        isSubDone 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-textMuted' 
                          : isSubInProgress 
                            ? 'bg-amber-500/10 border-amber-500/30 text-textMain font-medium'
                            : 'bg-card border-gray-100 dark:border-darkBorder text-textMain'
                      }`}
                    >
                      <div 
                        onClick={() => onToggleSubtask && onToggleSubtask(id, task.id)}
                        className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 select-none group"
                        title={lang === 'en' ? 'Click to toggle status' : 'Cliquer pour changer le statut'}
                      >
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                          isSubDone 
                            ? 'bg-emerald-600 text-white shadow-sm' 
                            : isSubInProgress 
                              ? 'bg-amber-500 text-white shadow-sm' 
                              : 'bg-slate-200 dark:bg-darkBorder text-slate-500 dark:text-slate-400'
                        }`}>
                          {isSubDone && <Check size={12} strokeWidth={3} />}
                          {isSubInProgress && <RefreshCw size={11} className="animate-spin" style={{ animationDuration: '3s' }} />}
                          {isSubNotStarted && <Circle size={10} />}
                        </div>

                        <span className={`truncate ${isSubDone ? 'line-through opacity-70' : ''}`}>
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span 
                          onClick={() => onToggleSubtask && onToggleSubtask(id, task.id)}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                            isSubDone 
                              ? 'bg-emerald-600/20 text-emerald-700 dark:text-emerald-300' 
                              : isSubInProgress 
                                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300' 
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {isSubDone ? t('statusDone') : isSubInProgress ? t('statusInProgress') : t('statusNotStarted')}
                        </span>

                        <button
                          onClick={() => onDeleteSubtask && onDeleteSubtask(id, task.id)}
                          className="text-textMuted hover:text-danger p-1 rounded transition-colors"
                          title={t('delete')}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick add subtask input */}
            <form onSubmit={handleCreateSubtask} className="flex gap-1.5 pt-1.5">
              <input
                type="text"
                placeholder={t('subtaskPlaceholder')}
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                className="flex-1 bg-card border border-gray-200 dark:border-darkBorder rounded-xl px-2.5 py-1.5 text-xs text-textMain focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="bg-primary text-white p-1.5 rounded-xl hover:bg-primary/90 text-xs font-bold transition-colors flex items-center justify-center px-3"
              >
                <Plus size={14} />
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
};

export default ProjectCard;