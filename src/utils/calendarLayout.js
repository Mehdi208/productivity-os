/**
 * Calendar Layout Engine — Inspired by Google Calendar
 * Provides cluster-based column packing for overlapping events, exact time conversions,
 * and drift-free current time coordinates.
 */

export const timeStrToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const minutesToTimeStr = (minutes) => {
  const clamped = Math.max(0, Math.min(1439, Math.round(minutes)));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export const getCalendarCurrentTime = () => {
  try {
    const parts = new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Africa/Abidjan',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    }).formatToParts(new Date());
    const h = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
    const m = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
    return { h: isNaN(h) ? new Date().getHours() : h, m: isNaN(m) ? new Date().getMinutes() : m };
  } catch (_) {
    const d = new Date();
    return { h: d.getHours(), m: d.getMinutes() };
  }
};

/**
 * Computes Google Calendar-style layout for an array of blocks on a single day.
 * - Sorts events chronologically (earlier first, longer first if tie)
 * - Identifies overlapping clusters
 * - Assigns parallel columns (colIndex 0..totalCols-1)
 * - Computes exact top, height, left, and width CSS styles with zero overlap collisions
 */
export const layoutDayBlocks = (blocks = [], hourHeight = 64) => {
  if (!Array.isArray(blocks) || blocks.length === 0) return [];

  const items = blocks.map(block => {
    const startMin = timeStrToMinutes(block.start);
    let endMin = timeStrToMinutes(block.end);
    if (endMin === 0 && startMin > 0) {
      endMin = 1440; // Midnight end of day
    }
    if (endMin <= startMin) {
      endMin = startMin + 30; // Minimum 30 min duration
    }
    return {
      block,
      startMin,
      endMin,
      durationMin: endMin - startMin
    };
  });

  // 1. Sort items chronologically: earlier start first. If same start, longer duration first
  items.sort((a, b) => {
    if (a.startMin !== b.startMin) return a.startMin - b.startMin;
    return b.durationMin - a.durationMin;
  });

  // 2. Group into overlapping clusters
  const clusters = [];
  let currentCluster = [];
  let clusterEnd = -1;

  for (const item of items) {
    if (currentCluster.length === 0) {
      currentCluster.push(item);
      clusterEnd = item.endMin;
    } else if (item.startMin < clusterEnd) {
      // Overlaps with current cluster
      currentCluster.push(item);
      clusterEnd = Math.max(clusterEnd, item.endMin);
    } else {
      // No overlap: close current cluster and start new one
      clusters.push(currentCluster);
      currentCluster = [item];
      clusterEnd = item.endMin;
    }
  }
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  // 3. For each cluster, assign sub-columns (coloring / packing)
  const laidOutItems = [];

  for (const cluster of clusters) {
    const columns = []; // columns[c] = endMin of last event placed in column c

    for (const item of cluster) {
      let placed = false;
      for (let c = 0; c < columns.length; c++) {
        if (columns[c] <= item.startMin) {
          // Fits in column c
          item.colIndex = c;
          columns[c] = item.endMin;
          placed = true;
          break;
        }
      }
      if (!placed) {
        item.colIndex = columns.length;
        columns.push(item.endMin);
      }
    }

    const totalCols = columns.length;

    for (const item of cluster) {
      const colWidthPercent = 100 / totalCols;
      const leftPercent = item.colIndex * colWidthPercent;
      
      const topPx = (item.startMin / 60) * hourHeight;
      const rawHeightPx = (item.durationMin / 60) * hourHeight;
      // Minimum visual height: at least 26px so label is readable, otherwise exact proportional height
      const heightPx = Math.max(26, rawHeightPx);

      laidOutItems.push({
        block: item.block,
        colIndex: item.colIndex,
        totalCols,
        style: {
          top: `${topPx}px`,
          height: `${heightPx}px`,
          left: totalCols > 1 ? `calc(${leftPercent}% + 2px)` : '4px',
          width: totalCols > 1 ? `calc(${colWidthPercent}% - 4px)` : 'calc(100% - 8px)',
          zIndex: 10 + item.colIndex
        }
      });
    }
  }

  return laidOutItems;
};

/**
 * Real-time Time Slot Conflict & Availability Engine
 */

/**
 * Checks if a proposed [startStr, endStr] time range conflicts with any existing block on that day.
 * Consecutive back-to-back tasks (e.g. 09:00-10:00 and 10:00-11:00) do NOT conflict.
 * Overlap occurs if and only if max(start1, start2) < min(end1, end2).
 */
export const checkSlotConflict = (startStr, endStr, existingBlocks = [], ignoreBlockId = null) => {
  if (!startStr || !endStr) return { hasConflict: false, conflictBlock: null };

  const sMin = timeStrToMinutes(startStr);
  let eMin = timeStrToMinutes(endStr);
  if (eMin === 0 && sMin > 0) eMin = 1440; // midnight edge case

  if (eMin <= sMin) {
    return {
      hasConflict: true,
      isInvalidRange: true,
      conflictBlock: null,
      messageFr: "L'heure de fin doit être postérieure à l'heure de début.",
      messageEn: "End time must be after start time."
    };
  }

  const validBlocks = (Array.isArray(existingBlocks) ? existingBlocks : [])
    .filter(b => b && b.start && b.end && (!ignoreBlockId || b.id !== ignoreBlockId));

  for (const block of validBlocks) {
    const bStart = timeStrToMinutes(block.start);
    let bEnd = timeStrToMinutes(block.end);
    if (bEnd === 0 && bStart > 0) bEnd = 1440;

    // Strict overlap formula
    const overlaps = Math.max(sMin, bStart) < Math.min(eMin, bEnd);
    if (overlaps) {
      // Propose auto-shift time:
      const duration = eMin - sMin;
      const proposedShiftStart = block.end;
      const proposedShiftEnd = minutesToTimeStr(Math.min(1439, bEnd + duration));

      return {
        hasConflict: true,
        isInvalidRange: false,
        conflictBlock: block,
        suggestedStart: proposedShiftStart,
        suggestedEnd: proposedShiftEnd,
        messageFr: `Ce créneau a déjà été pris par « ${block.title || 'Activité'} » (${block.start} - ${block.end}).`,
        messageEn: `This slot is already booked by "${block.title || 'Activity'}" (${block.start} - ${block.end}).`
      };
    }
  }

  return { hasConflict: false, isInvalidRange: false, conflictBlock: null };
};

/**
 * Returns an array of standard hour intervals (06:00 to 22:00) with their blocked status.
 * Used to render quick-pick hour buttons where occupied hours are disabled with 🔒.
 */
export const getHourlyAvailability = (existingBlocks = [], ignoreBlockId = null, startHour = 6, endHour = 22) => {
  const validBlocks = (Array.isArray(existingBlocks) ? existingBlocks : [])
    .filter(b => b && b.start && b.end && (!ignoreBlockId || b.id !== ignoreBlockId));

  const hours = [];
  for (let h = startHour; h <= endHour; h++) {
    const hStart = h * 60;
    const hEnd = (h + 1) * 60;
    const timeStr = `${h.toString().padStart(2, '0')}:00`;

    // Find any block covering this hour
    const blockingBlock = validBlocks.find(b => {
      const bStart = timeStrToMinutes(b.start);
      let bEnd = timeStrToMinutes(b.end);
      if (bEnd === 0 && bStart > 0) bEnd = 1440;
      return Math.max(hStart, bStart) < Math.min(hEnd, bEnd);
    });

    hours.push({
      hour: h,
      timeStr,
      isBlocked: Boolean(blockingBlock),
      blockingTitle: blockingBlock?.title || null,
      blockingBlock: blockingBlock || null
    });
  }
  return hours;
};

/**
 * Calculates continuous free slots (windows) throughout the day.
 */
export const getAvailableDaySlots = (existingBlocks = [], minDurationMin = 30, dayStartStr = "06:00", dayEndStr = "23:00", ignoreBlockId = null) => {
  const validBlocks = (Array.isArray(existingBlocks) ? existingBlocks : [])
    .filter(b => b && b.start && b.end && (!ignoreBlockId || b.id !== ignoreBlockId))
    .sort((a, b) => (a.start || '').localeCompare(b.start || ''));

  const dayStartMin = timeStrToMinutes(dayStartStr);
  const dayEndMin = timeStrToMinutes(dayEndStr);
  const freeSlots = [];
  let cursor = dayStartMin;

  for (const block of validBlocks) {
    const bStart = timeStrToMinutes(block.start);
    let bEnd = timeStrToMinutes(block.end);
    if (bEnd === 0 && bStart > 0) bEnd = 1440;

    if (bStart > cursor) {
      const duration = bStart - cursor;
      if (duration >= minDurationMin) {
        freeSlots.push({
          start: minutesToTimeStr(cursor),
          end: minutesToTimeStr(bStart),
          durationMin: duration,
          labelFr: `${minutesToTimeStr(cursor)} - ${minutesToTimeStr(bStart)} (${Math.round(duration / 60 * 10) / 10}h libre)`,
          labelEn: `${minutesToTimeStr(cursor)} - ${minutesToTimeStr(bStart)} (${Math.round(duration / 60 * 10) / 10}h free)`
        });
      }
    }
    cursor = Math.max(cursor, bEnd);
  }

  if (cursor < dayEndMin) {
    const duration = dayEndMin - cursor;
    if (duration >= minDurationMin) {
      freeSlots.push({
        start: minutesToTimeStr(cursor),
        end: minutesToTimeStr(dayEndMin),
        durationMin: duration,
        labelFr: `${minutesToTimeStr(cursor)} - ${minutesToTimeStr(dayEndMin)} (${Math.round(duration / 60 * 10) / 10}h libre)`,
        labelEn: `${minutesToTimeStr(cursor)} - ${minutesToTimeStr(dayEndMin)} (${Math.round(duration / 60 * 10) / 10}h free)`
      });
    }
  }

  return freeSlots;
};
