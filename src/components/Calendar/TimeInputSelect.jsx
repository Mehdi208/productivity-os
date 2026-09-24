import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Clock, ChevronDown, Check } from 'lucide-react';

/**
 * Pre-computed standard 15-minute time slots (00:00 to 23:45)
 * Generated once statically to ensure 0ms rendering latency
 */
const TIME_SLOTS_15MIN = (() => {
  const slots = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hStr = h.toString().padStart(2, '0');
      const mStr = m.toString().padStart(2, '0');
      slots.push(`${hStr}:${mStr}`);
    }
  }
  return slots;
})();

/**
 * Ultra-Responsive Zero-Latency Time Picker / Select Component
 * - Eliminates Chromium native time picker thread freezes on Windows
 * - Instant custom dropdown with 15-min increments
 * - Freeform keyboard typing support with auto-validation
 * - Quick preset chips (+15m, +30m, +1h) for instant adjustments
 */
const TimeInputSelect = ({
  value = '09:00',
  onChange,
  hasConflict = false,
  label = '',
  quickDurations = false, // If true, shows +15m, +30m, +1h chips (ideal for End Time)
  onAddDuration = null,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [typedValue, setTypedValue] = useState(value);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  // Sync internal typed value with prop
  useEffect(() => {
    setTypedValue(value || '09:00');
  }, [value]);

  // Click outside listener to close dropdown
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Scroll active time into view when opened
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'center' });
      }
    }
  }, [isOpen]);

  const handleSelectTime = (timeStr) => {
    setTypedValue(timeStr);
    onChange(timeStr);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setTypedValue(val);
    // If user typed a valid HH:MM format, propagate immediately
    if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(val)) {
      onChange(val);
    }
  };

  const handleInputBlur = () => {
    // On blur, normalize time or fallback to valid value
    if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(typedValue)) {
      onChange(typedValue);
    } else {
      setTypedValue(value);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="text-xs font-semibold text-textMuted block mb-1">
          {label}
        </label>
      )}

      {/* Input Field with Clock Icon and Dropdown Trigger */}
      <div 
        className={`flex items-center justify-between w-full bg-background border rounded-xl px-3 py-2 text-base sm:text-sm text-textMain transition-colors focus-within:ring-2 ${
          hasConflict 
            ? 'border-red-500 ring-red-500/20' 
            : isOpen 
              ? 'border-primary ring-primary/20' 
              : 'border-gray-200 dark:border-darkBorder hover:border-primary/50'
        } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Clock 
            size={16} 
            className={`flex-shrink-0 cursor-pointer ${hasConflict ? 'text-red-500' : 'text-primary'}`} 
            onClick={() => setIsOpen(prev => !prev)}
          />
          <input
            type="text"
            inputMode="numeric"
            value={typedValue}
            placeholder="09:00"
            maxLength={5}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={() => setIsOpen(true)}
            className="w-full bg-transparent font-semibold tracking-wider text-textMain focus:outline-none tabular-nums text-sm sm:text-base cursor-pointer"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className="text-textMuted hover:text-textMain p-0.5 rounded transition-transform duration-150"
          aria-label="Ouvrir les créneaux"
        >
          <ChevronDown size={16} className={`transition-transform duration-150 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
        </button>
      </div>

      {/* Quick Duration Chips (+15m, +30m, +1h) */}
      {quickDurations && onAddDuration && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="text-[10px] text-textMuted font-medium">Ajout rapide :</span>
          {[15, 30, 60].map(mins => (
            <button
              key={mins}
              type="button"
              onClick={() => onAddDuration(mins)}
              className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all active:scale-95"
            >
              +{mins < 60 ? `${mins}m` : `${mins / 60}h`}
            </button>
          ))}
        </div>
      )}

      {/* Fast, Zero-Lag Custom Dropdown */}
      {isOpen && (
        <div 
          ref={listRef}
          className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-card border border-gray-200 dark:border-darkBorder rounded-2xl shadow-xl max-h-56 overflow-y-auto p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100"
          style={{ willChange: 'transform, opacity' }}
        >
          <div className="px-2 py-1 text-[10px] font-bold text-textMuted uppercase tracking-wider sticky top-0 bg-card/95 backdrop-blur-none border-b border-gray-100 dark:border-darkBorder mb-1">
            Créneaux (15 min)
          </div>
          {TIME_SLOTS_15MIN.map((time) => {
            const isSelected = time === value;
            return (
              <button
                key={time}
                type="button"
                data-selected={isSelected}
                onClick={() => handleSelectTime(time)}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-primary text-white font-bold shadow-sm'
                    : 'text-textMain hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span className="tabular-nums">{time}</span>
                {isSelected && <Check size={14} className="text-white" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(TimeInputSelect);
