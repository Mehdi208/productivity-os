import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Trash2, Edit3, AlertTriangle, Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  checkSlotConflict, 
  getHourlyAvailability, 
  timeStrToMinutes, 
  minutesToTimeStr 
} from '../../utils/calendarLayout';

const EditBlockModal = ({ 
  isOpen, 
  onClose, 
  block, 
  dayIndex = 0, 
  isoDate = '',
  onSaveBlock, 
  onDeleteBlock,
  getDayBlocks,
  dailyRoutines = []
}) => {
  const { lang, t } = useLanguage();

  const initialDate = block?.date || isoDate || new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    title: block?.title || '',
    subtitle: block?.subtitle || '',
    start: block?.start || '09:00',
    end: block?.end || '10:30',
    color: block?.color || '#6C63FF',
    checkable: block?.checkable !== false,
    isRoutine: Boolean(block?.isRoutine),
    dayIndex: dayIndex,
    date: initialDate
  });

  useEffect(() => {
    if (block) {
      setForm({
        title: block.title || '',
        subtitle: block.subtitle || '',
        start: block.start || '09:00',
        end: block.end || '10:30',
        color: block.color || '#6C63FF',
        checkable: block.checkable !== false,
        isRoutine: Boolean(block.isRoutine),
        dayIndex: dayIndex,
        date: block.date || isoDate || new Date().toISOString().split('T')[0]
      });
    }
  }, [block, dayIndex, isoDate]);

  // Target blocks on the date or daily routines (ignoring this block's current id)
  const targetBlocks = useMemo(() => {
    if (!isOpen) return [];
    if (form.isRoutine) {
      return Array.isArray(dailyRoutines) ? dailyRoutines : [];
    }
    const targetDate = form.date || isoDate || block?.date || new Date().toISOString().split('T')[0];
    return getDayBlocks ? getDayBlocks(targetDate) : [];
  }, [isOpen, form.isRoutine, form.date, isoDate, block?.date, getDayBlocks, dailyRoutines]);

  // Conflict detection
  const conflict = useMemo(() => {
    if (!isOpen || !form.start || !form.end) return { hasConflict: false };
    return checkSlotConflict(form.start, form.end, targetBlocks, block?.id);
  }, [isOpen, form.start, form.end, targetBlocks, block?.id]);

  // Hourly slots (06:00 to 22:00) with 🔒 on blocked hours
  const hourlySlots = useMemo(() => {
    if (!isOpen) return [];
    return getHourlyAvailability(targetBlocks, block?.id, 6, 22);
  }, [isOpen, targetBlocks, block?.id]);

  const handleAutoShift = () => {
    if (conflict?.suggestedStart && conflict?.suggestedEnd) {
      setForm(prev => ({
        ...prev,
        start: conflict.suggestedStart,
        end: conflict.suggestedEnd
      }));
    }
  };

  const handleSelectHour = (hItem) => {
    if (hItem.isBlocked) return;
    const startM = timeStrToMinutes(hItem.timeStr);
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

  if (!isOpen || !block) return null;

  const handleDelete = () => {
    const confirmMsg = form.isRoutine
      ? (lang === 'en'
          ? "Delete this permanent daily routine? It will be removed from all days."
          : "Supprimer cette routine quotidienne ? Elle sera retirée de tous les jours.")
      : (lang === 'en'
          ? "Do you want to delete this block from your schedule?"
          : "Voulez-vous supprimer ce créneau de votre emploi du temps ?");
    if (window.confirm(confirmMsg)) {
      onDeleteBlock(block.id, dayIndex, form.date, form.isRoutine);
      onClose();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || conflict.hasConflict) return;
    onSaveBlock({
      ...block,
      ...form
    }, form.dayIndex, form.date);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[85] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-card rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-darkBorder transition-colors flex flex-col max-h-[88vh] max-h-[88dvh] my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Pinned Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-darkBorder flex-shrink-0 bg-card">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Edit3 size={16} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-textMain">
              {lang === 'en' ? 'Edit Scheduled Block' : 'Modifier le Créneau'}
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 rounded-xl flex items-center justify-center text-textMuted hover:text-textMain hover:bg-gray-100 dark:hover:bg-darkCard transition-colors font-bold text-base cursor-pointer"
            aria-label={lang === 'en' ? 'Close' : 'Fermer'}
          >
            ✕
          </button>
        </div>

        {/* Form Container with Separated Scrollable Body and Pinned Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6 py-4 space-y-4">
            
            {/* Permanent Daily Routine Switcher */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🔁</span>
              <div>
                <label htmlFor="modalRoutineToggle" className="text-xs font-bold text-textMain block cursor-pointer">
                  {lang === 'en' ? 'Permanent Daily Routine' : 'Routine quotidienne permanente'}
                </label>
                <span className="text-[11px] text-textMuted">
                  {form.isRoutine 
                    ? (lang === 'en' ? 'Repeats every day across all weeks' : 'Se répète chaque jour sur toutes les semaines')
                    : (lang === 'en' ? 'Single-day task only' : 'Activité pour cette date uniquement')}
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              id="modalRoutineToggle"
              checked={form.isRoutine}
              onChange={(e) => setForm({ ...form, isRoutine: e.target.checked })}
              className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-textMuted block mb-1">
              {lang === 'en' ? 'Activity / Task Title' : "Titre de l'activité / Tâche"}
            </label>
            <input 
              type="text" 
              required 
              value={form.title} 
              onChange={(e) => setForm({ ...form, title: e.target.value })} 
              className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-base sm:text-sm text-textMain focus:outline-none focus:border-primary" 
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-textMuted block mb-1">
              {lang === 'en' ? 'Description / Notes' : 'Description / Sous-titre'}
            </label>
            <input 
              type="text" 
              value={form.subtitle} 
              placeholder={lang === 'en' ? 'e.g. Uninterrupted focus or workout' : 'ex: Focus sans interruption ou Entraînement'} 
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })} 
              className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-base sm:text-sm text-textMain focus:outline-none focus:border-primary" 
            />
          </div>

          {!form.isRoutine && (
            <div>
              <label className="text-xs font-semibold text-textMuted block mb-1">
                {lang === 'en' ? 'Scheduled Date' : 'Date spécifique'}
              </label>
              <input 
                type="date" 
                required
                value={form.date} 
                onChange={(e) => setForm({ ...form, date: e.target.value })} 
                className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-base sm:text-sm text-textMain focus:outline-none focus:border-primary cursor-pointer" 
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-textMuted block mb-1">
                {lang === 'en' ? 'Start Time' : 'Heure de début'}
              </label>
              <input 
                type="time" 
                required 
                value={form.start} 
                onChange={(e) => setForm({ ...form, start: e.target.value })} 
                className={`w-full bg-background border rounded-xl px-3 py-2 text-base sm:text-sm text-textMain focus:outline-none transition-colors ${
                  conflict.hasConflict 
                    ? 'border-red-500 ring-1 ring-red-500/30' 
                    : 'border-gray-200 dark:border-darkBorder focus:border-primary'
                }`} 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-textMuted block mb-1">
                {lang === 'en' ? 'End Time' : 'Heure de fin'}
              </label>
              <input 
                type="time" 
                required 
                value={form.end} 
                onChange={(e) => setForm({ ...form, end: e.target.value })} 
                className={`w-full bg-background border rounded-xl px-3 py-2 text-base sm:text-sm text-textMain focus:outline-none transition-colors ${
                  conflict.hasConflict 
                    ? 'border-red-500 ring-1 ring-red-500/30' 
                    : 'border-gray-200 dark:border-darkBorder focus:border-primary'
                }`} 
              />
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


          <div>
            <label className="text-xs font-semibold text-textMuted block mb-1">
              {lang === 'en' ? 'Block Color' : 'Couleur du bloc'}
            </label>
            <div className="flex gap-2.5 pt-1">
              {['#6C63FF', '#3B82F6', '#00D4AA', '#F97316', '#FF4757', '#64748B'].map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setForm({ ...form, color: hex })}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    form.color === hex ? 'scale-125 border-textMain dark:border-white shadow-md' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="editCheckable" 
              checked={form.checkable} 
              onChange={(e) => setForm({ ...form, checkable: e.target.checked })} 
              className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer" 
            />
            <label htmlFor="editCheckable" className="text-xs font-medium text-textMain cursor-pointer">
              {lang === 'en' 
                ? 'Checkable block (included in daily productivity score)' 
                : 'Bloc à cocher (inclus dans le score de productivité)'}
            </label>
          </div>

          </div>

          {/* Pinned Footer Actions */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-t border-gray-100 dark:border-darkBorder flex-shrink-0 bg-card/95 backdrop-blur-sm">
            <button 
              type="button" 
              onClick={handleDelete} 
              className="text-danger hover:bg-danger/10 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
            >
              <Trash2 size={14} />
              <span>{lang === 'en' ? 'Delete' : 'Supprimer'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-textMuted hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                {lang === 'en' ? 'Cancel' : 'Annuler'}
              </button>
              <button 
                type="submit" 
                disabled={conflict.hasConflict}
                className={`font-bold px-4 sm:px-5 py-2 rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                  conflict.hasConflict
                    ? 'bg-red-500/20 text-red-500 border border-red-500/30 cursor-not-allowed opacity-80'
                    : 'bg-primary hover:bg-primary/90 text-white active:scale-95 shadow-primary/20'
                }`}
              >
                {conflict.hasConflict ? (
                  <>
                    <Lock size={13} />
                    <span>{t('btnSlotConflictDisabled')}</span>
                  </>
                ) : (
                  <span>{lang === 'en' ? 'Save Changes' : 'Enregistrer'}</span>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

export default EditBlockModal;
