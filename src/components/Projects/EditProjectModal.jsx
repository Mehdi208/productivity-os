import React, { useState, useEffect } from 'react';
import { Edit3, Trash2, Calendar, Flag } from 'lucide-react';
import { PRIORITY_LEVELS } from '../../data/priorityEngine';
import { useLanguage } from '../../context/LanguageContext';

const EditProjectModal = ({ isOpen, onClose, project, onSaveProject, onDeleteProject }) => {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: project?.name || '',
    subtitle: project?.subtitle || '',
    description: project?.description || '',
    deadline: project?.deadline || '',
    priorityKey: project?.priorityKey || 'normal',
    status: project?.status || 'In Progress',
    statusType: project?.statusType || 'primary',
    completedAt: project?.completedAt || null
  });

  useEffect(() => {
    if (project) {
      setForm({
        name: project.name || '',
        subtitle: project.subtitle || '',
        description: project.description || '',
        deadline: project.deadline || '',
        priorityKey: project.priorityKey || 'normal',
        status: project.status || 'In Progress',
        statusType: project.statusType || 'primary',
        completedAt: project.completedAt || null
      });
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const priorityOptions = [
    { key: 'low', label: t('priorityLow'), ...PRIORITY_LEVELS.LOW },
    { key: 'normal', label: t('priorityNormal'), ...PRIORITY_LEVELS.NORMAL },
    { key: 'important', label: t('priorityImportant'), ...PRIORITY_LEVELS.IMPORTANT },
    { key: 'urgent', label: t('priorityUrgent'), ...PRIORITY_LEVELS.URGENT }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const isDone = form.status === 'Done';
    const finalCompletedAt = isDone 
      ? (form.completedAt || new Date().toISOString().split('T')[0]) 
      : null;

    onSaveProject({
      ...project,
      ...form,
      completedAt: finalCompletedAt,
      priority: PRIORITY_LEVELS[form.priorityKey.toUpperCase()] || PRIORITY_LEVELS.NORMAL
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
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
            <h3 className="text-base sm:text-lg font-bold text-textMain">{t('editProjectModalTitle')}</h3>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 rounded-xl flex items-center justify-center text-textMuted hover:text-textMain hover:bg-gray-100 dark:hover:bg-darkCard transition-colors font-bold text-base cursor-pointer"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6 py-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-textMuted block mb-1">{t('projectNameLabel')}</label>
              <input 
                type="text" 
                required 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-base sm:text-sm text-textMain focus:outline-none focus:border-primary" 
              />
            </div>

          {/* Priority / Importance Selector */}
          <div>
            <label className="text-xs font-semibold text-textMuted block mb-1.5 flex items-center gap-1">
              <Flag size={13} className="text-primary" />
              <span>{t('projectPriorityLabel')}</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {priorityOptions.map((opt) => {
                const isSelected = form.priorityKey === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setForm({ ...form, priorityKey: opt.key })}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 border ${
                      isSelected 
                        ? `${opt.bg} ${opt.color} ${opt.border} shadow-md scale-[1.02]` 
                        : 'bg-background text-textMuted border-gray-200 dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span className="text-[10px] truncate max-w-full">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-textMuted block mb-1">{t('categoryLabel')}</label>
              <input 
                type="text" 
                value={form.subtitle} 
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })} 
                className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-base sm:text-sm text-textMain focus:outline-none focus:border-primary" 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-textMuted block mb-1 flex items-center gap-1">
                <Calendar size={13} className="text-primary" />
                <span>{t('deadlineLabel')}</span>
              </label>
              <input 
                type="date" 
                required
                value={form.deadline} 
                onChange={(e) => setForm({ ...form, deadline: e.target.value })} 
                className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-base sm:text-sm text-textMain focus:outline-none focus:border-primary cursor-pointer" 
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-textMuted block mb-1">{t('projectStatusLabel')}</label>
            <select
              value={form.status}
              onChange={(e) => {
                const val = e.target.value;
                let statusType = 'primary';
                if (val === 'Not Started') statusType = 'slate';
                else if (val === 'Overdue') statusType = 'danger';
                else if (val === 'Done') statusType = 'secondary';
                else if (val === 'In Progress') statusType = 'primary';

                setForm({ 
                  ...form, 
                  status: val, 
                  statusType,
                  completedAt: val === 'Done' ? (form.completedAt || new Date().toISOString().split('T')[0]) : null
                });
              }}
              className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-base sm:text-sm text-textMain focus:outline-none focus:border-primary cursor-pointer font-medium"
            >
              <option value="Not Started">⚪ {t('statusNotStarted')}</option>
              <option value="In Progress">⏳ {t('statusInProgress')}</option>
              <option value="Overdue">🔴 {t('statusOverdue')}</option>
              <option value="Done">✅ {t('statusDone')}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-textMuted block mb-1">{t('descriptionLabel')}</label>
            <textarea 
              rows={2} 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-base sm:text-sm text-textMain focus:outline-none focus:border-primary" 
            />
          </div>

          </div>

          {/* Pinned Footer Actions */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-t border-gray-100 dark:border-darkBorder flex-shrink-0 bg-card/95 backdrop-blur-sm">
            {onDeleteProject ? (
              <button 
                type="button" 
                onClick={() => {
                  if (window.confirm(t('deleteProjectConfirm'))) {
                    onDeleteProject(project.id);
                    onClose();
                  }
                }} 
                className="text-danger hover:bg-danger/10 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer active:scale-95"
              >
                <Trash2 size={14} />
                <span>{t('delete')}</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-textMuted hover:bg-gray-100 dark:hover:bg-darkCard transition-colors cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button 
                type="submit" 
                className="bg-primary hover:bg-primary/90 text-white font-bold px-4 sm:px-5 py-2 rounded-xl text-xs shadow-sm transition-all active:scale-95 shadow-primary/20 cursor-pointer"
              >
                {t('saveProjectBtn')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;
