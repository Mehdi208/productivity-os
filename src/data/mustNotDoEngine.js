// Must-Not-Do & Nutritional Discipline Engine
// Scientific Hydration & Fasting Window Tracker

import { getAbidjanDateStr } from './scoreHistory.js';

const STORAGE_KEY_PREFIX = 'pos_must_not_do_';

export const DEFAULT_HYDRATION_INTERVAL_MINUTES = 60; // 60 min scientific recommendation

export const getTodayMustNotDoData = () => {
  const todayStr = getAbidjanDateStr();
  const key = `${STORAGE_KEY_PREFIX}${todayStr}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse must-not-do data:', e);
  }

  // Default initial state for a fresh day
  return {
    date: todayStr,
    meals: {
      breakfast: false, // Must be eaten <= 07:00
      breakfastTime: null,
      lunch: false,     // Must be eaten between 12:00 and 12:45
      lunchTime: null,
      dinner: false,    // Evening meal (to achieve >= 3 meals/day)
      dinnerTime: null,
      extraMealsCount: 0
    },
    // Custom user rules that shouldn't be violated
    customRules: [
      { id: 'no_snack_after_7', title: 'Ne pas manger après 07h00 (jusqu\'à 12h00)', active: true },
      { id: 'no_skip_lunch_window', title: 'Ne pas manger en dehors de 12h00 - 12h45', active: true },
      { id: 'no_under_3_meals', title: 'Ne pas faire moins de 3 repas par jour', active: true },
      { id: 'no_prolonged_thirst', title: 'Ne pas rester plus de 60 min sans boire d\'eau', active: true }
    ],
    infractionsCount: 0,
    lastHydrationTimestamp: Date.now(),
    hydrationIntervalMinutes: DEFAULT_HYDRATION_INTERVAL_MINUTES,
    notificationsEnabled: true
  };
};

export const saveTodayMustNotDoData = (data) => {
  const todayStr = getAbidjanDateStr();
  const key = `${STORAGE_KEY_PREFIX}${todayStr}`;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save must-not-do data:', e);
  }
};

/**
 * Calculates real-time window statuses
 */
export const getMealWindowsStatus = (now = new Date()) => {
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTotalMin = hours * 60 + minutes;

  // 1. Breakfast window: 04:00 to 07:00 (420 min)
  const breakfastEndMin = 7 * 60; // 420
  let breakfastStatus = 'open'; // 'open' | 'warning' | 'closed'
  if (currentTotalMin > breakfastEndMin) {
    breakfastStatus = 'closed'; // Past 7:00 AM -> MUST NOT EAT
  } else if (currentTotalMin >= breakfastEndMin - 20) {
    breakfastStatus = 'warning'; // 06:40 - 07:00 -> Last chance
  } else {
    breakfastStatus = 'open';
  }

  // 2. Lunch window: 12:00 (720 min) to 12:45 (765 min)
  const lunchStartMin = 12 * 60; // 720
  const lunchEndMin = 12 * 60 + 45; // 765
  let lunchStatus = 'waiting'; // 'waiting' | 'active' | 'warning' | 'closed'
  if (currentTotalMin < lunchStartMin) {
    lunchStatus = 'waiting'; // Waiting for 12:00
  } else if (currentTotalMin >= lunchStartMin && currentTotalMin <= lunchEndMin - 10) {
    lunchStatus = 'active'; // 12:00 - 12:35 -> Window actively open
  } else if (currentTotalMin > lunchEndMin - 10 && currentTotalMin <= lunchEndMin) {
    lunchStatus = 'warning'; // 12:35 - 12:45 -> 10 min left
  } else {
    lunchStatus = 'closed'; // Past 12:45 -> Window closed
  }

  return {
    currentTotalMin,
    breakfastStatus,
    lunchStatus,
    isBreakfastTime: currentTotalMin <= breakfastEndMin,
    isLunchTime: currentTotalMin >= lunchStartMin && currentTotalMin <= lunchEndMin,
    isFastingBetweenMeals: currentTotalMin > breakfastEndMin && currentTotalMin < lunchStartMin
  };
};

/**
 * Returns elapsed minutes since last hydration log
 */
export const getMinutesSinceLastHydration = (lastTimestamp) => {
  if (!lastTimestamp) return 0;
  const elapsedMs = Math.max(0, Date.now() - lastTimestamp);
  return Math.floor(elapsedMs / (1000 * 60));
};
