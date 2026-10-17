import { useEffect, useRef } from 'react';
import { showSystemNotification, getNotificationPermission } from '../utils/notificationService';
import { playTimerAlarm } from '../utils/audioAlert';
import { getAbidjanDateStr } from '../data/scoreHistory';
import { getMinutesSinceLastHydration } from '../data/mustNotDoEngine';

export const useMustNotDoNotificationWatcher = (mustNotDoData, onHydrationNudge) => {
  const sentAlertsRef = useRef(new Set());
  const lastHydrationAlertRef = useRef(0);

  useEffect(() => {
    if (!mustNotDoData || mustNotDoData.notificationsEnabled === false) return;

    const checkMustNotDoAlerts = async () => {
      if (getNotificationPermission() !== 'granted') return;

      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const hhmm = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const todayStr = getAbidjanDateStr(now);

      const storageKey = `pos_must_not_do_notified_${todayStr}`;

      // Load already sent alerts for today
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.forEach((item) => sentAlertsRef.current.add(item));
        }
      } catch {}

      const markSent = (alertKey) => {
        sentAlertsRef.current.add(alertKey);
        try {
          localStorage.setItem(storageKey, JSON.stringify(Array.from(sentAlertsRef.current)));
        } catch {}
      };

      // -------------------------------------------------------------
      // 1. PETIT-DÉJEUNER : RÈGLE D'ARRÊT À 07H00
      // -------------------------------------------------------------
      // 06:45 -> 15 min reminder before close
      if (hhmm === '06:45' && !sentAlertsRef.current.has('breakfast_15m_warning')) {
        markSent('breakfast_15m_warning');
        try { playTimerAlarm('digital', 0.6); } catch {}
        await showSystemNotification('⏰ Clôture Petit-déjeuner dans 15 min !', {
          body: 'Règle Must-Not-Do : Arrêt impératif à 07h00. Prenez votre repas avant la fermeture du créneau.',
          tag: 'must-not-do-breakfast-warning',
          renotify: true
        });
      }

      // 07:00 -> Strict close notification
      if (hhmm === '07:00' && !sentAlertsRef.current.has('breakfast_closed_lock')) {
        markSent('breakfast_closed_lock');
        try { playTimerAlarm('digital', 0.6); } catch {}
        await showSystemNotification('🚫 07h00 : Clôture du Petit-déjeuner !', {
          body: 'Règle Must-Not-Do active : Aucun grignotage ni repas jusqu\'à 12h00 pour préserver votre discipline métabolique.',
          tag: 'must-not-do-breakfast-closed',
          renotify: true
        });
      }

      // -------------------------------------------------------------
      // 2. DÉJEUNER : CRÉNEAU STRICT 12H00 - 12H45
      // -------------------------------------------------------------
      // 12:00 -> Lunch window OPEN
      if (hhmm === '12:00' && !sentAlertsRef.current.has('lunch_window_opened')) {
        markSent('lunch_window_opened');
        try { playTimerAlarm('digital', 0.6); } catch {}
        await showSystemNotification('🍽️ 12h00 : Ouverture créneau Déjeuner !', {
          body: 'Vous avez 45 minutes (jusqu\'à 12h45) pour prendre votre repas de midi. Ne sautez pas ce repas !',
          tag: 'must-not-do-lunch-opened',
          renotify: true
        });
      }

      // 12:35 -> 10 minutes left
      if (hhmm === '12:35' && !sentAlertsRef.current.has('lunch_10m_warning')) {
        markSent('lunch_10m_warning');
        try { playTimerAlarm('digital', 0.6); } catch {}
        await showSystemNotification('⏰ 12h35 : Plus que 10 minutes pour déjeuner !', {
          body: 'Règle Must-Not-Do : Fin du repas à 12h45 pile. Finalisez votre assiette.',
          tag: 'must-not-do-lunch-warning',
          renotify: true
        });
      }

      // 12:45 -> Lunch window CLOSED
      if (hhmm === '12:45' && !sentAlertsRef.current.has('lunch_window_closed')) {
        markSent('lunch_window_closed');
        try { playTimerAlarm('digital', 0.6); } catch {}
        await showSystemNotification('🚫 12h45 : Fin du créneau Déjeuner', {
          body: 'Créneau 12h00-12h45 terminé. Clôture de l\'alimentation jusqu\'au dîner.',
          tag: 'must-not-do-lunch-closed',
          renotify: true
        });
      }

      // -------------------------------------------------------------
      // 3. HYDRATATION RÉGULIÈRE (RECOMMANDATION SCIENTIFIQUE : 60 MIN)
      // -------------------------------------------------------------
      // Only notify between 07:00 and 22:00 (active daytime)
      if (hours >= 7 && hours <= 22) {
        const intervalMin = mustNotDoData.hydrationIntervalMinutes || 60;
        const lastTimestamp = mustNotDoData.lastHydrationTimestamp || Date.now();
        const elapsedMinutes = getMinutesSinceLastHydration(lastTimestamp);

        // Check if elapsed time exceeded interval, and we haven't alerted in the last 45 minutes
        const nowMs = Date.now();
        const timeSinceLastAlertMs = nowMs - lastHydrationAlertRef.current;
        const minTimeBetweenAlertsMs = Math.max(30, intervalMin - 15) * 60 * 1000;

        if (elapsedMinutes >= intervalMin && timeSinceLastAlertMs > minTimeBetweenAlertsMs) {
          lastHydrationAlertRef.current = nowMs;
          try { playTimerAlarm('digital', 0.5); } catch {}

          await showSystemNotification('💧 Pause Hydratation (Alerte Santé)', {
            body: `Il s'est écoulé ${elapsedMinutes} min sans boire. Buvez un verre d'eau (200-250 ml) pour maintenir concentration et vitalité.`,
            tag: `must-not-do-hydration-${Math.floor(nowMs / (60 * 1000))}`,
            renotify: true
          });

          if (onHydrationNudge) {
            onHydrationNudge(elapsedMinutes);
          }
        }
      }
    };

    // Check immediately and then every 20 seconds
    checkMustNotDoAlerts();
    const interval = setInterval(checkMustNotDoAlerts, 20000);

    return () => clearInterval(interval);
  }, [mustNotDoData]);
};
