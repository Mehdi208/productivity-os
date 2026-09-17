// Priority Engine — Eisenhower scoring, sorting, and slot suggestions

/**
 * Priority levels with high-contrast, solid vibrant colors (No pale gray backgrounds)
 */
export const PRIORITY_LEVELS = {
  URGENT: { 
    key: 'urgent', 
    label: 'Urgent', 
    emoji: '🔴', 
    color: 'text-white', 
    bg: 'bg-red-600', 
    border: 'border-red-700', 
    weight: 4 
  },
  IMPORTANT: { 
    key: 'important', 
    label: 'Important', 
    emoji: '🟠', 
    color: 'text-white', 
    bg: 'bg-amber-500', 
    border: 'border-amber-600', 
    weight: 3 
  },
  NORMAL: { 
    key: 'normal', 
    label: 'Normal', 
    emoji: '🟡', 
    color: 'text-white', 
    bg: 'bg-indigo-600', 
    border: 'border-indigo-700', 
    weight: 2 
  },
  LOW: { 
    key: 'low', 
    label: 'Secondaire', 
    emoji: '🟢', 
    color: 'text-white', 
    bg: 'bg-emerald-600', 
    border: 'border-emerald-700', 
    weight: 1 
  },
};

export const autoPriority = (task) => {
  if (task.status === 'Overdue' || task.statusType === 'danger') {
    return PRIORITY_LEVELS.URGENT;
  }

  if (task.deadline) {
    const deadlineDate = parseDeadline(task.deadline);
    if (deadlineDate) {
      const daysLeft = Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 0) return PRIORITY_LEVELS.URGENT;
      if (daysLeft <= 3) return PRIORITY_LEVELS.IMPORTANT;
      if (daysLeft <= 7) return PRIORITY_LEVELS.NORMAL;
    }
  }

  if (task.progress && task.progress >= 80) {
    return PRIORITY_LEVELS.IMPORTANT;
  }

  return PRIORITY_LEVELS.NORMAL;
};

const parseDeadline = (deadlineStr) => {
  if (!deadlineStr) return null;
  const isoDate = new Date(deadlineStr);
  if (!isNaN(isoDate.getTime()) && deadlineStr.includes('-')) return isoDate;

  const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  const parts = deadlineStr.trim().split(/\s+/);
  if (parts.length === 2) {
    const month = months[parts[0]];
    const day = parseInt(parts[1], 10);
    if (month !== undefined && !isNaN(day)) {
      const year = new Date().getFullYear();
      return new Date(year, month, day);
    }
  }
  return null;
};

export const sortByPriority = (items) => {
  return [...items].sort((a, b) => {
    const aPriority = a.priority || autoPriority(a);
    const bPriority = b.priority || autoPriority(b);
    return bPriority.weight - aPriority.weight;
  });
};

export const getFreeSlots = (blocks = [], dayStart = "05:00", dayEnd = "23:00") => {
  const toMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  const fromMinutes = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const sortedBlocks = [...blocks]
    .filter(b => b.start && b.end)
    .sort((a, b) => a.start.localeCompare(b.start));

  const freeSlots = [];
  let cursor = toMinutes(dayStart);
  const endOfDay = toMinutes(dayEnd);

  for (const block of sortedBlocks) {
    const blockStart = toMinutes(block.start);
    const blockEnd = toMinutes(block.end);

    if (blockStart > cursor) {
      const duration = blockStart - cursor;
      if (duration >= 30) {
        freeSlots.push({
          start: fromMinutes(cursor),
          end: fromMinutes(blockStart),
          durationMin: duration,
          label: `${fromMinutes(cursor)} - ${fromMinutes(blockStart)} (${duration} min)`,
        });
      }
    }
    cursor = Math.max(cursor, blockEnd);
  }

  if (cursor < endOfDay) {
    const duration = endOfDay - cursor;
    if (duration >= 30) {
      freeSlots.push({
        start: fromMinutes(cursor),
        end: fromMinutes(endOfDay),
        durationMin: duration,
        label: `${fromMinutes(cursor)} - ${fromMinutes(endOfDay)} (${duration} min)`,
      });
    }
  }

  return freeSlots;
};

export const suggestSlotAssignments = (tasks, freeSlots) => {
  const suggestions = [];
  const usedSlots = new Set();
  const sorted = sortByPriority(tasks);

  for (const task of sorted) {
    const estimatedMin = task.estimatedMin || 60;
    let bestSlot = null;
    let bestIdx = -1;
    for (let i = 0; i < freeSlots.length; i++) {
      if (usedSlots.has(i)) continue;
      if (freeSlots[i].durationMin >= estimatedMin) {
        if (!bestSlot || freeSlots[i].durationMin < bestSlot.durationMin) {
          bestSlot = freeSlots[i];
          bestIdx = i;
        }
      }
    }

    if (bestSlot && bestIdx >= 0) {
      suggestions.push({
        task,
        slot: bestSlot,
        priority: task.priority || autoPriority(task),
      });
      usedSlots.add(bestIdx);
    }
  }

  return suggestions;
};

export const getMotivationalMessage = (score, streak, lang = 'en') => {
  const isFr = lang === 'fr';

  if (score >= 90 && streak >= 5) {
    return isFr
      ? "🏆 Une dynamique exemplaire ! Votre régularité est la clé de vos plus grandes réussites."
      : "🏆 Exemplary momentum! Your consistency is the foundation of your greatest achievements.";
  }
  if (score >= 80) {
    return isFr
      ? "🔥 Excellente performance hier ! Poursuivez sur cette lancée pour concrétiser vos objectifs du jour."
      : "🔥 Outstanding performance yesterday! Keep this positive momentum going to conquer today's goals.";
  }
  if (score >= 50) {
    return isFr
      ? "📈 Vous avancez dans la bonne direction. Concentrez votre énergie sur les blocs clés dès ce matin."
      : "📈 You are moving in the right direction. Channel your energy into your key blocks this morning.";
  }
  if (streak > 0) {
    return isFr
      ? `🔥 Belle constance de ${streak} jour${streak > 1 ? 's' : ''} ! Restez focus pour continuer la série.`
      : `🔥 Solid consistency with a ${streak}-day streak! Stay focused to keep the chain unbroken.`;
  }
  return isFr
    ? "☀️ Bienvenue dans votre cockpit de productivité. Préparez-vous à accomplir de grands projets aujourd'hui."
    : "☀️ Welcome to your productivity operating system. Get ready to achieve great milestones today.";
};
