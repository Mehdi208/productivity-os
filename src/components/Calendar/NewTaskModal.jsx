import React, { useMemo } from 'react';
import { AlertTriangle, Clock, Lock, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  checkSlotConflict, 
  getHourlyAvailability, 
  getAvailableDaySlots, 
  timeStrToMinutes, 
  minutesToTimeStr 
} from '../../utils/calendarLayout';

const COLOR_OPTIONS = ['#6C63FF', '#3B82F6', '#00D4AA', '#F97316', '#FF4757', '#64748B'];

const NewTaskModal = ({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  getDayBlocks,
  dailyRoutines = []
}) => {
  const { lang, t } = useLanguage();

  // Retrieve existing blocks for target date / routines to evaluate availability
  const targetBlocks = useMemo(() => {
    if (!isOpen) return [];
    if (form.isRoutine) {
      // When creating a routine, compare against other existing daily routines
      return Array.isArray(dailyRoutines) ? dailyRoutines : [];
    }
    const targetDate = form.date || new Date().toISOString().split('T')[0];
    return getDayBlocks ? getDayBlocks(targetDate) : [];
  }, [isOpen, form.isRoutine, form.date, getDayBlocks, dailyRoutines]);

  // Real-time conflict analysis as user types or adjusts hours
  const conflict = useMemo(() => {
    if (!isOpen || !form.start || !form.end) return { hasConflict: false };
    return checkSlotConflict(form.start, form.end, targetBlocks, null);
  }, [isOpen, form.start, form.end, targetBlocks]);

  // Hourly availability (06:00 to 22:00) with blocked status
  const hourlySlots = useMemo(() => {
    if (!isOpen) return [];
    return getHourlyAvailability(targetBlocks, null, 6, 22);
  }, [isOpen, targetBlocks]);

  // Continuous free slots throughout the day
  const freeSlots = useMemo(() => {
    if (!isOpen) return [];
    return getAvailableDaySlots(targetBlocks, 30, '06:00', '23:00');
  }, [isOpen, targetBlocks]);

  if (!isOpen) return null;

  // Handler to apply a free slot
  const handleApplySlot = (slot) => {
    setForm(prev => ({
      ...prev,
      start: slot.start,
      end: slot.end
    }));
  };

  // Handler to shift after conflicting block
  const handleAutoShift = () => {
    if (conflict?.suggestedStart && conflict?.suggestedEnd) {
      setForm(prev => ({
        ...prev,
        start: conflict.suggestedStart,
        end: conflict.suggestedEnd
      }));
    }
  };

  // Handler for clicking an hour from the hourly selector
  const handleSelectHour = (hItem) => {
    if (hItem.isBlocked) return;
    const startM = timeStrToMinutes(hItem.timeStr);
    // Default duration 60 mins or preserve current duration
    const currentDur = (form.start && form.end) 
      ? Math.max(30, timeStrToMinutes(form.end) - timeStrToMinutes(form.start)) 
      : 60;
    const endM = Math.min(1439, startM + currentDur);
    setForm(prev => ({
      ...prev,
      start: hItem.timeStr,
      end: minutesToTimeStr(endM)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-darkBorder transition-all max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-darkBorder">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            <h3 className="text-lg font-bold text-textMain">
              {lang === 'en' ? '✨ New Scheduled Slot' : '✨ Nouveau Créneau'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-textMuted hover:text-textMain font-bold p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-textMuted block mb-1">
              {lang === 'en' ? 'Task / Slot Title' : 'Titre de la tâche / créneau'}
            </label>
            <input 
              type="text" 
              required 
              placeholder={lang === 'en' ? 'e.g. Deep Work, Workout, or Client Call' : 'ex: Deep Work, Sport ou Réunion Projet'} 
              value={form.title} 
              onChange={(e) => setForm({ ...form, title: e.target.value })} 
              className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-sm text-textMain focus:outline-none focus:border-primary" 
            />
          </div>

          {/* Subtitle / Notes */}
          <div>
            <label className="text-xs font-semibold text-textMuted block mb-1">
              {lang === 'en' ? 'Notes / Subtitle' : 'Description / Sous-titre'}
            </label>
            <input 
              type="text" 
              placeholder={lang === 'en' ? 'e.g. Focused execution without distractions' : 'ex: Exécution focalisée sans distraction'} 
              value={form.subtitle} 
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })} 
              className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-sm text-textMain focus:outline-none focus:border-primary" 
            />
          </div>

          {/* Permanent Daily Routine Switcher */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🔁</span>
              <div>
                <label htmlFor="chkNewRoutine" className="text-xs font-bold text-textMain block cursor-pointer">
                  {t('permanentRoutine')}
                </label>
                <span className="text-[11px] text-textMuted">
                  {form.isRoutine 
                    ? t('permanentRoutineDesc')
                    : t('singleDayTaskDesc')}
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              id="chkNewRoutine"
              checked={form.isRoutine}
              onChange={(e) => setForm({ ...form, isRoutine: e.target.checked })}
              className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer"
            />
          </div>

          {/* Specific Date */}
          {!form.isRoutine && (
            <div>
              <label className="text-xs font-semibold text-textMuted block mb-1">
                {lang === 'en' ? 'Specific Date' : 'Date spécifique'}
              </label>
              <input 
                type="date" 
                required 
                value={form.date || new Date().toISOString().split('T')[0]} 
                onChange={(e) => {
                  const selectedDate = e.target.value;
                  const d = new Date(selectedDate);
                  const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
                  setForm({ ...form, date: selectedDate, dayIndex: dayIdx });
                }} 
                className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-sm text-textMain focus:outline-none focus:border-primary cursor-pointer" 
              />
            </div>
          )}

          {/* Time Inputs (Start & End) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-textMuted block mb-1">
                {lang === 'en' ? 'Start Time' : 'Heure de début'}
              </label>
              <div className="relative">
                <input 
                  type="time" 
                  required
                  value={form.start} 
                  onChange={(e) => setForm({ ...form, start: e.target.value })} 
                  className={`w-full bg-background border rounded-xl px-3 py-2 text-sm text-textMain focus:outline-none transition-colors ${
                    conflict.hasConflict 
                      ? 'border-red-500 ring-1 ring-red-500/30' 
                      : 'border-gray-200 dark:border-darkBorder focus:border-primary'
                  }`} 
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-textMuted block mb-1">
                {lang === 'en' ? 'End Time' : 'Heure de fin'}
              </label>
              <div className="relative">
                <input 
                  type="time" 
                  required
                  value={form.end} 
                  onChange={(e) => setForm({ ...form, end: e.target.value })} 
                  className={`w-full bg-background border rounded-xl px-3 py-2 text-sm text-textMain focus:outline-none transition-colors ${
                    conflict.hasConflict 
                      ? 'border-red-500 ring-1 ring-red-500/30' 
                      : 'border-gray-200 dark:border-darkBorder focus:border-primary'
                  }`} 
                />
              </div>
            </div>
          </div>

          {/* REAL-TIME CONFLICT ALERT BANNER */}
          {conflict.hasConflict && (
            <div className="bg-red-500/10 border-2 border-red-500/40 rounded-2xl p-3.5 space-y-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <AlertTriangle size={14} />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-black text-red-600 dark:text-red-400">
                    {t('slotConflictTitle')}
                  </h4>
                  <p className="text-xs font-semibold text-textMain mt-0.5">
                    {conflict.isInvalidRange 
                      ? (lang === 'en' ? conflict.messageEn : conflict.messageFr)
                      : t('slotConflictWarning', conflict.conflictBlock?.title || 'Activité', conflict.conflictBlock?.start, conflict.conflictBlock?.end)}
                  </p>
                  <p className="text-[11px] text-textMuted mt-0.5">
                    {t('slotConflictAdvice')}
                  </p>
                </div>
              </div>

              {/* One-click Auto Shift Button */}
              {conflict.suggestedStart && (
                <button
                  type="button"
                  onClick={handleAutoShift}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-2 px-3 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                >
                  <Clock size={14} />
                  <span>{t('shiftAfterSlot', conflict.suggestedStart)}</span>
                </button>
              )}
            </div>
          )}

          {/* VISUAL HOURLY AVAILABILITY SELECTOR (With 🔒 Blocked Hours) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-semibold text-textMuted">
              <span>{t('chooseQuickSlot')}</span>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> {t('slotAvailable')}
                </span>
                <span className="flex items-center gap-1 text-red-500 font-bold">
                  <Lock size={10} /> {t('slotBlocked')}
                </span>
              </div>
            </div>

            {/* Scrollable hour chips row */}
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 pt-0.5 select-none no-scrollbar">
              {hourlySlots.map((hItem) => {
                const isCurrentStart = form.start === hItem.timeStr;
                return (
                  <button
                    key={hItem.hour}
                    type="button"
                    disabled={hItem.isBlocked}
                    onClick={() => handleSelectHour(hItem)}
                    title={hItem.isBlocked ? `${t('slotBlocked')} : ${hItem.blockingTitle}` : `${t('slotAvailable')} : ${hItem.timeStr}`}
                    className={`flex-shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      hItem.isBlocked
                        ? 'bg-red-500/10 text-red-500/70 border border-red-500/20 line-through cursor-not-allowed opacity-60'
                        : isCurrentStart
                          ? 'bg-primary text-white shadow-sm ring-2 ring-primary/40 scale-105'
                          : 'bg-background hover:bg-primary/10 text-textMain border border-gray-200 dark:border-darkBorder hover:border-primary/40'
                    }`}
                  >
                    {hItem.isBlocked && <Lock size={11} className="flex-shrink-0" />}
                    <span>{hItem.timeStr}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RECOMMENDED FREE SLOTS CHIPS */}
          {freeSlots.length > 0 && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-3 space-y-1.5">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block">
                ✨ {t('availableSlotsTitle')} :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {freeSlots.slice(0, 4).map((slot, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplySlot(slot)}
                    className="bg-card hover:bg-emerald-500 hover:text-white border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-xs transition-colors flex items-center gap-1"
                  >
                    <Clock size={11} />
                    <span>{lang === 'en' ? slot.labelEn : slot.labelFr}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          <div>
            <label className="text-xs font-semibold text-textMuted block mb-1">
              {lang === 'en' ? 'Block Color' : 'Couleur du créneau'}
            </label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((hex) => (
                <button 
                  key={hex} 
                  type="button" 
                  onClick={() => setForm({ ...form, color: hex })} 
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    form.color === hex ? 'scale-125 border-textMain dark:border-white shadow-sm' : 'border-transparent'
                  }`} 
                  style={{ backgroundColor: hex }} 
                />
              ))}
            </div>
          </div>

          {/* Checkable toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input 
              type="checkbox" 
              id="chkCheckable" 
              checked={form.checkable} 
              onChange={(e) => setForm({ ...form, checkable: e.target.checked })} 
              className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer" 
            />
            <label htmlFor="chkCheckable" className="text-xs font-medium text-textMain cursor-pointer">
              {lang === 'en' ? 'Checkable task (counted in daily score)' : 'Tâche à cocher (comptée dans le score)'}
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-darkBorder">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 rounded-xl text-xs font-semibold text-textMuted hover:bg-gray-100 dark:hover:bg-darkCard"
            >
              {lang === 'en' ? 'Cancel' : 'Annuler'}
            </button>
            <button 
              type="submit" 
              disabled={conflict.hasConflict}
              className={`font-bold px-5 py-2 rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5 ${
                conflict.hasConflict
                  ? 'bg-red-500/20 text-red-500 border border-red-500/30 cursor-not-allowed opacity-80'
                  : 'bg-primary hover:bg-primary/90 text-white active:scale-95'
              }`}
            >
              {conflict.hasConflict ? (
                <>
                  <Lock size={13} />
                  <span>{t('btnSlotConflictDisabled')}</span>
                </>
              ) : (
                <span>{lang === 'en' ? 'Create Slot' : 'Créer le créneau'}</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default NewTaskModal;
