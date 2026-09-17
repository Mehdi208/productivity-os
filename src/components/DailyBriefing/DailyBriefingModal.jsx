import React from 'react';
import { X, Flame, Droplet, CheckCircle2, Target, Sparkles, BarChart3, Quote, ArrowRight, Brain } from 'lucide-react';
import { getMotivationalMessage } from '../../data/priorityEngine';
import { getDailyQuote } from '../../data/quotes';
import { useLanguage } from '../../context/LanguageContext';

const DailyBriefingModal = ({ 
  isOpen, 
  onClose, 
  yesterdayScore = 0, 
  yesterdayHydration = 0,
  streak = 0, 
  todayBlocks = [], 
  projects = [], 
  hydrationMl = 0, 
  hydrationTarget = 1925, 
  weekScores = [],
  onOpenCoach
}) => {
  const { lang, t } = useLanguage();

  if (!isOpen) return null;

  const quoteData = getDailyQuote(lang);
  const message = getMotivationalMessage(yesterdayScore, streak, lang);
  const todayCheckable = todayBlocks.filter(b => b.checkable);
  const todayChecked = todayCheckable.filter(b => b.checked);

  // Score color
  const scoreColor = yesterdayScore >= 70 ? 'text-secondary' : yesterdayScore >= 50 ? 'text-warning' : 'text-textMain dark:text-darkTextMain';
  const scoreBg = yesterdayScore >= 70 ? 'bg-secondary' : yesterdayScore >= 50 ? 'bg-warning' : 'bg-primary';

  // Active projects
  const activeProjects = projects.filter(p => p.status !== 'Done');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[70] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-card dark:bg-darkCard rounded-3xl w-full max-w-xl shadow-2xl border border-gray-200/80 dark:border-darkBorder overflow-hidden my-auto max-h-[92vh] flex flex-col transition-colors">
        
        {/* Header gradient banner */}
        <div className="relative bg-gradient-to-br from-primary/15 via-primary/5 to-secondary/10 dark:from-primary/20 dark:via-darkCard dark:to-secondary/10 p-6 pb-5 border-b border-gray-100 dark:border-darkBorder flex-shrink-0">
          <button 
            onClick={onClose} 
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/90 dark:bg-darkCardElevated text-textMuted dark:text-darkTextMuted hover:text-textMain dark:hover:text-darkTextMain flex items-center justify-center transition-all shadow-sm active:scale-95 border dark:border-darkBorder"
            aria-label={t('close')}
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 bg-primary/10 dark:bg-primary/25 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles size={13} /> {t('briefingTitle')}
            </span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-textMain dark:text-darkTextMain tracking-tight">
            {t('greeting')}
          </h2>
          <p className="text-sm text-textMuted dark:text-darkTextMuted mt-1 font-medium">{message}</p>
        </div>

        {/* Scrollable content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Quote of the Day Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:to-transparent border border-amber-200/70 dark:border-amber-500/30 rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute -right-2 -bottom-2 text-amber-500/15 pointer-events-none">
              <Quote size={80} />
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Quote size={16} />
              </div>
              <div className="min-w-0 pr-6">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">{quoteData.theme}</span>
                <p className="text-sm font-semibold text-textMain dark:text-darkTextMain italic leading-snug mt-0.5">
                  "{quoteData.quote}"
                </p>
                <p className="text-xs text-textMuted dark:text-darkTextMuted mt-1.5 font-medium">
                  — <strong className="text-textMain dark:text-darkTextMain">{quoteData.author}</strong> ({quoteData.role})
                </p>
              </div>
            </div>
          </div>

          {/* Yesterday Score + Streak Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background dark:bg-darkBg rounded-2xl p-4 border border-gray-100 dark:border-darkBorder flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                  <Target size={14} />
                </div>
                <span className="text-[11px] font-bold text-textMuted dark:text-darkTextMuted uppercase tracking-wide">
                  {t('yesterdayScoreTitle')}
                </span>
              </div>
              <div>
                <span className={`text-3xl font-extrabold ${scoreColor}`}>{yesterdayScore}%</span>
                <div className="w-full bg-gray-200 dark:bg-darkBorder h-2 rounded-full overflow-hidden mt-2">
                  <div className={`h-full rounded-full transition-all duration-700 ${scoreBg}`} style={{ width: `${Math.min(100, yesterdayScore)}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-background dark:bg-darkBg rounded-2xl p-4 border border-gray-100 dark:border-darkBorder flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-warning/10 dark:bg-warning/20 flex items-center justify-center text-warning">
                  <Flame size={14} />
                </div>
                <span className="text-[11px] font-bold text-textMuted dark:text-darkTextMuted uppercase tracking-wide">
                  {t('activeStreakTitle')}
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-warning">{streak}</span>
                  <span className="text-xs text-textMuted dark:text-darkTextMuted font-medium">{t('streakUnit', streak)}</span>
                </div>
                <p className="text-[10px] text-textMuted dark:text-darkTextMuted mt-1">
                  {streak > 0 ? t('streakOn') : t('streakZero')}
                </p>
              </div>
            </div>
          </div>

          {/* Weekly Trend Mini Sparkline */}
          {weekScores.length > 0 && (
            <div className="bg-background dark:bg-darkBg rounded-2xl p-4 border border-gray-100 dark:border-darkBorder">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 size={15} className="text-primary" />
                  <span className="text-xs font-bold text-textMain dark:text-darkTextMain">{t('weeklyTrendTitle')}</span>
                </div>
                <span className="text-[10px] font-bold text-primary bg-primary/10 dark:bg-primary/25 px-2.5 py-0.5 rounded-full">
                  {t('averageBadge', weekScores.filter(s => s.score > 0).length > 0 ? Math.round(weekScores.filter(s => s.score > 0).reduce((a, s) => a + s.score, 0) / weekScores.filter(s => s.score > 0).length) : 0)}
                </span>
              </div>
              <div className="flex items-end gap-2 h-14 pt-1">
                {weekScores.map((s, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-gray-200/80 dark:bg-darkBorder rounded-lg h-9 overflow-hidden flex flex-col justify-end">
                      <div 
                        className={`w-full rounded-lg transition-all duration-500 ${s.score >= 70 ? 'bg-secondary' : s.score >= 50 ? 'bg-warning' : s.score > 0 ? 'bg-danger' : 'bg-transparent'}`}
                        style={{ height: `${s.score ? Math.max(15, s.score) : 0}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-textMuted dark:text-darkTextMuted">{s.day}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Today's Agenda & Tasks Progress */}
          <div className="bg-background dark:bg-darkBg rounded-2xl p-4 border border-gray-100 dark:border-darkBorder">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-secondary" />
                <span className="text-xs font-bold text-textMain dark:text-darkTextMain">{t('todayTargetTitle')}</span>
              </div>
              <span className="text-xs font-bold text-textMain dark:text-darkTextMain bg-card dark:bg-darkCard px-2 py-0.5 rounded-md border border-gray-100 dark:border-darkBorder">
                {t('validatedCount', todayChecked.length, todayCheckable.length)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-darkBorder h-2 rounded-full overflow-hidden mt-1.5 mb-3">
              <div 
                className="h-full bg-secondary rounded-full transition-all duration-500" 
                style={{ width: `${todayCheckable.length > 0 ? (todayChecked.length / todayCheckable.length) * 100 : 0}%` }} 
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {todayCheckable.slice(0, 6).map(block => (
                <span 
                  key={block.id} 
                  className={`text-[11px] px-2.5 py-1 rounded-xl font-medium border ${
                    block.checked 
                      ? 'bg-secondary/10 border-secondary/30 text-[#005B48] dark:text-secondary line-through' 
                      : 'bg-card dark:bg-darkCard border-gray-200/80 dark:border-darkBorder text-textMain dark:text-darkTextMain'
                  }`}
                >
                  {block.title} <span className="text-[10px] text-textMuted dark:text-darkTextMuted">({block.start})</span>
                </span>
              ))}
            </div>
          </div>

          {/* Active Projects Quick View */}
          {activeProjects.length > 0 && (
            <div className="bg-background dark:bg-darkBg rounded-2xl p-4 border border-gray-100 dark:border-darkBorder">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-textMain dark:text-darkTextMain">🎯 {t('activeProjectsTitle')}</span>
                <span className="text-[11px] text-textMuted dark:text-darkTextMuted">{activeProjects.length} {lang === 'en' ? 'active' : 'actifs'}</span>
              </div>
              <div className="space-y-2.5">
                {activeProjects.slice(0, 3).map(proj => (
                  <div key={proj.id} className="flex items-center gap-3 bg-card dark:bg-darkCard p-2.5 rounded-xl border border-gray-100 dark:border-darkBorder">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${proj.iconColor || 'text-primary bg-primary/10'}`}>
                      {proj.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-textMain dark:text-darkTextMain truncate">{proj.name}</span>
                        <span className="text-xs font-bold text-primary">{proj.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-darkBorder h-1.5 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${proj.progress || 0}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hydration Evaluation Section */}
          <div className="bg-blue-50/80 dark:bg-blue-950/40 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                  <Droplet size={15} className="fill-blue-500/30" />
                </div>
                <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                  {lang === 'en' ? 'Hydration Target & Status' : 'Bilan & Objectif Hydratation'}
                </span>
              </div>
              <span className="text-[10px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-full">
                {lang === 'en' ? `Target: ${hydrationTarget} ml` : `Cible : ${hydrationTarget} ml`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="bg-white/60 dark:bg-darkCard/60 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <span className="text-[10px] font-bold text-textMuted uppercase block">
                  {lang === 'en' ? "Yesterday's Water" : "Eau d'hier"}
                </span>
                <span className="font-extrabold text-sm text-textMain">{yesterdayHydration} ml</span>
                <span className={`text-[10px] font-bold block mt-0.5 ${yesterdayHydration >= hydrationTarget ? 'text-emerald-600 dark:text-emerald-400' : yesterdayHydration > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-textMuted'}`}>
                  {yesterdayHydration >= hydrationTarget ? (lang === 'en' ? 'Target met ✅' : 'Objectif atteint ✅') : yesterdayHydration > 0 ? `${Math.round((yesterdayHydration / hydrationTarget) * 100)}%` : (lang === 'en' ? 'Not logged' : 'Non renseigné')}
                </span>
              </div>

              <div className="bg-white/60 dark:bg-darkCard/60 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <span className="text-[10px] font-bold text-textMuted uppercase block">
                  {lang === 'en' ? 'Today' : "Aujourd'hui"}
                </span>
                <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">{hydrationMl} ml</span>
                <span className="text-[10px] font-bold text-textMuted block mt-0.5">
                  {hydrationMl > 0 ? `${Math.round((hydrationMl / hydrationTarget) * 100)}%` : (lang === 'en' ? 'Reset to 0 ml 🔄' : 'Réinitialisé à 0 ml 🔄')}
                </span>
              </div>
            </div>

            <div className="w-full bg-blue-100 dark:bg-blue-900/40 h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(0, (hydrationMl / hydrationTarget) * 100))}%` }} 
              />
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-5 bg-card dark:bg-darkCard border-t border-gray-100 dark:border-darkBorder flex items-center gap-3 flex-shrink-0">
          {onOpenCoach && (
            <button
              onClick={() => { onClose(); onOpenCoach(); }}
              className="px-4 py-3 bg-primary/10 hover:bg-primary/15 dark:bg-primary/20 text-primary rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Brain size={15} />
              <span>{t('openAiCoach')}</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-5 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-primary/25 transition-all duration-200 active:scale-[0.98] text-sm"
          >
            <span>{t('startDay')}</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default DailyBriefingModal;
