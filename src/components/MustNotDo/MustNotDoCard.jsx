import React, { useState, useEffect } from 'react';
import { Ban, ShieldAlert, Check, Clock, Droplet, Plus, Info, Utensils, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getMealWindowsStatus, getMinutesSinceLastHydration } from '../../data/mustNotDoEngine';

const MustNotDoCard = ({ 
  mustNotDoData, 
  onToggleMeal, 
  onAddWater, 
  onOpenDetailsModal 
}) => {
  const { lang, t } = useLanguage();
  const [now, setNow] = useState(new Date());

  // Update real-time clock every 30 seconds for live status calculation
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const windowStatus = getMealWindowsStatus(now);
  const meals = mustNotDoData?.meals || {};
  const elapsedHydrationMin = getMinutesSinceLastHydration(mustNotDoData?.lastHydrationTimestamp);
  const hydrationInterval = mustNotDoData?.hydrationIntervalMinutes || 60;

  // Count meals taken today
  const mealsCount = (meals.breakfast ? 1 : 0) + (meals.lunch ? 1 : 0) + (meals.dinner ? 1 : 0);

  // Status badge for breakfast rule
  const getBreakfastBadge = () => {
    if (meals.breakfast) {
      return { 
        text: meals.breakfastTime ? `${t('mndRespectLabel') || 'Respecté'} (${meals.breakfastTime})` : (t('mndRespectLabel') || 'Respecté'), 
        bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
      };
    }
    if (windowStatus.breakfastStatus === 'closed') {
      return { 
        text: t('mndLockedUntil12') || 'Fermé • Zéro repas jusqu\'à 12h', 
        bg: 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30' 
      };
    }
    if (windowStatus.breakfastStatus === 'warning') {
      return { 
        text: t('mndWarningLastCall') || 'Dernier appel (fin 07h00)', 
        bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
      };
    }
    return { 
      text: t('mndWindowOpenUntil7') || 'Ouvert jusqu\'à 07h00', 
      bg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30' 
    };
  };

  // Status badge for lunch rule
  const getLunchBadge = () => {
    if (meals.lunch) {
      return { 
        text: meals.lunchTime ? `${t('mndRespectLabel') || 'Validé'} (${meals.lunchTime})` : (t('mndRespectLabel') || 'Validé'), 
        bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
      };
    }
    if (windowStatus.lunchStatus === 'active') {
      return { 
        text: t('mndLunchActiveNow') || 'Crénau actif (12h00-12h45) !', 
        bg: 'bg-emerald-500 text-white font-extrabold shadow-sm animate-pulse' 
      };
    }
    if (windowStatus.lunchStatus === 'warning') {
      return { 
        text: t('mndLunchLast10m') || 'Fin dans 10 min (12h45) !', 
        bg: 'bg-amber-500 text-white font-bold' 
      };
    }
    if (windowStatus.lunchStatus === 'waiting') {
      return { 
        text: t('mndWaiting12h') || 'En attente (12h00)', 
        bg: 'bg-slate-500/15 text-slate-600 dark:text-slate-300 border border-slate-500/30' 
      };
    }
    return { 
      text: t('mndLunchClosed') || 'Crénau 12h-12h45 clos', 
      bg: 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30' 
    };
  };

  const bBadge = getBreakfastBadge();
  const lBadge = getLunchBadge();

  // Hydration progress towards 60 min limit
  const hydrationPct = Math.min(100, Math.round((elapsedHydrationMin / hydrationInterval) * 100));
  const isHydrationOverdue = elapsedHydrationMin >= hydrationInterval;

  return (
    <div className="bg-card rounded-3xl p-5 sm:p-6 shadow-sm border border-red-200/60 dark:border-red-950/40 relative overflow-hidden transition-all hover:shadow-md">
      {/* Decorative subtle background aura */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
            <Ban size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-textMain flex items-center gap-1.5">
              <span>{lang === 'en' ? 'Must Not Do (Anti-Habits)' : 'Must Not Do (Ce qu\'il faut éviter)'}</span>
            </h3>
            <p className="text-[11px] text-textMuted font-medium">
              {lang === 'en' ? 'Daily discipline & fasting windows' : 'Discipline quotidienne & fenêtres de jeûne'}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenDetailsModal}
          className="text-textMuted hover:text-primary transition-colors p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-darkBorder"
          title={lang === 'en' ? 'Scientific details & rules' : 'Détails scientifiques & réglages'}
          aria-label="Info"
        >
          <Info size={16} />
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        
        {/* RÈGLE 1 : Petit-déjeuner avant 07h00 */}
        <div className="p-3 rounded-2xl bg-background border border-gray-100 dark:border-darkBorder flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-textMain">
                🚫 {lang === 'en' ? 'No food after 07:00 AM' : 'Ne pas manger après 07h00'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bBadge.bg}`}>
                {bBadge.text}
              </span>
            </div>
            <p className="text-[11px] text-textMuted mt-0.5">
              {lang === 'en' ? 'Window: Waking up to 07:00 AM sharp' : 'Fenêtre : Réveil à 07h00 pile'}
            </p>
          </div>

          <button
            onClick={() => onToggleMeal && onToggleMeal('breakfast')}
            className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              meals.breakfast 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'bg-gray-100 dark:bg-darkBorder text-textMain hover:bg-primary hover:text-white'
            }`}
          >
            {meals.breakfast ? <Check size={13} strokeWidth={3} /> : null}
            <span>{meals.breakfast ? (lang === 'en' ? 'Eaten' : 'Pris') : (lang === 'en' ? 'Mark eaten' : 'Valider')}</span>
          </button>
        </div>

        {/* RÈGLE 2 : Déjeuner entre 12h00 et 12h45 */}
        <div className="p-3 rounded-2xl bg-background border border-gray-100 dark:border-darkBorder flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-textMain">
                🚫 {lang === 'en' ? 'No lunch outside 12:00 - 12:45' : 'Ne pas manger hors 12h00 - 12h45'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${lBadge.bg}`}>
                {lBadge.text}
              </span>
            </div>
            <p className="text-[11px] text-textMuted mt-0.5">
              {lang === 'en' ? 'Strict 45-min lunch window • Do not skip' : 'Créneau strict de 45 min • Ne pas sauter'}
            </p>
          </div>

          <button
            onClick={() => onToggleMeal && onToggleMeal('lunch')}
            className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              meals.lunch 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'bg-gray-100 dark:bg-darkBorder text-textMain hover:bg-primary hover:text-white'
            }`}
          >
            {meals.lunch ? <Check size={13} strokeWidth={3} /> : null}
            <span>{meals.lunch ? (lang === 'en' ? 'Eaten' : 'Pris') : (lang === 'en' ? 'Mark eaten' : 'Valider')}</span>
          </button>
        </div>

        {/* RÈGLE 3 : Minimum 3 repas par jour */}
        <div className="p-3 rounded-2xl bg-background border border-gray-100 dark:border-darkBorder flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-textMain">
                🍽️ {lang === 'en' ? 'Min. 3 meals per day' : 'Au moins 3 repas par jour'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                mealsCount >= 3 
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
              }`}>
                {mealsCount}/3 {lang === 'en' ? 'meals' : 'repas'}
              </span>
            </div>
            <p className="text-[11px] text-textMuted mt-0.5">
              {lang === 'en' ? 'Breakfast + Lunch + Dinner' : 'Petit-déj + Déjeuner + Dîner'}
            </p>
          </div>

          <button
            onClick={() => onToggleMeal && onToggleMeal('dinner')}
            className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              meals.dinner 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'bg-gray-100 dark:bg-darkBorder text-textMain hover:bg-primary hover:text-white'
            }`}
          >
            {meals.dinner ? <Check size={13} strokeWidth={3} /> : null}
            <span>{meals.dinner ? (lang === 'en' ? 'Dinner done' : 'Dîner pris') : (lang === 'en' ? 'Dinner' : 'Dîner')}</span>
          </button>
        </div>

        {/* RÈGLE 4 : Hydratation toutes les 60 min */}
        <div className="p-3 rounded-2xl bg-background border border-gray-100 dark:border-darkBorder space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-textMain flex items-center gap-1">
                <span>💧</span> {lang === 'en' ? 'No >60 min without water' : 'Ne pas rester >60 min sans eau'}
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                isHydrationOverdue 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
              }`}>
                {isHydrationOverdue 
                  ? (lang === 'en' ? 'ALERT: Drink now !' : 'ALERTE : Buvez un verre !') 
                  : (lang === 'en' ? `${elapsedHydrationMin}m elapsed` : `Bu il y a ${elapsedHydrationMin} min`)}
              </span>
            </div>

            <button
              onClick={() => onAddWater && onAddWater(250)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1 rounded-xl transition-all flex items-center gap-1 shadow-sm active:scale-95"
              title="Ajouter un verre d'eau (+250 ml)"
            >
              <Plus size={12} strokeWidth={3} />
              <span>250ml</span>
            </button>
          </div>

          {/* Progress towards 60-min interval */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-textMuted font-medium">
              <span>{lang === 'en' ? 'Interval progress' : 'Intervalle scientifique conseillé (60 min)'}</span>
              <span>{elapsedHydrationMin} / {hydrationInterval} min</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-darkBorder h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  isHydrationOverdue ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, hydrationPct)}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Card Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-darkBorder flex items-center justify-between text-[11px] text-textMuted">
        <span className="flex items-center gap-1 font-semibold">
          <Clock size={12} />
          <span>{lang === 'en' ? 'Pop-up notifications active' : 'Alertes pop-ups automatiques actives'}</span>
        </span>
        <button
          onClick={onOpenDetailsModal}
          className="text-primary hover:underline font-bold"
        >
          {lang === 'en' ? 'Configure rules →' : 'Personnaliser →'}
        </button>
      </div>

    </div>
  );
};

export default MustNotDoCard;
