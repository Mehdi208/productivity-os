import { useState, useEffect, useCallback } from 'react';
import { showSystemNotification, getNotificationPermission } from '../utils/notificationService';
import { playTimerAlarm } from '../utils/audioAlert';
import { formatMonthLabel } from '../data/monthlyReviewEngine';

const STORAGE_NOTIFIED_KEY = 'pos_monthly_recap_notified_system_';
const STORAGE_SEEN_KEY = 'pos_monthly_recap_seen_';
const STORAGE_SIMULATION_KEY = 'pos_monthly_recap_simulated';

export const useMonthlyRecapWatcher = (lang = 'fr') => {
  const [hasUnreadRecap, setHasUnreadRecap] = useState(false);
  const [recapMonthKey, setRecapMonthKey] = useState('');
  const [isSimulated, setIsSimulated] = useState(false);

  // Helper to compute previous month key
  const computePreviousMonthKey = () => {
    const now = new Date();
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  };

  const checkMonthlyRecapStatus = useCallback(async () => {
    const now = new Date();
    const isFirstDay = now.getDate() === 1;
    const prevMonthKey = computePreviousMonthKey();
    
    // Check if simulation was requested
    const simulationFlag = localStorage.getItem(STORAGE_SIMULATION_KEY);
    const shouldTrigger = isFirstDay || simulationFlag === 'true';

    setRecapMonthKey(prevMonthKey);
    setIsSimulated(simulationFlag === 'true' && !isFirstDay);

    if (shouldTrigger) {
      const isSeen = localStorage.getItem(`${STORAGE_SEEN_KEY}${prevMonthKey}`);
      if (!isSeen) {
        setHasUnreadRecap(true);

        // System notification trigger (once per month)
        const isNotified = localStorage.getItem(`${STORAGE_NOTIFIED_KEY}${prevMonthKey}`);
        if (!isNotified && getNotificationPermission() === 'granted') {
          try {
            playTimerAlarm('digital', 0.6);
          } catch {}

          const monthName = formatMonthLabel(prevMonthKey, lang);
          const title = lang === 'en'
            ? `📊 Monthly Review Ready: ${monthName}`
            : `📊 Bilan Mensuel Prêt : ${monthName}`;
          const body = lang === 'en'
            ? "It's the 1st of the month! Check your performance and AI recommendations."
            : "C'est le 1er du mois ! Découvrez vos performances et conseils IA pour progresser.";

          await showSystemNotification(title, {
            body,
            icon: '/favicon.svg',
            tag: `monthly-recap-${prevMonthKey}`,
            data: { url: `/monthly-review?month=${prevMonthKey}` }
          });

          localStorage.setItem(`${STORAGE_NOTIFIED_KEY}${prevMonthKey}`, 'true');
        }
      } else {
        setHasUnreadRecap(false);
      }
    } else {
      setHasUnreadRecap(false);
    }
  }, [lang]);

  useEffect(() => {
    checkMonthlyRecapStatus();
    // Check every minute
    const timer = setInterval(checkMonthlyRecapStatus, 60000);
    return () => clearInterval(timer);
  }, [checkMonthlyRecapStatus]);

  // Dismiss / Mark as viewed
  const dismissRecap = useCallback((monthKey = null) => {
    const target = monthKey || recapMonthKey;
    if (target) {
      localStorage.setItem(`${STORAGE_SEEN_KEY}${target}`, 'true');
      localStorage.removeItem(STORAGE_SIMULATION_KEY);
      setHasUnreadRecap(false);
      setIsSimulated(false);
    }
  }, [recapMonthKey]);

  // Simulation handler for instant testing
  const triggerSimulation = useCallback(async () => {
    const prevMonthKey = computePreviousMonthKey();
    localStorage.setItem(STORAGE_SIMULATION_KEY, 'true');
    localStorage.removeItem(`${STORAGE_SEEN_KEY}${prevMonthKey}`);
    localStorage.removeItem(`${STORAGE_NOTIFIED_KEY}${prevMonthKey}`);

    setIsSimulated(true);
    setHasUnreadRecap(true);
    setRecapMonthKey(prevMonthKey);

    // Play chime sound
    try {
      playTimerAlarm('digital', 0.6);
    } catch {}

    // Show system notification
    const monthName = formatMonthLabel(prevMonthKey, lang);
    const title = lang === 'en'
      ? `📊 [Test 1st of Month] Review Ready: ${monthName}`
      : `📊 [Test 1er du Mois] Bilan Prêt : ${monthName}`;
    const body = lang === 'en'
      ? "Simulation active: Discover your monthly recap and AI coaching."
      : "Simulation active : Découvrez votre récapitulatif mensuel et votre coaching IA.";

    await showSystemNotification(title, {
      body,
      icon: '/favicon.svg',
      tag: `test-monthly-recap-${Date.now()}`
    });
  }, [lang]);

  return {
    hasUnreadRecap,
    recapMonthKey,
    isSimulated,
    dismissRecap,
    triggerSimulation,
    checkMonthlyRecapStatus
  };
};
