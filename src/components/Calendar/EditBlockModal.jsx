import React, { useState, useEffect } from 'react';
import { X, Clock, Trash2, Edit3, Calendar, CheckSquare } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const EditBlockModal = ({ 
  isOpen, 
  onClose, 
  block, 
  dayIndex = 0, 
  isoDate = '',
  onSaveBlock, 
  onDeleteBlock 
}) => {
  const { lang } = useLanguage();

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

  if (!isOpen || !block) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSaveBlock({
      ...block,
      ...form
    }, form.dayIndex, form.date);
    onClose();
  };

  const daysNames = lang === 'en'
    ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    : ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[85] flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-darkBorder transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-darkBorder">
          <div className="flex items-center gap-2">
            <Edit3 size={18} className="text-primary" />
            <h3 className="text-lg font-bold text-textMain">
              {lang === 'en' ? 'Edit Scheduled Block' : 'Modifier le Bloc Horaire'}
            </h3>
          </div>
          <button onClick={onClose} className="text-textMuted hover:text-textMain font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          
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
              className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-sm text-textMain focus:outline-none focus:border-primary" 
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
              className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-sm text-textMain focus:outline-none focus:border-primary" 
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
                className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-sm text-textMain focus:outline-none focus:border-primary cursor-pointer" 
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
                className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-sm text-textMain focus:outline-none focus:border-primary" 
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
                className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-sm text-textMain focus:outline-none focus:border-primary" 
              />
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

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-darkBorder">
            <button 
              type="button" 
              onClick={() => {
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
              }} 
              className="text-danger hover:bg-danger/10 p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 size={15} />
              <span>{lang === 'en' ? 'Delete' : 'Supprimer'}</span>
            </button>

            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2 rounded-xl text-xs font-semibold text-textMuted hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {lang === 'en' ? 'Cancel' : 'Annuler'}
              </button>
              <button 
                type="submit" 
                className="bg-primary hover:bg-primary/90 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-sm"
              >
                {lang === 'en' ? 'Save Changes' : 'Enregistrer'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

export default EditBlockModal;
