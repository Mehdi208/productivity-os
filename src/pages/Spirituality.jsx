// src/pages/Spirituality.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, Moon, Sun, CheckCircle2, Check, Sparkles, Flame, 
  ChevronRight, RotateCcw, Plus, Minus, Heart, Award, Compass, 
  Clock, Bookmark, Star, ArrowUpRight
} from 'lucide-react';
import { 
  loadSpiritualityState, 
  saveSpiritualityState, 
  incrementQuranPage, 
  decrementQuranPage, 
  setExactQuranPage, 
  toggleDailyPrayer, 
  incrementTasbih, 
  resetTasbih, 
  getSurahForPage, 
  TOTAL_QURAN_PAGES, 
  QURAN_SURAHS, 
  SPIRITUAL_QUOTES, 
  DHIKR_ITEMS 
} from '../data/spiritualityEngine';
import { useLanguage } from '../context/LanguageContext';
import { getTodayStr, getAbidjanDateStr } from '../data/scoreHistory';
import { playDigitalChime } from '../utils/audioAlert';

const Spirituality = () => {
  const { lang, t } = useLanguage();
  const [state, setState] = useState(() => loadSpiritualityState());
  const [activeDhikrId, setActiveDhikrId] = useState('subhanallah');
  const [showSurahModal, setShowSurahModal] = useState(false);
  const [pageInputVal, setPageInputVal] = useState('');
  const [showPageInputModal, setShowPageInputModal] = useState(false);
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);

  const todayStr = getAbidjanDateStr ? getAbidjanDateStr() : getTodayStr();

  // Refresh quote cyclically
  useEffect(() => {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    setActiveQuoteIndex(dayOfYear % SPIRITUAL_QUOTES.length);
  }, []);

  const currentQuote = SPIRITUAL_QUOTES[activeQuoteIndex] || SPIRITUAL_QUOTES[0];

  // Quran progress metrics
  const currentPage = state.quran.currentPage || 1;
  const currentSurah = useMemo(() => getSurahForPage(currentPage), [currentPage]);
  const khatmaProgressPct = ((currentPage / TOTAL_QURAN_PAGES) * 100).toFixed(1);
  const pagesRemaining = Math.max(0, TOTAL_QURAN_PAGES - currentPage);
  const isDailyTargetDone = (state.quran.pagesReadToday || 0) >= (state.quran.dailyTarget || 1);

  // Today prayers
  const todayPrayers = state.prayers[todayStr] || {
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false
  };

  const prayersList = [
    { key: 'fajr', name: 'Fajr', arabic: 'الفجر', period: 'Aube', icon: '🌅' },
    { key: 'dhuhr', name: 'Dhuhr', arabic: 'الظهر', period: 'Midi', icon: '☀️' },
    { key: 'asr', name: 'Asr', arabic: 'العصر', period: 'Après-midi', icon: '🌤️' },
    { key: 'maghrib', name: 'Maghrib', arabic: 'المغرب', period: 'Coucher du soleil', icon: '🌇' },
    { key: 'isha', name: 'Isha', arabic: 'العشاء', period: 'Nuit', icon: '🌙' }
  ];

  const prayersDoneCount = Object.values(todayPrayers).filter(Boolean).length;

  // Active Dhikr
  const activeDhikr = DHIKR_ITEMS.find(d => d.id === activeDhikrId) || DHIKR_ITEMS[0];
  const activeDhikrCount = state.tasbih[activeDhikrId] || 0;

  // Handlers
  const handleAddPage = (amount = 1) => {
    const updated = incrementQuranPage(amount);
    setState({ ...updated });
    try {
      playDigitalChime();
    } catch (e) {
      // silent
    }
  };

  const handleMinusPage = () => {
    const updated = decrementQuranPage();
    setState({ ...updated });
  };

  const handleSetPageSubmit = (e) => {
    e.preventDefault();
    const p = parseInt(pageInputVal, 10);
    if (!isNaN(p) && p >= 1 && p <= TOTAL_QURAN_PAGES) {
      const updated = setExactQuranPage(p);
      setState({ ...updated });
      setShowPageInputModal(false);
      setPageInputVal('');
    }
  };

  const handleTogglePrayer = (prayerKey) => {
    const updated = toggleDailyPrayer(prayerKey);
    setState({ ...updated });
  };

  const handleTapTasbih = () => {
    const updated = incrementTasbih(activeDhikrId);
    setState({ ...updated });
    if ((activeDhikrCount + 1) % activeDhikr.target === 0) {
      try {
        playDigitalChime();
      } catch (e) {}
    }
  };

  const handleResetTasbih = () => {
    const updated = resetTasbih(activeDhikrId);
    setState({ ...updated });
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-28 md:pb-12 animate-in fade-in duration-300">
      
      {/* 1. Luxurious Islamic Header with Calligraphy & Bismillah */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-700/40">
        {/* Subtle decorative islamic geometry circles */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        <div className="absolute right-10 bottom-0 text-emerald-400/10 text-9xl font-serif select-none pointer-events-none">
          ☪
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-800/60 border border-emerald-600/40 text-amber-300 text-xs font-bold shadow-inner">
              <Sparkles size={13} className="text-amber-400" />
              <span>Espace Spiritualité & Éveil</span>
            </div>

            <div className="space-y-1">
              <div className="font-serif text-2xl sm:text-3xl text-amber-200 tracking-wide font-normal">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Discipline Spirituelle & Lecture du Coran
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200/80 max-w-xl">
                Nourris ton âme au quotidien. Une page lue chaque jour avec constance forge un cœur serein et un esprit inébranlable.
              </p>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap sm:flex-nowrap">
            <div className="bg-emerald-900/80 backdrop-blur-md border border-emerald-700/50 rounded-2xl p-3.5 text-center min-w-[100px]">
              <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">Progression</span>
              <span className="text-xl font-extrabold text-amber-300 mt-0.5 block">{khatmaProgressPct}%</span>
              <span className="text-[10px] text-emerald-300/70 block">{currentPage} / 604</span>
            </div>

            <div className="bg-emerald-900/80 backdrop-blur-md border border-emerald-700/50 rounded-2xl p-3.5 text-center min-w-[100px]">
              <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">Prières Aujourd'hui</span>
              <span className="text-xl font-extrabold text-white mt-0.5 block">{prayersDoneCount} / 5</span>
              <span className="text-[10px] text-emerald-300/70 block">{prayersDoneCount === 5 ? 'Accomplies ✨' : 'En cours'}</span>
            </div>

            <div className="bg-emerald-900/80 backdrop-blur-md border border-emerald-700/50 rounded-2xl p-3.5 text-center min-w-[90px]">
              <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">Série (Streak)</span>
              <span className="text-xl font-extrabold text-amber-400 mt-0.5 block flex items-center justify-center gap-1">
                {state.quran.readingStreak || 0} <Flame size={16} className="text-amber-400" />
              </span>
              <span className="text-[10px] text-emerald-300/70 block">jours</span>
            </div>
          </div>
        </div>

        {/* Verset / Hadith Inspirant du Jour */}
        <div className="relative z-10 mt-6 pt-5 border-t border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
              📖
            </div>
            <div className="min-w-0">
              <div className="text-xs text-amber-200 font-serif leading-relaxed">
                {currentQuote.arabic}
              </div>
              <p className="text-xs text-emerald-100 font-medium italic mt-0.5">
                {currentQuote.french}
              </p>
              <span className="text-[10px] text-emerald-300/60 font-semibold block mt-0.5">
                — {currentQuote.reference}
              </span>
            </div>
          </div>

          <button 
            onClick={() => setActiveQuoteIndex((prev) => (prev + 1) % SPIRITUAL_QUOTES.length)}
            className="text-[11px] text-emerald-300 hover:text-amber-300 font-bold px-3 py-1.5 rounded-xl bg-emerald-800/40 hover:bg-emerald-800/70 border border-emerald-600/30 transition-colors flex items-center gap-1.5 self-end sm:self-center flex-shrink-0"
          >
            <span>Autre rappel</span>
            <RotateCcw size={11} />
          </button>
        </div>
      </header>

      {/* 2. Main Grid: Quran Tracker (Left 2 cols) + Prayers & Tasbih (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: THE HOLY QURAN TRACKER */}
        <section className="lg:col-span-2 space-y-6">
          
          {/* Main Quran Card */}
          <div className="bg-card rounded-3xl p-6 sm:p-7 shadow-sm border border-emerald-100 dark:border-emerald-950/60 relative overflow-hidden transition-all">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className="text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1.5">
                  <BookOpen size={14} />
                  <span>Suivi de Lecture du Saint Coran (Mushaf Médine)</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-textMain mt-1 tracking-tight">
                  Page {currentPage} <span className="text-textMuted text-lg font-bold">/ {TOTAL_QURAN_PAGES}</span>
                </h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs font-bold text-textMain">
                    Sourate {currentSurah.num}. {currentSurah.name} ({currentSurah.french})
                  </span>
                  <span className="text-xs font-serif text-emerald-600 dark:text-emerald-400 font-bold">
                    {currentSurah.arabic}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPageInputModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-darkBorder hover:bg-gray-200 dark:hover:bg-gray-800 text-xs font-bold text-textMain transition-colors"
                  title="Aller à une page précise"
                >
                  Aller à la page...
                </button>
                <button
                  onClick={() => setShowSurahModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1"
                >
                  <span>Index des Sourates</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-textMuted">
                <span>Début (Al-Fatiha)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{khatmaProgressPct}% accompli</span>
                <span>Fin (An-Nas)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-darkBorder overflow-hidden p-0.5">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-400 transition-all duration-500 shadow-sm"
                  style={{ width: `${khatmaProgressPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-textMuted">
                <span>Reste : {pagesRemaining} pages</span>
                <span>{state.quran.totalKhatmas || 0} Khatma(s) complétée(s)</span>
              </div>
            </div>

            {/* Today's Reading Target Status */}
            <div className={`mt-6 p-4 rounded-2xl border transition-all ${
              isDailyTargetDone 
                ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200' 
                : 'bg-amber-50/60 dark:bg-amber-950/15 border-amber-200 dark:border-amber-800/30 text-amber-900 dark:text-amber-200'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black ${
                    isDailyTargetDone 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                  }`}>
                    {isDailyTargetDone ? <Check size={18} strokeWidth={3} /> : '🎯'}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold">
                      {isDailyTargetDone 
                        ? 'Objectif spirituel du jour validé ! Qu’Allah accepte ta lecture.' 
                        : 'Objectif du jour : 1 page de Coran à lire aujourd’hui'}
                    </h4>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      {state.quran.pagesReadToday || 0} page(s) lue(s) aujourd'hui • Cible : {state.quran.dailyTarget || 1} page / jour
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={handleMinusPage}
                    disabled={currentPage <= 1}
                    className="p-2 rounded-xl bg-card border border-gray-200 dark:border-darkBorder text-textMuted hover:text-textMain disabled:opacity-40 transition-colors"
                    title="Reculer d'une page"
                  >
                    <Minus size={14} />
                  </button>
                  <button
                    onClick={() => handleAddPage(1)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Plus size={15} strokeWidth={2.5} />
                    <span>+1 Page Lue</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Tips for Consistent Quran Reading */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-background border border-gray-100 dark:border-darkBorder">
                <span className="font-bold text-textMain block mb-0.5">⏰ Meilleur Moment Recommandé</span>
                <p className="text-textMuted text-[11px] leading-relaxed">
                  Juste après la prière du Fajr ou le soir après Isha pour une concentration maximale et un recueillement profond.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-background border border-gray-100 dark:border-darkBorder">
                <span className="font-bold text-textMain block mb-0.5">⚡ La Force de la Régularité</span>
                <p className="text-textMuted text-[11px] leading-relaxed">
                  À raison d'une page par jour, chaque verset s'ancre en toi. Ne vise pas la quantité, vise la constance sans jamais rompre ta chaîne.
                </p>
              </div>
            </div>

          </div>

          {/* Surah Overview Carousel Preview */}
          <div className="bg-card rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-darkBorder">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-black uppercase text-textMuted tracking-wider">
                Sourates Clés & Repères de Lecture
              </h3>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                114 Sourates au total
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { name: 'Al-Kahf (18)', page: 293, desc: 'Lumière du Vendredi' },
                { name: 'Yâ-Sîn (36)', page: 440, desc: 'Le Cœur du Coran' },
                { name: 'Ar-Rahmân (55)', page: 531, desc: 'Bienfaits Divins' },
                { name: 'Al-Mulk (67)', page: 562, desc: 'Protection de la Nuit' }
              ].map((s) => (
                <div 
                  key={s.name}
                  onClick={() => {
                    const updated = setExactQuranPage(s.page);
                    setState({ ...updated });
                  }}
                  className="p-3 rounded-2xl bg-background border border-gray-100 dark:border-darkBorder hover:border-emerald-500/50 hover:shadow-sm cursor-pointer transition-all group"
                >
                  <span className="text-xs font-extrabold text-textMain group-hover:text-emerald-600 block truncate">
                    {s.name}
                  </span>
                  <span className="text-[10px] text-textMuted block mt-0.5">{s.desc}</span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block mt-1">
                    Page {s.page} →
                  </span>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* RIGHT COLUMN: 5 PRAYERS & TASBIH COUNTER */}
        <section className="space-y-6">
          
          {/* 5 Daily Prayers (Salât) Tracker */}
          <div className="bg-card rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-darkBorder">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider block">
                  Piliers du Jour
                </span>
                <h3 className="text-lg font-black text-textMain mt-0.5">
                  Les 5 Prières Quotidiennes
                </h3>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-xl ${
                prayersDoneCount === 5 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
              }`}>
                {prayersDoneCount} / 5 faites
              </span>
            </div>

            <div className="space-y-2">
              {prayersList.map((pr) => {
                const isChecked = !!todayPrayers[pr.key];
                return (
                  <div
                    key={pr.key}
                    onClick={() => handleTogglePrayer(pr.key)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isChecked 
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400/60 text-emerald-950 dark:text-emerald-100 shadow-sm' 
                        : 'bg-background border-gray-100 dark:border-darkBorder hover:border-gray-200 text-textMain'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{pr.icon}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold ${isChecked ? 'line-through opacity-80' : ''}`}>
                            {pr.name}
                          </span>
                          <span className="text-[11px] font-serif text-emerald-600 dark:text-emerald-400">
                            {pr.arabic}
                          </span>
                        </div>
                        <span className="text-[10px] text-textMuted block font-medium">
                          {pr.period}
                        </span>
                      </div>
                    </div>

                    <div className={`w-6 h-6 rounded-xl border flex items-center justify-center transition-all ${
                      isChecked 
                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                        : 'border-gray-300 dark:border-darkBorder'
                    }`}>
                      {isChecked && <Check size={14} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Electronic Tasbih & Dhikr Counter */}
          <div className="bg-card rounded-3xl p-5 sm:p-6 shadow-sm border border-emerald-100 dark:border-emerald-950/60 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[11px] font-black uppercase text-amber-500 tracking-wider block">
                  Tasbih Électronique
                </span>
                <h3 className="text-base font-black text-textMain mt-0.5">
                  Dhikr & Invocations
                </h3>
              </div>
              <button
                onClick={handleResetTasbih}
                className="text-[11px] text-textMuted hover:text-red-500 p-1 rounded-lg transition-colors"
                title="Remettre à zéro"
              >
                <RotateCcw size={13} />
              </button>
            </div>

            {/* Dhikr Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {DHIKR_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveDhikrId(item.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                    activeDhikrId === item.id 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'bg-background border border-gray-100 dark:border-darkBorder text-textMuted hover:text-textMain'
                  }`}
                >
                  {item.text}
                </button>
              ))}
            </div>

            {/* Tasbih Main Tap Display */}
            <div className="mt-4 text-center p-4 rounded-2xl bg-gradient-to-b from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-100 dark:border-emerald-900/30">
              <div className="font-serif text-xl text-emerald-800 dark:text-emerald-300 mb-1">
                {activeDhikr.arabic}
              </div>
              <div className="text-xs font-bold text-textMain mb-1">
                {activeDhikr.text}
              </div>
              <div className="text-[10px] text-textMuted italic mb-4">
                « {activeDhikr.meaning} »
              </div>

              {/* Huge Interactive Tap Button */}
              <button
                onClick={handleTapTasbih}
                className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-white font-black text-3xl shadow-lg shadow-emerald-600/30 active:scale-90 transition-transform flex flex-col items-center justify-center ring-4 ring-emerald-500/20"
              >
                <span>{activeDhikrCount}</span>
                <span className="text-[10px] opacity-75 font-semibold mt-0.5">/ {activeDhikr.target}</span>
              </button>

              <p className="text-[10px] text-textMuted mt-3">
                Touche le cercle pour égrener • Palier : {activeDhikr.target}
              </p>
            </div>
          </div>

        </section>

      </div>

      {/* MODAL: Full Surah Index */}
      {showSurahModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg max-h-[80vh] rounded-3xl p-5 shadow-2xl border border-gray-200 dark:border-darkBorder flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-darkBorder">
              <div>
                <h3 className="font-black text-base text-textMain">Index des 114 Sourates du Coran</h3>
                <p className="text-xs text-textMuted">Choisis une sourate pour y placer ton marque-page</p>
              </div>
              <button 
                onClick={() => setShowSurahModal(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-textMuted"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto py-3 space-y-1.5 flex-1 pr-1">
              {QURAN_SURAHS.map((s) => (
                <div
                  key={s.num}
                  onClick={() => {
                    const updated = setExactQuranPage(s.startPage);
                    setState({ ...updated });
                    setShowSurahModal(false);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                    currentSurah.num === s.num 
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold' 
                      : 'bg-background hover:bg-gray-50 dark:hover:bg-darkCardElevated border-gray-100 dark:border-darkBorder text-textMain'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-black/10 dark:bg-white/10 flex items-center justify-center font-bold text-[10px]">
                      {s.num}
                    </span>
                    <div>
                      <span className="font-extrabold">{s.name}</span>
                      <span className="text-[10px] opacity-75 ml-1.5">({s.french})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-serif text-sm">{s.arabic}</span>
                    <span className="text-[10px] font-bold opacity-80">p. {s.startPage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Set Exact Page */}
      {showPageInputModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form 
            onSubmit={handleSetPageSubmit}
            className="bg-card w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-gray-200 dark:border-darkBorder space-y-4"
          >
            <h3 className="font-black text-base text-textMain">Définir la page courante</h3>
            <p className="text-xs text-textMuted">
              Indique le numéro de page où tu te trouves dans ton Coran papier (entre 1 et {TOTAL_QURAN_PAGES}) :
            </p>

            <input
              type="number"
              min="1"
              max={TOTAL_QURAN_PAGES}
              value={pageInputVal}
              onChange={(e) => setPageInputVal(e.target.value)}
              placeholder={`Ex : ${currentPage}`}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-darkBorder bg-background text-textMain text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              autoFocus
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPageInputModal(false)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-textMuted hover:text-textMain"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
              >
                Valider la page
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default Spirituality;
