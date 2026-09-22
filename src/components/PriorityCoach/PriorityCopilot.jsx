import React, { useState } from 'react';
import { 
  Sparkles, X, Brain, Calendar, Clock, ArrowRight, CheckCircle, 
  AlertTriangle, Flame, ChevronRight, Zap, Target, Layers, Play, Droplet
} from 'lucide-react';
import { PRIORITY_LEVELS, sortByPriority, getFreeSlots, autoPriority } from '../../data/priorityEngine';
import { recommendFocusTechnique } from '../../data/focusTechniques';
import { useLanguage } from '../../context/LanguageContext';

const PriorityCopilot = ({ 
  isOpen, 
  onClose, 
  tasks = [], 
  todayBlocks = [], 
  hydrationMl = 0, 
  hydrationTarget = 1925, 
  onScheduleTask, 
  onOpenFocusWithTask
}) => {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('suggestions');

  const freeSlots = getFreeSlots(todayBlocks);
  const prioritizedTasks = sortByPriority(tasks);

  return (
    <>

      {/* Floating Copilot Trigger Button (Desktop Bottom Right) */}
      <button
        onClick={isOpen ? onClose : () => onClose(true)}
        className={`hidden md:flex fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl items-center justify-center shadow-xl transition-all duration-300 active:scale-95 ${
          isOpen 
            ? 'bg-textMain text-white rotate-90 border dark:border-darkBorder' 
            : 'bg-gradient-to-tr from-primary to-indigo-500 text-white hover:shadow-primary/40 shadow-primary/25 hover:scale-105'
        }`}
        aria-label={t('coachTitle')}
        title={t('coachTitle')}
      >
        {isOpen ? <X size={22} /> : <Sparkles size={24} className="animate-pulse" />}
      </button>

      {/* Slide-in Priority Drawer / Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-card shadow-2xl border-l border-gray-200/80 dark:border-darkBorder flex flex-col animate-in slide-in-from-right duration-300 transition-colors">
          
          {/* Drawer Header */}
          <div className="p-6 pb-4 border-b border-gray-100 dark:border-darkBorder bg-gradient-to-r from-primary/10 via-background to-secondary/10 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-bold shadow-md shadow-primary/25">
                  <Brain size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-textMain leading-tight">{t('coachTitle')}</h3>
                  <p className="text-xs text-textMuted font-medium">{t('coachSubtitle')}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-background hover:bg-gray-100 dark:hover:bg-gray-800 text-textMuted hover:text-textMain flex items-center justify-center transition-colors"
                aria-label={t('close')}
              >
                <X size={16} />
              </button>
            </div>

            {/* Navigation tabs inside coach */}
            <div className="flex items-center gap-1.5 bg-background p-1 rounded-2xl border border-gray-200/80 dark:border-darkBorder mt-4">
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'suggestions' ? 'bg-primary text-white shadow-sm' : 'text-textMuted hover:text-textMain'
                }`}
              >
                {t('coachTabSuggestions')}
              </button>
              <button
                onClick={() => setActiveTab('priorities')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'priorities' ? 'bg-primary text-white shadow-sm' : 'text-textMuted hover:text-textMain'
                }`}
              >
                {t('coachTabMatrix')} ({prioritizedTasks.length})
              </button>
              <button
                onClick={() => setActiveTab('freeslots')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'freeslots' ? 'bg-primary text-white shadow-sm' : 'text-textMuted hover:text-textMain'
                }`}
              >
                {t('coachTabSlots')} ({freeSlots.length})
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            
            {/* TAB 1: Smart AI Suggestions */}
            {activeTab === 'suggestions' && (
              <div className="space-y-4">
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs mb-1">
                    <Zap size={14} />
                    <span>{t('coachOptimalFound')}</span>
                  </div>
                  <p className="text-xs text-textMuted leading-relaxed">
                    {lang === 'en'
                      ? `The coach scanned your ${todayBlocks.length} schedule blocks and found ${freeSlots.length} available free slots today.`
                      : `L'agent a scanné vos ${todayBlocks.length} blocs du calendrier et a identifié ${freeSlots.length} créneaux libres aujourd'hui.`}
                  </p>
                </div>

                {/* Cognitive Hydration Coaching Insight */}
                <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40 rounded-2xl p-3.5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Droplet size={16} className="fill-blue-500/20" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider">
                        {lang === 'en' ? 'Energy & Hydration' : 'Énergie & Hydratation'}
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">
                        {hydrationMl} / {hydrationTarget} ml ({Math.round((hydrationMl / hydrationTarget) * 100)}%)
                      </span>
                    </div>
                    <p className="text-xs text-textMuted dark:text-darkTextMuted mt-1 leading-snug">
                      {hydrationMl >= hydrationTarget 
                        ? (lang === 'en' ? "🎉 Hydration goal achieved! Your cognitive endurance and focus are primed for high performance." : "🎉 Objectif hydratation atteint ! Votre clarté mentale et votre endurance sont optimales pour vos sessions de travail.")
                        : hydrationMl >= 1000 
                          ? (lang === 'en' ? "⚡ Good hydration underway. Take a sip of water before your next deep work slot." : "⚡ Bon apport en eau en cours. Pensez à boire une gorgée d'eau avant votre prochain créneau de travail profond.")
                          : (lang === 'en' ? "💧 Water intake is low this morning. Drink 1-2 glasses (250-500 ml) to jumpstart your cognitive alertness." : "💧 Votre niveau d'eau est bas ce matin. Buvez 1 à 2 verres (250-500 ml) pour relancer votre vigilance cognitive.")}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-textMuted uppercase tracking-wider">
                    {lang === 'en' ? 'Recommended tasks to schedule:' : 'Tâches recommandées à placer :'}
                  </h4>
                  
                  {prioritizedTasks.length === 0 ? (
                    <div className="text-center py-8 text-textMuted text-xs">
                      {t('coachNoTasks')}
                    </div>
                  ) : (
                    prioritizedTasks.map((task) => {
                      const priority = task.priority || autoPriority(task);
                      const technique = recommendFocusTechnique(task.title || task.name, 60, lang);
                      
                      return (
                        <div key={task.id} className="bg-background rounded-2xl p-4 border border-gray-100 dark:border-darkBorder space-y-3 transition-all hover:border-gray-300">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg shadow-sm ${priority.bg} ${priority.color}`}>
                                  {priority.emoji} {priority.label}
                                </span>
                                {task.deadline && (
                                  <span className="text-[10px] text-textMuted font-medium">📅 {t('deadline')} : {task.deadline}</span>
                                )}
                              </div>
                              <h5 className="font-bold text-sm text-textMain mt-1.5">{task.title || task.name}</h5>
                              <p className="text-xs text-textMuted mt-0.5">{task.subtitle || task.description || (lang === 'en' ? 'Custom task' : 'Tâche personnalisée')}</p>
                            </div>
                          </div>

                          {/* Focus method recommendation */}
                          <div className="bg-card rounded-xl p-2.5 border border-gray-100 dark:border-darkBorder flex items-center justify-between">
                            <div className="min-w-0 pr-2">
                              <span className="text-[10px] font-bold text-primary block">
                                {lang === 'en' ? 'Recommended method:' : 'Méthode conseillée :'}
                              </span>
                              <span className="text-xs font-semibold text-textMain truncate">{technique.name}</span>
                            </div>
                            {onOpenFocusWithTask && (
                              <button
                                onClick={() => {
                                  onClose();
                                  onOpenFocusWithTask(task);
                                }}
                                className="px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-sm transition-transform active:scale-95 flex-shrink-0"
                              >
                                <Play size={10} className="fill-current" />
                                <span>{t('coachLaunchFocus')}</span>
                              </button>
                            )}
                          </div>

                          {/* Slot suggestion button */}
                          {freeSlots.length > 0 && onScheduleTask && (
                            <div className="pt-2 border-t border-gray-100 dark:border-darkBorder flex items-center justify-between">
                              <span className="text-[11px] text-textMuted">
                                {lang === 'en' ? 'Fit at' : 'Placer à'} <strong>{freeSlots[0].start} - {freeSlots[0].end}</strong>
                              </span>
                              <button
                                onClick={() => onScheduleTask(task, freeSlots[0])}
                                className="bg-primary hover:bg-primary/90 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm transition-all active:scale-95"
                              >
                                <span>{t('coachScheduleInSlot')}</span>
                                <ArrowRight size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Priorities Matrix */}
            {activeTab === 'priorities' && (
              <div className="space-y-4">
                <p className="text-xs text-textMuted">
                  {lang === 'en' ? 'Tasks ranked by Eisenhower Matrix:' : "Tâches classées selon la matrice d'Eisenhower :"}
                </p>
                
                {Object.values(PRIORITY_LEVELS).map((level) => {
                  const tasksInLevel = prioritizedTasks.filter(t => (t.priority?.key || autoPriority(t).key) === level.key);
                  return (
                    <div key={level.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold px-3 py-1 rounded-xl shadow-sm flex items-center gap-1.5 ${level.bg} ${level.color}`}>
                          {level.emoji} {level.label}
                        </span>
                        <span className="text-xs text-textMuted font-medium">
                          {tasksInLevel.length} {lang === 'en' ? `task${tasksInLevel.length > 1 ? 's' : ''}` : `tâche${tasksInLevel.length > 1 ? 's' : ''}`}
                        </span>
                      </div>
                      
                      {tasksInLevel.map((t) => (
                        <div key={t.id} className="bg-background p-3 rounded-xl border border-gray-100 dark:border-darkBorder flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-textMain truncate">{t.title || t.name}</span>
                          <span className="text-[10px] text-textMuted flex-shrink-0">{t.deadline || (lang === 'en' ? 'Today' : "Aujourd'hui")}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 3: Free Slots Finder */}
            {activeTab === 'freeslots' && (
              <div className="space-y-3">
                <p className="text-xs text-textMuted">
                  {lang === 'en' ? "Free slots detected in today's agenda:" : "Créneaux libres détectés dans l'agenda d'aujourd'hui :"}
                </p>
                
                {freeSlots.length === 0 ? (
                  <div className="bg-background rounded-2xl p-6 text-center text-textMuted text-xs border border-gray-100 dark:border-darkBorder">
                    {t('coachNoFreeSlots')}
                  </div>
                ) : (
                  freeSlots.map((slot, index) => (
                    <div key={index} className="bg-background rounded-2xl p-4 border border-gray-100 dark:border-darkBorder flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          <Clock size={16} />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-textMain">{slot.start} - {slot.end}</div>
                          <div className="text-[10px] text-textMuted">
                            {slot.durationMin} {lang === 'en' ? 'minutes available' : 'minutes disponibles'}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                        {lang === 'en' ? 'Free' : 'Libre'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>

        </div>
      )}
    </>
  );
};

export default PriorityCopilot;
