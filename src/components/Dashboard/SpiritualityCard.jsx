// src/components/Dashboard/SpiritualityCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Check, Plus, Sparkles, Flame, ChevronRight, Moon } from 'lucide-react';
import { 
  loadSpiritualityState, 
  incrementQuranPage, 
  getSurahForPage, 
  TOTAL_QURAN_PAGES 
} from '../../data/spiritualityEngine';
import { getTodayStr, getAbidjanDateStr } from '../../data/scoreHistory';
import { playDigitalChime } from '../../utils/audioAlert';

const SpiritualityCard = () => {
  const [state, setState] = useState(() => loadSpiritualityState());
  const todayStr = getAbidjanDateStr ? getAbidjanDateStr() : getTodayStr();

  const currentPage = state.quran.currentPage || 1;
  const currentSurah = getSurahForPage(currentPage);
  const khatmaProgressPct = ((currentPage / TOTAL_QURAN_PAGES) * 100).toFixed(0);
  const isDailyTargetDone = (state.quran.pagesReadToday || 0) >= (state.quran.dailyTarget || 1);

  // Today prayers count
  const todayPrayers = state.prayers[todayStr] || {};
  const prayersDoneCount = Object.values(todayPrayers).filter(Boolean).length;

  const handleQuickAddPage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = incrementQuranPage(1);
    setState({ ...updated });
    try {
      playDigitalChime();
    } catch {}
  };

  return (
    <div className="bg-gradient-to-br from-emerald-950/90 via-emerald-900 to-teal-950 text-white rounded-3xl p-5 shadow-sm border border-emerald-700/40 relative overflow-hidden transition-all hover:border-emerald-600/60 group">
      
      {/* Subtle background glow */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />

      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-800/80 border border-emerald-600/40 text-amber-300 flex items-center justify-center font-bold text-xs shadow-inner">
            📖
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider block">
              Spiritualité & Coran
            </span>
            <h4 className="text-sm font-extrabold text-white leading-tight">
              Page {currentPage} <span className="text-emerald-300/70 text-xs font-semibold">/ {TOTAL_QURAN_PAGES}</span>
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 bg-emerald-900/80 px-2 py-0.5 rounded-lg border border-emerald-700/50">
            {state.quran.readingStreak || 0} <Flame size={12} className="text-amber-400" />
          </span>
          <Link
            to="/spirituality"
            className="text-[11px] text-emerald-300 hover:text-white font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
            title="Ouvrir l'Espace Spiritualité"
          >
            <span>Ouvrir</span>
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>

      {/* Surah context info */}
      <div className="flex items-center justify-between text-xs mb-3 px-0.5 relative z-10">
        <span className="text-emerald-200/90 font-medium truncate">
          Sourate {currentSurah.name} ({currentSurah.french})
        </span>
        <span className="font-serif text-amber-300 text-xs font-bold flex-shrink-0">
          {currentSurah.arabic}
        </span>
      </div>

      {/* Mini Progress Bar */}
      <div className="w-full bg-emerald-950/80 border border-emerald-800/50 h-2 rounded-full overflow-hidden p-0.5 mb-3.5 relative z-10">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-300 rounded-full transition-all duration-500"
          style={{ width: `${khatmaProgressPct}%` }}
        />
      </div>

      {/* Action and Daily Status Row */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-emerald-800/60 relative z-10">
        <div className="min-w-0">
          <span className="text-[10px] text-emerald-300/80 font-bold block uppercase tracking-wider">
            {isDailyTargetDone ? 'Objectif du jour validé ✨' : 'Cible : 1 page aujourd’hui'}
          </span>
          <span className="text-[11px] text-white font-semibold truncate block">
            {prayersDoneCount} / 5 prières accomplies
          </span>
        </div>

        <button
          onClick={handleQuickAddPage}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5 flex-shrink-0"
        >
          <Plus size={13} strokeWidth={3} />
          <span>+1 Page</span>
        </button>
      </div>

    </div>
  );
};

export default SpiritualityCard;
