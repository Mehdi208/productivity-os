import React from 'react';
import { Play, Pause, Maximize2, RotateCcw } from 'lucide-react';
import { useFocus } from '../../context/FocusContext';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedTechnique } from '../../data/focusTechniques';

const MiniFocusBar = ({ isModalOpen = false, onOpenModal }) => {
  const { lang, t } = useLanguage();
  const { session, selectedTech, openModal: contextOpenModal, togglePlay, resetSession } = useFocus();

  // Show mini-bar only when a session is active/paused AND modal is closed
  const hasActiveSession = session.isRunning || (session.pausedRemainingSeconds < session.totalDurationSeconds && session.remainingSeconds > 0);
  if (!hasActiveSession || isModalOpen) {
    return null;
  }

  const handleOpen = onOpenModal || contextOpenModal;

  const minutes = Math.floor(session.remainingSeconds / 60);
  const seconds = session.remainingSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const progressPercent = Math.min(
    100,
    Math.max(0, ((session.totalDurationSeconds - session.remainingSeconds) / session.totalDurationSeconds) * 100)
  );

  const isWork = session.mode === 'work';
  const locTech = getLocalizedTechnique(selectedTech, lang);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:right-6 md:w-96 z-40 animate-in slide-in-from-bottom-5 duration-300">
      <div 
        onClick={handleOpen}
        className="group relative bg-card/95 dark:bg-darkCard/95 backdrop-blur-xl border border-primary/40 dark:border-primary/50 rounded-2xl p-3 shadow-2xl hover:shadow-primary/20 transition-all cursor-pointer overflow-hidden flex items-center justify-between gap-3"
      >
        {/* Top Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-darkBorder">
          <div
            className={`h-full transition-all duration-500 ${isWork ? 'bg-primary' : 'bg-secondary'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Left: Indicator & Time */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <div className={`w-3 h-3 rounded-full ${session.isRunning ? 'bg-emerald-500 animate-ping opacity-75' : 'bg-amber-500'}`} />
            <div className={`w-2.5 h-2.5 rounded-full absolute ${session.isRunning ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-lg font-black text-textMain dark:text-darkTextMain tracking-tight">
                {timeFormatted}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                isWork
                  ? 'bg-primary/15 text-primary'
                  : 'bg-secondary/15 text-[#00604C] dark:text-secondary'
              }`}>
                {isWork ? (lang === 'en' ? 'Work' : 'Travail') : (lang === 'en' ? 'Break' : 'Pause')}
              </span>
            </div>
            <div className="text-[11px] text-textMuted dark:text-darkTextMuted truncate max-w-[140px]">
              {session.taskTitle ? `🎯 ${session.taskTitle}` : locTech.name}
            </div>
          </div>
        </div>

        {/* Right: Quick Controls */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={resetSession}
            className="w-8 h-8 rounded-xl bg-background dark:bg-darkBg hover:bg-gray-100 dark:hover:bg-darkBorder border border-gray-200 dark:border-darkBorder text-textMuted hover:text-textMain flex items-center justify-center transition-all active:scale-95"
            title={t('focusReset')}
          >
            <RotateCcw size={13} />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-all active:scale-95 ${
              session.isRunning
                ? 'bg-warning hover:bg-warning/90 text-white shadow-warning/30'
                : 'bg-primary hover:bg-primary/90 text-white shadow-primary/30'
            }`}
            title={session.isRunning ? t('focusPause') : t('focusStart')}
          >
            {session.isRunning ? <Pause size={15} /> : <Play size={15} className="fill-white" />}
          </button>

          <button
            type="button"
            onClick={handleOpen}
            className="w-8 h-8 rounded-xl bg-background dark:bg-darkBg hover:bg-gray-100 dark:hover:bg-darkBorder border border-gray-200 dark:border-darkBorder text-textMuted hover:text-textMain flex items-center justify-center transition-all active:scale-95"
            title={t('focusExpand')}
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniFocusBar;
