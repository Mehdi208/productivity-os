import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { FOCUS_TECHNIQUES } from '../data/focusTechniques';
import { playTimerAlarm, initAudio } from '../utils/audioAlert';
import { showSystemNotification } from '../utils/notificationService';

const FocusContext = createContext(null);

const STORAGE_KEY = 'pos_active_focus_session';

const getInitialSession = () => {
  const defaultTech = FOCUS_TECHNIQUES[1]; // Pomodoro 50/10
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.techId) {
        // If it was running, recalculate remainingSeconds from endTimestamp
        if (parsed.isRunning && parsed.endTimestamp) {
          const diff = Math.round((parsed.endTimestamp - Date.now()) / 1000);
          if (diff > 0) {
            return { ...parsed, remainingSeconds: diff };
          } else {
            // Already finished while app was closed
            return {
              ...parsed,
              isRunning: false,
              endTimestamp: null,
              remainingSeconds: 0
            };
          }
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored focus session:', e);
    }
  }

  return {
    isRunning: false,
    techId: defaultTech.id,
    techName: defaultTech.name,
    mode: 'work', // 'work' | 'break' | 'long_break'
    cycleCount: 1,
    totalDurationSeconds: defaultTech.workMinutes * 60,
    endTimestamp: null,
    pausedRemainingSeconds: defaultTech.workMinutes * 60,
    remainingSeconds: defaultTech.workMinutes * 60,
    taskTitle: null,
    soundEnabled: true,
    selectedSound: 'zen'
  };
};

export const FocusProvider = ({ children }) => {
  const [session, setSession] = useState(getInitialSession);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper to persist state
  const persistSession = useCallback((updated) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }, []);

  const getTech = useCallback((techId) => {
    return FOCUS_TECHNIQUES.find((t) => t.id === techId) || FOCUS_TECHNIQUES[1];
  }, []);

  // Compute duration for a specific mode
  const getModeDurationSeconds = useCallback((tech, mode) => {
    if (mode === 'work') return tech.workMinutes * 60;
    if (mode === 'break') return tech.breakMinutes * 60;
    return tech.longBreakMinutes * 60;
  }, []);

  // Play / Resume
  const resumeSession = useCallback(() => {
    initAudio();
    setSession((prev) => {
      const remaining = prev.pausedRemainingSeconds > 0 ? prev.pausedRemainingSeconds : prev.totalDurationSeconds;
      const endTimestamp = Date.now() + remaining * 1000;
      const updated = {
        ...prev,
        isRunning: true,
        endTimestamp,
        remainingSeconds: remaining
      };
      persistSession(updated);
      return updated;
    });
  }, [persistSession]);

  // Pause
  const pauseSession = useCallback(() => {
    setSession((prev) => {
      const remaining = prev.endTimestamp
        ? Math.max(0, Math.round((prev.endTimestamp - Date.now()) / 1000))
        : prev.remainingSeconds;

      const updated = {
        ...prev,
        isRunning: false,
        endTimestamp: null,
        pausedRemainingSeconds: remaining,
        remainingSeconds: remaining
      };
      persistSession(updated);
      return updated;
    });
  }, [persistSession]);

  // Reset current phase
  const resetSession = useCallback(() => {
    setSession((prev) => {
      const tech = getTech(prev.techId);
      const total = getModeDurationSeconds(tech, prev.mode);
      const updated = {
        ...prev,
        isRunning: false,
        endTimestamp: null,
        totalDurationSeconds: total,
        pausedRemainingSeconds: total,
        remainingSeconds: total
      };
      persistSession(updated);
      return updated;
    });
  }, [getTech, getModeDurationSeconds, persistSession]);

  // Select a new technique
  const selectTechnique = useCallback((tech) => {
    setSession((prev) => {
      const total = tech.workMinutes * 60;
      const updated = {
        ...prev,
        isRunning: false,
        techId: tech.id,
        techName: tech.name,
        mode: 'work',
        cycleCount: 1,
        totalDurationSeconds: total,
        endTimestamp: null,
        pausedRemainingSeconds: total,
        remainingSeconds: total
      };
      persistSession(updated);
      return updated;
    });
  }, [persistSession]);

  // Change phase (work / break / long_break)
  const setPhase = useCallback((newMode) => {
    setSession((prev) => {
      const tech = getTech(prev.techId);
      const total = getModeDurationSeconds(tech, newMode);
      const updated = {
        ...prev,
        mode: newMode,
        isRunning: false,
        endTimestamp: null,
        totalDurationSeconds: total,
        pausedRemainingSeconds: total,
        remainingSeconds: total
      };
      persistSession(updated);
      return updated;
    });
  }, [getTech, getModeDurationSeconds, persistSession]);

  // Set Sound options
  const updateSoundSettings = useCallback((soundEnabled, selectedSound) => {
    setSession((prev) => {
      const updated = {
        ...prev,
        soundEnabled: typeof soundEnabled === 'boolean' ? soundEnabled : prev.soundEnabled,
        selectedSound: selectedSound || prev.selectedSound
      };
      persistSession(updated);
      return updated;
    });
  }, [persistSession]);

  // Set initial task if starting from a task card
  const setInitialTask = useCallback((task) => {
    if (!task) return;
    setSession((prev) => {
      const updated = {
        ...prev,
        taskTitle: task.title || task.name || null
      };
      persistSession(updated);
      return updated;
    });
  }, [persistSession]);

  // Master Timer Tick: runs globally even when modal is closed or tab is in background!
  useEffect(() => {
    if (!session.isRunning || !session.endTimestamp) return;

    const interval = setInterval(() => {
      const diff = Math.max(0, Math.round((session.endTimestamp - Date.now()) / 1000));

      if (diff <= 0) {
        clearInterval(interval);

        // 1. Play audio alarm
        if (session.soundEnabled) {
          playTimerAlarm(session.selectedSound, 0.7);
        }

        // 2. Show system notification (WhatsApp style)
        const tech = getTech(session.techId);
        const isWork = session.mode === 'work';
        const notifTitle = isWork
          ? `🏁 Session Focus Terminée (${tech.name})`
          : `⚡ Fin de Pause — Prêt pour le Focus !`;
        const notifBody = isWork
          ? `Bravo ! Vous avez complété votre bloc de ${tech.workMinutes} min. Prenez maintenant votre pause.`
          : `Votre pause est terminée. Reprenez votre session de concentration.`;

        showSystemNotification(notifTitle, {
          body: notifBody,
          tag: 'focus-timer-completed',
          renotify: true,
          vibrate: [300, 150, 300, 150, 600]
        });

        // 3. Advance phase automatically
        setSession((prev) => {
          let nextMode = 'work';
          let nextCycle = prev.cycleCount;

          if (prev.mode === 'work') {
            if (prev.cycleCount >= tech.cyclesBeforeLongBreak) {
              nextMode = 'long_break';
              nextCycle = 1;
            } else {
              nextMode = 'break';
              nextCycle = prev.cycleCount + 1;
            }
          } else {
            nextMode = 'work';
          }

          const nextTotal = getModeDurationSeconds(tech, nextMode);
          const updated = {
            ...prev,
            isRunning: false,
            endTimestamp: null,
            mode: nextMode,
            cycleCount: nextCycle,
            totalDurationSeconds: nextTotal,
            pausedRemainingSeconds: nextTotal,
            remainingSeconds: nextTotal
          };
          persistSession(updated);
          return updated;
        });
      } else {
        setSession((prev) => ({ ...prev, remainingSeconds: diff }));
      }
    }, 500);

    return () => clearInterval(interval);
  }, [session.isRunning, session.endTimestamp, session.soundEnabled, session.selectedSound, session.techId, session.mode, getTech, getModeDurationSeconds, persistSession]);

  // Sync browser document title with remaining time
  useEffect(() => {
    if (session.isRunning) {
      const minutes = Math.floor(session.remainingSeconds / 60);
      const seconds = session.remainingSeconds % 60;
      const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      const prefix = session.mode === 'work' ? '🎯' : '☕';
      document.title = `${prefix} (${formatted}) ${session.techName} | Productivity OS`;
    } else {
      document.title = 'Productivity OS';
    }
  }, [session.isRunning, session.remainingSeconds, session.techName, session.mode]);

  const value = {
    session,
    selectedTech: getTech(session.techId),
    isModalOpen,
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
    togglePlay: session.isRunning ? pauseSession : resumeSession,
    resumeSession,
    pauseSession,
    resetSession,
    selectTechnique,
    setPhase,
    updateSoundSettings,
    setInitialTask
  };

  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
};

export const useFocus = () => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
};
