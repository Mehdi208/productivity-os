import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, Target } from 'lucide-react';
import TimeBlock from './TimeBlock';
import { useLanguage } from '../../context/LanguageContext';

const DayView = ({ 
  blocksByDay = {}, 
  getDayBlocks,
  todayBlocks = [], 
  projects = [],
  viewMode = '1day',
  onViewModeChange,
  onToggleCheck, 
  onEditBlock, 
  onSaveBlock,
  onNewTask,
  onNewTaskAtSlot
}) => {
  const { lang, t } = useLanguage();
  // Full 24-hour timeline from midnight 00:00 to 23:59
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const hourHeight = 64;
  const [currentTimeOffset, setCurrentTimeOffset] = useState(null);
  const scrollContainerRef = useRef(null);

  // Real today index (0 = Monday, 6 = Sunday)
  const todayDate = new Date();
  const currentJsDay = todayDate.getDay();
  const realTodayIndex = currentJsDay === 0 ? 6 : currentJsDay - 1;

  const [activeDayIndex, setActiveDayIndex] = useState(realTodayIndex);
  const [weekOffset, setWeekOffset] = useState(0);

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
    let endMin = timeStrToMinutes(block.end);
    if (endMin === 0 && startMin > 0) {
      endMin = 1440;
    }
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
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      setCurrentTimeOffset((h + m / 60) * hourHeight);
    };
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000);
    return () => clearInterval(interval);
  }, [hourHeight]);

  // Auto-scroll to current time on mount so user sees active hours immediately
  useEffect(() => {
    if (scrollContainerRef.current) {
      const now = new Date();
      const currentH = now.getHours();
      const scrollPos = Math.max(0, (currentH - 1) * hourHeight);
      scrollContainerRef.current.scrollTop = scrollPos;
    }
  }, [hourHeight]);

  // Navigate day by day or week by week
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

  // Compute active day metadata and week days
  const getDayInfo = () => {
    const curr = new Date(todayDate);
    curr.setDate(curr.getDate() + weekOffset * 7);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(curr.setDate(diff));

    const dayNames = lang === 'en'
      ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      : ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const shortNames = lang === 'en'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + activeDayIndex);

    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDate.getDate()).padStart(2, '0');
    const isoStr = `${yyyy}-${mm}-${dd}`;

    const activeDeadlines = (projects || []).filter(p => {
      if (!p || !p.deadline) return false;
      return p.deadline === isoStr || p.deadline.startsWith(isoStr);
    });

    return {
      fullName: dayNames[activeDayIndex] || dayNames[0],
      shortName: shortNames[activeDayIndex] || shortNames[0],
      dayNumber: targetDate.getDate(),
      month: targetDate.toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', { month: 'long' }),
      isoDate: isoStr,
      deadlines: activeDeadlines,
      isRealToday: weekOffset === 0 && activeDayIndex === realTodayIndex,
      allDays: shortNames.map((name, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dayIso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const dayDeadlines = (projects || []).filter(p => p && (p.deadline === dayIso || (p.deadline && p.deadline.startsWith(dayIso))));
        return {
          name,
          fullName: dayNames[i],
          index: i,
          num: d.getDate(),
          isoDate: dayIso,
          deadlines: dayDeadlines,
          hasDeadline: dayDeadlines.length > 0,
          isRealToday: weekOffset === 0 && i === realTodayIndex,
          isSelected: i === activeDayIndex
        };
      })
    };
  };

  const dayInfo = getDayInfo();
  const safeAllDays = Array.isArray(dayInfo?.allDays) ? dayInfo.allDays : [];
  const safeActiveDayIdx = Math.max(0, Math.min(activeDayIndex, Math.max(0, safeAllDays.length - 1)));
  const activeDayBlocks = getDayBlocks ? getDayBlocks(dayInfo?.isoDate) : (blocksByDay[activeDayIndex] || []);

  // Determine visible days based on viewMode
  const visibleDays = (() => {
    if (viewMode === '1day') {
      const day = safeAllDays[safeActiveDayIdx] || safeAllDays[0];
      return day ? [day] : [];
    }
    if (viewMode === '3days') {
      const startIdx = Math.max(0, Math.min(safeActiveDayIdx, Math.max(0, safeAllDays.length - 3)));
      return safeAllDays.slice(startIdx, startIdx + 3);
    }
    return safeAllDays;
  })();

  // Determine grid column template
  const getGridColsClass = () => {
    if (viewMode === '1day') return 'grid-cols-[50px_1fr]';
    if (viewMode === '3days') return 'grid-cols-[42px_1fr_1fr_1fr]';
    return 'grid-cols-[44px_repeat(7,1fr)]';
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
    // If end is 00:00 (midnight) and started earlier, treat as 24:00 (1440 min)
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
    <div 
      className="md:hidden flex flex-col h-[calc(100vh-130px)] h-[calc(100dvh-130px)] bg-card rounded-2xl border border-gray-200/80 dark:border-darkBorder shadow-sm relative transition-colors overflow-hidden"
    >
      
      {/* Mobile Sticky Navigation Header */}
      <div className="px-3.5 py-2.5 bg-card border-b border-gray-200/80 dark:border-darkBorder flex-shrink-0 select-none transition-colors">
        
        {/* Row 1: Title + View Mode Switcher */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-textMain capitalize truncate">
                {viewMode === '1day' && `${dayInfo.fullName} ${dayInfo.dayNumber} ${dayInfo.month}`}
                {viewMode === '3days' && `${visibleDays[0].name} ${visibleDays[0].num} – ${visibleDays[visibleDays.length - 1].name} ${visibleDays[visibleDays.length - 1].num}`}
                {viewMode === 'week' && t('weekOfRange', dayInfo.allDays[0].num, dayInfo.month, dayInfo.allDays[6].num, dayInfo.month)}
              </h2>
              {viewMode === '1day' && dayInfo.isRealToday && (
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex-shrink-0">
                  {t('todayShort')}
                </span>
              )}
            </div>
            <p className="text-[11px] text-textMuted mt-0.5 truncate">
              {viewMode === '1day' && (lang === 'en' 
                ? `${activeDayBlocks.length} block${activeDayBlocks.length > 1 ? 's' : ''} • ${dayInfo.deadlines.length} deadline${dayInfo.deadlines.length > 1 ? 's' : ''}`
                : `${activeDayBlocks.length} activité${activeDayBlocks.length > 1 ? 's' : ''} • ${dayInfo.deadlines.length} échéance${dayInfo.deadlines.length > 1 ? 's' : ''}`)}
              {viewMode === '3days' && (lang === 'en' ? '3-Day View' : 'Vue 3 jours')}
              {viewMode === 'week' && (lang === 'en' ? '7-Day View • Swipe horizontally' : 'Vue semaine complète • Glisser horizontalement')}
            </p>
          </div>

          {/* Segmented Switcher */}
          <div className="flex items-center bg-background p-1 rounded-xl border border-gray-200 dark:border-darkBorder shadow-sm flex-shrink-0">
            <button 
              type="button"
              onClick={() => onViewModeChange && onViewModeChange('1day')}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
                viewMode === '1day'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-textMuted hover:text-textMain'
              }`}
            >
              {lang === 'en' ? '1D' : '1J'}
            </button>
            <button 
              type="button"
              onClick={() => onViewModeChange && onViewModeChange('3days')}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
                viewMode === '3days'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-textMuted hover:text-textMain'
              }`}
            >
              {lang === 'en' ? '3D' : '3J'}
            </button>
            <button 
              type="button"
              onClick={() => onViewModeChange && onViewModeChange('week')}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
                viewMode === 'week'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-textMuted hover:text-textMain'
              }`}
            >
              {lang === 'en' ? '7D' : 'Sem.'}
            </button>
          </div>
        </div>

        {/* Row 2: Navigation controls + Quick Add */}
        <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-gray-100 dark:border-darkBorder">
          {/* Navigation Arrows */}
          <div className="flex items-center gap-1 bg-background p-0.5 rounded-xl border border-gray-200 dark:border-darkBorder shadow-sm flex-shrink-0">
            <button 
              onClick={handlePrev} 
              className="p-1 rounded-lg hover:bg-card text-textMuted hover:text-textMain active:scale-95 transition-all"
              title={viewMode === 'week' ? (lang === 'en' ? "Previous week" : "Semaine précédente") : (lang === 'en' ? "Previous" : "Précédent")}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={handleGoToToday} 
              className="px-2 py-0.5 text-[11px] font-bold text-textMain hover:text-primary"
            >
              {lang === 'en' ? 'Today' : "Aujourd'hui"}
            </button>
            <button 
              onClick={handleNext} 
              className="p-1 rounded-lg hover:bg-card text-textMuted hover:text-textMain active:scale-95 transition-all"
              title={viewMode === 'week' ? (lang === 'en' ? "Next week" : "Semaine suivante") : (lang === 'en' ? "Next" : "Suivant")}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Quick Add Button on mobile */}
          <button
            onClick={onNewTask}
            className="bg-primary hover:bg-primary/90 text-white font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 text-xs shadow-sm shadow-primary/25 active:scale-95 transition-all"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>{lang === 'en' ? '+ Add' : '+ Ajouter'}</span>
          </button>
        </div>

        {/* 7-Days Quick Bar (When in 1day or 3days mode) */}
        {viewMode !== 'week' && (
          <div className="grid grid-cols-7 gap-1 mt-2.5 pt-2 border-t border-gray-100 dark:border-darkBorder text-center">
            {dayInfo.allDays.map((d) => {
              const isVisibleIn3Days = viewMode === '3days' && visibleDays.some(vd => vd.index === d.index);
              return (
                <button
                  key={d.name}
                  type="button"
                  onClick={() => setActiveDayIndex(d.index)}
                  className={`py-1 rounded-xl text-center relative transition-all ${
                    d.isSelected 
                      ? 'bg-primary text-white font-bold shadow-sm' 
                      : isVisibleIn3Days
                        ? 'bg-primary/15 dark:bg-primary/25 text-primary dark:text-indigo-200 font-bold border border-primary/30'
                        : d.isRealToday 
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30' 
                          : 'text-textMuted dark:text-darkTextMuted hover:bg-gray-100 dark:hover:bg-darkCardElevated'
                  }`}
                >
                  <span className="text-[9px] uppercase block font-semibold">{d.name}</span>
                  <span className="text-xs font-bold block mt-0.5">{d.num}</span>
                  {d.hasDeadline && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 absolute top-1 right-1" title={lang === 'en' ? 'Project deadline on this day' : 'Échéance projet ce jour'} />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Active Deadlines alert banner on mobile */}
        {dayInfo.deadlines.length > 0 && viewMode === '1day' && (
          <div className="mt-2.5 space-y-1">
            {dayInfo.deadlines.map(p => (
              <div key={p.id} className="bg-red-600 text-white rounded-xl p-2 flex items-center justify-between text-xs font-bold shadow-sm">
                <span className="flex items-center gap-1.5">
                  <Target size={14} />
                  <span>{t('projectDeadline')} : {p.name}</span>
                </span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md uppercase">{t('todayBadge')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid Canvas with Auto-Scroll to Active Hour */}
      <div 
        ref={scrollContainerRef} 
        className={`flex-1 min-h-0 relative ${viewMode === 'week' ? 'overflow-x-auto overflow-y-auto' : 'overflow-x-hidden overflow-y-auto'} pt-2 touch-auto overscroll-contain`}
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y' }}
      >
        <div className={viewMode === 'week' ? 'min-w-[640px]' : 'w-full'}>
          
          {/* Column Headers for 3days and week rendered inside scrollable container */}
          {viewMode !== '1day' && (
            <div className={`grid ${getGridColsClass()} border-b border-gray-200/80 dark:border-darkBorder bg-card select-none mb-1`}>
              <div className={`p-2 flex items-center justify-center text-textMuted text-[10px] font-bold ${viewMode === 'week' ? 'sticky left-0 bg-card z-30 shadow-[1px_0_3px_rgba(0,0,0,0.06)]' : ''}`}>
                <Clock size={12} />
              </div>
              {visibleDays.filter(Boolean).map((d) => (
                <div 
                  key={d.name}
                  onClick={() => setActiveDayIndex(d.index)}
                  className={`py-2 px-1 text-center border-l border-gray-100 dark:border-darkBorder cursor-pointer transition-all ${
                    d.isSelected 
                      ? 'bg-primary/15 border-t-2 border-t-primary' 
                      : d.isRealToday 
                        ? 'bg-emerald-500/10 border-t-2 border-t-emerald-500' 
                        : ''
                  }`}
                >
                  <span className={`text-[10px] uppercase font-bold block ${d.isSelected ? 'text-primary' : d.isRealToday ? 'text-emerald-700 dark:text-emerald-300' : 'text-textMuted'}`}>
                    {d.name}
                  </span>
                  <span className={`text-xs font-extrabold block mt-0.5 ${d.isSelected ? 'text-primary' : d.isRealToday ? 'text-emerald-700 dark:text-emerald-300' : 'text-textMain'}`}>
                    {d.num}
                  </span>
                  {d.deadlines.length > 0 && (
                    <div className="flex justify-center mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" title={`${t('projectDeadline')} : ${d.deadlines[0].name}`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className={`grid ${getGridColsClass()} relative min-h-[1536px] pb-16`}>
            
            {/* Time Gutter */}
            <div className={`border-r border-gray-200/60 dark:border-darkBorder bg-background select-none z-10 ${viewMode === 'week' ? 'sticky left-0 bg-background/95 backdrop-blur-sm z-20 shadow-[1px_0_3px_rgba(0,0,0,0.06)]' : ''}`}>
              {hours.map((h) => (
                <div 
                  key={h} 
                  style={{ height: `${hourHeight}px` }} 
                  className={`text-[10px] font-bold text-textMuted text-right pr-1.5 transition-colors ${
                    h === 0 
                      ? 'pt-2 text-textMain' 
                      : '-mt-2'
                  }`}
                >
                  {h.toString().padStart(2, '0')}:00
                </div>
              ))}
              {/* End of day / Midnight demarcation badge */}
              <div className="text-right pr-1.5 -mt-2 select-none">
                <span 
                  className="text-[9px] font-extrabold text-textMuted/90 bg-slate-100 dark:bg-darkCard px-1 py-0.5 rounded border border-gray-200/80 dark:border-darkBorder shadow-xs inline-block"
                  title={lang === 'en' ? 'Midnight (End of day)' : 'Minuit (Fin de journée)'}
                >
                  00:00
                </span>
              </div>
            </div>

            {/* Current Time Laser Indicator (Only if looking at today in visible days) */}
            {currentTimeOffset !== null && weekOffset === 0 && visibleDays.some(d => d.isRealToday) && (
              <div 
                style={{ top: `${currentTimeOffset}px` }} 
                className={`absolute ${viewMode === '1day' ? 'left-[50px]' : viewMode === '3days' ? 'left-[42px]' : 'left-[44px]'} right-0 z-20 flex items-center pointer-events-none`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-red-600 -ml-1 flex-shrink-0 animate-pulse shadow-sm" />
                <div className="h-[2px] w-full bg-red-600 shadow-sm" />
              </div>
            )}

            {/* Visible Day Columns */}
            {visibleDays.filter(Boolean).map((d) => {
              const dayBlocks = getDayBlocks ? getDayBlocks(d.isoDate) : (blocksByDay[d.index] || []);
              const isColumnHovered = dragPreview?.dayIndex === d.index;

              return (
                <div 
                  key={d.name}
                  data-day-index={d.index}
                  data-iso-date={d.isoDate}
                  onDragOver={(e) => handleColumnDragOver(e, d.index, d.isoDate)}
                  onDragLeave={(e) => handleColumnDragLeave(e, d.index)}
                  onDrop={(e) => handleColumnDrop(e, d.index, d.isoDate)}
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
                  {/* Hour clickable slots */}
                  {hours.map((h) => (
                    <div 
                      key={h} 
                      style={{ height: `${hourHeight}px` }} 
                      className="border-b border-gray-100 dark:border-darkBorder/60 w-full active:bg-primary/[0.06] transition-colors"
                      onClick={() => onNewTaskAtSlot && onNewTaskAtSlot(d.index, `${h.toString().padStart(2, '0')}:00`, d.isoDate)}
                    />
                  ))}

                  {/* Subtle End-of-Day (Midnight) boundary label under Hour 23 */}
                  <div className="h-6 border-b-2 border-dashed border-gray-200/60 dark:border-darkBorder/60 flex items-center justify-center pointer-events-none opacity-40">
                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-textMuted">
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
                      className="absolute inset-x-1 rounded-xl border-2 border-dashed border-primary bg-primary/25 backdrop-blur-sm z-30 pointer-events-none p-1.5 flex flex-col justify-between shadow-xl ring-2 ring-primary/30 transition-all animate-pulse"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-black text-primary truncate">
                          {activeDraggedBlock.block.title}
                        </span>
                        <span className="text-[9px] font-extrabold px-1 py-0.5 rounded bg-primary text-white shadow-sm flex-shrink-0">
                          {dragPreview.startTimeStr} - {dragPreview.endTimeStr}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-primary/80">
                        {t('dropToReschedule')}
                      </span>
                    </div>
                  )}

                  {/* Time Blocks on this day */}
                  {dayBlocks.map((block) => (
                    <TimeBlock 
                      key={block.id} 
                      block={block} 
                      dayIndex={d.index}
                      isDragging={activeDraggedBlock?.block?.id === block.id}
                      onDragBlockStart={(b, idx, grabY) => handleDragBlockStart(b, idx, grabY, d.isoDate)}
                      onDragBlockEnd={handleDragBlockEnd}
                      onTouchDragMove={handleTouchDragMove}
                      onTouchDragEnd={handleTouchDragEnd}
                      onToggleCheck={onToggleCheck} 
                      onEditBlock={(b) => onEditBlock && onEditBlock(b, d.index, d.isoDate)}
                      style={{ 
                        top: `${timeToTop(block.start)}px`, 
                        height: `${getDurationHeight(block.start, block.end)}px` 
                      }} 
                      isMobile={true} 
                    />
                  ))}
                </div>
              );
            })}

          </div>
        </div>
      </div>

    </div>
  );
};

export default DayView;