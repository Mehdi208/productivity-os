import React, { useState } from 'react';
import { Plus, Layers, Filter, Flag, CheckCircle2, Clock, RefreshCw, AlertTriangle, RotateCcw, Globe } from 'lucide-react';
import ProjectCard from '../components/Projects/ProjectCard';
import EditProjectModal from '../components/Projects/EditProjectModal';
import { PRIORITY_LEVELS, autoPriority } from '../data/priorityEngine';
import { useLanguage } from '../context/LanguageContext';

const Projects = ({ 
  projects = [], 
  onNewProject, 
  onToggleSubtask, 
  onAddSubtask, 
  onDeleteSubtask, 
  onSaveProject, 
  onDeleteProject 
}) => {
  const { lang, toggleLanguage, t } = useLanguage();
  // Category 1: Priority / Importance Filter
  const [priorityFilter, setPriorityFilter] = useState('ALL'); // 'ALL' | 'urgent' | 'important' | 'normal' | 'low'
  
  // Category 2: Status Filter (takes Category 1 into account)
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Not Started' | 'In Progress' | 'Overdue' | 'Done'

  const [editingProject, setEditingProject] = useState(null);

  // Projects filtered by Priority first (Category 1)
  const projectsMatchingPriority = projects.filter(p => {
    if (priorityFilter === 'ALL') return true;
    const pPriority = p.priorityKey || (p.priority ? p.priority.key : autoPriority(p).key);
    return pPriority === priorityFilter;
  });

  // Final filtered projects combining Priority AND Status (Category 2)
  const filteredProjects = projectsMatchingPriority.filter(p => {
    if (statusFilter === 'ALL') return true;
    return p.status === statusFilter;
  });

  // Dynamic counts for Priority Filter (Category 1)
  const getPriorityCount = (key) => {
    if (key === 'ALL') return projects.length;
    return projects.filter(p => {
      const pPriority = p.priorityKey || (p.priority ? p.priority.key : autoPriority(p).key);
      return pPriority === key;
    }).length;
  };

  // Dynamic counts for Status Filter (Category 2, strictly scoped to the active Priority Filter)
  const getStatusCount = (st) => {
    if (st === 'ALL') return projectsMatchingPriority.length;
    return projectsMatchingPriority.filter(p => p.status === st).length;
  };

  const isFiltered = priorityFilter !== 'ALL' || statusFilter !== 'ALL';

  const handleResetFilters = () => {
    setPriorityFilter('ALL');
    setStatusFilter('ALL');
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 md:pb-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-darkBorder flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-textMain tracking-tight">
              {t('projectsTitle')}
            </h1>
            <span className="bg-primary/15 text-primary text-xs font-extrabold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-sm">
              {projects.length} {lang === 'en' ? `project${projects.length > 1 ? 's' : ''}` : `projet${projects.length > 1 ? 's' : ''}`}
            </span>
          </div>
          <p className="text-xs text-textMuted mt-1 hidden sm:block">
            {t('projectsSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
          <button 
            onClick={onNewProject} 
            className="bg-primary hover:bg-primary/90 text-white font-bold px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-primary/25 transition-all active:scale-95 text-xs flex-shrink-0"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>{lang === 'en' ? 'New Project' : 'Nouveau projet'}</span>
          </button>
        </div>
      </div>

      {/* 2 Linked High-Contrast Filter Categories Bar */}
      <div className="bg-card p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-darkBorder space-y-3 sm:space-y-4 transition-colors">
        
        {/* Category 1: Importance & Priorité */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-textMain">
              <Flag size={14} className="text-primary" />
              <span>{t('filterByPriority')}</span>
            </div>
            {priorityFilter !== 'ALL' && (
              <span className="text-[10px] font-bold text-primary bg-primary/15 dark:bg-primary/25 px-2 py-0.5 rounded-md">
                Active
              </span>
            )}
          </div>
          
          <div className="flex items-center sm:flex-wrap gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
            {/* All Priorities */}
            <button
              type="button"
              onClick={() => setPriorityFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                priorityFilter === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-950 dark:bg-white dark:text-slate-950 dark:border-white shadow-md'
                  : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/80 dark:text-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <span>{t('all')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${priorityFilter === 'ALL' ? 'bg-white/20 dark:bg-slate-900/20' : 'bg-black/10 dark:bg-white/10'}`}>
                {getPriorityCount('ALL')}
              </span>
            </button>

            {/* Urgent */}
            <button
              type="button"
              onClick={() => setPriorityFilter('urgent')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                priorityFilter === 'urgent'
                  ? 'bg-red-600 text-white border-red-700 shadow-md ring-2 ring-red-500/30'
                  : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60 hover:bg-red-100 dark:hover:bg-red-900/50'
              }`}
            >
              <span>🔴 {t('urgent')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${priorityFilter === 'urgent' ? 'bg-black/25 text-white' : 'bg-red-200/60 dark:bg-red-900/60'}`}>
                {getPriorityCount('urgent')}
              </span>
            </button>

            {/* Important */}
            <button
              type="button"
              onClick={() => setPriorityFilter('important')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                priorityFilter === 'important'
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-400/30'
                  : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/50'
              }`}
            >
              <span>🟠 {t('important')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${priorityFilter === 'important' ? 'bg-black/25 text-white' : 'bg-amber-200/60 dark:bg-amber-900/60'}`}>
                {getPriorityCount('important')}
              </span>
            </button>

            {/* Normal */}
            <button
              type="button"
              onClick={() => setPriorityFilter('normal')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                priorityFilter === 'normal'
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-500/30'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
              }`}
            >
              <span>🟡 {t('normal')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${priorityFilter === 'normal' ? 'bg-black/25 text-white' : 'bg-indigo-200/60 dark:bg-indigo-900/60'}`}>
                {getPriorityCount('normal')}
              </span>
            </button>

            {/* Low */}
            <button
              type="button"
              onClick={() => setPriorityFilter('low')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                priorityFilter === 'low'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
              }`}
            >
              <span>🟢 {t('low')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${priorityFilter === 'low' ? 'bg-black/25 text-white' : 'bg-emerald-200/60 dark:bg-emerald-900/60'}`}>
                {getPriorityCount('low')}
              </span>
            </button>
          </div>
        </div>

        {/* Category 2: Statut du Projet */}
        <div className="pt-2.5 sm:pt-3 border-t border-gray-100 dark:border-darkBorder">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-textMain">
              <Filter size={14} className="text-secondary" />
              <span>{t('filterByStatus')}</span>
            </div>

            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-[11px] font-bold text-danger hover:underline"
              >
                <RotateCcw size={12} />
                <span>{t('resetFilters')}</span>
              </button>
            )}
          </div>

          <div className="flex items-center sm:flex-wrap gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
            {/* All Statuses */}
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                statusFilter === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-950 dark:bg-white dark:text-slate-950 dark:border-white shadow-md'
                  : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/80 dark:text-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <span>{t('all')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${statusFilter === 'ALL' ? 'bg-white/20 dark:bg-slate-900/20' : 'bg-black/10 dark:bg-white/10'}`}>
                {getStatusCount('ALL')}
              </span>
            </button>

            {/* Not Started */}
            <button
              type="button"
              onClick={() => setStatusFilter('Not Started')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                statusFilter === 'Not Started'
                  ? 'bg-slate-700 text-white border-slate-800 shadow-md ring-2 ring-slate-600/30'
                  : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <span>⚪ {t('notStarted')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${statusFilter === 'Not Started' ? 'bg-black/25 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>
                {getStatusCount('Not Started')}
              </span>
            </button>

            {/* In Progress */}
            <button
              type="button"
              onClick={() => setStatusFilter('In Progress')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                statusFilter === 'In Progress'
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-500/30'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
              }`}
            >
              <span>⏳ {t('inProgress')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${statusFilter === 'In Progress' ? 'bg-black/25 text-white' : 'bg-indigo-200/60 dark:bg-indigo-900/60'}`}>
                {getStatusCount('In Progress')}
              </span>
            </button>

            {/* Overdue */}
            <button
              type="button"
              onClick={() => setStatusFilter('Overdue')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                statusFilter === 'Overdue'
                  ? 'bg-red-600 text-white border-red-700 shadow-md ring-2 ring-red-500/30'
                  : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60 hover:bg-red-100 dark:hover:bg-red-900/50'
              }`}
            >
              <span>🔴 {t('overdue')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${statusFilter === 'Overdue' ? 'bg-black/25 text-white' : 'bg-red-200/60 dark:bg-red-900/60'}`}>
                {getStatusCount('Overdue')}
              </span>
            </button>

            {/* Done */}
            <button
              type="button"
              onClick={() => setStatusFilter('Done')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                statusFilter === 'Done'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
              }`}
            >
              <span>✅ {t('done')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${statusFilter === 'Done' ? 'bg-black/25 text-white' : 'bg-emerald-200/60 dark:bg-emerald-900/60'}`}>
                {getStatusCount('Done')}
              </span>
            </button>
          </div>
        </div>

      </div>

      {/* Grid of Projects */}
      {filteredProjects.length === 0 ? (
        <div className="bg-card rounded-3xl p-8 sm:p-12 text-center border border-gray-100 dark:border-darkBorder">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <Layers size={24} />
          </div>
          <h3 className="font-bold text-base text-textMain">{t('noProjectsFound')}</h3>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-4 inline-flex items-center gap-1.5 bg-primary/15 text-primary hover:bg-primary/25 font-bold text-xs px-4 py-2 rounded-xl transition-colors"
          >
            <RotateCcw size={13} />
            <span>{t('resetFilters')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {filteredProjects.map((proj) => (
            <ProjectCard 
              key={proj.id} 
              project={proj} 
              onToggleSubtask={onToggleSubtask}
              onAddSubtask={onAddSubtask}
              onDeleteSubtask={onDeleteSubtask}
              onEditProject={(p) => setEditingProject(p)}
            />
          ))}
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <EditProjectModal
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          project={editingProject}
          onSaveProject={onSaveProject}
          onDeleteProject={onDeleteProject}
        />
      )}

      {/* Mobile Floating Action Button */}
      <button 
        onClick={onNewProject} 
        className="md:hidden fixed bottom-24 right-5 w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 z-40 active:scale-95 transition-transform"
        aria-label="Nouveau projet"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

    </div>
  );
};

export default Projects;