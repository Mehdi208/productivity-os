// Score History — Save/Load daily scores, compute real streak, custom date lookup & Hydration Analytics
const STORAGE_KEY = 'pos_emmanuella_score_history';

// Timezone Helper: Côte d'Ivoire (Africa/Abidjan, UTC+0 / GMT)
export const getAbidjanDateStr = () => {
  return new Intl.DateTimeFormat('fr-CA', {
    timeZone: 'Africa/Abidjan',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
};

export const getTodayStr = () => getAbidjanDateStr();

export const loadScoreHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveDayScore = (dateStr, data) => {
  const history = loadScoreHistory();
  const existing = history[dateStr] || {};
  history[dateStr] = {
    ...existing,
    ...data,
    score: data.score !== undefined ? Math.round(data.score) : (existing.score || 0),
    completed: data.completed !== undefined ? data.completed : (existing.completed || 0),
    total: data.total !== undefined ? data.total : (existing.total || 0),
    hydration: data.hydration !== undefined ? data.hydration : (existing.hydration || 0),
    timestamp: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return history;
};

export const getDayScore = (dateStr) => {
  const history = loadScoreHistory();
  return history[dateStr] || null;
};

// Current Calendar Week (Strictly Monday to Sunday)
export const getCurrentWeekScores = () => {
  const history = loadScoreHistory();
  const today = new Date();
  
  // Calculate Monday of current week in Abidjan
  const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = (currentDayOfWeek + 6) % 7; // Monday = 0, Tuesday = 1, ... Sunday = 6
  
  const monday = new Date(today);
  monday.setDate(today.getDate() - distanceToMonday);
  
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const result = [];
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = new Intl.DateTimeFormat('fr-CA', {
      timeZone: 'Africa/Abidjan',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d);
    
    const entry = history[dateStr];
    result.push({
      date: dateStr,
      day: dayNames[i],
      score: entry !== undefined ? entry.score : 0,
      completed: entry ? entry.completed : 0,
      total: entry ? entry.total : 0,
      hydration: entry ? entry.hydration : 0,
    });
  }
  return result;
};

export const getLastNDaysScores = (n = 7) => {
  if (n === 7) {
    return getCurrentWeekScores();
  }
  const history = loadScoreHistory();
  const result = [];
  const today = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = new Intl.DateTimeFormat('fr-CA', {
      timeZone: 'Africa/Abidjan',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d);
    
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const entry = history[dateStr];
    result.push({
      date: dateStr,
      day: dayNames[d.getDay()],
      score: entry !== undefined ? entry.score : 0,
      completed: entry ? entry.completed : 0,
      total: entry ? entry.total : 0,
      hydration: entry ? entry.hydration : 0,
    });
  }
  return result;
};

export const getWeeklyAverages = (weeks = 4) => {
  const history = loadScoreHistory();
  const result = [];
  const today = new Date();

  for (let w = weeks - 1; w >= 0; w--) {
    let sum = 0;
    let count = 0;
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (w * 7 + d));
      const dateStr = new Intl.DateTimeFormat('fr-CA', {
        timeZone: 'Africa/Abidjan',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
      if (history[dateStr] && history[dateStr].score !== undefined && history[dateStr].score !== null) {
        sum += history[dateStr].score;
        count++;
      }
    }
    result.push({
      week: `S${weeks - w}`,
      score: count > 0 ? Math.round(sum / count) : 0,
      days: count,
    });
  }
  return result;
};

export const computeStreak = (threshold = 50) => {
  const history = loadScoreHistory();
  let streak = 0;
  const today = new Date();

  for (let i = 1; i <= 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = new Intl.DateTimeFormat('fr-CA', {
      timeZone: 'Africa/Abidjan',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d);
    const entry = history[dateStr];

    if (entry && entry.score >= threshold) {
      streak++;
    } else {
      break;
    }
  }

  const todayStr = getTodayStr();
  const todayEntry = history[todayStr];
  if (todayEntry && todayEntry.score >= threshold) {
    streak++;
  }

  return streak;
};

export const getBestDay = (nOrDays = 7) => {
  const days = Array.isArray(nOrDays) ? nOrDays : getLastNDaysScores(nOrDays);
  const withScores = days.filter(d => d.score > 0);
  if (withScores.length === 0) return { day: '—', score: 0 };
  return withScores.reduce((best, d) => d.score > best.score ? d : best, withScores[0]);
};

export const getAverageScore = (nOrDays = 7) => {
  const days = Array.isArray(nOrDays) ? nOrDays : getLastNDaysScores(nOrDays);
  const withScores = days.filter(d => d.score > 0);
  if (withScores.length === 0) return 0;
  return Math.round(withScores.reduce((sum, d) => sum + d.score, 0) / withScores.length);
};

// Automatic Daily Reset for Hydration (Calibrated to Abidjan timezone)
export const checkAndResetDailyHydration = () => {
  const todayStr = getAbidjanDateStr();
  const lastDate = localStorage.getItem('pos_emmanuella_hydration_date');
  if (lastDate !== todayStr) {
    const prevMl = parseInt(localStorage.getItem('pos_emmanuella_hydration') || '0', 10);
    if (lastDate && prevMl > 0) {
      saveDayScore(lastDate, { hydration: prevMl });
    }
    localStorage.setItem('pos_emmanuella_hydration_date', todayStr);
    localStorage.setItem('pos_emmanuella_hydration', '0');
    return { shouldReset: true, todayStr, previousMl: prevMl };
  }
  const currentMl = parseInt(localStorage.getItem('pos_emmanuella_hydration') || '0', 10);
  return { shouldReset: false, todayStr, currentMl };
};

export const shouldResetHydration = () => {
  return checkAndResetDailyHydration().shouldReset;
};

// Comprehensive Hydration Analytics Evaluation
export const getHydrationStats = (nOrDays = 7, targetMl = 1925) => {
  const days = Array.isArray(nOrDays) ? nOrDays : getLastNDaysScores(nOrDays);
  const totalMl = days.reduce((sum, d) => sum + (d.hydration || 0), 0);
  const avgMl = days.length > 0 ? Math.round(totalMl / days.length) : 0;
  const targetMetDays = days.filter(d => (d.hydration || 0) >= targetMl).length;
  const targetMetRate = days.length > 0 ? Math.round((targetMetDays / days.length) * 100) : 0;
  const bestDay = days.reduce((best, d) => (d.hydration || 0) > (best.hydration || 0) ? d : best, days[0] || { day: '—', hydration: 0 });
  
  return {
    days,
    totalMl,
    avgMl,
    targetMl,
    targetMetDays,
    targetMetRate,
    bestDay,
    overallPercent: Math.min(100, Math.round((avgMl / targetMl) * 100))
  };
};
