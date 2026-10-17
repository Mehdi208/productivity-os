// src/pages/JudoProgram.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, Flame, CheckCircle2, Clock, Play, Pause, RotateCcw, 
  Zap, Award, Scale, Calendar, Star, Info, Check, Eye, X, AlertTriangle, ChevronRight
} from 'lucide-react';
import { 
  JUDO_PROGRAM_DATA, 
  getJudoState, 
  toggleExerciseCompletion, 
  recordSessionRating, 
  logAthleteWeight, 
  getJudoKPIs 
} from '../data/judoEngine';
import { playDigitalChime } from '../utils/audioAlert';

const JudoProgram = () => {
  const [judoState, setJudoState] = useState(() => getJudoState());
  const [activeMonthId, setActiveMonthId] = useState(1);
  const [activeWeekNum, setActiveWeekNum] = useState(1);
  const [activeSessionIndex, setActiveSessionIndex] = useState(0);

  // Exercise Demo Modal State
  const [selectedExerciseModal, setSelectedExerciseModal] = useState(null);

  // Weight logging state
  const [weightInput, setWeightInput] = useState('');
  const [showWeightModal, setShowWeightModal] = useState(false);

  // Rest Timer State
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [timerRemaining, setTimerRemaining] = useState(90);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Session Rating Form State
  const [ratingScore, setRatingScore] = useState(9);
  const [ratingRpe, setRatingRpe] = useState(8);
  const [athleteNotes, setAthleteNotes] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Refresh KPIs
  const kpis = useMemo(() => getJudoKPIs(judoState), [judoState]);

  // Active Month & Week & Session calculation
  const currentMonthData = useMemo(() => {
    return JUDO_PROGRAM_DATA.months.find(m => m.id === activeMonthId) || JUDO_PROGRAM_DATA.months[0];
  }, [activeMonthId]);

  // Base sessions from Week 1 (used as template across the program with week modifiers)
  const baseSessions = useMemo(() => {
    return JUDO_PROGRAM_DATA.months[0].weeks[0].sessions;
  }, []);

  const activeSession = useMemo(() => {
    return baseSessions[activeSessionIndex] || baseSessions[0];
  }, [baseSessions, activeSessionIndex]);

  // Session ID dynamically generated per month/week/session
  const currentSessionId = `m${activeMonthId}_w${activeWeekNum}_s${activeSessionIndex + 1}`;

  // Completed exercises for current active session
  const completedExerciseIds = useMemo(() => {
    return judoState.completedExercises[currentSessionId] || [];
  }, [judoState.completedExercises, currentSessionId]);

  // Existing rating for current session if already done
  const existingRating = useMemo(() => {
    return judoState.sessionRatings[currentSessionId] || null;
  }, [judoState.sessionRatings, currentSessionId]);

  // Pre-fill rating form if already reviewed
  useEffect(() => {
    if (existingRating) {
      setRatingScore(existingRating.score);
      setRatingRpe(existingRating.rpe);
      setAthleteNotes(existingRating.notes || '');
    } else {
      setRatingScore(9);
      setRatingRpe(8);
      setAthleteNotes('');
    }
  }, [currentSessionId, existingRating]);

  // Rest Timer countdown effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining(prev => prev - 1);
      }, 1000);
    } else if (timerRemaining === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      try {
        playDigitalChime();
      } catch (e) {
        console.error('Audio chime error:', e);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerRemaining]);

  const handleStartTimer = (secs) => {
    const s = parseInt(secs, 10) || 90;
    setTimerSeconds(s);
    setTimerRemaining(s);
    setIsTimerRunning(true);
  };

  const handleToggleTimer = () => {
    setIsTimerRunning(prev => !prev);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerRemaining(timerSeconds);
  };

  // Toggle Exercise Check
  const handleToggleExercise = (exerciseId) => {
    const updated = toggleExerciseCompletion(currentSessionId, exerciseId);
    setJudoState({ ...updated });
    try {
      playDigitalChime();
    } catch {}
  };

  // Submit Session Evaluation
  const handleSubmitRating = (e) => {
    e.preventDefault();
    const updated = recordSessionRating(currentSessionId, {
      score: ratingScore,
      rpe: ratingRpe,
      notes: athleteNotes
    });
    setJudoState({ ...updated });
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  // Submit Weight Log
  const handleLogWeight = (e) => {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (!isNaN(val) && val > 0) {
      const updated = logAthleteWeight(val);
      setJudoState({ ...updated });
      setWeightInput('');
      setShowWeightModal(false);
    }
  };

  // Format Timer mm:ss
  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Weeks available in this month
  const availableWeeks = useMemo(() => {
    if (activeMonthId === 1) return [1, 2, 3, 4];
    if (activeMonthId === 2) return [5, 6, 7, 8];
    return [9, 10, 11, 12];
  }, [activeMonthId]);

  // Sync active week when month changes
  const handleSelectMonth = (monthId) => {
    setActiveMonthId(monthId);
    if (monthId === 1) setActiveWeekNum(1);
    else if (monthId === 2) setActiveWeekNum(5);
    else setActiveWeekNum(9);
  };

  const currentWeekMeta = useMemo(() => {
    return currentMonthData.weeks.find(w => w.weekNumber === activeWeekNum) || currentMonthData.weeks[0];
  }, [currentMonthData, activeWeekNum]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-3.5 sm:space-y-6 pb-32 md:pb-12 animate-in fade-in duration-200">
      
      {/* 1. Header: Elite Judo Athlete Identity */}
      <div className="bg-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-gray-200/80 dark:border-darkBorder shadow-sm relative overflow-hidden transition-colors">
        <div className="absolute -right-8 -top-8 w-44 h-44 bg-red-500/10 dark:bg-red-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="hidden sm:block absolute right-12 bottom-0 opacity-5 dark:opacity-10 pointer-events-none select-none text-9xl font-black">
          柔道
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black tracking-wider uppercase bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30">
                <Trophy size={12} className="flex-shrink-0" />
                <span>Objectif : Équipe Nationale (-60 kg)</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Flame size={12} />
                <span>Rythme Pro</span>
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-textMain tracking-tight">
              Judo High-Performance OS 🥋
            </h1>
            <p className="text-xs sm:text-sm text-textMuted max-w-2xl leading-relaxed">
              Force polyarticulaire, poigne (*kumi-kata*) et montée de catégorie de <span className="font-bold text-textMain">55 kg vers 60 kg</span>.
            </p>
          </div>

          {/* Quick Equipment Tag */}
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-bold text-textMain pt-1 md:pt-0">
            <span className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-darkCard border border-gray-200 dark:border-darkBorder">🎒 Sac 5 kg</span>
            <span className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-darkCard border border-gray-200 dark:border-darkBorder">⚡ Élastique</span>
            <span className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-darkCard border border-gray-200 dark:border-darkBorder">🪵 Barre</span>
          </div>
        </div>
      </div>

      {/* 2. Unified Athlete Dashboard Card (Weight + Progress + KPIs) */}
      <div className="bg-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-gray-200/80 dark:border-darkBorder shadow-sm space-y-3 transition-colors">
        {/* Weight Row Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-darkBorder">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
              <Scale size={16} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-textMain">Progression Catégorie -60 kg</h3>
              <span className="text-[10px] text-textMuted">Prise de masse musculaire propre</span>
            </div>
          </div>

          <button
            onClick={() => setShowWeightModal(true)}
            className="text-xs font-bold text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex-shrink-0"
          >
            + Pesée
          </button>
        </div>

        {/* Weight Metrics & Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-textMain tracking-tight">
                {kpis.currentWeight} <span className="text-xs sm:text-sm font-semibold text-textMuted">kg</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 ml-1.5">
                (+{kpis.weightProgressKg} kg acquis)
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] sm:text-xs font-bold text-textMuted">Cible : </span>
              <span className="text-xs sm:text-sm font-black text-textMain">{kpis.targetWeight} kg</span>
              <span className="text-[10px] text-textMuted ml-1">(Reste {kpis.remainingWeightKg} kg)</span>
            </div>
          </div>

          <div className="w-full bg-gray-100 dark:bg-darkCard rounded-full h-2.5 overflow-hidden p-0.5 border border-gray-200/50 dark:border-darkBorder">
            <div 
              className="bg-gradient-to-r from-primary to-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.max(5, kpis.weightPercent)}%` }} 
            />
          </div>
          <div className="flex justify-between text-[9px] sm:text-[10px] text-textMuted font-bold">
            <span>55.0 kg</span>
            <span className="font-black text-textMain">{kpis.weightPercent}% de l’obj. -60 kg</span>
            <span>60.0 kg</span>
          </div>
        </div>

        {/* 3 Quick Stats Badges */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-darkBorder text-center">
          <div className="bg-background/80 p-2 rounded-xl border border-gray-100 dark:border-darkBorder">
            <span className="text-[9px] font-bold text-textMuted uppercase block">Séances</span>
            <span className="text-sm sm:text-base font-black text-textMain mt-0.5 block">
              {kpis.totalSessions} <span className="text-[10px] font-normal text-textMuted">validées</span>
            </span>
          </div>
          <div className="bg-background/80 p-2 rounded-xl border border-gray-100 dark:border-darkBorder">
            <span className="text-[9px] font-bold text-textMuted uppercase block">Note Moy.</span>
            <span className="text-sm sm:text-base font-black text-amber-500 mt-0.5 block">
              {kpis.avgScore} <span className="text-[10px] font-normal text-textMuted">/10</span>
            </span>
          </div>
          <div className="bg-background/80 p-2 rounded-xl border border-gray-100 dark:border-darkBorder">
            <span className="text-[9px] font-bold text-textMuted uppercase block">Intensité</span>
            <span className="text-sm sm:text-base font-black text-primary mt-0.5 block">
              RPE 8-9
            </span>
          </div>
        </div>
      </div>

      {/* 3. Program Navigation: Months (Mobile Segmented Pills) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black text-textMain uppercase tracking-wider flex items-center gap-1.5">
            <Flame size={14} className="text-primary" />
            <span>Planification sur 3 Mois</span>
          </h2>
          <span className="text-[10px] font-bold text-textMuted">Mois actif : {activeMonthId}/3</span>
        </div>

        {/* 3 Month Segmented Control */}
        <div className="grid grid-cols-3 gap-1.5 bg-card p-1.5 rounded-2xl border border-gray-200/80 dark:border-darkBorder shadow-xs">
          {JUDO_PROGRAM_DATA.months.map((m) => {
            const isSelected = m.id === activeMonthId;
            return (
              <button
                key={m.id}
                onClick={() => handleSelectMonth(m.id)}
                className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-primary text-white shadow-sm font-black' 
                    : 'text-textMuted hover:text-textMain font-bold hover:bg-background/50'
                }`}
              >
                <span className="text-[10px] sm:text-xs block">Mois {m.id}</span>
                <span className="text-[9px] opacity-80 truncate block hidden sm:block">{m.title.split(':')[1] || m.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Week Selector within Active Month */}
      <div className="bg-card rounded-2xl p-2.5 sm:p-3 border border-gray-200/80 dark:border-darkBorder shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-textMain">Semaine :</span>
          <div className="flex items-center gap-1">
            {availableWeeks.map(wNum => (
              <button
                key={wNum}
                onClick={() => setActiveWeekNum(wNum)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  activeWeekNum === wNum 
                    ? 'bg-primary text-white shadow-sm font-black' 
                    : 'bg-background hover:bg-gray-100 dark:hover:bg-darkCard text-textMuted hover:text-textMain border border-gray-200/60 dark:border-darkBorder'
                }`}
              >
                S{wNum}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[10px] sm:text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 w-full sm:w-auto truncate">
          🎯 {currentWeekMeta.focus || `Semaine ${activeWeekNum} : Intensité Judo`}
        </div>
      </div>

      {/* 5. Session Tabs (Séance 1, 2, 3 + Mobilité) */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 w-full touch-pan-x">
        {baseSessions.map((session, idx) => {
          const isSelected = idx === activeSessionIndex;
          const sId = `m${activeMonthId}_w${activeWeekNum}_s${idx + 1}`;
          const isDone = (judoState.sessionRatings[sId]?.score || 0) > 0;

          return (
            <button
              key={session.id}
              onClick={() => setActiveSessionIndex(idx)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? 'bg-card border-primary ring-2 ring-primary/20 shadow-md'
                  : 'bg-card/70 hover:bg-card border-gray-200/80 dark:border-darkBorder'
              }`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-blue-500' : idx === 2 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <div className="min-w-0">
                <span className="text-[11px] font-black text-textMain truncate block">
                  {idx === 3 ? 'Mobilité Quotidienne' : `Séance ${idx + 1}`}
                </span>
              </div>
              {isDone && (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 6. Active Workout Session View */}
      <div className="bg-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-gray-200/80 dark:border-darkBorder shadow-sm space-y-4 transition-colors">
        
        {/* Session Top Bar & Stopwatch */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-gray-100 dark:border-darkBorder gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary">
                {activeSession.type.toUpperCase()}
              </span>
              <span className="text-xs text-textMuted flex items-center gap-1">
                <Clock size={12} />
                <span>{activeSession.durationMin} min</span>
              </span>
              <span className="text-xs text-textMuted font-bold">
                • {completedExerciseIds.length}/{activeSession.exercises.length} validés
              </span>
            </div>
            <h2 className="text-base sm:text-lg md:text-xl font-black text-textMain">{activeSession.title}</h2>
            <p className="text-xs text-primary font-bold">
              🥋 Impact Judo : {activeSession.judoContext}
            </p>
          </div>

          {/* Integrated Rest Stopwatch */}
          <div className="flex items-center justify-between sm:justify-start gap-2.5 bg-background p-2.5 rounded-2xl border border-gray-200/80 dark:border-darkBorder">
            <div>
              <div className="text-[9px] font-black text-textMuted uppercase">Chrono Repos</div>
              <div className={`text-xl font-black font-mono tracking-tight ${timerRemaining === 0 ? 'text-red-500 animate-pulse' : 'text-textMain'}`}>
                {formatTimer(timerRemaining)}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleToggleTimer}
                className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all cursor-pointer shadow-sm active:scale-95"
                title={isTimerRunning ? 'Pause' : 'Démarrer'}
              >
                {isTimerRunning ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
              </button>
              <button
                onClick={handleResetTimer}
                className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-darkCard hover:bg-gray-200 text-textMuted flex items-center justify-center transition-all cursor-pointer active:scale-95"
                title="Réinitialiser"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            <div className="flex items-center gap-1 pl-2 border-l border-gray-200 dark:border-darkBorder text-[10px] font-bold">
              <button onClick={() => handleStartTimer(60)} className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-darkCard hover:text-primary transition-colors cursor-pointer">60s</button>
              <button onClick={() => handleStartTimer(90)} className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-darkCard hover:text-primary transition-colors cursor-pointer">90s</button>
              <button onClick={() => handleStartTimer(120)} className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-darkCard hover:text-primary transition-colors cursor-pointer">120s</button>
            </div>
          </div>
        </div>

        {/* Exercises Cards (Mobile-First Architecture) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <h3 className="text-xs font-black text-textMuted uppercase tracking-wider">Exercices du Protocole</h3>
            <span className="text-[10px] font-bold text-textMuted">Tempo : 3s de descente</span>
          </div>

          <div className="space-y-3.5">
            {activeSession.exercises.map((ex, exIdx) => {
              const isChecked = completedExerciseIds.includes(ex.id);

              return (
                <div
                  key={ex.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isChecked
                      ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/40 shadow-xs'
                      : 'bg-card border-gray-200/80 dark:border-darkBorder shadow-xs'
                  }`}
                >
                  {/* Exercise Photo Header with Badges */}
                  {ex.imageUrl && (
                    <div 
                      onClick={() => setSelectedExerciseModal(ex)}
                      className="relative w-full h-40 sm:h-52 bg-slate-950 overflow-hidden cursor-pointer group"
                      title="Cliquer pour voir la décomposition technique en grand"
                    >
                      <img 
                        src={ex.imageUrl} 
                        alt={ex.name} 
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs border border-white/10">
                          #{exIdx + 1} • {ex.equipment}
                        </span>

                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-primary text-white shadow-sm">
                          {ex.sets} séries × {ex.reps}
                        </span>
                      </div>

                      {/* Bottom Info on Image */}
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-sm sm:text-base font-black text-white leading-tight drop-shadow-sm truncate">
                            {ex.name}
                          </h4>
                          <span className="text-[10px] text-white/80 font-medium block mt-0.5 truncate">
                            Tempo : {ex.tempo} • Repos : {ex.rest}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedExerciseModal(ex);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1 flex-shrink-0 cursor-pointer transition-colors"
                        >
                          <Eye size={12} />
                          <span>Démo</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Exercise Body Information */}
                  <div className="p-3 sm:p-4 space-y-2.5">
                    {/* Pro Athlete Coaching Cue */}
                    <div className="text-xs text-textMuted flex items-start gap-1.5">
                      <Info size={14} className="text-primary flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed"><strong className="text-textMain">Exécution Pro :</strong> {ex.cue}</span>
                    </div>

                    {/* Specific Judo Impact */}
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                      <Zap size={12} className="flex-shrink-0" />
                      <span>Bénéfice Randori : {ex.judoImpact}</span>
                    </div>

                    {/* Action Bar: Fat-Finger Validation & Quick Timer */}
                    <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-gray-100 dark:border-darkBorder">
                      <button
                        type="button"
                        onClick={() => handleToggleExercise(ex.id)}
                        className={`flex-1 min-h-[44px] rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                          isChecked
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20'
                        }`}
                      >
                        <Check size={16} strokeWidth={3} />
                        <span>{isChecked ? 'Exercice Validé ! (Décocher)' : 'Valider cet Exercice'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartTimer(ex.rest || 90)}
                        className="px-3 min-h-[44px] rounded-xl bg-background hover:bg-gray-100 dark:hover:bg-darkCard border border-gray-200/80 dark:border-darkBorder text-textMain text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                        title="Démarrer le chronomètre de repos pour cet exercice"
                      >
                        <Play size={12} className="text-primary fill-current" />
                        <span>Repos {ex.rest || '90s'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7. Post-Session Review & Rating Card */}
        <div className="bg-background rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-gray-200/80 dark:border-darkBorder shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between pb-2 border-b border-gray-200/60 dark:border-darkBorder gap-2">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-amber-500" />
              <h3 className="text-xs sm:text-sm font-black text-textMain">Attribution de la Note & Bilan</h3>
            </div>
            {existingRating && (
              <span className="text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Déjà notée : {existingRating.score}/10
              </span>
            )}
          </div>

          <form onSubmit={handleSubmitRating} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Note globale / 10 */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <label className="text-textMain">Note Globale :</label>
                  <span className="text-amber-500 font-black text-base">{ratingScore} / 10</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  step="0.5"
                  value={ratingScore} 
                  onChange={(e) => setRatingScore(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-gray-200 dark:bg-darkCard rounded-lg"
                />
                <div className="flex justify-between text-[9px] text-textMuted font-medium">
                  <span>1 (Bâclée)</span>
                  <span>5 (Moyen)</span>
                  <span>8.5 (Pro)</span>
                  <span>10 (Champion)</span>
                </div>
              </div>

              {/* RPE Effort (1 à 10) */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <label className="text-textMain">RPE (Effort Perçu) :</label>
                  <span className="text-red-500 font-black text-base">RPE {ratingRpe} / 10</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="10" 
                  step="1"
                  value={ratingRpe} 
                  onChange={(e) => setRatingRpe(parseInt(e.target.value, 10))}
                  className="w-full accent-red-500 cursor-pointer h-2 bg-gray-200 dark:bg-darkCard rounded-lg"
                />
                <div className="flex justify-between text-[9px] text-textMuted font-medium">
                  <span>RPE 6 (Échauffement)</span>
                  <span>RPE 8 (Match)</span>
                  <span>RPE 10 (Échec)</span>
                </div>
              </div>
            </div>

            {/* Athlete Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-textMuted block">Ressenti du Judoka (Poigne, Vitesse, Fatigue) :</label>
              <textarea 
                rows={2}
                placeholder="Ex : Superbe vitesse sur les uchi-komi, avant-bras brûlés sur les tractions kimono..."
                value={athleteNotes}
                onChange={(e) => setAthleteNotes(e.target.value)}
                className="w-full bg-card border border-gray-200 dark:border-darkBorder rounded-xl p-2.5 text-xs text-textMain focus:outline-none focus:border-primary"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              {saveSuccessMsg && (
                <div className="mb-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={14} /> Séance et note enregistrées avec succès !
                </div>
              )}

              <button
                type="submit"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-black px-6 py-3 rounded-xl text-xs shadow-md shadow-primary/25 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <Award size={15} />
                <span>Enregistrer & Noter ma Séance 🥋</span>
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Floating Rest Stopwatch Pill (Active when timer is running or paused during workout) */}
      {(isTimerRunning || (timerRemaining < timerSeconds && timerRemaining > 0)) && (
        <div className="fixed bottom-20 md:bottom-8 right-3 sm:right-6 z-40 bg-slate-900/95 text-white backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-2xl border border-primary/50 flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200">
          <Clock size={16} className={`text-primary ${isTimerRunning ? 'animate-spin' : ''}`} />
          <div className="font-mono font-black text-sm tracking-tight">
            {formatTimer(timerRemaining)}
          </div>
          <button
            onClick={handleToggleTimer}
            className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center cursor-pointer active:scale-95"
            title={isTimerRunning ? 'Pause' : 'Reprendre'}
          >
            {isTimerRunning ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
          </button>
          <button
            onClick={handleResetTimer}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer active:scale-95"
            title="Arrêter"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      )}

      {/* 8. Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-darkBorder space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-darkBorder">
              <h3 className="text-xs sm:text-sm font-black text-textMain flex items-center gap-2">
                <Scale size={16} className="text-primary" />
                <span>Enregistrer la Pesée du Jour</span>
              </h3>
              <button onClick={() => setShowWeightModal(false)} className="text-textMuted hover:text-textMain font-bold p-1">✕</button>
            </div>

            <form onSubmit={handleLogWeight} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-textMuted block mb-1.5">Poids à jeun ce matin (kg) :</label>
                <input 
                  type="number"
                  step="0.1"
                  min="45"
                  max="75"
                  required
                  placeholder="Ex : 55.4"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl p-3 text-lg font-black text-textMain focus:outline-none focus:border-primary"
                />
                <p className="text-[11px] text-textMuted mt-1">Cible : 60.0 kg pour la catégorie -60 kg.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-darkBorder">
                <button type="button" onClick={() => setShowWeightModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-textMuted hover:bg-gray-100 dark:hover:bg-darkCard cursor-pointer">Annuler</button>
                <button type="submit" className="bg-primary hover:bg-primary/90 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-sm cursor-pointer">Valider la pesée</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. History of Evaluated Sessions */}
      {judoState.history && judoState.history.length > 0 && (
        <div className="bg-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-gray-200/80 dark:border-darkBorder shadow-sm space-y-3 transition-colors">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-darkBorder">
            <h3 className="text-xs font-black text-textMain uppercase tracking-wider flex items-center gap-2">
              <Calendar size={14} className="text-primary" />
              <span>Historique des Séances</span>
            </h3>
            <span className="text-[10px] text-textMuted font-bold">{judoState.history.length} entrées</span>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-darkBorder">
            {judoState.history.slice(0, 5).map((item, idx) => (
              <div key={idx} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-extrabold text-textMain uppercase">{item.sessionId.replace('_', ' • ')}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-500">
                      ★ {item.score}/10
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500">
                      RPE {item.rpe}
                    </span>
                  </div>
                  {item.notes && <p className="text-textMuted text-[11px] mt-0.5 italic">« {item.notes} »</p>}
                </div>
                <div className="text-[10px] text-textMuted font-medium">
                  {new Date(item.completedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. Exercise Movement Demo & Photo Modal */}
      {selectedExerciseModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-card rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-darkBorder max-h-[92vh] overflow-y-auto space-y-3.5">
            
            {/* Modal Image Header */}
            <div className="relative w-full h-48 sm:h-64 rounded-t-2xl sm:rounded-t-3xl overflow-hidden bg-slate-950">
              <img 
                src={selectedExerciseModal.imageUrl} 
                alt={selectedExerciseModal.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              
              <button 
                type="button"
                onClick={() => setSelectedExerciseModal(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center font-bold transition-all cursor-pointer shadow-md"
              >
                <X size={16} />
              </button>

              <div className="absolute bottom-3 left-3.5 right-3.5">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-primary text-white">
                    {selectedExerciseModal.equipment}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/20 text-white backdrop-blur-xs">
                    {selectedExerciseModal.sets} séries × {selectedExerciseModal.reps}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/20 text-white backdrop-blur-xs">
                    Tempo : {selectedExerciseModal.tempo}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                  {selectedExerciseModal.name}
                </h3>
              </div>
            </div>

            {/* Modal Content Body */}
            <div className="p-4 sm:p-5 pt-0 space-y-3.5">
              
              {/* Tactical Judo Impact Box */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 sm:p-3 flex items-start gap-2.5">
                <Zap size={16} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-black text-emerald-700 dark:text-emerald-300 block">Pourquoi cet exercice pour ton Judo ?</span>
                  <p className="text-textMuted mt-0.5 leading-relaxed">{selectedExerciseModal.judoImpact}</p>
                </div>
              </div>

              {/* 3 Steps Guide */}
              {selectedExerciseModal.steps && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-textMain uppercase tracking-wider">
                    Décomposition Technique (3 Étapes) :
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="bg-background p-2.5 sm:p-3 rounded-xl border border-gray-200/80 dark:border-darkBorder flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-lg bg-blue-500 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                      <div>
                        <strong className="text-textMain block font-bold">Position de Départ :</strong>
                        <span className="text-textMuted leading-relaxed">{selectedExerciseModal.steps.start}</span>
                      </div>
                    </div>
                    <div className="bg-background p-2.5 sm:p-3 rounded-xl border border-gray-200/80 dark:border-darkBorder flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-lg bg-primary text-white font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                      <div>
                        <strong className="text-textMain block font-bold">Phase Active & Mouvement :</strong>
                        <span className="text-textMuted leading-relaxed">{selectedExerciseModal.steps.movement}</span>
                      </div>
                    </div>
                    <div className="bg-background p-2.5 sm:p-3 rounded-xl border border-gray-200/80 dark:border-darkBorder flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-lg bg-emerald-500 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                      <div>
                        <strong className="text-textMain block font-bold">Phase Retour & Contrôle :</strong>
                        <span className="text-textMuted leading-relaxed">{selectedExerciseModal.steps.finish}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error to Avoid */}
              {selectedExerciseModal.avoidMistake && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 sm:p-3 flex items-start gap-2.5">
                  <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-black text-amber-700 dark:text-amber-400 block">⚠️ Erreur technique à éviter absolument :</span>
                    <p className="text-textMuted mt-0.5 leading-relaxed">{selectedExerciseModal.avoidMistake}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 border-t border-gray-100 dark:border-darkBorder">
                <button
                  type="button"
                  onClick={() => setSelectedExerciseModal(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-textMuted hover:bg-gray-100 dark:hover:bg-darkCard cursor-pointer text-center"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleToggleExercise(selectedExerciseModal.id);
                    setSelectedExerciseModal(null);
                  }}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Check size={14} />
                  <span>{completedExerciseIds.includes(selectedExerciseModal.id) ? 'Décocher cet exercice' : 'Valider cet exercice'}</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default JudoProgram;
