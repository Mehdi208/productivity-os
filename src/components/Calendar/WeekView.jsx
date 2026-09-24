import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, Globe } from 'lucide-react';
import TimeBlock from './TimeBlock';
import { useLanguage } from '../../context/LanguageContext';
import { layoutDayBlocks, getCalendarCurrentTime } from '../../utils/calendarLayout';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const WeekView = ({ 
  blocksByDay = {}, 
  getDayBlocks,
  projects = [],
  viewMode = 'week',
  onViewModeChange,
  onToggleCheck, 
  onEditBlock, 
  onSaveBlock,
  onNewTaskAtSlot, 
  onNewTask 
}) => {
  const { lang, t } = useLanguage();
  const hours = HOURS;
  const hourHeight = 64;
  const [currentTimeData, setCurrentTimeData] = useState(() => {
    const { h, m } = getCalendarCurrentTime();
    return {
      offset: (h + m / 60) * hourHeight,
      timeStr: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
    };
  });
  const scrollContainerRef = useRef(null);
  
  // Real today index (0 = Monday, 6 = Sunday)
  const todayDate = new Date();
  const currentJsDay = todayDate.getDay();
  const realTodayIndex = currentJsDay === 0 ? 6 : currentJsDay - 1;

  const [weekOffset, setWeekOffset] = useState(0);
  const [activeDayIndex, setActiveDayIndex] = useState(realTodayIndex);

  // Drag-and-drop state
  const [activeDraggedBlock, setActiveDraggedBlock] = useState(null);
  const [dragPreview, setDragPreview] = useState(null);

  const timeStrToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const minutesToTimeStr = (minutes) => {
    const clamped = Math.max(0, Math.min(1439, Math.round(minutes)));
    const h = Math.floor(clamped / 60);
    const m = clamped % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const handleDragBlockStart = (block, dayIndex, grabOffsetY, sourceIsoDate) => {
    const startMin = timeStrToMinutes(block.start);
    const endMin = timeStrToMinutes(block.end);
    const duration = Math.max(15, endMin > startMin ? endMin - startMin : 30);
    setActiveDraggedBlock({
      block,
      sourceDayIndex: dayIndex,
      sourceIsoDate: sourceIsoDate || block.date,
      grabOffsetY: grabOffsetY || 0,
      durationMinutes: duration
    });
  };

  const handleDragBlockEnd = () => {
    setActiveDraggedBlock(null);
    setDragPreview(null);
  };

  const handleColumnDragOver = (e, targetDayIndex, targetIsoDate) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!activeDraggedBlock) return;

    const columnRect = e.currentTarget.getBoundingClientRect();
    const offsetY = Math.max(0, e.clientY - columnRect.top - (activeDraggedBlock.grabOffsetY || 0));
    const rawMinutes = (offsetY / hourHeight) * 60;

    const durationMinutes = activeDraggedBlock.durationMinutes;
    let snappedStartMin = Math.round(rawMinutes / 15) * 15;
    snappedStartMin = Math.max(0, Math.min(1440 - durationMinutes, snappedStartMin));
    const snappedEndMin = snappedStartMin + durationMinutes;

    const top = (snappedStartMin / 60) * hourHeight;
    const height = Math.max(44, (durationMinutes / 60) * hourHeight);

    setDragPreview({
      dayIndex: targetDayIndex,
      isoDate: targetIsoDate,
      startMinutes: snappedStartMin,
      endMinutes: snappedEndMin,
      startTimeStr: minutesToTimeStr(snappedStartMin),
      endTimeStr: minutesToTimeStr(snappedEndMin),
      top,
      height
    });
  };

  const handleColumnDragLeave = (e, targetDayIndex) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragPreview(prev => (prev?.dayIndex === targetDayIndex ? null : prev));
    }
  };

  const handleColumnDrop = (e, targetDayIndex, targetIsoDate) => {
    e.preventDefault();
    if (!activeDraggedBlock || !dragPreview || !onSaveBlock) {
      handleDragBlockEnd();
      return;
    }

    const finalDate = targetIsoDate || dragPreview.isoDate || activeDraggedBlock.block.date;

    const updatedBlock = {
      ...activeDraggedBlock.block,
      start: dragPreview.startTimeStr,
      end: dragPreview.endTimeStr,
      date: finalDate
    };

    onSaveBlock(updatedBlock, targetDayIndex, finalDate);
    handleDragBlockEnd();
  };

  // Interactive bottom-handle resizing state (Google Calendar style)
  const [activeResizingBlock, setActiveResizingBlock] = useState(null);
  const [resizePreview, setResizePreview] = useState(null);
  const resizePreviewRef = useRef(null);

  const handleResizeBlockStart = (block, dayIndex, clientYOrEvent) => {
    const startMin = timeStrToMinutes(block.start);
    let endMin = timeStrToMinutes(block.end);
    if (endMin === 0 && startMin > 0) endMin = 1440;
    const initialDuration = Math.max(15, endMin - startMin);

    const clientY = clientYOrEvent.clientY !== undefined ? clientYOrEvent.clientY : (clientYOrEvent.touches?.[0]?.clientY ?? 0);
    const clientX = clientYOrEvent.clientX !== undefined ? clientYOrEvent.clientX : (clientYOrEvent.touches?.[0]?.clientX ?? 0);

    const initialPreview = {
      blockId: block.id,
      dayIndex,
      startMin,
      initialEndMin: endMin,
      startTimeStr: block.start,
      endTimeStr: block.end,
      durationMinutes: initialDuration,
      mouseX: clientX,
      mouseY: clientY,
      newHeight: Math.max(26, (initialDuration / 60) * hourHeight)
    };

    setActiveResizingBlock(block);
    setResizePreview(initialPreview);
    resizePreviewRef.current = initialPreview;

    const onPointerMove = (e) => {
      const curY = e.clientY !== undefined ? e.clientY : (e.touches?.[0]?.clientY ?? 0);
      const curX = e.clientX !== undefined ? e.clientX : (e.touches?.[0]?.clientX ?? 0);

      const columnEl = document.querySelector(`[data-day-index="${dayIndex}"]`);
      if (!columnEl) return;

      const columnRect = columnEl.getBoundingClientRect();
      const offsetY = Math.max(0, curY - columnRect.top);
      const rawMinutes = (offsetY / hourHeight) * 60;

      // Snap end time to 15-minute intervals
      let snappedEndMin = Math.round(rawMinutes / 15) * 15;
      // Minimum duration: at least 15 minutes after start, and cannot exceed 1440 (midnight)
      snappedEndMin = Math.max(startMin + 15, Math.min(1440, snappedEndMin));
      const durationMinutes = snappedEndMin - startMin;
      const newHeight = Math.max(26, (durationMinutes / 60) * hourHeight);
      const endTimeStr = minutesToTimeStr(snappedEndMin);

      const nextPreview = {
        blockId: block.id,
        dayIndex,
        startMin,
        initialEndMin: endMin,
        startTimeStr: block.start,
        endTimeStr,
        durationMinutes,
        mouseX: curX,
        mouseY: curY,
        newHeight
      };

      setResizePreview(nextPreview);
      resizePreviewRef.current = nextPreview;
    };

    const onPointerUp = () => {
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      const finalPreview = resizePreviewRef.current;
      if (finalPreview && finalPreview.endTimeStr && finalPreview.endTimeStr !== block.end) {
        if (onSaveBlock) {
          const finalDate = block.date;
          const updatedBlock = {
            ...block,
            end: finalPreview.endTimeStr
          };
          onSaveBlock(updatedBlock, dayIndex, finalDate);
        }
      }

      setActiveResizingBlock(null);
      setResizePreview(null);
      resizePreviewRef.current = null;
    };

    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
  };

  const handleTouchDragMove = (clientX, clientY) => {
    if (!activeDraggedBlock) return;

    // Auto-scroll container if finger is near top or bottom
    if (scrollContainerRef.current) {
      const containerRect = scrollContainerRef.current.getBoundingClientRect();
      if (clientY < containerRect.top + 70) {
        scrollContainerRef.current.scrollTop -= 8;
      } else if (clientY > containerRect.bottom - 70) {
        scrollContainerRef.current.scrollTop += 8;
      }
    }

    // Find which column is under touch
    const element = document.elementFromPoint(clientX, clientY);
    const columnEl = element?.closest('[data-day-index]');
    
    let targetDayIndex = activeDraggedBlock.sourceDayIndex;
    let targetIsoDate = null;
    let targetColumnRect = null;

    if (columnEl) {
      targetDayIndex = parseInt(columnEl.getAttribute('data-day-index'), 10);
      targetIsoDate = columnEl.getAttribute('data-iso-date');
      targetColumnRect = columnEl.getBoundingClientRect();
    } else {
      const allCols = document.querySelectorAll('[data-day-index]');
      for (const col of allCols) {
        const rect = col.getBoundingClientRect();
        if (clientX >= rect.left && clientX <= rect.right) {
          targetDayIndex = parseInt(col.getAttribute('data-day-index'), 10);
          targetIsoDate = col.getAttribute('data-iso-date');
          targetColumnRect = rect;
          break;
        }
      }
      if (!targetColumnRect && allCols.length > 0) {
        targetColumnRect = allCols[0].getBoundingClientRect();
        targetDayIndex = parseInt(allCols[0].getAttribute('data-day-index'), 10);
        targetIsoDate = allCols[0].getAttribute('data-iso-date');
      }
    }

    if (targetColumnRect) {
      const offsetY = Math.max(0, clientY - targetColumnRect.top - (activeDraggedBlock.grabOffsetY || 0));
      const rawMinutes = (offsetY / hourHeight) * 60;
      const durationMinutes = activeDraggedBlock.durationMinutes;
      let snappedStartMin = Math.round(rawMinutes / 15) * 15;
      snappedStartMin = Math.max(0, Math.min(1440 - durationMinutes, snappedStartMin));
      const snappedEndMin = snappedStartMin + durationMinutes;

      const top = (snappedStartMin / 60) * hourHeight;
      const height = Math.max(44, (durationMinutes / 60) * hourHeight);

      setDragPreview({
        dayIndex: targetDayIndex,
        isoDate: targetIsoDate,
        startMinutes: snappedStartMin,
        endMinutes: snappedEndMin,
        startTimeStr: minutesToTimeStr(snappedStartMin),
        endTimeStr: minutesToTimeStr(snappedEndMin),
        top,
        height
      });
    }
  };

  const handleTouchDragEnd = () => {
    if (activeDraggedBlock && dragPreview && onSaveBlock) {
      const finalDate = dragPreview.isoDate || activeDraggedBlock.block.date;
      const updatedBlock = {
        ...activeDraggedBlock.block,
        start: dragPreview.startTimeStr,
        end: dragPreview.endTimeStr,
        date: finalDate
      };
      onSaveBlock(updatedBlock, dragPreview.dayIndex, finalDate);
    }
    handleDragBlockEnd();
  };

  useEffect(() => {
    const updateCurrentTime = () => {
      const { h, m } = getCalendarCurrentTime();
      setCurrentTimeData({
        offset: (h + m / 60) * hourHeight,
        timeStr: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
      });
    };
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000);
    return () => clearInterval(interval);
  }, [hourHeight]);

  // Auto-scroll to current time on mount so user sees active hours immediately
  useEffect(() => {
    if (scrollContainerRef.current) {
      const { h } = getCalendarCurrentTime();
      const scrollPos = Math.max(0, (h - 1) * hourHeight);
      scrollContainerRef.current.scrollTop = scrollPos;
    }
  }, [hourHeight]);

  // Navigate day by day with left / right arrows
  const handlePrevDay = () => {
    if (activeDayIndex > 0) {
      setActiveDayIndex(prev => prev - 1);
    } else {
      setWeekOffset(w => w - 1);
      setActiveDayIndex(6);
    }
  };

  const handleNextDay = () => {
    if (activeDayIndex < 6) {
      setActiveDayIndex(prev => prev + 1);
    } else {
      setWeekOffset(w => w + 1);
      setActiveDayIndex(0);
    }
  };

  const handlePrev = () => {
    if (viewMode === 'week') {
      setWeekOffset(w => w - 1);
    } else if (viewMode === '3days') {
      if (activeDayIndex > 0) {
        setActiveDayIndex(prev => Math.max(0, prev - 1));
      } else {
        setWeekOffset(w => w - 1);
        setActiveDayIndex(4);
      }
    } else {
      handlePrevDay();
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      setWeekOffset(w => w + 1);
    } else if (viewMode === '3days') {
      if (activeDayIndex < 4) {
        setActiveDayIndex(prev => Math.min(4, prev + 1));
      } else {
        setWeekOffset(w => w + 1);
        setActiveDayIndex(0);
      }
    } else {
      handleNextDay();
    }
  };

  const handleGoToToday = () => {
    setWeekOffset(0);
    setActiveDayIndex(realTodayIndex);
  };

  // Calculate dynamic day numbers and ISO dates
  const getWeekDates = () => {
    const curr = new Date(todayDate);
    curr.setDate(curr.getDate() + weekOffset * 7);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(curr.setDate(diff));

    const weekDays = [];
    const dayNames = lang === 'en'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const fullNames = lang === 'en'
      ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      : ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    for (let i = 0; i < 7; i++) {
      const next = new Date(monday);
      next.setDate(monday.getDate() + i);
      
      const yyyy = next.getFullYear();
      const mm = String(next.getMonth() + 1).padStart(2, '0');
      const dd = String(next.getDate()).padStart(2, '0');
      const isoStr = `${yyyy}-${mm}-${dd}`;

      // Check if any project has deadline on this day
      const dayDeadlines = (projects || []).filter(p => {
        if (!p || !p.deadline) return false;
        return p.deadline === isoStr || p.deadline.startsWith(isoStr);
      });

      weekDays.push({
        name: dayNames[i],
        fullName: fullNames[i],
        dayIndex: i,
        dayNumber: next.getDate(),
        month: next.toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', { month: 'short' }),
        isoDate: isoStr,
        deadlines: dayDeadlines,
        isRealToday: weekOffset === 0 && i === realTodayIndex,
        isSelected: i === activeDayIndex,
        fullDate: next.toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
      });
    }
    return weekDays;
  };

  const days = getWeekDates();
  const safeDays = Array.isArray(days) ? days : [];
  const safeActiveIdx = Math.max(0, Math.min(activeDayIndex, Math.max(0, safeDays.length - 1)));
  const currentSelectedDay = safeDays[safeActiveIdx] || safeDays[0];

  // Determine visible days based on viewMode
  const getVisibleDays = () => {
    if (viewMode === '1day') {
      return currentSelectedDay ? [currentSelectedDay] : [];
    }
    if (viewMode === '3days') {
      const startIdx = Math.max(0, Math.min(safeActiveIdx, Math.max(0, safeDays.length - 3)));
      return safeDays.slice(startIdx, startIdx + 3);
    }
    return safeDays;
  };

  const visibleDays = getVisibleDays();

  // High performance pre-calculated layout and hour occupancy map
  const daysLayoutData = useMemo(() => {
    return visibleDays.filter(Boolean).map((d) => {
      const rawBlocks = getDayBlocks ? getDayBlocks(d.isoDate) : (blocksByDay[d.dayIndex] || []);
      const dayBlocksWithLayout = layoutDayBlocks(rawBlocks, hourHeight);
      const occupiedByHour = new Map();
      hours.forEach((h) => {
        const slotHourStart = h * 60;
        const slotHourEnd = (h + 1) * 60;
        const occ = rawBlocks.find((b) => {
          if (!b || !b.start || !b.end) return false;
          const bs = timeStrToMinutes(b.start);
          let be = timeStrToMinutes(b.end);
          if (be === 0 && bs > 0) be = 1440;
          return Math.max(slotHourStart, bs) < Math.min(slotHourEnd, be);
        });
        if (occ) occupiedByHour.set(h, occ);
      });
      return {
        ...d,
        rawBlocks,
        dayBlocksWithLayout,
        occupiedByHour
      };
    });
  }, [visibleDays, getDayBlocks, blocksByDay, hourHeight]);

  // Determine grid column template
  const getGridColsClass = () => {
    if (viewMode === '1day') return 'grid-cols-[60px_1fr]';
    if (viewMode === '3days') return 'grid-cols-[60px_1fr_1fr_1fr]';
    return 'grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr]';
  };

  const timeToTop = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h + (m || 0) / 60) * hourHeight;
  };

  const getDurationHeight = (startStr, endStr) => {
    if (!startStr || !endStr) return hourHeight;
    const [sH, sM] = startStr.split(':').map(Number);
    const [eH, eM] = endStr.split(':').map(Number);
    let startMin = sH * 60 + (sM || 0);
    let endMin = eH * 60 + (eM || 0);
    // If block ends at 00:00 after starting late in the day (e.g. 23:00 to 00:00), endMin is 1440 (midnight)
    if (endMin === 0 && startMin > 0) {
      endMin = 1440;
    }
    if (endMin <= startMin) {
      endMin = startMin + 30;
    }
    const durationMinutes = endMin - startMin;
    return Math.max(44, (durationMinutes / 60) * hourHeight);
  };

  return (
    <div className="hidden md:flex flex-col bg-card rounded-3xl shadow-sm border border-gray-100 dark:border-darkBorder overflow-hidden flex-1 h-full min-h-0 transition-colors">
      
      {/* Header with Navigation, Title, Mode Switcher & Add Button */}
      <div className="p-6 border-b border-gray-200/60 dark:border-darkBorder flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              {viewMode === '1day' && (
                <>
                  <h2 className="text-2xl font-extrabold text-textMain capitalize">
                    {currentSelectedDay.fullName} {currentSelectedDay.dayNumber} {currentSelectedDay.month}
                  </h2>
                  {currentSelectedDay.isRealToday ? (
                    <span className="bg-emerald-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm">
                      {t('todayBadge')}
                    </span>
                  ) : (
                    <span className="bg-primary text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm">
                      {t('selectedBadge')}
                    </span>
                  )}
                </>
              )}

              {viewMode === '3days' && (
                <>
                  <h2 className="text-2xl font-extrabold text-textMain capitalize">
                    {visibleDays[0].fullName} {visibleDays[0].dayNumber} – {visibleDays[visibleDays.length - 1].fullName} {visibleDays[visibleDays.length - 1].dayNumber} {visibleDays[visibleDays.length - 1].month}
                  </h2>
                  {visibleDays.some(d => d.isRealToday) && (
                    <span className="bg-emerald-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm">
                      {t('todayIncluded')}
                    </span>
                  )}
                </>
              )}

              {viewMode === 'week' && (
                <>
                  <h2 className="text-2xl font-extrabold text-textMain capitalize">
                    {t('weekOfRange', days[0].dayNumber, days[0].month, days[6].dayNumber, days[6].month)}
                  </h2>
                  {weekOffset === 0 && (
                    <span className="bg-emerald-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm">
                      {t('thisWeek')}
                    </span>
                  )}
                </>
              )}
            </div>

            <p className="text-xs text-textMuted mt-0.5">
              {viewMode === '1day' && t('view1DayDesc', t('weekOfRange', days[0].dayNumber, days[0].month, days[6].dayNumber, days[6].month))}
              {viewMode === '3days' && t('view3DaysDesc', t('weekOfRange', days[0].dayNumber, days[0].month, days[6].dayNumber, days[6].month))}
              {viewMode === 'week' && t('viewWeekDesc')}
            </p>
          </div>

          {/* Navigation Pill */}
          <div className="flex items-center bg-background rounded-2xl p-1 border border-gray-200/80 dark:border-darkBorder shadow-sm">
            <button 
              onClick={handlePrev} 
              className="p-2 rounded-xl hover:bg-card text-textMuted hover:text-textMain transition-colors"
              title={viewMode === 'week' ? (lang === 'en' ? "Previous week" : "Semaine précédente") : (lang === 'en' ? "Previous" : "Précédent")}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={handleGoToToday} 
              className="px-3.5 py-1 font-bold text-xs text-textMain hover:text-primary transition-colors"
              title={lang === 'en' ? "Go to today" : "Revenir à aujourd'hui"}
            >
              {lang === 'en' ? 'Today' : "Aujourd'hui"}
            </button>
            <button 
              onClick={handleNext} 
              className="p-2 rounded-xl hover:bg-card text-textMuted hover:text-textMain transition-colors"
              title={viewMode === 'week' ? (lang === 'en' ? "Next week" : "Semaine suivante") : (lang === 'en' ? "Next" : "Suivant")}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Right Actions: View Mode Switcher + New Task Button */}
        <div className="flex items-center gap-3">
          {/* Segmented View Switcher */}
          <div className="flex items-center bg-background rounded-2xl p-1 border border-gray-200/80 dark:border-darkBorder shadow-sm">
            <button 
              type="button"
              onClick={() => onViewModeChange && onViewModeChange('1day')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                viewMode === '1day' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-textMuted hover:text-textMain hover:bg-card'
              }`}
            >
              {t('view1Day')}
            </button>
            <button 
              type="button"
              onClick={() => onViewModeChange && onViewModeChange('3days')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                viewMode === '3days' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-textMuted hover:text-textMain hover:bg-card'
              }`}
            >
              {t('view3Days')}
            </button>
            <button 
              type="button"
              onClick={() => onViewModeChange && onViewModeChange('week')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                viewMode === 'week' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-textMuted hover:text-textMain hover:bg-card'
              }`}
            >
              {t('viewWeek')}
            </button>
          </div>

          <button
            onClick={onNewTask}
            className="bg-primary hover:bg-primary/90 text-white font-bold px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs shadow-sm shadow-primary/25 transition-all active:scale-95"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>{t('addSlot')}</span>
          </button>
        </div>
      </div>

      {/* Mini 7-Day Navigation Strip (Only in 1day or 3days mode on Desktop) */}
      {viewMode !== 'week' && (
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-50 dark:bg-darkBg/90 border-b border-gray-200/80 dark:border-darkBorder transition-colors flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-extrabold text-textMuted dark:text-darkTextMuted uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={13} className="text-primary" />
              <span>{t('chooseDay')}</span>
            </span>

            {/* Inset Segmented Pill Bar */}
            <div className="inline-flex items-center p-1 bg-background dark:bg-darkCard rounded-2xl border border-gray-200/80 dark:border-darkBorder shadow-sm gap-1">
              {days.map((d) => {
                const isVisible = visibleDays.some(vd => vd.dayIndex === d.dayIndex);
                return (
                  <button
                    key={d.dayIndex}
                    type="button"
                    onClick={() => setActiveDayIndex(d.dayIndex)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      d.isSelected
                        ? 'bg-primary text-white shadow-md shadow-primary/30 ring-1 ring-primary/40 scale-105'
                        : isVisible
                          ? 'bg-primary/15 dark:bg-primary/25 text-primary dark:text-indigo-200 border border-primary/30 hover:bg-primary/20'
                          : d.isRealToday
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'text-textMuted dark:text-darkTextMuted hover:text-textMain dark:hover:text-darkTextMain hover:bg-gray-100 dark:hover:bg-darkCardElevated'
                    }`}
                  >
                    <span>{d.name} {d.dayNumber}</span>
                    {d.deadlines.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" title={`${d.deadlines.length} ${lang === 'en' ? 'deadline(s)' : 'échéance(s)'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-textMuted dark:text-darkTextMuted bg-card dark:bg-darkCard px-3 py-1 rounded-xl border border-gray-200/70 dark:border-darkBorder shadow-sm">
              {viewMode === '3days' ? (lang === 'en' ? '3-consecutive-day view' : 'Vue 3 jours consécutifs') : (lang === 'en' ? 'Detailed day view' : 'Vue journée détaillée')}
            </span>
          </div>
        </div>
      )}

      {/* Days Header Row with Clickable Highlight & Project Deadline Badges */}
      <div className={`grid ${getGridColsClass()} border-b border-gray-200/60 dark:border-darkBorder bg-card select-none flex-shrink-0`}>
        <div className="p-3 text-[11px] font-bold text-textMuted text-center flex items-center justify-center">
          <Clock size={14} />
        </div>
        
        {visibleDays.map((d) => (
          <div 
            key={d.name} 
            onClick={() => setActiveDayIndex(d.dayIndex)}
            className={`py-3 px-2 text-center border-l border-gray-100 dark:border-darkBorder cursor-pointer transition-all ${
              d.isSelected 
                ? 'bg-primary/15 border-t-4 border-t-primary shadow-sm' 
                : d.isRealToday 
                  ? 'bg-emerald-500/10 border-t-2 border-t-emerald-500 hover:bg-emerald-500/15' 
                  : 'hover:bg-gray-50/70 dark:hover:bg-gray-800/40'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <span className={`text-xs uppercase font-bold ${d.isSelected ? 'text-primary' : d.isRealToday ? 'text-emerald-700 dark:text-emerald-300' : 'text-textMuted'}`}>
                {d.name}
              </span>
              {d.isRealToday && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title={t('todayBadge')} />
              )}
            </div>
            <div className={`text-base font-extrabold mt-0.5 ${d.isSelected ? 'text-primary scale-110' : d.isRealToday ? 'text-emerald-700 dark:text-emerald-300' : 'text-textMain'}`}>
              {d.dayNumber}
            </div>

            {/* Project Deadline Indicator in Column Header */}
            {d.deadlines.length > 0 && (
              <div className="mt-1 space-y-1">
                {d.deadlines.map(p => (
                  <span 
                    key={p.id} 
                    className="block text-[9px] bg-red-600 text-white font-extrabold px-1.5 py-0.5 rounded-md shadow-sm truncate"
                    title={`${t('projectDeadline')} : ${p.name}`}
                  >
                    🎯 {p.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Grid Canvas with Auto-Scroll to Active Hour */}
      <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto relative overscroll-contain">
        <div className={`grid ${getGridColsClass()} relative min-h-[1536px] pb-16`}>
          
          {/* Time gutter with zero-drift Google Calendar alignment */}
          <div className="border-r border-gray-200/60 dark:border-darkBorder bg-card z-10 select-none relative">
            {hours.map((h) => (
              <div 
                key={h} 
                style={{ height: `${hourHeight}px` }} 
                className="relative border-b border-transparent"
              >
                {/* Google Calendar centers hour text on the divider line between hours */}
                {h > 0 ? (
                  <span className="absolute -top-2.5 right-2 text-[11px] font-semibold text-textMuted select-none tabular-nums">
                    {h.toString().padStart(2, '0')}:00
                  </span>
                ) : (
                  <span className="absolute top-1 right-2 text-[10px] font-bold text-textMuted/70 select-none tabular-nums">
                    00:00
                  </span>
                )}
              </div>
            ))}
            
            {/* End of day / Midnight demarcation badge */}
            <div className="relative h-6 border-t border-gray-200/40 dark:border-darkBorder select-none">
              <span 
                className="absolute -top-2.5 right-2 text-[10px] font-extrabold text-textMuted/90 bg-slate-100 dark:bg-darkCard px-1.5 py-0.5 rounded border border-gray-200/80 dark:border-darkBorder shadow-xs"
                title={lang === 'en' ? 'Midnight (End of day)' : 'Minuit (Fin de journée)'}
              >
                00:00
              </span>
            </div>

            {/* Current Time red chip in gutter (when today is visible in current week) */}
            {weekOffset === 0 && visibleDays.some(d => d.isRealToday) && (
              <div 
                style={{ top: `${currentTimeData.offset - 9}px` }} 
                className="absolute right-1.5 z-40 pointer-events-none"
              >
                <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-md select-none tabular-nums flex items-center">
                  {currentTimeData.timeStr}
                </span>
              </div>
            )}
          </div>

          {/* Current Time Red Laser Line (Only when real today is in visible days) */}
          {weekOffset === 0 && visibleDays.some(d => d.isRealToday) && (
            <div 
              style={{ top: `${currentTimeData.offset}px` }} 
              className="absolute left-[60px] right-0 z-30 flex items-center pointer-events-none"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-red-600 -ml-1.5 flex-shrink-0 shadow-sm animate-pulse" />
              <div className="h-[2px] w-full bg-red-600 shadow-sm" />
            </div>
          )}

          {/* Visible Day Columns */}
          {daysLayoutData.map((d) => {
            const { dayBlocksWithLayout, occupiedByHour } = d;
            const isColumnHovered = dragPreview?.dayIndex === d.dayIndex;

            return (
              <div 
                key={d.name} 
                data-day-index={d.dayIndex}
                data-iso-date={d.isoDate}
                onDragOver={(e) => handleColumnDragOver(e, d.dayIndex, d.isoDate)}
                onDragLeave={(e) => handleColumnDragLeave(e, d.dayIndex)}
                onDrop={(e) => handleColumnDrop(e, d.dayIndex, d.isoDate)}
                className={`relative border-l border-gray-100 dark:border-darkBorder transition-colors ${
                  isColumnHovered
                    ? 'bg-primary/[0.08] ring-2 ring-inset ring-primary/40'
                    : d.isSelected 
                      ? 'bg-primary/[0.04]' 
                      : d.isRealToday 
                        ? 'bg-emerald-500/[0.02]' 
                        : ''
                }`}
              >
                {/* Hour horizontal grid lines with Google Calendar half-hour subtle dashed guide */}
                {hours.map((h) => {
                  const occupiedBlock = occupiedByHour.get(h);

                  return (
                    <div 
                      key={h} 
                      style={{ height: `${hourHeight}px` }} 
                      className="relative border-b border-gray-100 dark:border-darkBorder/60 w-full hover:bg-primary/[0.04] cursor-pointer transition-colors"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const isBottomHalf = (e.clientY - rect.top) > (hourHeight / 2);
                        const timeStr = `${h.toString().padStart(2, '0')}:${isBottomHalf ? '30' : '00'}`;
                        if (onNewTaskAtSlot) onNewTaskAtSlot(d.dayIndex, timeStr, d.isoDate);
                      }}
                      title={occupiedBlock 
                        ? (lang === 'en' ? `🔒 Slot occupied by "${occupiedBlock.title}" (${occupiedBlock.start} - ${occupiedBlock.end})` : `🔒 Créneau occupé par « ${occupiedBlock.title} » (${occupiedBlock.start} - ${occupiedBlock.end})`)
                        : (lang === 'en' ? `Click to add a task at ${h}:00 on ${d.fullName}` : `Cliquer pour ajouter une tâche à ${h}:00 le ${d.fullName}`)}
                    >
                      {/* Faint half-hour guideline (Google Calendar style) */}
                      <div className="absolute top-1/2 left-0 right-0 border-b border-dashed border-gray-100/70 dark:border-darkBorder/30 pointer-events-none" />
                    </div>
                  );
                })}

                {/* Subtle End-of-Day (Midnight) boundary label under Hour 23 */}
                <div className="h-6 border-b-2 border-dashed border-gray-200/60 dark:border-darkBorder/60 flex items-center justify-center pointer-events-none opacity-40">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-textMuted">
                    {lang === 'en' ? 'Midnight • End of day' : 'Minuit • Fin de journée'}
                  </span>
                </div>

                {/* Ghost Preview during Drag & Drop */}
                {isColumnHovered && activeDraggedBlock && (
                  <div 
                    style={{ 
                      top: `${dragPreview.top}px`, 
                      height: `${dragPreview.height}px` 
                    }} 
                    className="absolute inset-x-1 rounded-xl border-2 border-dashed border-primary bg-primary/25 backdrop-blur-sm z-30 pointer-events-none p-2 flex flex-col justify-between shadow-xl ring-2 ring-primary/30 transition-all animate-pulse"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-black text-primary truncate">
                        {activeDraggedBlock.block.title}
                      </span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-primary text-white shadow-sm flex-shrink-0">
                        {dragPreview.startTimeStr} - {dragPreview.endTimeStr}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-primary/80">
                      {t('dropToReschedule')}
                    </span>
                  </div>
                )}

                {/* Time Blocks on this day — Rendered with Google Calendar layout styles */}
                {dayBlocksWithLayout.map(({ block, style }) => {
                  const isCurrentResizing = activeResizingBlock?.id === block.id;
                  const effectiveStyle = isCurrentResizing && resizePreview?.newHeight
                    ? { ...style, height: `${resizePreview.newHeight}px`, zIndex: 40 }
                    : style;

                  return (
                    <TimeBlock 
                      key={block.id} 
                      block={block} 
                      dayIndex={d.dayIndex}
                      isDragging={activeDraggedBlock?.block?.id === block.id}
                      onDragBlockStart={(b, idx, grabY) => handleDragBlockStart(b, idx, grabY, d.isoDate)}
                      onDragBlockEnd={handleDragBlockEnd}
                      onTouchDragMove={handleTouchDragMove}
                      onTouchDragEnd={handleTouchDragEnd}
                      onToggleCheck={onToggleCheck} 
                      onEditBlock={(b) => onEditBlock && onEditBlock(b, d.dayIndex, d.isoDate)}
                      onResizeBlockStart={handleResizeBlockStart}
                      isResizing={isCurrentResizing}
                      resizingEndStr={isCurrentResizing ? resizePreview?.endTimeStr : null}
                      style={effectiveStyle}
                    />
                  );
                })}
              </div>
            );
          })}

        </div>
      </div>

      {/* Floating Resize Live Badge (Google Calendar Style) */}
      {activeResizingBlock && resizePreview && (
        <div 
          style={{ 
            position: 'fixed', 
            top: `${resizePreview.mouseY + 16}px`, 
            left: `${resizePreview.mouseX + 16}px`,
            zIndex: 100
          }}
          className="pointer-events-none bg-slate-900/95 dark:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xl border border-white/10 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-75 select-none"
        >
          <Clock size={13} className="text-primary flex-shrink-0" />
          <span className="font-extrabold truncate max-w-[150px]">{activeResizingBlock.title}</span>
          <span className="text-primary font-black ml-1 tabular-nums whitespace-nowrap">
            {resizePreview.startTimeStr} – {resizePreview.endTimeStr}
          </span>
          <span className="text-[10px] text-slate-300 font-medium ml-0.5 whitespace-nowrap bg-white/10 px-1.5 py-0.5 rounded">
            {Math.floor(resizePreview.durationMinutes / 60)}h{resizePreview.durationMinutes % 60 > 0 ? (resizePreview.durationMinutes % 60).toString().padStart(2, '0') : '00'}
          </span>
        </div>
      )}

    </div>
  );
};

export default WeekView;