import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase/config';
import { getDaySchedule } from './data/fixedBlocks';
import { 
  getTodayStr, 
  getAbidjanDateStr,
  saveDayScore, 
  computeStreak, 
  getLastNDaysScores, 
  checkAndResetDailyHydration
} from './data/scoreHistory';
import { PRIORITY_LEVELS } from './data/priorityEngine';

import Sidebar from './components/Layout/Sidebar';
import BottomNav from './components/Layout/BottomNav';
import MobileDrawer from './components/Layout/MobileDrawer';
import Today from './pages/Today';
import Week from './pages/Week';
import Projects from './pages/Projects';
import Stats from './pages/Stats';
import Challenge30Days from './pages/Challenge30Days';
import MonthlyReview from './pages/MonthlyReview';

import DailyBriefingModal from './components/DailyBriefing/DailyBriefingModal';
import PriorityCopilot from './components/PriorityCoach/PriorityCopilot';
import NewTaskModal from './components/Calendar/NewTaskModal';
import FocusTimerModal from './components/Focus/FocusTimerModal';
import MiniFocusBar from './components/Focus/MiniFocusBar';
import { FocusProvider } from './context/FocusContext';
import { useLanguage } from './context/LanguageContext';
import PWAInstallPrompt, { PWAInstallModal } from './components/PWA/PWAInstallPrompt';
import OnboardingModal from './components/Onboarding/OnboardingModal';
import { useAgendaNotificationWatcher } from './hooks/useAgendaNotificationWatcher';
import { useMonthlyRecapWatcher } from './hooks/useMonthlyRecapWatcher';
import { formatMonthLabel } from './data/monthlyReviewEngine';
import { Menu, Globe, Sparkles, ArrowRight, X } from 'lucide-react';

const storageKey = (key) => `pos_${key}`;

const AppContent = () => {
  const location = useLocation();
  const isWeekPage = location.pathname === '/week';

  // Theme state (Light / Dark)
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem(storageKey('theme'));
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark class and data-theme immediately to document & body
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem(storageKey('theme'), 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem(storageKey('theme'), 'light');
    }
  }, [isDark]);

  const handleToggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem(storageKey('theme'), 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem(storageKey('theme'), 'light');
      }
      return next;
    });
  };

  // Hydration state (Strict Daily Reset to 0 ml on each new day based on Abidjan timezone)
  const [hydrationMl, setHydrationMl] = useState(() => {
    const res = checkAndResetDailyHydration();
    if (res.shouldReset) {
      return 0;
    }
    return res.currentMl || 0;
  });

  // Check if daily reset is needed (on load, periodic 30s timer, on tab visibility change)
  useEffect(() => {
    const handleDayCheck = () => {
      const res = checkAndResetDailyHydration();
      if (res.shouldReset) {
        setHydrationMl(0);
      }
    };
    handleDayCheck();
    const timer = setInterval(handleDayCheck, 30000);
    window.addEventListener('visibilitychange', handleDayCheck);
    return () => {
      clearInterval(timer);
      window.removeEventListener('visibilitychange', handleDayCheck);
    };
  }, []);

  // Hook de langue bilingue
  const { lang, toggleLanguage, t } = useLanguage();

  // User-defined Permanent Daily Routines (repeats each day across all weeks)
  // Default is pristine empty: Emmanuella defines and controls all routines
  const [dailyRoutines, setDailyRoutines] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey('daily_routines'));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {}
    return [];
  });

  // Custom blocks by ISO date (e.g. { "2026-09-16": [...] })
  // Activities added to a specific date stay strictly on that date and never repeat on other weeks!
  const [customBlocksByDate, setCustomBlocksByDate] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey('custom_blocks_by_date'));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {}
    try { localStorage.removeItem(storageKey('week_blocks')); } catch {}
    return {};
  });

  // Dynamic Today index and date (Abidjan timezone)
  const todayStr = getAbidjanDateStr();
  const todayDayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  // Checked blocks
  const [checkedBlockIds, setCheckedBlockIds] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey('checked_blocks'));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  // Today's schedule: user daily routines + customs for today
  const todayBlocks = React.useMemo(() => {
    return getDaySchedule(todayStr, customBlocksByDate, dailyRoutines);
  }, [customBlocksByDate, dailyRoutines, todayStr]);

  // Dynamic schedule getter for any ISO date (YYYY-MM-DD)
  const getDayBlocks = React.useCallback((isoDate) => {
    const schedule = getDaySchedule(isoDate, customBlocksByDate, dailyRoutines);
    const safeChecked = Array.isArray(checkedBlockIds) ? checkedBlockIds : [];
    return (schedule || []).map(b => ({
      ...b,
      checked: safeChecked.includes(b?.checkId || b?.id),
      date: isoDate
    }));
  }, [customBlocksByDate, dailyRoutines, checkedBlockIds]);

  // Agenda Native System Notification Watcher (Pop-up alerts like WhatsApp at block start times)
  useAgendaNotificationWatcher(todayBlocks);

  // Monthly Review Automatic Watcher (Detects 1st of month & handles alerts)
  const { 
    hasUnreadRecap, 
    recapMonthKey, 
    isSimulated, 
    dismissRecap, 
    triggerSimulation 
  } = useMonthlyRecapWatcher(lang);

  // Real auto-computed streak
  const [streak, setStreak] = useState(() => computeStreak(50) || 0);

  // Projects state
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey('projects'));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [{
      id: 'proj_bienvenue',
      name: 'Mission Septembre — 1 Web App',
      subtitle: 'Entrepreneur & High Performance',
      description: 'Personal space to plan, achieve, and track major milestones.',
      deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      priorityKey: 'high',
      status: 'In Progress',
      color: '#EC4899',
      category: 'Personnel',
      subtasks: []
    }];
  });

  // Challenge 30 Days State (Synchronized with localStorage & Firestore)
  const [challengeData, setChallengeData] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey('challenge_30_days'));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return {
      dailyLogs: [],
      prospects: [],
      weeksData: null
    };
  });

  const handleUpdateChallenge = (newChallengeData) => {
    setChallengeData(newChallengeData);
    localStorage.setItem(storageKey('challenge_30_days'), JSON.stringify(newChallengeData));
    pushMutationToCloud({ challengeData: newChallengeData });
  };

  // Modal states
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showDailyBriefing, setShowDailyBriefing] = useState(() => {
    const lastSeen = localStorage.getItem(storageKey('briefing_seen_date'));
    const today = getTodayStr();
    return lastSeen !== today;
  });
  const [showFocusModal, setShowFocusModal] = useState(false);
  const [activeFocusTask, setActiveFocusTask] = useState(null);

  // Mobile drawer & PWA & Onboarding Tour states
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showOnboardingTour, setShowOnboardingTour] = useState(() => {
    return !localStorage.getItem(storageKey('tour_seen'));
  });

  // Copilot drawer state
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Action to completely clear schedule to a clean pristine state
  const handleClearSchedule = () => {
    setCustomBlocksByDate({});
    setDailyRoutines([]);
    setCheckedBlockIds([]);
    localStorage.setItem(storageKey('custom_blocks_by_date'), JSON.stringify({}));
    localStorage.setItem(storageKey('daily_routines'), JSON.stringify([]));
    localStorage.setItem(storageKey('checked_blocks'), JSON.stringify([]));
    pushMutationToCloud({ customBlocksByDate: {}, dailyRoutines: [], checkedBlockIds: [] });
  };

  // Forms
  const [newTaskForm, setNewTaskForm] = useState({ 
    title: '', 
    subtitle: '',
    start: '09:00', 
    end: '10:30', 
    color: '#6C63FF', 
    checkable: true,
    isRoutine: false,
    dayIndex: todayDayIdx,
    date: getAbidjanDateStr()
  });
  
  const [newProjectForm, setNewProjectForm] = useState({ 
    name: '', 
    subtitle: 'Client externe', 
    description: '', 
    deadline: new Date().toISOString().split('T')[0],
    priorityKey: 'normal',
    status: 'Not Started'
  });

  // Score calculation with type-safe guards
  const safeTodayBlocks = Array.isArray(todayBlocks) ? todayBlocks : [];
  const safeCheckedIds = Array.isArray(checkedBlockIds) ? checkedBlockIds : [];
  const checkableBlocks = safeTodayBlocks.filter(b => b && b.checkable);
  const totalCount = checkableBlocks.length;
  const completedCount = checkableBlocks.filter(b => b && safeCheckedIds.includes(b.checkId || b.id)).length;
  const score = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const annotatedTodayBlocks = React.useMemo(() => {
    const safeChecked = Array.isArray(checkedBlockIds) ? checkedBlockIds : [];
    return (todayBlocks || []).map(b => ({ ...b, checked: safeChecked.includes(b?.checkId || b?.id), date: todayStr }));
  }, [todayBlocks, checkedBlockIds, todayStr]);

  // Backward-compatible annotatedWeekBlocksByDay for current week
  const annotatedWeekBlocksByDay = React.useMemo(() => {
    try {
      const now = new Date();
      const currentDayOfWeek = now.getDay();
      const distanceToMonday = (currentDayOfWeek + 6) % 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - distanceToMonday);
      const res = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        res[i] = getDayBlocks(iso);
      }
      return res;
    } catch (e) {
      console.warn("Error computing annotatedWeekBlocksByDay:", e);
      return {};
    }
  }, [getDayBlocks]);

  // Real-time Cloud Sync State & Shield
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'syncing' | 'offline'
  const [lastSyncTime, setLastSyncTime] = useState('');
  const isReceivingRemoteUpdateRef = React.useRef(false);
  const lastUserEditTimeRef = React.useRef(0);
  const projectsRef = React.useRef(projects);

  React.useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  // Realtime multi-device sync with Firebase Firestore (Single Source of Truth + Shield)
  useEffect(() => {
    if (!db) return;
    try {
      const docRef = doc(db, "productivity_user", "mehdi_data");
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const isRecentLocalEdit = Date.now() - lastUserEditTimeRef.current < 15000;
          
          // Lock outbound sync temporarily to avoid echoing received remote data back
          isReceivingRemoteUpdateRef.current = true;
          
          if (data.checkedBlockIds !== undefined && Array.isArray(data.checkedBlockIds)) {
            setCheckedBlockIds(data.checkedBlockIds);
            localStorage.setItem(storageKey('checked_blocks'), JSON.stringify(data.checkedBlockIds));
          }
          if (data.hydrationMl !== undefined && typeof data.hydrationMl === 'number') {
            setHydrationMl(data.hydrationMl);
            localStorage.setItem(storageKey('hydration'), data.hydrationMl.toString());
          }

          // SMART MERGE / SHIELD FOR PROJECTS:
          // Never let an incoming snapshot wipe out newly created local projects!
          if (data.projects && Array.isArray(data.projects)) {
            if (isRecentLocalEdit && (projectsRef.current || []).length >= data.projects.length) {
              // Local has recent edits with equal or more projects: keep local projects intact
              console.info("Shielding local projects against older/shorter snapshot");
            } else {
              setProjects(prev => {
                const prevList = Array.isArray(prev) ? prev : [];
                // If local has custom created projects not in remote, preserve them!
                const remoteIds = new Set(data.projects.map(p => p.id));
                const localCustom = prevList.filter(p => p && p.id && p.id.startsWith('proj_') && !remoteIds.has(p.id));
                const merged = [...data.projects, ...localCustom];
                localStorage.setItem(storageKey('projects'), JSON.stringify(merged));
                localStorage.setItem(storageKey('projects_backup'), JSON.stringify(merged));
                return merged;
              });
            }
          }

          if (data.dailyRoutines && Array.isArray(data.dailyRoutines)) {
            setDailyRoutines(data.dailyRoutines);
            localStorage.setItem(storageKey('daily_routines'), JSON.stringify(data.dailyRoutines));
          }

          if (data.customBlocksByDate && typeof data.customBlocksByDate === 'object' && !Array.isArray(data.customBlocksByDate)) {
            setCustomBlocksByDate(data.customBlocksByDate);
            localStorage.setItem(storageKey('custom_blocks_by_date'), JSON.stringify(data.customBlocksByDate));
          }

          if (data.challengeData && typeof data.challengeData === 'object') {
            setChallengeData(data.challengeData);
            localStorage.setItem(storageKey('challenge_30_days'), JSON.stringify(data.challengeData));
          }

          if (data.hydrationMl !== undefined && data.hydrationDate) {
            const todayStr = getAbidjanDateStr();
            if (data.hydrationDate === todayStr) {
              if (!isRecentLocalEdit) {
                setHydrationMl(data.hydrationMl);
                localStorage.setItem(storageKey('hydration'), data.hydrationMl.toString());
                localStorage.setItem(storageKey('hydration_date'), todayStr);
              }
            } else {
              // Remote data is from a previous day: reset to 0 for today
              setHydrationMl(0);
              localStorage.setItem(storageKey('hydration'), '0');
              localStorage.setItem(storageKey('hydration_date'), todayStr);
            }
          }

          setSyncStatus('synced');
          setLastSyncTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

          setTimeout(() => {
            isReceivingRemoteUpdateRef.current = false;
          }, 350);
        }
      }, (err) => {
        console.info("Firestore sync fallback/offline:", err?.message);
        setSyncStatus('offline');
      });
      return () => unsubscribe();
    } catch (err) {
      console.info("Firestore listener setup error:", err);
      setSyncStatus('offline');
    }
  }, []);

  // Save day score and sync streak
  useEffect(() => {
    const todayStr = getTodayStr();
    saveDayScore(todayStr, {
      score: Math.round(score),
      completed: completedCount,
      total: totalCount,
      hydration: hydrationMl
    });
    setStreak(computeStreak(50) || 0);
  }, [score, completedCount, totalCount, hydrationMl]);

  // Dedicated Outbound Push Function (Executed ONLY on explicit user actions, NEVER on phone wake-up)
  const pushMutationToCloud = async (updates) => {
    if (!db) return;
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, "productivity_user", "mehdi_data"), {
        ...updates,
        lastSync: new Date().toISOString(),
        lastSyncTimestamp: Date.now()
      }, { merge: true });
      setSyncStatus('synced');
      setLastSyncTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn("Cloud push error:", err);
      setSyncStatus('offline');
    }
  };

  // Force Manual Refresh / Sync Helper
  const handleForceSync = async () => {
    if (!db) return;
    try {
      setSyncStatus('syncing');
      const snap = await getDoc(doc(db, "productivity_user", "mehdi_data"));
      if (snap.exists()) {
        const data = snap.data();
        if (data.checkedBlockIds !== undefined && Array.isArray(data.checkedBlockIds)) setCheckedBlockIds(data.checkedBlockIds);
        if (data.hydrationMl !== undefined && typeof data.hydrationMl === 'number') setHydrationMl(data.hydrationMl);
        if (data.projects && Array.isArray(data.projects)) {
          // Preserve local custom projects
          const prevList = Array.isArray(projects) ? projects : [];
          const remoteIds = new Set(data.projects.map(p => p.id));
          const localCustom = prevList.filter(p => p && p.id && p.id.startsWith('proj_') && !remoteIds.has(p.id));
          const merged = [...data.projects, ...localCustom];
          setProjects(merged);
          localStorage.setItem(storageKey('projects'), JSON.stringify(merged));
          localStorage.setItem(storageKey('projects_backup'), JSON.stringify(merged));
        }
        if (data.dailyRoutines && Array.isArray(data.dailyRoutines)) {
          setDailyRoutines(data.dailyRoutines);
          localStorage.setItem(storageKey('daily_routines'), JSON.stringify(data.dailyRoutines));
        }
        if (data.customBlocksByDate && typeof data.customBlocksByDate === 'object' && !Array.isArray(data.customBlocksByDate)) {
          setCustomBlocksByDate(data.customBlocksByDate);
          localStorage.setItem(storageKey('custom_blocks_by_date'), JSON.stringify(data.customBlocksByDate));
        }
        if (data.challengeData && typeof data.challengeData === 'object') {
          setChallengeData(data.challengeData);
          localStorage.setItem(storageKey('challenge_30_days'), JSON.stringify(data.challengeData));
        }
      } else {
        await setDoc(doc(db, "productivity_user", "mehdi_data"), {
          checkedBlockIds,
          hydrationMl,
          projects,
          dailyRoutines,
          customBlocksByDate,
          challengeData,
          streak,
          score: Math.round(score),
          lastSync: new Date().toISOString()
        }, { merge: true });
      }
      setSyncStatus('synced');
      setLastSyncTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn("Manual sync error:", err);
      setSyncStatus('offline');
    }
  };

  const handleToggleCheckBlock = (blockId, checkId) => {
    const targetId = checkId || blockId;
    setCheckedBlockIds(prev => {
      const list = Array.isArray(prev) ? prev : [];
      const next = list.includes(targetId) ? list.filter(id => id !== targetId) : [...list, targetId];
      localStorage.setItem(storageKey('checked_blocks'), JSON.stringify(next));
      pushMutationToCloud({ checkedBlockIds: next });
      return next;
    });
  };

  const handleAddWater = (amount) => {
    setHydrationMl(prev => {
      const next = Math.min(3500, Math.max(0, prev + amount));
      const todayStr = getAbidjanDateStr();
      localStorage.setItem(storageKey('hydration'), next.toString());
      localStorage.setItem(storageKey('hydration_date'), todayStr);
      saveDayScore(todayStr, { hydration: next });
      pushMutationToCloud({ 
        hydrationMl: next,
        hydrationDate: todayStr
      });
      return next;
    });
  };

  // Proactive Copilot trigger when a task is created
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskForm.title.trim()) return;

    if (newTaskForm.isRoutine) {
      const routineBlock = {
        id: `routine_${Date.now()}`,
        title: newTaskForm.title.trim(),
        start: newTaskForm.start,
        end: newTaskForm.end,
        color: newTaskForm.color,
        subtitle: newTaskForm.subtitle || (lang === 'en' ? "Daily Routine" : "Routine quotidienne"),
        checkable: newTaskForm.checkable !== false,
        isRoutine: true
      };

      setDailyRoutines(prev => {
        const list = Array.isArray(prev) ? prev : [];
        const updated = [...list, routineBlock].sort((a, b) => (a.start || '').localeCompare(b.start || ''));
        localStorage.setItem(storageKey('daily_routines'), JSON.stringify(updated));
        pushMutationToCloud({ dailyRoutines: updated });
        return updated;
      });
    } else {
      const taskDate = newTaskForm.date || getAbidjanDateStr();
      const newBlock = { 
        id: `custom_${Date.now()}`, 
        title: newTaskForm.title.trim(), 
        start: newTaskForm.start, 
        end: newTaskForm.end, 
        color: newTaskForm.color, 
        checkable: newTaskForm.checkable !== false, 
        isRoutine: false,
        subtitle: newTaskForm.subtitle || (lang === 'en' ? "Custom task" : "Tâche personnalisée"),
        date: taskDate
      };

      setCustomBlocksByDate(prev => {
        const currentObj = (prev && typeof prev === 'object' && !Array.isArray(prev)) ? prev : {};
        const currentList = Array.isArray(currentObj[taskDate]) ? currentObj[taskDate] : [];
        const updated = [...currentList, newBlock].sort((a, b) => (a.start || '').localeCompare(b.start || ''));
        const next = { ...currentObj, [taskDate]: updated };
        localStorage.setItem(storageKey('custom_blocks_by_date'), JSON.stringify(next));
        pushMutationToCloud({ customBlocksByDate: next });
        return next;
      });
    }

    setShowNewTaskModal(false);

    setNewTaskForm({ 
      title: '', 
      subtitle: '',
      start: '09:00', 
      end: '10:30', 
      color: '#6C63FF', 
      checkable: true, 
      isRoutine: false,
      dayIndex: todayDayIdx,
      date: getAbidjanDateStr()
    });
  };

  // Block Editing Handlers (Modify ANY block in agenda)
  const handleSaveBlock = (updatedBlock, targetDayIndex, targetIsoDate) => {
    const finalDate = targetIsoDate || updatedBlock.date || getAbidjanDateStr();
    const isRoutine = Boolean(updatedBlock.isRoutine);

    if (isRoutine) {
      // Save/update in dailyRoutines
      setDailyRoutines(prev => {
        const list = Array.isArray(prev) ? prev : [];
        const existingIdx = list.findIndex(r => r.id === updatedBlock.id);
        let updated;
        if (existingIdx >= 0) {
          updated = list.map(r => r.id === updatedBlock.id ? { ...updatedBlock, isRoutine: true } : r);
        } else {
          updated = [...list, { ...updatedBlock, isRoutine: true }];
        }
        updated.sort((a, b) => (a.start || '').localeCompare(b.start || ''));
        localStorage.setItem(storageKey('daily_routines'), JSON.stringify(updated));
        pushMutationToCloud({ dailyRoutines: updated });
        return updated;
      });

      // Remove from customBlocksByDate if it was previously there
      setCustomBlocksByDate(prev => {
        const next = (prev && typeof prev === 'object' && !Array.isArray(prev)) ? { ...prev } : {};
        let modified = false;
        Object.keys(next).forEach(dKey => {
          if (Array.isArray(next[dKey])) {
            const filtered = next[dKey].filter(b => b && b.id !== updatedBlock.id);
            if (filtered.length !== next[dKey].length) {
              next[dKey] = filtered;
              modified = true;
            }
          }
        });
        if (modified) {
          localStorage.setItem(storageKey('custom_blocks_by_date'), JSON.stringify(next));
          pushMutationToCloud({ customBlocksByDate: next });
        }
        return modified ? next : prev;
      });
    } else {
      // Save in customBlocksByDate for finalDate
      const blockToSave = { ...updatedBlock, isRoutine: false, date: finalDate };

      setCustomBlocksByDate(prev => {
        const next = (prev && typeof prev === 'object' && !Array.isArray(prev)) ? { ...prev } : {};
        Object.keys(next).forEach(dKey => {
          if (Array.isArray(next[dKey])) {
            next[dKey] = next[dKey].filter(b => b && b.id !== updatedBlock.id);
          }
        });
        const targetList = Array.isArray(next[finalDate]) ? next[finalDate] : [];
        next[finalDate] = [...targetList, blockToSave].sort((a, b) => (a.start || '').localeCompare(b.start || ''));
        localStorage.setItem(storageKey('custom_blocks_by_date'), JSON.stringify(next));
        pushMutationToCloud({ customBlocksByDate: next });
        return next;
      });

      // Remove from dailyRoutines if it was previously a routine
      setDailyRoutines(prev => {
        const list = Array.isArray(prev) ? prev : [];
        const filtered = list.filter(r => r && r.id !== updatedBlock.id);
        if (filtered.length !== list.length) {
          localStorage.setItem(storageKey('daily_routines'), JSON.stringify(filtered));
          pushMutationToCloud({ dailyRoutines: filtered });
          return filtered;
        }
        return prev;
      });
    }
  };

  const handleDeleteBlock = (blockId, dayIndex, blockDate, isRoutine = false) => {
    if (isRoutine) {
      setDailyRoutines(prev => {
        const list = Array.isArray(prev) ? prev : [];
        const updated = list.filter(r => r && r.id !== blockId);
        localStorage.setItem(storageKey('daily_routines'), JSON.stringify(updated));
        pushMutationToCloud({ dailyRoutines: updated });
        return updated;
      });
    } else {
      setCustomBlocksByDate(prev => {
        const next = (prev && typeof prev === 'object' && !Array.isArray(prev)) ? { ...prev } : {};
        if (blockDate && Array.isArray(next[blockDate])) {
          next[blockDate] = next[blockDate].filter(b => b && b.id !== blockId);
        } else {
          Object.keys(next).forEach(dKey => {
            if (Array.isArray(next[dKey])) {
              next[dKey] = next[dKey].filter(b => b && b.id !== blockId);
            }
          });
        }
        localStorage.setItem(storageKey('custom_blocks_by_date'), JSON.stringify(next));
        pushMutationToCloud({ customBlocksByDate: next });
        return next;
      });
    }
  };

  // Schedule a Challenge 30 Days meeting into the calendar
  const handleScheduleChallengeRdv = (rdvData) => {
    const { 
      date, 
      start = '10:00', 
      end = '11:30', 
      companyName, 
      contactPerson = 'Décideur',
      phone = '', 
      location = '', 
      pricingModel = 'monthly',
      budget,
      objective = 'Présentation et démo du dashboard de gestion métier',
      prospectId = null
    } = rdvData;

    const rdvDate = date || getAbidjanDateStr();
    const formattedBudget = budget || (pricingModel === 'yearly' ? '300 000 FCFA / an' : '30 000 FCFA / mois');
    const blockId = rdvData.id || `rdv_challenge_${Date.now()}`;

    const newRdvBlock = {
      id: blockId,
      title: `🤝 RDV : ${companyName}`,
      subtitle: `${contactPerson} • ${formattedBudget}${location ? ' • ' + location : ''}`,
      start,
      end,
      color: '#00D4AA', // Distinctive emerald/teal
      checkable: true,
      isRoutine: false,
      isChallengeRdv: true,
      date: rdvDate,
      rdvDetails: {
        id: blockId,
        challengeProspectId: prospectId,
        companyName,
        contactPerson,
        phone,
        location,
        pricingModel,
        budget: formattedBudget,
        objective,
        status: rdvData.status || 'scheduled'
      }
    };

    setCustomBlocksByDate(prev => {
      const currentObj = (prev && typeof prev === 'object' && !Array.isArray(prev)) ? prev : {};
      const currentList = Array.isArray(currentObj[rdvDate]) ? currentObj[rdvDate] : [];
      // Remove any block with same id if updating
      const filtered = currentList.filter(b => b && b.id !== blockId);
      const updated = [...filtered, newRdvBlock].sort((a, b) => (a.start || '').localeCompare(b.start || ''));
      const next = { ...currentObj, [rdvDate]: updated };
      localStorage.setItem(storageKey('custom_blocks_by_date'), JSON.stringify(next));
      pushMutationToCloud({ customBlocksByDate: next });
      return next;
    });

    return newRdvBlock;
  };

  // Update meeting status (completed vs scheduled)
  const handleUpdateChallengeRdvStatus = (blockId, newStatus) => {
    setCustomBlocksByDate(prev => {
      const next = (prev && typeof prev === 'object' && !Array.isArray(prev)) ? { ...prev } : {};
      let changed = false;
      Object.keys(next).forEach(dKey => {
        if (Array.isArray(next[dKey])) {
          const idx = next[dKey].findIndex(b => b && b.id === blockId);
          if (idx >= 0) {
            const targetBlock = next[dKey][idx];
            const updatedBlock = {
              ...targetBlock,
              checked: newStatus === 'completed',
              rdvDetails: {
                ...(targetBlock.rdvDetails || {}),
                status: newStatus
              }
            };
            next[dKey] = [
              ...next[dKey].slice(0, idx),
              updatedBlock,
              ...next[dKey].slice(idx + 1)
            ];
            changed = true;
          }
        }
      });
      if (changed) {
        localStorage.setItem(storageKey('custom_blocks_by_date'), JSON.stringify(next));
        pushMutationToCloud({ customBlocksByDate: next });
        return next;
      }
      return prev;
    });

    // Also update checkedBlockIds
    setCheckedBlockIds(prev => {
      const list = Array.isArray(prev) ? prev : [];
      const next = newStatus === 'completed' 
        ? (list.includes(blockId) ? list : [...list, blockId])
        : list.filter(id => id !== blockId);
      localStorage.setItem(storageKey('checked_blocks'), JSON.stringify(next));
      pushMutationToCloud({ checkedBlockIds: next });
      return next;
    });
  };

  // Update meeting details (reschedule time/date, update notes/contact)
  const handleUpdateChallengeRdvDetails = (blockId, details) => {
    const { date, start, end, companyName, contactPerson, phone, location, pricingModel, budget, objective } = details;
    const targetDate = date || getAbidjanDateStr();

    setCustomBlocksByDate(prev => {
      const next = (prev && typeof prev === 'object' && !Array.isArray(prev)) ? { ...prev } : {};
      let oldBlock = null;

      // Find and remove old block from whichever date it was in
      Object.keys(next).forEach(dKey => {
        if (Array.isArray(next[dKey])) {
          const found = next[dKey].find(b => b && b.id === blockId);
          if (found) {
            oldBlock = found;
            next[dKey] = next[dKey].filter(b => b && b.id !== blockId);
          }
        }
      });

      const updatedBlock = {
        ...(oldBlock || {}),
        id: blockId,
        title: `🤝 RDV : ${companyName || oldBlock?.title?.replace('🤝 RDV : ', '') || 'Entreprise'}`,
        subtitle: `${contactPerson || 'Décideur'} • ${budget || '30 000 FCFA / mois'}${location ? ' • ' + location : ''}`,
        start: start || oldBlock?.start || '10:00',
        end: end || oldBlock?.end || '11:30',
        color: '#00D4AA',
        checkable: true,
        isRoutine: false,
        isChallengeRdv: true,
        date: targetDate,
        rdvDetails: {
          ...(oldBlock?.rdvDetails || {}),
          companyName,
          contactPerson,
          phone,
          location,
          pricingModel,
          budget,
          objective,
          status: oldBlock?.rdvDetails?.status || 'scheduled'
        }
      };

      const targetList = Array.isArray(next[targetDate]) ? next[targetDate] : [];
      next[targetDate] = [...targetList, updatedBlock].sort((a, b) => (a.start || '').localeCompare(b.start || ''));

      localStorage.setItem(storageKey('custom_blocks_by_date'), JSON.stringify(next));
      pushMutationToCloud({ customBlocksByDate: next });
      return next;
    });
  };

  // Delete meeting from calendar
  const handleDeleteChallengeRdv = (blockId, blockDate) => {
    handleDeleteBlock(blockId, null, blockDate, false);
    setCheckedBlockIds(prev => {
      const list = Array.isArray(prev) ? prev : [];
      const next = list.filter(id => id !== blockId);
      localStorage.setItem(storageKey('checked_blocks'), JSON.stringify(next));
      pushMutationToCloud({ checkedBlockIds: next });
      return next;
    });
  };

  const handleAddBlockToDay = (dayIndex, startTime = '09:00', isoDate = null) => {
    const [h, m] = startTime.split(':').map(Number);
    const endH = Math.min(23, h + 1);
    const endTime = `${endH.toString().padStart(2, '0')}:${(m || 0).toString().padStart(2, '0')}`;
    
    setNewTaskForm({
      title: '',
      subtitle: '',
      start: startTime,
      end: endTime,
      color: '#6C63FF',
      checkable: true,
      isRoutine: false,
      dayIndex: dayIndex,
      date: isoDate || getAbidjanDateStr()
    });
    setShowNewTaskModal(true);
  };

  const handleScheduleTask = (task, slot) => {
    const todayAbj = getAbidjanDateStr();
    const scheduledBlock = {
      ...task,
      start: slot.start,
      end: slot.end,
      subtitle: lang === 'en' ? `Optimized slot (${slot.durationMin}m)` : `Créneau optimisé (${slot.durationMin}m)`,
      date: todayAbj
    };

    setCustomBlocksByDate(prev => {
      const currentObj = (prev && typeof prev === 'object' && !Array.isArray(prev)) ? prev : {};
      const currentList = Array.isArray(currentObj[todayAbj]) ? currentObj[todayAbj] : [];
      const filtered = currentList.filter(b => b && b.id !== task.id);
      const next = {
        ...currentObj,
        [todayAbj]: [...filtered, scheduledBlock].sort((a, b) => (a.start || '').localeCompare(b.start || ''))
      };
      localStorage.setItem(storageKey('custom_blocks_by_date'), JSON.stringify(next));
      pushMutationToCloud({ customBlocksByDate: next });
      return next;
    });
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProjectForm.name.trim()) return;
    lastUserEditTimeRef.current = Date.now();
    
    const pKey = newProjectForm.priorityKey || 'normal';
    const statusVal = newProjectForm.status || 'Not Started';
    let statusType = 'slate';
    if (statusVal === 'In Progress') statusType = 'primary';
    else if (statusVal === 'Overdue') statusType = 'danger';
    else if (statusVal === 'Done') statusType = 'secondary';

    const newProj = { 
      id: `proj_${Date.now()}`, 
      name: newProjectForm.name, 
      subtitle: newProjectForm.subtitle, 
      description: newProjectForm.description || "Projet créé manuellement.", 
      status: statusVal, 
      statusType: statusType, 
      deadline: newProjectForm.deadline,
      priorityKey: pKey,
      priority: PRIORITY_LEVELS[pKey.toUpperCase()] || PRIORITY_LEVELS.NORMAL,
      completedAt: statusVal === 'Done' ? new Date().toISOString().split('T')[0] : null,
      subtasks: []
    };
    setProjects(prev => {
      const updated = [...prev, newProj];
      localStorage.setItem(storageKey('projects'), JSON.stringify(updated));
      localStorage.setItem(storageKey('projects_backup'), JSON.stringify(updated));
      pushMutationToCloud({ projects: updated });
      return updated;
    });
    setShowNewProjectModal(false);
    setNewProjectForm({ 
      name: '', 
      subtitle: 'Client externe', 
      description: '', 
      deadline: new Date().toISOString().split('T')[0],
      priorityKey: 'normal',
      status: 'Not Started'
    });
  };

  // Sub-task handlers for projects with 3-state cycling
  const handleToggleSubtask = (projectId, subtaskId) => {
    lastUserEditTimeRef.current = Date.now();
    setProjects(prev => {
      const updated = prev.map(p => {
        if (p.id !== projectId) return p;
        const updatedSubtasks = (p.subtasks || []).map(st => {
          if (st.id !== subtaskId) return st;
          const currentStatus = st.status || (st.completed ? 'done' : 'not_started');
          let nextStatus = 'in_progress';
          if (currentStatus === 'not_started') nextStatus = 'in_progress';
          else if (currentStatus === 'in_progress') nextStatus = 'done';
          else if (currentStatus === 'done') nextStatus = 'not_started';

          return {
            ...st,
            status: nextStatus,
            completed: nextStatus === 'done'
          };
        });

        const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every(st => (st.status === 'done' || st.completed));
        
        let nextStatus = p.status;
        let nextStatusType = p.statusType;
        let nextCompletedAt = p.completedAt;

        if (allDone) {
          nextStatus = 'Done';
          nextStatusType = 'secondary';
          nextCompletedAt = nextCompletedAt || new Date().toISOString().split('T')[0];
        } else if (p.status === 'Done') {
          nextStatus = 'In Progress';
          nextStatusType = 'primary';
          nextCompletedAt = null;
        }

        return { 
          ...p, 
          status: nextStatus,
          statusType: nextStatusType,
          completedAt: nextCompletedAt,
          subtasks: updatedSubtasks 
        };
      });
      localStorage.setItem(storageKey('projects'), JSON.stringify(updated));
      localStorage.setItem(storageKey('projects_backup'), JSON.stringify(updated));
      pushMutationToCloud({ projects: updated });
      return updated;
    });
  };

  const handleAddSubtask = (projectId, title) => {
    lastUserEditTimeRef.current = Date.now();
    setProjects(prev => {
      const updated = prev.map(p => {
        if (p.id !== projectId) return p;
        const newSubtask = { id: `st_${Date.now()}`, title, status: 'not_started', completed: false };
        return { ...p, subtasks: [...(p.subtasks || []), newSubtask] };
      });
      localStorage.setItem(storageKey('projects'), JSON.stringify(updated));
      localStorage.setItem(storageKey('projects_backup'), JSON.stringify(updated));
      pushMutationToCloud({ projects: updated });
      return updated;
    });
  };

  const handleDeleteSubtask = (projectId, subtaskId) => {
    lastUserEditTimeRef.current = Date.now();
    setProjects(prev => {
      const updated = prev.map(p => {
        if (p.id !== projectId) return p;
        return { ...p, subtasks: (p.subtasks || []).filter(st => st.id !== subtaskId) };
      });
      localStorage.setItem(storageKey('projects'), JSON.stringify(updated));
      localStorage.setItem(storageKey('projects_backup'), JSON.stringify(updated));
      pushMutationToCloud({ projects: updated });
      return updated;
    });
  };

  const handleSaveProject = (updatedProject) => {
    lastUserEditTimeRef.current = Date.now();
    setProjects(prev => {
      const updated = prev.map(p => {
        if (p.id !== updatedProject.id) return p;
        return {
          ...updatedProject,
          completedAt: updatedProject.status === 'Done' 
            ? (updatedProject.completedAt || new Date().toISOString().split('T')[0]) 
            : null
        };
      });
      localStorage.setItem(storageKey('projects'), JSON.stringify(updated));
      localStorage.setItem(storageKey('projects_backup'), JSON.stringify(updated));
      pushMutationToCloud({ projects: updated });
      return updated;
    });
  };

  const handleDeleteProject = (projectId) => {
    lastUserEditTimeRef.current = Date.now();
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== projectId);
      localStorage.setItem(storageKey('projects'), JSON.stringify(updated));
      localStorage.setItem(storageKey('projects_backup'), JSON.stringify(updated));
      pushMutationToCloud({ projects: updated });
      return updated;
    });
  };

  const handleCloseBriefing = () => {
    setShowDailyBriefing(false);
    localStorage.setItem(storageKey('briefing_seen_date'), getTodayStr());
  };

  const handleOpenFocus = (task = null) => {
    setActiveFocusTask(task);
    setShowFocusModal(true);
  };

  const weekScores = getLastNDaysScores(7);
  const yesterdayScores = weekScores.filter(s => s.score !== null);
  const yesterdayScore = yesterdayScores.length > 1 ? yesterdayScores[yesterdayScores.length - 2].score : 0;
  const yesterdayHydration = yesterdayScores.length > 1 ? (yesterdayScores[yesterdayScores.length - 2].hydration || 0) : 0;

  return (
    <div 
      data-theme={isDark ? 'dark' : 'light'}
      className={`flex flex-col min-h-screen md:h-screen md:overflow-hidden ${isDark ? 'dark' : ''} bg-background font-sans antialiased text-textMain relative transition-colors duration-300`}
    >
      {/* Mobile Dedicated Top Header (Clean, spacious, zero clutter, accessible tap targets) */}
      <header className="md:hidden sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-gray-200/80 dark:border-darkBorder px-4 py-2.5 flex items-center justify-between shadow-sm transition-colors">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-primary to-pink-500 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-primary/25 flex-shrink-0">
            M
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-extrabold text-sm text-textMain leading-none truncate">{t('appName')}</h1>
            <span className="text-[11px] text-textMuted font-medium truncate block mt-0.5">{t('userName')} 👋</span>
          </div>
        </div>

        {/* Right: Clean, balanced mobile actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Quick Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="h-9 px-2.5 rounded-xl border border-gray-200 dark:border-darkBorder bg-background hover:border-primary text-xs font-extrabold text-textMain flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            title="Switch language"
            aria-label="Switch language"
          >
            <Globe size={14} className="text-primary" />
            <span>{lang === 'en' ? 'EN' : 'FR'}</span>
          </button>

          {/* Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="w-9 h-9 rounded-xl bg-background border border-gray-200 dark:border-darkBorder flex items-center justify-center text-textMain hover:border-primary active:scale-95 transition-all shadow-sm flex-shrink-0"
            title={t('menu')}
            aria-label={t('menu')}
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 h-full md:overflow-hidden">
        <Sidebar 
          onNewTask={() => {
            const todayDayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
            setNewTaskForm({ 
              title: '', 
              subtitle: '',
              start: '09:00', 
              end: '10:30', 
              color: '#6C63FF', 
              checkable: true, 
              isRoutine: false,
              dayIndex: todayDayIdx,
              date: getAbidjanDateStr()
            });
            setShowNewTaskModal(true);
          }} 
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
          syncStatus={syncStatus}
          lastSyncTime={lastSyncTime}
          onForceSync={handleForceSync}
          onOpenTour={() => setShowOnboardingTour(true)}
          hasUnreadMonthlyRecap={hasUnreadRecap}
        />
        
        <main className={`flex-1 flex flex-col min-w-0 p-3.5 sm:p-6 max-w-[1600px] w-full mx-auto min-h-0 h-full ${isWeekPage ? 'md:overflow-hidden md:p-4 lg:p-6' : 'overflow-y-auto lg:p-8'}`}>
          {/* Unread Monthly Recap Top Banner (Triggered on 1st of month or simulation) */}
          {hasUnreadRecap && location.pathname !== '/monthly-review' && (
            <div className="mb-4 bg-gradient-to-r from-primary via-indigo-600 to-purple-600 text-white rounded-2xl p-3.5 sm:p-4 shadow-lg flex items-center justify-between gap-3 animate-in slide-in-from-top duration-300">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold flex-shrink-0">
                  <Sparkles size={18} className="animate-pulse text-amber-300" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-black leading-tight truncate">
                    {lang === 'en' 
                      ? `📊 Monthly Review Ready: ${formatMonthLabel(recapMonthKey, lang)}` 
                      : `📊 Bilan Mensuel Prêt : ${formatMonthLabel(recapMonthKey, lang)}`}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-white/80 truncate mt-0.5">
                    {lang === 'en' 
                      ? "It's the 1st of the month! Discover your performance highlights and strategic AI coaching." 
                      : "C'est le 1er du mois ! Découvrez vos performances et vos axes d'efforts recommandés par l'IA."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  to={`/monthly-review?month=${recapMonthKey}`}
                  onClick={() => dismissRecap()}
                  className="bg-white text-primary hover:bg-white/95 text-xs font-black px-3.5 py-2 rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
                >
                  <span>{lang === 'en' ? 'View Review' : 'Voir mon bilan'}</span>
                  <ArrowRight size={13} />
                </Link>
                <button
                  onClick={() => dismissRecap()}
                  className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  title="Fermer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          <Routes>
            <Route 
              path="/" 
              element={
                <Today 
                  score={score} 
                  completedCount={completedCount} 
                  totalCount={totalCount} 
                  streak={streak} 
                  hydrationMl={hydrationMl} 
                  onAddWater={handleAddWater} 
                  todayBlocks={annotatedTodayBlocks} 
                  onToggleCheckBlock={handleToggleCheckBlock}
                  weekBlocksByDay={annotatedWeekBlocksByDay}
                  onOpenFocusWithTask={handleOpenFocus}
                  onOpenDailyBriefing={() => setShowDailyBriefing(true)}
                  onOpenCoach={() => setIsCopilotOpen(true)}
                  onUpdateRdvStatus={handleUpdateChallengeRdvStatus}
                  onUpdateRdvDetails={handleUpdateChallengeRdvDetails}
                  onDeleteRdv={handleDeleteChallengeRdv}
                />
              } 
            />
            <Route 
              path="/week" 
              element={
                <Week 
                  blocksByDay={annotatedWeekBlocksByDay} 
                  getDayBlocks={getDayBlocks}
                  todayBlocks={annotatedTodayBlocks} 
                  projects={projects}
                  dailyRoutines={dailyRoutines}
                  onToggleCheckBlock={handleToggleCheckBlock} 
                  onNewTask={() => {
                    setNewTaskForm({ 
                      title: '', 
                      subtitle: '',
                      start: '09:00', 
                      end: '10:30', 
                      color: '#6C63FF', 
                      checkable: true, 
                      isRoutine: false,
                      dayIndex: todayDayIdx,
                      date: getAbidjanDateStr()
                    });
                    setShowNewTaskModal(true);
                  }} 
                  onSaveBlock={handleSaveBlock}
                  onDeleteBlock={handleDeleteBlock}
                  onAddBlockToDay={handleAddBlockToDay}
                  onUpdateRdvStatus={handleUpdateChallengeRdvStatus}
                  onUpdateRdvDetails={handleUpdateChallengeRdvDetails}
                  onDeleteRdv={handleDeleteChallengeRdv}
                />
              } 
            />
              <Route 
                path="/projects" 
                element={
                  <Projects 
                    projects={projects} 
                    onNewProject={() => setShowNewProjectModal(true)}
                    onToggleSubtask={handleToggleSubtask}
                    onAddSubtask={handleAddSubtask}
                    onDeleteSubtask={handleDeleteSubtask}
                    onSaveProject={handleSaveProject}
                    onDeleteProject={handleDeleteProject}
                  />
                } 
              />
              <Route path="/stats" element={<Stats hydrationMl={hydrationMl} />} />
              <Route 
                path="/challenge" 
                element={
                  <Challenge30Days 
                    challengeData={challengeData}
                    onUpdateChallenge={handleUpdateChallenge}
                    onScheduleChallengeRdv={handleScheduleChallengeRdv}
                  />
                } 
              />
              <Route 
                path="/monthly-review" 
                element={
                  <MonthlyReview 
                    projects={projects} 
                    onOpenCoach={() => setIsCopilotOpen(true)}
                    onSimulateFirstOfMonth={triggerSimulation}
                    isSimulated={isSimulated}
                  />
                } 
              />
            </Routes>
          </main>
        </div>

        {/* Mobile Navigation Bar with integrated Coach IA button */}
        <BottomNav onOpenCoach={() => setIsCopilotOpen(true)} isDark={isDark} onToggleTheme={handleToggleTheme} />

        {/* Mobile Slide-in Drawer */}
        <MobileDrawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
          onOpenFocus={() => handleOpenFocus(null)}
          onOpenBriefing={() => setShowDailyBriefing(true)}
          onOpenCoach={() => setIsCopilotOpen(true)}
          onOpenTour={() => setShowOnboardingTour(true)}
          onOpenInstall={() => setShowInstallModal(true)}
          onClearSchedule={handleClearSchedule}
          syncStatus={syncStatus}
          lastSyncTime={lastSyncTime}
          onForceSync={handleForceSync}
          hasUnreadMonthlyRecap={hasUnreadRecap}
        />

        {/* Onboarding Welcome Tour Modal */}
        <OnboardingModal
          isOpen={showOnboardingTour}
          onClose={() => {
            setShowOnboardingTour(false);
            localStorage.setItem(storageKey('tour_seen'), 'true');
          }}
        />

        {/* PWA / iPhone Install Modal */}
        <PWAInstallModal
          isOpen={showInstallModal}
          onClose={() => setShowInstallModal(false)}
        />



        {/* Priority Coach Copilot (Floating bottom-right button on desktop, integrated in BottomNav on mobile) */}
        <PriorityCopilot
          isOpen={isCopilotOpen}
          onClose={() => setIsCopilotOpen(prev => !prev)}
          tasks={todayBlocks.filter(b => b.checkable && !b.checked)}
          todayBlocks={todayBlocks}
          hydrationMl={hydrationMl}
          hydrationTarget={1925}
          onScheduleTask={handleScheduleTask}
          onOpenFocusWithTask={handleOpenFocus}
        />

        {/* Daily Briefing Popup (Shows once/day on load or on click) */}
        <DailyBriefingModal
          isOpen={showDailyBriefing}
          onClose={handleCloseBriefing}
          yesterdayScore={yesterdayScore}
          yesterdayHydration={yesterdayHydration}
          streak={streak}
          todayBlocks={annotatedTodayBlocks}
          projects={projects}
          hydrationMl={hydrationMl}
          hydrationTarget={1925}
          weekScores={weekScores}
          onOpenCoach={() => setIsCopilotOpen(true)}
        />

        {/* Interactive Focus Studio Timer Modal */}
        <FocusTimerModal
          isOpen={showFocusModal}
          onClose={() => setShowFocusModal(false)}
          initialTask={activeFocusTask}
        />

        {/* Persistent Floating Mini Focus Bar (Shows when session is active and modal is closed) */}
        <MiniFocusBar 
          isModalOpen={showFocusModal} 
          onOpenModal={() => setShowFocusModal(true)} 
        />

        {/* New Task Modal with Conflict Detection & Blocked Hours Indicator */}
        <NewTaskModal
          isOpen={showNewTaskModal}
          onClose={() => setShowNewTaskModal(false)}
          form={newTaskForm}
          setForm={setNewTaskForm}
          onSubmit={handleCreateTask}
          getDayBlocks={getDayBlocks}
          dailyRoutines={dailyRoutines}
        />

        {/* New Project Modal with Importance Selector, Status Selector & Calendar Date Picker */}
        {showNewProjectModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-card rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-darkBorder transition-colors max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-darkBorder">
                <h3 className="text-lg font-bold text-textMain">{t('newProjectModalTitle')}</h3>
                <button onClick={() => setShowNewProjectModal(false)} className="text-textMuted hover:text-textMain font-bold">✕</button>
              </div>
              <form onSubmit={handleCreateProject} className="space-y-4 pt-4">
                <div>
                  <label className="text-xs font-semibold text-textMuted block mb-1">{t('projectNameLabel')}</label>
                  <input type="text" required placeholder={t('projectNamePlaceholder')} value={newProjectForm.name} onChange={(e) => setNewProjectForm({ ...newProjectForm, name: e.target.value })} className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-sm text-textMain focus:outline-none focus:border-primary" />
                </div>

                {/* Priority / Importance Selector */}
                <div>
                  <label className="text-xs font-semibold text-textMuted block mb-1.5 flex items-center gap-1">
                    <span>{t('projectPriorityLabel')}</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { key: 'low', label: t('priorityLow'), ...PRIORITY_LEVELS.LOW },
                      { key: 'normal', label: t('priorityNormal'), ...PRIORITY_LEVELS.NORMAL },
                      { key: 'important', label: t('priorityImportant'), ...PRIORITY_LEVELS.IMPORTANT },
                      { key: 'urgent', label: t('priorityUrgent'), ...PRIORITY_LEVELS.URGENT }
                    ].map((opt) => {
                      const isSelected = (newProjectForm.priorityKey || 'normal') === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setNewProjectForm({ ...newProjectForm, priorityKey: opt.key })}
                          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 border ${
                            isSelected 
                              ? `${opt.bg} ${opt.color} ${opt.border} shadow-md scale-[1.02]` 
                              : 'bg-background text-textMuted border-gray-200 dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <span>{opt.emoji}</span>
                          <span className="text-[10px] truncate max-w-full">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-textMuted block mb-1">{t('categoryLabel')}</label>
                    <input type="text" value={newProjectForm.subtitle} onChange={(e) => setNewProjectForm({ ...newProjectForm, subtitle: e.target.value })} className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-sm text-textMain focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-textMuted block mb-1">{t('deadlineLabel')}</label>
                    <input 
                      type="date" 
                      required
                      value={newProjectForm.deadline} 
                      onChange={(e) => setNewProjectForm({ ...newProjectForm, deadline: e.target.value })} 
                      className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-sm text-textMain focus:outline-none focus:border-primary cursor-pointer" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-textMuted block mb-1">{t('initialStatusLabel')}</label>
                  <select
                    value={newProjectForm.status}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, status: e.target.value })}
                    className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-sm text-textMain focus:outline-none focus:border-primary cursor-pointer font-medium"
                  >
                    <option value="Not Started">⚪ {t('statusNotStarted')}</option>
                    <option value="In Progress">⏳ {t('statusInProgress')}</option>
                    <option value="Overdue">🔴 {t('statusOverdue')}</option>
                    <option value="Done">✅ {t('statusDone')}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-textMuted block mb-1">{t('descriptionLabel')}</label>
                  <textarea rows={2} placeholder={lang === 'en' ? 'Project details & milestones...' : 'Détails du projet...'} value={newProjectForm.description} onChange={(e) => setNewProjectForm({ ...newProjectForm, description: e.target.value })} className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-sm text-textMain focus:outline-none focus:border-primary" />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-darkBorder">
                  <button type="button" onClick={() => setShowNewProjectModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-textMuted hover:bg-gray-100 dark:hover:bg-darkCard">{t('cancel')}</button>
                  <button type="submit" className="bg-primary hover:bg-primary/90 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-sm">{t('createProjectBtn')}</button>
                </div>
              </form>
            </div>
          </div>
        )}


        {/* PWA Install Prompt Banner / Bottom Sheet */}
        <PWAInstallPrompt />

      </div>
  );
};

const App = () => {
  return (
    <FocusProvider>
      <Router>
        <AppContent />
      </Router>
    </FocusProvider>
  );
};

export default App;
