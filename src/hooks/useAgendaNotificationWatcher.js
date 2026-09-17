import { useEffect, useRef } from 'react';
import { showSystemNotification, getNotificationPermission } from '../utils/notificationService';
import { playTimerAlarm } from '../utils/audioAlert';
import { getAbidjanDateStr } from '../data/scoreHistory';

export const useAgendaNotificationWatcher = (todayBlocks) => {
  const checkedRef = useRef(new Set());

  useEffect(() => {
    if (!todayBlocks || todayBlocks.length === 0) return;

    const checkUpcomingBlocks = async () => {
      if (getNotificationPermission() !== 'granted') return;

      const now = new Date();
      // Format current time as HH:MM
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentHHMM = `${currentHours}:${currentMinutes}`;

      const todayStr = getAbidjanDateStr(now);
      const storageKey = `pos_agenda_notified_${todayStr}`;

      // Load already notified block IDs for today
      let notifiedSet = checkedRef.current;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.forEach((id) => notifiedSet.add(id));
        }
      } catch {}

      for (const block of todayBlocks) {
        if (!block || !block.start) continue;

        // Trigger if block starts right at the current minute and hasn't been notified today
        if (block.start === currentHHMM && !notifiedSet.has(block.id)) {
          notifiedSet.add(block.id);
          try {
            localStorage.setItem(storageKey, JSON.stringify(Array.from(notifiedSet)));
          } catch {}

          // 1. Play chime
          try {
            playTimerAlarm('digital', 0.6);
          } catch {}

          // 2. Trigger native system notification
          await showSystemNotification(`🎯 ${block.start} : ${block.title}`, {
            body: block.subtitle || "C'est l'heure de votre créneau planifié dans votre agenda !",
            icon: '/favicon.svg',
            tag: `agenda-task-${block.id}`,
            renotify: true,
            vibrate: [250, 100, 250, 100, 500]
          });
        }
      }
    };

    // Check immediately and then every 20 seconds
    checkUpcomingBlocks();
    const interval = setInterval(checkUpcomingBlocks, 20000);

    return () => clearInterval(interval);
  }, [todayBlocks]);
};
