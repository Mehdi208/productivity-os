// Agenda and Routine Blocks Handler for Emmanuella
// Pristine by default: no hardcoded routines forced on the user.
// Emmanuella can define custom daily routines that repeat each day, or single-day tasks.

export const getFixedRoutineBlocks = (_dateStr) => {
  // Empty by default: let Emmanuella define her own schedule freely
  return [];
};

export const getBlocksForDate = (_dateObj = new Date()) => {
  return [];
};

export const getDaySchedule = (dateStr, customBlocksByDate = {}, dailyRoutines = []) => {
  const safeDateStr = typeof dateStr === 'string' 
    ? dateStr 
    : (dateStr ? String(dateStr) : new Date().toISOString().split('T')[0]);
  
  // 1. Process user-defined permanent daily routines
  const routinesList = Array.isArray(dailyRoutines) ? dailyRoutines : [];
  const routines = routinesList
    .filter(r => r && r.title)
    .map(r => ({
      ...r,
      id: r.id || `routine_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      checkId: `${r.id}__${safeDateStr}`,
      isRoutine: true,
      date: safeDateStr,
      checkable: r.checkable !== false
    }));
  
  // 2. Process custom blocks specific to this date
  const dict = (customBlocksByDate && typeof customBlocksByDate === 'object' && !Array.isArray(customBlocksByDate))
    ? customBlocksByDate
    : {};
  
  const rawCustoms = dict[safeDateStr];
  const customsList = Array.isArray(rawCustoms) ? rawCustoms : [];
  const customs = customsList
    .filter(c => c && c.title)
    .map(c => ({
      ...c,
      checkId: c.id,
      isRoutine: false,
      date: safeDateStr
    }));

  return [...routines, ...customs]
    .filter(Boolean)
    .sort((a, b) => (a.start || '').localeCompare(b.start || ''));
};

export const getWeekBlocks = (referenceDate = new Date(), customBlocksByDate = {}, dailyRoutines = []) => {
  const validDate = referenceDate instanceof Date && !isNaN(referenceDate) ? referenceDate : new Date();
  const currentDayOfWeek = validDate.getDay();
  const distanceToMonday = (currentDayOfWeek + 6) % 7;
  const mondayDate = new Date(validDate);
  mondayDate.setDate(validDate.getDate() - distanceToMonday);

  const blocksByDay = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    blocksByDay[i] = getDaySchedule(iso, customBlocksByDate, dailyRoutines);
  }
  return blocksByDay;
};
