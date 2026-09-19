import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Sparkles, Brain, TrendingUp, CheckCircle2, Target, 
  Flame, Droplet, BarChart3, Zap, Bell, FolderCheck 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  getAvailableMonths, 
  formatMonthLabel, 
  computeMonthlyMetrics, 
  generateAIMonthlyCoaching 
} from '../data/monthlyReviewEngine';
import { useLanguage } from '../context/LanguageContext';

const MonthlyReview = ({ projects = [], onOpenCoach, onSimulateFirstOfMonth, isSimulated = false }) => {
  const { lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Available months
  const availableMonths = useMemo(() => getAvailableMonths(), []);
  
  // Selected month from URL query or default to most recent available
  const queryMonth = searchParams.get('month');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    if (queryMonth && availableMonths.includes(queryMonth)) {
      return queryMonth;
    }
    // Default to current month or previous month if 1st
    return availableMonths[0] || '2026-09';
  });

  const handleSelectMonth = (m) => {
    setSelectedMonth(m);
    setSearchParams({ month: m });
  };

  // Compute metrics for selected month
  const metrics = useMemo(() => {
    return computeMonthlyMetrics(selectedMonth, projects);
  }, [selectedMonth, projects]);

  // Generate AI Coaching
  const aiCoaching = useMemo(() => {
    return generateAIMonthlyCoaching(metrics, lang);
  }, [metrics, lang]);

  const monthLabel = formatMonthLabel(selectedMonth, lang);
  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    const curKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return selectedMonth === curKey;
  }, [selectedMonth]);

  const handleTriggerSimulation = () => {
    if (onSimulateFirstOfMonth) {
      onSimulateFirstOfMonth();
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      
      {/* Simulation Banner if active */}
      {isSimulated && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-2 border-amber-500/50 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold flex-shrink-0">
              <Bell size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black text-textMain uppercase tracking-wider">
                {lang === 'en' ? '1st of the Month Simulation Active' : 'Simulation du 1er du Mois Active'}
              </h4>
              <p className="text-xs text-textMuted mt-0.5">
                {lang === 'en'
                  ? `Simulating automatic monthly recap notification for ${monthLabel}.`
                  : `Simulation de la notification et du bilan automatique pour ${monthLabel}.`}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold bg-amber-500/30 text-amber-800 dark:text-amber-200 px-2.5 py-1 rounded-lg">
            Test Mode
          </span>
        </motion.div>
      )}

      {/* Main Top Header: Title, Month Selector & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-5 sm:p-6 rounded-3xl border border-gray-200/80 dark:border-darkBorder shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-primary/10 dark:bg-primary/20 text-primary uppercase tracking-wider">
              <Sparkles size={13} /> {lang === 'en' ? 'Monthly Retrospective' : 'Bilan & Rétrospective Mensuelle'}
            </span>
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
              isCurrentMonth 
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' 
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
            }`}>
              {isCurrentMonth 
                ? (lang === 'en' ? 'Current Month' : 'Mois en cours') 
                : (lang === 'en' ? 'Completed Month' : 'Bilan Clôturé')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-textMain tracking-tight">
            {monthLabel}
          </h1>
          <p className="text-xs sm:text-sm text-textMuted mt-1">
            {lang === 'en'
              ? 'Comprehensive performance review and strategic AI guidance to hit your targets.'
              : 'Analyse exhaustive de vos performances et recommandations d’efforts par l’IA.'}
          </p>
        </div>

        {/* Month Selector Pills + Simulation Test Button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-background p-1 rounded-2xl border border-gray-200/80 dark:border-darkBorder shadow-inner">
            {availableMonths.map((m) => {
              const label = formatMonthLabel(m, lang);
              const isSel = m === selectedMonth;
              return (
                <button
                  key={m}
                  onClick={() => handleSelectMonth(m)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSel 
                      ? 'bg-primary text-white shadow-md shadow-primary/20 scale-100' 
                      : 'text-textMuted hover:text-textMain hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Simulate 1st of month button */}
          <button
            onClick={handleTriggerSimulation}
            title={lang === 'en' ? 'Simulate 1st of Month Notification' : 'Simuler la notification du 1er du mois'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold bg-card hover:bg-gray-100 dark:hover:bg-darkCardElevated border border-dashed border-primary/50 text-primary transition-all active:scale-95 shadow-sm"
          >
            <Bell size={13} className="text-primary" />
            <span className="hidden sm:inline">{lang === 'en' ? 'Test 1st of Month' : 'Tester le 1er du mois'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (Design System Pro Max) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Score Moyen */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-card p-4 sm:p-5 rounded-3xl border border-gray-200/80 dark:border-darkBorder shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-textMuted">
              {lang === 'en' ? 'Avg Monthly Score' : 'Score Moyen'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-textMain tracking-tight">
                {metrics.avgScore}%
              </span>
              <span className="text-[10px] font-bold text-primary">
                {metrics.recordedDaysCount} {lang === 'en' ? 'days active' : 'jours actifs'}
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-darkBorder h-2 rounded-full overflow-hidden mt-3">
              <div 
                className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-700" 
                style={{ width: `${Math.min(100, metrics.avgScore)}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Card 2: Tâches Complétées */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-card p-4 sm:p-5 rounded-3xl border border-gray-200/80 dark:border-darkBorder shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-textMuted">
              {lang === 'en' ? 'Tasks & Slots Done' : 'Créneaux Réalisés'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-textMain tracking-tight">
                {metrics.totalTasksCompleted}
              </span>
              <span className="text-xs font-semibold text-textMuted">
                / {metrics.totalTasksScheduled}
              </span>
            </div>
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
              <Zap size={11} /> {metrics.completionRate}% {lang === 'en' ? 'execution rate' : 'taux d’exécution'}
            </p>
          </div>
        </motion.div>

        {/* Card 3: Hydratation */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-card p-4 sm:p-5 rounded-3xl border border-gray-200/80 dark:border-darkBorder shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-textMuted">
              {lang === 'en' ? 'Avg Hydration' : 'Hydratation Moy.'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Droplet size={16} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black text-textMain tracking-tight">
                {metrics.avgHydration}
              </span>
              <span className="text-xs font-bold text-textMuted">ml/j</span>
            </div>
            <p className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 mt-2">
              {metrics.hydrationSuccessRate}% {lang === 'en' ? 'days on target' : 'jours à l’objectif'}
            </p>
          </div>
        </motion.div>

        {/* Card 4: Streak & Projets */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-card p-4 sm:p-5 rounded-3xl border border-gray-200/80 dark:border-darkBorder shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-textMuted">
              {lang === 'en' ? 'Peak Streak' : 'Record Streak'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flame size={16} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-textMain tracking-tight">
                {metrics.maxStreakInMonth}
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {lang === 'en' ? 'days unbroken' : 'jours de suite'}
              </span>
            </div>
            <p className="text-[11px] font-bold text-textMuted mt-2 flex items-center gap-1">
              <FolderCheck size={12} className="text-primary" />
              <span>{metrics.closedProjectsCount} {lang === 'en' ? 'projects closed' : 'projets bouclés'}</span>
            </p>
          </div>
        </motion.div>

      </div>

      {/* AI Performance & Coaching Diagnostic Module (The Hero AI Block) */}
      <div className="bg-card rounded-3xl border-2 border-primary/30 dark:border-primary/40 shadow-xl overflow-hidden">
        
        {/* Module Header with AI Identity */}
        <div className="bg-gradient-to-r from-primary/15 via-primary/5 to-indigo-500/10 dark:from-primary/20 dark:via-darkCard dark:to-indigo-500/15 p-6 border-b border-gray-100 dark:border-darkBorder flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
              <Brain size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-textMain">
                  {lang === 'en' ? 'AI Performance Diagnostic' : 'Diagnostic de Performance & Stratégie IA'}
                </h2>
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  <Sparkles size={10} /> Copilot Core
                </span>
              </div>
              <p className="text-xs text-textMuted font-medium mt-0.5">
                {lang === 'en'
                  ? 'Personalized analysis based on your agenda completions, streaks, and focus metrics.'
                  : 'Analyse sur-mesure basée sur votre agenda, vos streaks et votre exécution.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl text-xs font-black text-white shadow-sm" style={{ backgroundColor: aiCoaching.color }}>
              {aiCoaching.badge}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* 1. Executive Summary */}
          <div className="bg-background dark:bg-darkBg rounded-2xl p-5 border border-gray-200/80 dark:border-darkBorder">
            <h3 className="text-xs font-black uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5">
              <Target size={14} /> {lang === 'en' ? 'Executive Summary' : 'Synthèse Exécutive du Mois'}
            </h3>
            <p className="text-sm text-textMain font-semibold leading-relaxed">
              {aiCoaching.summary}
            </p>
          </div>

          {/* 2. Top Strengths & Priority Effort Points (2 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Left: Points Forts */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={15} /> {lang === 'en' ? 'Top Strengths (What Worked Well)' : 'Vos Points Forts (Ce qui a payé)'}
              </h3>
              <div className="space-y-2.5">
                {aiCoaching.strengths.map((s, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-textMain">{s.title}</h4>
                      <p className="text-xs text-textMuted mt-0.5 leading-snug">{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Points d'Efforts Prioritaires (Où mettre ses efforts) */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Zap size={15} /> {lang === 'en' ? 'Priority Effort Areas (Where to Focus)' : 'Points d’Efforts Prioritaires (Où progresser)'}
              </h3>
              <div className="space-y-2.5">
                {aiCoaching.priorityEfforts.map((e, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/25 flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300">
                          {e.tag}
                        </span>
                        <h4 className="text-xs font-extrabold text-textMain">{e.title}</h4>
                      </div>
                      <p className="text-xs text-textMuted mt-1 leading-snug">{e.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 3. Plan d'Attaque Recommandé pour le Nouveau Mois */}
          <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 dark:from-primary/15 dark:via-darkCard dark:to-secondary/15 rounded-2xl p-5 border border-primary/25">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Target size={15} /> {lang === 'en' ? 'Recommended Attack Plan for Next Month' : 'Plan d’Attaque Recommandé pour le Nouveau Mois'}
              </h3>
              {onOpenCoach && (
                <button
                  onClick={onOpenCoach}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm active:scale-95"
                >
                  <Brain size={13} />
                  <span>{lang === 'en' ? 'Discuss with AI Coach' : 'Approfondir avec le Coach IA'}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {aiCoaching.newMonthGoals.map((g) => (
                <div 
                  key={g.id}
                  className="bg-card dark:bg-darkCard p-3.5 rounded-2xl border border-gray-200/80 dark:border-darkBorder shadow-sm flex flex-col justify-between"
                >
                  <p className="text-xs font-bold text-textMain leading-snug mb-3">
                    {g.text}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-darkBorder">
                    <span className="text-[10px] font-extrabold text-textMuted uppercase">Cible</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                      {g.target}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Weekly Score Progression Mini Bars */}
      <div className="bg-card p-5 sm:p-6 rounded-3xl border border-gray-200/80 dark:border-darkBorder shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wider text-textMuted mb-4 flex items-center gap-1.5">
          <BarChart3 size={15} className="text-primary" />
          {lang === 'en' ? 'Weekly Productivity Rhythm' : 'Rythme & Régularité par Semaine'}
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {metrics.weeklyTrends.map((w, idx) => (
            <div key={idx} className="bg-background dark:bg-darkBg p-3.5 rounded-2xl border border-gray-100 dark:border-darkBorder">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-textMuted">{w.label}</span>
                <span className="text-xs font-black text-textMain">{w.averageScore}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-darkBorder h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    w.averageScore >= 70 ? 'bg-emerald-500' : w.averageScore >= 50 ? 'bg-primary' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, w.averageScore)}%` }}
                />
              </div>
              <span className="text-[10px] text-textMuted block mt-1.5 font-medium">
                {w.daysRecorded} {lang === 'en' ? 'recorded days' : 'jours enregistrés'}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default MonthlyReview;
