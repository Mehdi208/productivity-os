import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Brain, Volume2, VolumeX, Bell } from 'lucide-react';
import { FOCUS_TECHNIQUES, getLocalizedTechnique } from '../../data/focusTechniques';
import { playTimerAlarm, initAudio, SOUND_PRESETS } from '../../utils/audioAlert';
import { useFocus } from '../../context/FocusContext';
import { useLanguage } from '../../context/LanguageContext';

const FocusTimerModal = ({ isOpen, onClose, initialTask = null }) => {
  const { lang, t } = useLanguage();
  const {
    session,
    selectedTech,
    togglePlay,
    resetSession,
    selectTechnique,
    setPhase,
    updateSoundSettings,
    setInitialTask
  } = useFocus();

  const [isTestingSound, setIsTestingSound] = useState(false);

  // Sync initial task if provided
  useEffect(() => {
    if (initialTask) {
      setInitialTask(initialTask);
    }
  }, [initialTask, setInitialTask]);

  const mode = session.mode;
  const cycleCount = session.cycleCount;
  const isRunning = session.isRunning;
  const soundEnabled = session.soundEnabled;
  const selectedSound = session.selectedSound;

  const activeTechLocalized = getLocalizedTechnique(selectedTech, lang);

  const handleTestSound = (soundId = selectedSound) => {
    initAudio();
    setIsTestingSound(true);
    playTimerAlarm(soundId, 0.7);
    setTimeout(() => setIsTestingSound(false), 1200);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    updateSoundSettings(next, selectedSound);
    if (next) {
      initAudio();
    }
  };

  const handleChangeSoundPreset = (id) => {
    updateSoundSettings(soundEnabled, id);
    if (soundEnabled) {
      handleTestSound(id);
    }
  };

  const minutes = Math.floor(session.remainingSeconds / 60);
  const seconds = session.remainingSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const totalCurrentSeconds = session.totalDurationSeconds || (selectedTech.workMinutes * 60);
  const progressPercent = Math.min(100, Math.max(0, ((totalCurrentSeconds - session.remainingSeconds) / totalCurrentSeconds) * 100));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[75] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-card dark:bg-darkCard rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-200/80 dark:border-darkBorder overflow-hidden my-auto max-h-[95vh] flex flex-col transition-colors">
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100 dark:border-darkBorder flex items-center justify-between bg-gradient-to-r from-primary/10 via-background to-secondary/10 dark:from-primary/20 dark:via-darkCard dark:to-secondary/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 dark:bg-primary/25 text-primary flex items-center justify-center font-bold">
              <Brain size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-textMain dark:text-darkTextMain">{t('focusTitle')}</h2>
                <span className="bg-secondary/15 text-[#00604C] dark:text-secondary px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {t('focusScienceBadge')}
                </span>
              </div>
              <p className="text-xs text-textMuted dark:text-darkTextMuted mt-0.5">{t('focusSubtitle')}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-background dark:bg-darkCardElevated hover:bg-gray-100 dark:hover:bg-darkBorder text-textMuted dark:text-darkTextMuted hover:text-textMain dark:hover:text-darkTextMain flex items-center justify-center transition-colors"
            aria-label={t('close')}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Technique Picker Pills */}
          <div>
            <label className="text-xs font-bold text-textMuted dark:text-darkTextMuted uppercase tracking-wider block mb-2">
              {t('focusPickMethod')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FOCUS_TECHNIQUES.map((tech) => {
                const isSelected = selectedTech.id === tech.id;
                const loc = getLocalizedTechnique(tech, lang);
                return (
                  <button
                    key={tech.id}
                    onClick={() => selectTechnique(tech)}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      isSelected 
                        ? 'bg-primary/10 dark:bg-primary/20 border-primary text-primary shadow-sm font-semibold' 
                        : 'bg-background dark:bg-darkBg hover:bg-gray-50 dark:hover:bg-darkCardElevated border-gray-200/80 dark:border-darkBorder text-textMain dark:text-darkTextMain'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{loc.name}</div>
                    <div className="text-[10px] text-textMuted dark:text-darkTextMuted mt-0.5">{tech.workMinutes}m focus • {tech.breakMinutes}m pause</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Technique Protocol Card */}
          <div className="bg-background dark:bg-darkBg rounded-2xl p-4 border border-gray-100 dark:border-darkBorder">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-textMain dark:text-darkTextMain">{activeTechLocalized.name}</span>
                <span className="text-[11px] text-textMuted dark:text-darkTextMuted">• {t('focusBy')} <strong className="text-primary">{selectedTech.creator}</strong></span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-card dark:bg-darkCard border border-gray-200 dark:border-darkBorder text-textMuted dark:text-darkTextMuted">
                {activeTechLocalized.tag}
              </span>
            </div>
            <p className="text-xs text-textMuted dark:text-darkTextMuted leading-relaxed mb-3">{activeTechLocalized.description}</p>
            
            <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-darkBorder">
              <span className="text-[10px] font-bold text-textMuted dark:text-darkTextMuted uppercase tracking-wider">{t('focusProtocol')}</span>
              {activeTechLocalized.protocol.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-textMain dark:text-darkTextMain">
                  <div className="w-4 h-4 rounded-full bg-primary/10 dark:bg-primary/25 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Big Interactive Timer Box */}
          <div className="bg-gradient-to-b from-card to-background dark:from-darkCard dark:to-darkBg rounded-3xl p-6 border border-gray-200/80 dark:border-darkBorder shadow-inner flex flex-col items-center justify-center text-center relative overflow-hidden">
            
            {/* Phase switchers */}
            <div className="flex items-center gap-1.5 bg-background dark:bg-darkBg p-1 rounded-2xl border border-gray-200 dark:border-darkBorder mb-6">
              <button
                onClick={() => setPhase('work')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  mode === 'work' ? 'bg-primary text-white shadow-sm' : 'text-textMuted dark:text-darkTextMuted hover:text-textMain dark:hover:text-darkTextMain'
                }`}
              >
                {t('focusPhaseWork', selectedTech.workMinutes)}
              </button>
              <button
                onClick={() => setPhase('break')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  mode === 'break' ? 'bg-secondary text-[#004A3B] shadow-sm' : 'text-textMuted dark:text-darkTextMuted hover:text-textMain dark:hover:text-darkTextMain'
                }`}
              >
                {t('focusPhaseBreak', selectedTech.breakMinutes)}
              </button>
              <button
                onClick={() => setPhase('long_break')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  mode === 'long_break' ? 'bg-warning text-[#4D3200] shadow-sm' : 'text-textMuted dark:text-darkTextMuted hover:text-textMain dark:hover:text-darkTextMain'
                }`}
              >
                {t('focusPhaseLongBreak', selectedTech.longBreakMinutes)}
              </button>
            </div>

            {/* Countdown digits */}
            <div className="text-6xl sm:text-7xl font-extrabold tracking-tight text-textMain dark:text-darkTextMain my-2 font-mono">
              {timeFormatted}
            </div>
            
            <p className="text-xs font-semibold text-textMuted dark:text-darkTextMuted mb-4">
              {mode === 'work' ? t('focusCycleStatus', cycleCount, selectedTech.cyclesBeforeLongBreak) : t('focusBreakStatus')}
            </p>

            {/* Progress bar */}
            <div className="w-full max-w-md bg-gray-200 dark:bg-darkBorder h-2 rounded-full overflow-hidden mb-6">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  mode === 'work' ? 'bg-primary' : 'bg-secondary'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={resetSession}
                className="w-12 h-12 rounded-2xl bg-background dark:bg-darkBg hover:bg-gray-100 dark:hover:bg-darkCardElevated border border-gray-200 dark:border-darkBorder text-textMuted dark:text-darkTextMuted hover:text-textMain dark:hover:text-darkTextMain flex items-center justify-center transition-all active:scale-95"
                title={t('focusReset')}
              >
                <RotateCcw size={18} />
              </button>

              <button
                onClick={togglePlay}
                className={`px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2.5 text-base shadow-lg transition-all active:scale-95 ${
                  isRunning 
                    ? 'bg-warning hover:bg-warning/90 text-white shadow-warning/30' 
                    : 'bg-primary hover:bg-primary/90 text-white shadow-primary/30'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause size={20} />
                    <span>{t('focusPause')}</span>
                  </>
                ) : (
                  <>
                    <Play size={20} className="fill-white" />
                    <span>{t('focusStart')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Sound Alert Configuration Bar */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-darkBorder w-full max-w-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleSound}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold transition-all active:scale-95 ${
                    soundEnabled 
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm' 
                      : 'bg-gray-100 dark:bg-darkBorder text-textMuted border border-gray-200 dark:border-darkBorder'
                  }`}
                  title={soundEnabled ? t('focusSoundActive') : t('focusSoundMuted')}
                >
                  {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                  <span>{soundEnabled ? t('focusSoundActive') : t('focusSoundMuted')}</span>
                </button>

                {soundEnabled && (
                  <div className="flex items-center gap-1 bg-background dark:bg-darkBg p-1 rounded-xl border border-gray-200/80 dark:border-darkBorder">
                    {SOUND_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleChangeSoundPreset(preset.id)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                          selectedSound === preset.id
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-textMuted hover:text-textMain'
                        }`}
                        title={`${preset.name} - ${preset.desc}`}
                      >
                        <span>{preset.icon}</span>
                        <span className="hidden sm:inline">{preset.id === 'zen' ? 'Zen' : preset.id === 'digital' ? 'Chime' : 'Gong'}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {soundEnabled && (
                <button
                  type="button"
                  onClick={() => handleTestSound()}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 border active:scale-95 ${
                    isTestingSound 
                      ? 'bg-primary/20 text-primary border-primary animate-pulse' 
                      : 'bg-background hover:bg-gray-100 dark:hover:bg-darkBorder border-gray-200 dark:border-darkBorder text-textMuted hover:text-textMain'
                  }`}
                  title={t('focusTestSound')}
                >
                  <Bell size={13} className={isTestingSound ? "animate-bounce" : ""} />
                  <span className="text-[11px]">{isTestingSound ? t('focusPlayingSound') : t('focusTestSound')}</span>
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default FocusTimerModal;
