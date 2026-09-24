import React, { useRef, useState, useEffect } from 'react';
import { Check, Video, Edit3, GripVertical } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const TimeBlock = ({ 
  block, 
  onToggleCheck, 
  onEditBlock, 
  style, 
  isMobile = false,
  dayIndex,
  onDragBlockStart,
  onDragBlockEnd,
  onTouchDragMove,
  onTouchDragEnd,
  isDragging = false,
  onResizeBlockStart,
  isResizing = false,
  resizingEndStr = null
}) => {
  const { lang, t } = useLanguage();
  const { id, title, start, end, color = '#6C63FF', checkable, checked, subtitle, hasVideo } = block;
  const displayedEnd = (isResizing && resizingEndStr) ? resizingEndStr : end;

  const touchTimerRef = useRef(null);
  const touchStartPosRef = useRef({ x: 0, y: 0 });
  const grabOffsetRef = useRef(0);
  const dragJustEndedRef = useRef(false);
  const resizeJustEndedRef = useRef(false);
  const prevIsResizingRef = useRef(isResizing);
  const [isTouchDragging, setIsTouchDragging] = useState(false);

  useEffect(() => {
    if (prevIsResizingRef.current && !isResizing) {
      resizeJustEndedRef.current = true;
      const timer = setTimeout(() => {
        resizeJustEndedRef.current = false;
      }, 500);
      return () => clearTimeout(timer);
    }
    prevIsResizingRef.current = isResizing;
  }, [isResizing]);

  const getBackgroundColor = (hex) => {
    switch (hex) {
      case '#3B82F6': 
        return { 
          bg: 'bg-blue-100 dark:bg-blue-950/90', 
          border: 'border-blue-400 dark:border-blue-500 shadow-sm', 
          text: 'text-blue-950 dark:text-blue-100 font-bold', 
          subText: 'text-blue-800 dark:text-blue-300 font-semibold', 
          accent: '#2563EB' 
        };
      case '#6C63FF': 
        return { 
          bg: 'bg-indigo-100 dark:bg-indigo-950/90', 
          border: 'border-indigo-400 dark:border-indigo-500 shadow-sm', 
          text: 'text-indigo-950 dark:text-indigo-100 font-bold', 
          subText: 'text-indigo-800 dark:text-indigo-300 font-semibold', 
          accent: '#6C63FF' 
        };
      case '#00D4AA': 
        return { 
          bg: 'bg-emerald-100 dark:bg-emerald-950/90', 
          border: 'border-emerald-400 dark:border-emerald-500 shadow-sm', 
          text: 'text-emerald-950 dark:text-emerald-100 font-bold', 
          subText: 'text-emerald-800 dark:text-emerald-300 font-semibold', 
          accent: '#059669' 
        };
      case '#F97316': 
        return { 
          bg: 'bg-orange-100 dark:bg-orange-950/90', 
          border: 'border-orange-400 dark:border-orange-500 shadow-sm', 
          text: 'text-orange-950 dark:text-orange-100 font-bold', 
          subText: 'text-orange-800 dark:text-orange-300 font-semibold', 
          accent: '#EA580C' 
        };
      case '#FF4757': 
        return { 
          bg: 'bg-red-100 dark:bg-red-950/90', 
          border: 'border-red-400 dark:border-red-500 shadow-sm', 
          text: 'text-red-950 dark:text-red-100 font-bold', 
          subText: 'text-red-800 dark:text-red-300 font-semibold', 
          accent: '#DC2626' 
        };
      default: 
        return { 
          bg: 'bg-slate-100 dark:bg-slate-900/90', 
          border: 'border-slate-400 dark:border-slate-600 shadow-sm', 
          text: 'text-slate-950 dark:text-slate-100 font-bold', 
          subText: 'text-slate-800 dark:text-slate-300 font-semibold', 
          accent: '#64748B' 
        };
    }
  };

  const rdvTheme = {
    bg: 'bg-emerald-50/95 dark:bg-emerald-950/90',
    border: 'border-emerald-500 dark:border-emerald-400 shadow-md ring-1 ring-emerald-500/40',
    text: 'text-emerald-950 dark:text-emerald-100 font-extrabold',
    subText: 'text-emerald-800 dark:text-emerald-300 font-semibold',
    accent: '#059669'
  };

  const theme = block.isChallengeRdv ? rdvTheme : getBackgroundColor(color);
  
  const handleCheckboxClick = (e) => { 
    e.stopPropagation(); 
    if (checkable && onToggleCheck) onToggleCheck(block.checkId || id); 
  };

  const handleCardClick = (e) => {
    e.stopPropagation();
    if (dragJustEndedRef.current) {
      dragJustEndedRef.current = false;
      return;
    }
    if (resizeJustEndedRef.current || isResizing) {
      resizeJustEndedRef.current = false;
      return;
    }
    if (isTouchDragging) return;
    if (onEditBlock) {
      onEditBlock(block);
    } else if (checkable && onToggleCheck) {
      onToggleCheck(block.checkId || id);
    }
  };

  // Touch Handlers for mobile (300ms long press to lift & drag without blocking scrolling)
  const handleTouchStart = (e) => {
    if (e.target.closest('button')) return;
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };

    const rect = e.currentTarget.getBoundingClientRect();
    grabOffsetRef.current = touch.clientY - rect.top;

    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
    }

    touchTimerRef.current = setTimeout(() => {
      // Trigger haptic feedback if available on mobile
      if (typeof window !== 'undefined' && window.navigator?.vibrate) {
        try { window.navigator.vibrate(40); } catch (_) {}
      }
      setIsTouchDragging(true);
      if (onDragBlockStart) {
        onDragBlockStart(block, dayIndex, grabOffsetRef.current, true);
      }
    }, 300);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPosRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPosRef.current.y);

    if (!isTouchDragging) {
      // If user moves finger more than 8px before 300ms, it is regular scrolling
      if (deltaX > 8 || deltaY > 8) {
        if (touchTimerRef.current) {
          clearTimeout(touchTimerRef.current);
          touchTimerRef.current = null;
        }
      }
    } else {
      // Active touch drag: notify parent with finger position
      if (onTouchDragMove) {
        onTouchDragMove(touch.clientX, touch.clientY);
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
    if (isTouchDragging) {
      setIsTouchDragging(false);
      dragJustEndedRef.current = true;
      setTimeout(() => { dragJustEndedRef.current = false; }, 200);
      if (onTouchDragEnd) {
        onTouchDragEnd();
      }
    }
  };

  const handleTouchCancel = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
    if (isTouchDragging) {
      setIsTouchDragging(false);
      if (onTouchDragEnd) {
        onTouchDragEnd();
      }
    }
  };

  const numericHeight = typeof style?.height === 'number' ? style.height : (parseInt(style?.height, 10) || 64);
  const isCompact = numericHeight < 56;

  return (
    <div 
      style={style} 
      draggable={!isResizing}
      onDragStart={(e) => {
        if (e.target.closest('button') || e.target.closest('[data-resize-handle="true"]')) {
          e.preventDefault();
          return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        const grabOffsetY = e.clientY - rect.top;
        try {
          e.dataTransfer.setData('text/plain', JSON.stringify({ blockId: id, dayIndex }));
          e.dataTransfer.effectAllowed = 'move';
        } catch (_) {}
        if (onDragBlockStart) {
          onDragBlockStart(block, dayIndex, grabOffsetY);
        }
      }}
      onDragEnd={() => {
        if (onDragBlockEnd) {
          onDragBlockEnd();
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onClick={handleCardClick} 
      className={`absolute ${style?.left ? '' : 'inset-x-1'} rounded-xl ${isCompact ? 'py-1 px-1.5 md:px-2 flex items-center' : 'p-2 md:p-2.5 flex flex-col justify-between'} border-2 transition-all duration-150 overflow-hidden select-none cursor-grab active:cursor-grabbing group hover:z-30 ${theme.bg} ${theme.border} ${checked ? 'opacity-40 grayscale' : isTouchDragging ? 'touch-none scale-[1.03] shadow-2xl z-40 ring-2 ring-primary ring-offset-2 opacity-95 border-primary' : isDragging ? 'opacity-25 scale-95 border-dashed' : isResizing ? 'ring-2 ring-primary ring-offset-1 border-primary shadow-2xl z-40 scale-[1.01]' : 'hover:shadow-lg hover:scale-[1.01] z-10'}`}
      title={`${title} (${start} - ${displayedEnd})${subtitle ? ' • ' + subtitle : ''} — ${lang === 'en' ? 'Hold & drag to reschedule' : 'Maintenir pour déplacer'}`}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl" style={{ backgroundColor: theme.accent }} />
      
      {isCompact ? (
        /* Compact Single-Row Layout: never clips text on short 15-30min tasks */
        <div className="pl-1.5 flex items-center justify-between gap-1.5 w-full min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <GripVertical size={11} className="opacity-0 group-hover:opacity-60 text-slate-500 dark:text-slate-400 flex-shrink-0 transition-opacity -ml-0.5" />
            {checkable && (
              <button 
                type="button" 
                onClick={handleCheckboxClick} 
                className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors flex-shrink-0 ${
                  checked 
                    ? 'bg-primary border-primary text-white' 
                    : 'bg-white dark:bg-darkBg border-slate-500 hover:border-primary'
                }`}
              >
                {checked && <Check size={10} strokeWidth={3} />}
              </button>
            )}
            {block.isChallengeRdv && (
              <span className="text-[9px] font-black uppercase px-1 py-0.2 rounded bg-emerald-600 text-white flex-shrink-0 leading-none">
                🤝 RDV
              </span>
            )}
            <span className={`text-[11px] md:text-xs font-bold truncate leading-tight ${theme.text} ${checked ? 'line-through opacity-70' : ''}`}>
              {block.isChallengeRdv && block.rdvDetails?.companyName ? block.rdvDetails.companyName : title}
            </span>
            <span className={`text-[10px] font-semibold opacity-75 whitespace-nowrap flex-shrink-0 leading-none ${theme.subText}`}>
              {start}-{displayedEnd}
            </span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {hasVideo && <Video size={12} className="text-primary flex-shrink-0 hidden md:block" />}
            {onEditBlock && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onEditBlock(block); }}
                className={`${block.isChallengeRdv ? 'opacity-100 bg-emerald-600 text-white hover:bg-emerald-700' : 'opacity-0 group-hover:opacity-100 bg-white/90 dark:bg-darkCard text-textMuted hover:text-primary'} p-0.5 rounded transition-opacity`}
                title={block.isChallengeRdv ? 'Détails du Rendez-vous' : t('editBlock')}
              >
                <Edit3 size={11} />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Full Multi-Row Layout for taller time blocks */
        <div className="pl-2 flex items-start justify-between gap-1">
          <div className="flex items-start gap-1.5 min-w-0">
            <GripVertical size={13} className="opacity-0 group-hover:opacity-60 text-slate-500 dark:text-slate-400 flex-shrink-0 transition-opacity mt-0.5 -ml-1" />
            {checkable && (
              <button 
                type="button" 
                onClick={handleCheckboxClick} 
                className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border-2 transition-colors flex-shrink-0 ${
                  checked 
                    ? 'bg-primary border-primary text-white' 
                    : 'bg-white dark:bg-darkBg border-slate-500 hover:border-primary'
                }`}
              >
                {checked && <Check size={12} strokeWidth={3} />}
              </button>
            )}
            <div className="min-w-0">
              {block.isChallengeRdv && (
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                    🤝 RDV PROSPECT
                  </span>
                  {block.rdvDetails?.contactPerson && (
                    <span className="text-[10px] text-emerald-800 dark:text-emerald-200 font-bold truncate max-w-[120px]">
                      • {block.rdvDetails.contactPerson}
                    </span>
                  )}
                </div>
              )}
              <h4 className={`text-xs md:text-sm font-extrabold truncate leading-tight ${theme.text} ${checked ? 'line-through opacity-70' : ''}`}>
                {block.isChallengeRdv && block.rdvDetails?.companyName ? `🤝 ${block.rdvDetails.companyName}` : title}
              </h4>
              <p className={`text-[10px] md:text-xs mt-0.5 ${theme.subText} truncate`}>
                {start} - {displayedEnd} {block.isChallengeRdv && block.rdvDetails?.budget ? `• ${block.rdvDetails.budget}` : (subtitle ? `• ${subtitle}` : '')} {block.isChallengeRdv && block.rdvDetails?.location ? `• 📍 ${block.rdvDetails.location}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {hasVideo && <Video size={14} className="text-primary flex-shrink-0 mt-0.5 mr-1 hidden md:block" />}
            {onEditBlock && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onEditBlock(block); }}
                className={`${block.isChallengeRdv ? 'opacity-100 bg-emerald-600 text-white hover:bg-emerald-700' : 'opacity-0 group-hover:opacity-100 bg-white/90 dark:bg-darkCard text-textMuted hover:text-primary'} p-1 rounded-lg shadow-sm transition-opacity`}
                title={block.isChallengeRdv ? 'Détails du Rendez-vous' : t('editBlock')}
              >
                <Edit3 size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Google Calendar Style Bottom Resize Handle */}
      {onResizeBlockStart && (
        <div
          data-resize-handle="true"
          className="absolute bottom-0 inset-x-0 h-4.5 md:h-3.5 cursor-ns-resize z-30 flex items-center justify-center opacity-70 md:opacity-0 md:group-hover:opacity-100 hover:opacity-100 active:opacity-100 transition-all touch-none select-none"
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            resizeJustEndedRef.current = true;
            setTimeout(() => { resizeJustEndedRef.current = false; }, 400);
            onResizeBlockStart(block, dayIndex, e);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            if (typeof window !== 'undefined' && window.navigator?.vibrate) {
              try { window.navigator.vibrate(30); } catch (_) {}
            }
            resizeJustEndedRef.current = true;
            setTimeout(() => { resizeJustEndedRef.current = false; }, 400);
            if (e.touches?.[0]) {
              onResizeBlockStart(block, dayIndex, e.touches[0]);
            }
          }}
          title={lang === 'en' ? 'Drag up or down to adjust end time' : "Glisser pour modifier l'heure de fin"}
        >
          <div className="w-10 md:w-8 h-1 md:h-0.5 rounded-full bg-slate-500/80 dark:bg-slate-300/80 shadow-xs" />
        </div>
      )}
    </div>
  );
};
export default React.memo(TimeBlock);
