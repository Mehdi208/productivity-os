import React, { useState } from 'react';
import { Droplet, Plus, Minus, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const HydrationCard = ({ currentMl = 0, targetMl = 1925, onAddWater }) => {
  const { t } = useLanguage();
  const [customAmount, setCustomAmount] = useState('');
  const [error, setError] = useState('');
  const [showMobileModal, setShowMobileModal] = useState(false);

  const progressPercentage = Math.min(100, Math.max(0, (currentMl / targetMl) * 100));
  const formattedCurrent = (currentMl / 1000).toFixed(1);
  const formattedTarget = (targetMl / 1000).toFixed(1);

  // Dynamic Performance Evaluation Metric
  const getHydrationEvaluation = () => {
    const pct = Math.round((currentMl / targetMl) * 100);
    if (pct >= 100) {
      return {
        label: t('hydrationOptimal'),
        shortLabel: t('hydrationOptimalShort'),
        badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
        barColor: 'bg-emerald-500',
        level: 'optimal'
      };
    }
    if (pct >= 75) {
      return {
        label: t('hydrationGood'),
        shortLabel: t('hydrationGoodShort'),
        badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30',
        barColor: 'bg-blue-500',
        level: 'good'
      };
    }
    if (pct >= 40) {
      return {
        label: t('hydrationModerate'),
        shortLabel: t('hydrationModerateShort'),
        badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
        barColor: 'bg-amber-500',
        level: 'moderate'
      };
    }
    if (pct > 0) {
      return {
        label: t('hydrationStarted'),
        shortLabel: t('hydrationStartedShort'),
        badgeClass: 'bg-slate-500/15 text-slate-600 dark:text-slate-300 border border-slate-500/30',
        barColor: 'bg-blue-400',
        level: 'started'
      };
    }
    return {
      label: t('hydrationZero'),
      shortLabel: t('hydrationZeroShort'),
      badgeClass: 'bg-gray-100 dark:bg-darkBorder text-textMuted border border-gray-200/80 dark:border-darkBorder',
      barColor: 'bg-gray-300 dark:bg-gray-600',
      level: 'zero'
    };
  };

  const evaluation = getHydrationEvaluation();

  const handleCustomAdd = (e, multiplier = 1) => {
    if (e) e.preventDefault();
    const val = parseInt(customAmount, 10);
    if (isNaN(val) || val < 1) return setError(t('hydrationInvalidAmount'));
    setError('');
    if (onAddWater) onAddWater(val * multiplier);
    setCustomAmount('');
    setShowMobileModal(false);
  };

  const handleReset = () => {
    if (onAddWater) onAddWater(-currentMl);
    setShowMobileModal(false);
  };

  return (
    <>
      {/* Desktop Card */}
      <div className="hidden md:flex bg-card rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-darkBorder flex-col justify-between h-full transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm font-bold text-textMuted uppercase tracking-wider">{t('hydrationTitle')}</span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${evaluation.badgeClass}`}>
              {evaluation.shortLabel}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {currentMl > 0 && (
              <button 
                onClick={handleReset}
                className="text-[10px] text-textMuted hover:text-danger font-semibold p-1 transition-colors"
                title={t('hydrationResetTooltip')}
              >
                <RotateCcw size={12} />
              </button>
            )}
            <span className="text-blue-500 text-lg">💧</span>
          </div>
        </div>

        <div className="my-2 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl lg:text-4xl font-extrabold text-blue-600 dark:text-blue-400">{formattedCurrent}L</span>
            <span className="text-sm font-bold text-textMuted">/ {formattedTarget}L</span>
          </div>
          
          {/* Quick Add & Subtract buttons with high contrast */}
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => onAddWater && onAddWater(-250)}
              disabled={currentMl <= 0}
              className={`p-1.5 rounded-xl transition-all flex items-center justify-center font-bold text-xs ${
                currentMl <= 0 
                  ? 'opacity-30 cursor-not-allowed bg-gray-100 dark:bg-darkBorder text-textMuted' 
                  : 'bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/20 active:scale-95'
              }`}
              title={t('hydrationSubtract')}
            >
              <Minus size={14} strokeWidth={2.5} />
            </button>
            
            <button 
              onClick={() => onAddWater && onAddWater(250)} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-1.5 px-3 rounded-xl transition-all flex items-center gap-1 shadow-sm shadow-blue-500/25 active:scale-95"
              title={t('hydrationAdd')}
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>250ml</span>
            </button>
          </div>
        </div>

        {/* Evaluation Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-textMuted mb-1">
            <span>{evaluation.label}</span>
            <span className="font-bold text-textMain">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-darkBorder h-2 rounded-full overflow-hidden">
            <div className={`h-full ${evaluation.barColor} rounded-full transition-all duration-500 ease-out`} style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>

        {/* Custom manual input */}
        <form onSubmit={(e) => handleCustomAdd(e, 1)} className="mt-2 flex items-center gap-1.5 pt-2 border-t border-gray-100 dark:border-darkBorder">
          <input 
            type="number" 
            min="1" 
            max="3000" 
            placeholder="ml..." 
            value={customAmount} 
            onChange={(e) => { setCustomAmount(e.target.value); if (error) setError(''); }} 
            className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-2.5 py-1 text-xs text-textMain focus:outline-none focus:border-blue-500 transition-colors" 
          />
          <button 
            type="button" 
            onClick={() => handleCustomAdd(null, -1)}
            disabled={!customAmount || currentMl <= 0}
            className="bg-red-500/15 hover:bg-red-500 text-red-600 hover:text-white font-bold text-xs px-2.5 py-1 rounded-xl transition-colors disabled:opacity-30 border border-red-300 dark:border-red-800/40"
            title={t('hydrationSubtract')}
          >
            -
          </button>
          <button 
            type="submit" 
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-3 py-1 rounded-xl transition-colors flex-shrink-0"
          >
            +
          </button>
        </form>
        {error && <span className="text-[10px] text-danger font-medium mt-0.5">{error}</span>}
      </div>

      {/* Mobile Trigger Card */}
      <div onClick={() => setShowMobileModal(true)} className="md:hidden bg-card rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-darkBorder flex flex-col justify-between h-full cursor-pointer active:scale-[0.98] transition-transform">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center"><Droplet size={18} className="fill-blue-500/20" /></div>
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${evaluation.badgeClass}`}>
            {evaluation.shortLabel}
          </span>
        </div>
        <div className="my-2 flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-textMain">{formattedCurrent}L</span>
            <span className="text-xs text-textMuted">/ {formattedTarget}L</span>
          </div>
          <span className="text-xs font-medium text-textMuted mt-1">{t('hydrationTitle')} ({currentMl} ml • {Math.round(progressPercentage)}%)</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-darkBorder h-1.5 rounded-full overflow-hidden mt-1">
          <div className={`h-full ${evaluation.barColor} rounded-full`} style={{ width: `${progressPercentage}%` }} />
        </div>
      </div>

      {/* Mobile Modal */}
      {showMobileModal && (
        <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl p-6 w-full max-w-xs shadow-2xl space-y-4 border border-gray-100 dark:border-darkBorder">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-textMain flex items-center gap-2">
                <span>💧</span> {t('hydrationManageTitle')}
              </h3>
              <button onClick={() => setShowMobileModal(false)} className="text-textMuted font-bold">✕</button>
            </div>
            
            <p className="text-xs text-textMuted">{t('hydrationCurrentAndGoal', currentMl, targetMl)}</p>
            
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { onAddWater && onAddWater(250); setShowMobileModal(false); }} className="bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm">+250 ml</button>
              <button onClick={() => { onAddWater && onAddWater(500); setShowMobileModal(false); }} className="bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm">+500 ml</button>
              <button onClick={() => { onAddWater && onAddWater(-250); setShowMobileModal(false); }} disabled={currentMl <= 0} className="bg-red-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm disabled:opacity-30">-250 ml</button>
              <button onClick={() => { onAddWater && onAddWater(-500); setShowMobileModal(false); }} disabled={currentMl <= 0} className="bg-red-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm disabled:opacity-30">-500 ml</button>
            </div>

            <button onClick={handleReset} className="w-full text-xs font-bold text-textMuted hover:text-danger py-1.5 border-t border-gray-100 dark:border-darkBorder">
              {t('hydrationReset')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
export default HydrationCard;