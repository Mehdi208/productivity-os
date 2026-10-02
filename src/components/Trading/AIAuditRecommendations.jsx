import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  Sliders, 
  Check,
  CheckSquare,
  Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { applyAIStrategy } from '../../data/tradingJournalEngine';

const AIAuditRecommendations = ({ auditData, onStrategyUpdated }) => {
  const [selectedRecIds, setSelectedRecIds] = useState(() => {
    return auditData?.selectedRecIds || ['rec_intraday_swing', 'rec_fast_be', 'rec_sharia_safety'];
  });
  const [isApplying, setIsApplying] = useState(false);
  const [showAppliedToast, setShowAppliedToast] = useState(false);
  const [isApplied, setIsApplied] = useState(auditData?.isApplied || false);
  const [appliedAt, setAppliedAt] = useState(auditData?.appliedAt || null);

  if (!auditData) return null;

  const toggleRec = (id) => {
    setSelectedRecIds((prev) => 
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allIds = auditData.recommendations.map((r) => r.id);
    if (selectedRecIds.length === allIds.length) {
      // Uncheck all except the high conviction one
      setSelectedRecIds(['rec_intraday_swing']);
    } else {
      setSelectedRecIds(allIds);
    }
  };

  const handleApplyStrategy = async () => {
    if (selectedRecIds.length === 0) return;
    setIsApplying(true);
    try {
      const updated = await applyAIStrategy(null, selectedRecIds);
      setIsApplied(true);
      setAppliedAt(updated.appliedAt);
      setShowAppliedToast(true);
      if (onStrategyUpdated) {
        onStrategyUpdated(updated);
      }
      setTimeout(() => {
        setShowAppliedToast(false);
      }, 5000);
    } catch (e) {
      console.error('Erreur application stratégie:', e);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="p-3.5 sm:p-6 rounded-3xl bg-card border border-gray-200/80 dark:border-darkBorder shadow-sm mb-6 select-none relative overflow-hidden">
      
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header - Mobile First Clean Stacking */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-darkBorder/60 relative z-10">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-primary/20 shrink-0">
            <Bot size={22} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h3 className="font-extrabold text-sm sm:text-lg text-textMain leading-tight">
                Audit Cognitif & Stratégie IA (Jarvis)
              </h3>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Haute Conviction
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-textMuted font-medium mt-0.5">
              Diagnostic réel de vos trades, priorisation des mouvements intraday et réglages sur-mesure.
            </p>
          </div>
        </div>

        {/* Global Rating & State Badge */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-darkCard border border-gray-200/70 dark:border-darkBorder flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-xs">
              {auditData.grade}
            </div>
            <div>
              <div className="text-[9px] font-bold text-textMuted uppercase">Note IA</div>
              <div className="text-[11px] font-black text-textMain leading-none">
                {auditData.overallScore}/100
              </div>
            </div>
          </div>

          <div className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-black flex items-center gap-1.5 ${
            isApplied
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isApplied ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{isApplied ? 'Stratégie Active' : 'Sélection Prête'}</span>
          </div>
        </div>

      </div>

      {/* Toast Notification when Applied */}
      <AnimatePresence>
        {showAppliedToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-5 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-between gap-3 shadow-md"
          >
            <div className="flex items-center gap-2.5 text-xs font-bold">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
              <span>
                <strong>Succès !</strong> Les {selectedRecIds.length} recommandations sélectionnées ont été injectées dans la stratégie de trading Jarvis.
              </span>
            </div>
            <button 
              onClick={() => setShowAppliedToast(false)}
              className="text-xs font-black text-emerald-500/80 hover:text-emerald-500 cursor-pointer min-h-[36px] px-2"
            >
              Fermer
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid: Points Forts vs Points Faibles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        
        {/* Colonne 1 : Points Forts */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/[0.02] border border-emerald-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-emerald-500/15">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                  <ShieldCheck size={14} />
                </div>
                <h4 className="font-black text-xs sm:text-sm text-textMain uppercase tracking-wide">
                  Points Forts Validés
                </h4>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                {auditData.strengths.length} Forces
              </span>
            </div>

            <div className="space-y-2.5">
              {auditData.strengths.map((item) => (
                <div 
                  key={item.id}
                  className="p-2.5 sm:p-3 rounded-xl bg-card border border-emerald-500/15"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-extrabold text-[11px] sm:text-xs text-textMain leading-tight">
                      {item.title}
                    </span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 shrink-0">
                      {item.metric}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-textMuted font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-emerald-500/15 flex items-center justify-between text-[10px] font-bold text-emerald-500">
            <span>Discipline Sharia & 0 Swap : 100% Respecté</span>
            <Check size={14} />
          </div>
        </div>

        {/* Colonne 2 : Points Faibles */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-500/[0.02] border border-rose-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-rose-500/15">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                  <AlertTriangle size={14} />
                </div>
                <h4 className="font-black text-xs sm:text-sm text-textMain uppercase tracking-wide">
                  Points Faibles & Vigilances
                </h4>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500">
                {auditData.weaknesses.length} Axes
              </span>
            </div>

            <div className="space-y-2.5">
              {auditData.weaknesses.map((item) => (
                <div 
                  key={item.id}
                  className="p-2.5 sm:p-3 rounded-xl bg-card border border-rose-500/15"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-extrabold text-[11px] sm:text-xs text-textMain leading-tight">
                      {item.title}
                    </span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-500 shrink-0">
                      {item.metric}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-textMuted font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-rose-500/15 flex items-center justify-between text-[10px] font-bold text-rose-500">
            <span>Objectif : Privilégier 1 grand mouvement net plutôt que 10 scalps bruyants</span>
            <AlertTriangle size={13} />
          </div>
        </div>

      </div>

      {/* Recommandations Tactiques Sélectionnables avec Cases à Cocher */}
      <div className="mb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <h4 className="font-extrabold text-xs sm:text-sm text-textMain">
              Recommandations Personnalisables (Cochez celles à activer)
            </h4>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between">
            <span className="text-[10px] font-bold text-textMuted">
              {selectedRecIds.length} / {auditData.recommendations.length} sélectionnée{selectedRecIds.length > 1 ? 's' : ''}
            </span>
            <button
              onClick={handleSelectAll}
              className="text-[10px] font-black text-primary hover:underline cursor-pointer min-h-[36px] px-2 flex items-center gap-1"
            >
              {selectedRecIds.length === auditData.recommendations.length ? 'Décocher tout' : 'Tout cocher'}
            </button>
          </div>
        </div>

        {/* Cards Grid with interactive selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {auditData.recommendations.map((rec) => {
            const isSelected = selectedRecIds.includes(rec.id);
            return (
              <div
                key={rec.id}
                onClick={() => toggleRec(rec.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden select-none active:scale-[0.99] ${
                  isSelected
                    ? 'bg-primary/[0.04] dark:bg-primary/[0.08] border-primary/50 shadow-xs'
                    : 'bg-gray-50/60 dark:bg-darkCard/40 border-gray-200/70 dark:border-darkBorder/60 opacity-75 hover:opacity-100'
                }`}
              >
                <div>
                  {/* Top line of card: Checkbox + Priority + Impact */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-h-[32px]">
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-primary text-white shadow-xs' 
                          : 'border-2 border-gray-300 dark:border-gray-600 text-transparent'
                      }`}>
                        <Check size={13} strokeWidth={3} />
                      </div>
                      <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isSelected ? 'bg-primary/10 text-primary' : 'bg-gray-200 dark:bg-darkBorder text-textMuted'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>

                    <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md whitespace-nowrap">
                      {rec.impact}
                    </span>
                  </div>

                  {/* Title */}
                  <h5 className={`font-black text-xs sm:text-sm mb-1.5 leading-snug ${
                    isSelected ? 'text-textMain' : 'text-textMuted'
                  }`}>
                    {rec.title}
                  </h5>

                  {/* Description */}
                  <p className="text-[10px] sm:text-[11px] text-textMuted font-medium leading-relaxed mb-3">
                    {rec.description}
                  </p>
                </div>

                {/* Parameter Code Box */}
                <div className="pt-2 border-t border-gray-200/50 dark:border-darkBorder/40 flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-textMuted">
                  <span>Paramètre :</span>
                  <code className={`font-bold px-1.5 py-0.5 rounded text-[9px] truncate max-w-[200px] sm:max-w-none ${
                    isSelected ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-darkBorder/50 text-textMuted'
                  }`}>
                    {rec.targetParam}
                  </code>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic 1-Click Action Bar */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-indigo-500/10 to-emerald-500/10 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders size={15} className="text-primary" />
            <h5 className="font-extrabold text-xs sm:text-base text-textMain">
              Déploiement Sélectif sur la Stratégie Active
            </h5>
          </div>
          <p className="text-[11px] sm:text-xs text-textMuted font-medium">
            Seules les <strong>{selectedRecIds.length}</strong> recommandations cochées seront injectées dans le moteur d'exécution de Jarvis.
          </p>
          {isApplied && appliedAt && (
            <div className="text-[10px] sm:text-[11px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>Dernière application : {new Date(appliedAt).toLocaleString('fr-FR')}</span>
            </div>
          )}
        </div>

        <button
          onClick={handleApplyStrategy}
          disabled={isApplying || selectedRecIds.length === 0}
          className={`w-full sm:w-auto min-h-[46px] py-2.5 px-4 sm:px-6 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer whitespace-nowrap active:scale-95 shrink-0 ${
            selectedRecIds.length === 0
              ? 'bg-gray-300 dark:bg-darkBorder text-textMuted cursor-not-allowed opacity-60'
              : isApplied
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25'
              : 'bg-primary hover:bg-primary/90 text-white shadow-primary/30'
          }`}
        >
          {isApplying ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Injection dans Jarvis...</span>
            </>
          ) : selectedRecIds.length === 0 ? (
            <span>Sélectionnez au moins 1 règle</span>
          ) : isApplied ? (
            <>
              <CheckCircle2 size={16} />
              <span>Appliquer ({selectedRecIds.length}) Règles Actives</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>⚡ Appliquer ({selectedRecIds.length}) Recommandations</span>
            </>
          )}
        </button>

      </div>

    </div>
  );
};

export default AIAuditRecommendations;
