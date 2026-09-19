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
