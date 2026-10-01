import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  Sliders, 
  Flame, 
  Clock, 
  Zap,
  ArrowRight,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { applyAIStrategy } from '../../data/tradingJournalEngine';

const AIAuditRecommendations = ({ auditData, onStrategyUpdated }) => {
  const [isApplying, setIsApplying] = useState(false);
  const [showAppliedToast, setShowAppliedToast] = useState(false);
  const [isApplied, setIsApplied] = useState(auditData?.isApplied || false);
  const [appliedAt, setAppliedAt] = useState(auditData?.appliedAt || null);

  if (!auditData) return null;

  const handleApplyStrategy = async () => {
    setIsApplying(true);
    try {
      const updated = await applyAIStrategy();
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
    <div className="p-4 sm:p-6 rounded-3xl bg-card border border-gray-200/80 dark:border-darkBorder shadow-sm mb-6 select-none relative overflow-hidden">
      
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-darkBorder/60 relative z-10">
        
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-primary/20 shrink-0">
            <Bot size={22} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-xl text-textMain leading-tight">
                Audit Cognitif & Optimiseur de Stratégie IA (Jarvis)
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Propulsé par Jarvis AI
              </span>
            </div>
            <p className="text-xs text-textMuted font-medium mt-0.5">
              Évaluation impartiale de votre historique réel MoonX, diagnostic des forces/faiblesses et déploiement tactique en 1-clic.
            </p>
          </div>
        </div>

        {/* Global Rating & State Badge */}
        <div className="flex items-center gap-3 self-stretch lg:self-auto justify-between lg:justify-end">
          
          <div className="px-3.5 py-2 rounded-2xl bg-gray-100 dark:bg-darkCard border border-gray-200/70 dark:border-darkBorder flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-sm">
              {auditData.grade}
            </div>
            <div>
              <div className="text-[10px] font-bold text-textMuted uppercase tracking-wider">
                Note Globale IA
              </div>
              <div className="text-xs font-black text-textMain">
                {auditData.overallScore}/100 • {auditData.disciplineRating}
              </div>
            </div>
          </div>

          <div className={`px-3 py-2 rounded-2xl border text-xs font-black flex items-center gap-1.5 ${
            isApplied
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isApplied ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{isApplied ? 'Stratégie IA Active' : 'Optimisation Recommandée'}</span>
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
            className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-between gap-3 shadow-md"
          >
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
              <span>
                <strong>Succès !</strong> Toutes les recommandations de l'IA ont été injectées dans la stratégie de trading active de Jarvis.
              </span>
            </div>
            <button 
              onClick={() => setShowAppliedToast(false)}
              className="text-xs font-black text-emerald-500/80 hover:text-emerald-500 cursor-pointer"
            >
              Fermer
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid: Points Forts vs Points Faibles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        
        {/* Colonne 1 : Points Forts */}
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/[0.02] border border-emerald-500/20 dark:border-emerald-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-emerald-500/15">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                  <ShieldCheck size={16} />
                </div>
                <h4 className="font-black text-sm text-textMain uppercase tracking-wide">
                  Points Forts de Votre Historique
                </h4>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                {auditData.strengths.length} Forces Validées
              </span>
            </div>

            <div className="space-y-3">
              {auditData.strengths.map((item) => (
                <div 
                  key={item.id}
                  className="p-3 rounded-xl bg-card border border-emerald-500/15 hover:border-emerald-500/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-extrabold text-xs text-textMain">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 whitespace-nowrap">
                      {item.metric}
                    </span>
                  </div>
                  <p className="text-[11px] text-textMuted font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-500/15 flex items-center justify-between text-[11px] font-semibold text-emerald-500">
            <span>Discipline Sharia & Risk Management : 100%</span>
            <Check size={14} />
          </div>
        </div>

        {/* Colonne 2 : Points Faibles */}
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/[0.02] border border-rose-500/20 dark:border-rose-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-rose-500/15">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                  <AlertTriangle size={16} />
                </div>
                <h4 className="font-black text-sm text-textMain uppercase tracking-wide">
                  Points Faibles & Manques à Gagner
                </h4>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500">
                {auditData.weaknesses.length} Axes d'Amélioration
              </span>
            </div>

            <div className="space-y-3">
              {auditData.weaknesses.map((item) => (
                <div 
                  key={item.id}
                  className="p-3 rounded-xl bg-card border border-rose-500/15 hover:border-rose-500/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-extrabold text-xs text-textMain">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 whitespace-nowrap">
                      {item.metric}
                    </span>
                  </div>
                  <p className="text-[11px] text-textMuted font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-rose-500/15 flex items-center justify-between text-[11px] font-semibold text-rose-500">
            <span>Correction requise pour accélérer le retour aux 330$</span>
            <AlertTriangle size={14} />
          </div>
        </div>

      </div>

      {/* Recommandations Stratégiques Actionnables de l'IA */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-primary" />
          <h4 className="font-extrabold text-sm sm:text-base text-textMain">
            Recommandations Tactiques de l'IA pour Optimiser Votre Stratégie
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {auditData.recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-darkCard/50 border border-gray-200/80 dark:border-darkBorder hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                    {rec.priority}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {rec.impact}
                  </span>
                </div>

                <h5 className="font-extrabold text-xs sm:text-sm text-textMain mb-1.5 leading-snug">
                  {rec.title}
                </h5>

                <p className="text-[11px] text-textMuted font-medium leading-relaxed mb-3">
                  {rec.description}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-200/60 dark:border-darkBorder/60 flex items-center justify-between text-[10px] font-mono text-textMuted">
                <span>Code Paramètre :</span>
                <code className="text-primary font-bold bg-primary/5 px-1.5 py-0.5 rounded">
                  {rec.targetParam}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 1-Click Interactive Button Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-indigo-500/10 to-emerald-500/10 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders size={16} className="text-primary" />
            <h5 className="font-extrabold text-sm sm:text-base text-textMain">
              Déploiement Automatique sur la Stratégie Active
            </h5>
          </div>
          <p className="text-xs text-textMuted font-medium">
            Cliquez ci-dessous pour appliquer immédiatement ces 4 réglages optimisés au moteur d'exécution Jarvis (scalp Londres 07h, TP dynamique, calibrage des lots).
          </p>
          {isApplied && appliedAt && (
            <div className="text-[11px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>Dernière application : {new Date(appliedAt).toLocaleString('fr-FR')}</span>
            </div>
          )}
        </div>

        <button
          onClick={handleApplyStrategy}
          disabled={isApplying}
          className={`py-3 px-5 sm:px-6 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2.5 transition-all shadow-lg cursor-pointer whitespace-nowrap active:scale-95 shrink-0 ${
            isApplied
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25'
              : 'bg-primary hover:bg-primary/90 text-white shadow-primary/30'
          }`}
        >
          {isApplying ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Injection dans Jarvis...</span>
            </>
          ) : isApplied ? (
            <>
              <CheckCircle2 size={18} />
              <span>Recommandations Appliquées (Réappliquer)</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>⚡ Appliquer les Recommandations à Notre Stratégie</span>
            </>
          )}
        </button>

      </div>

    </div>
  );
};

export default AIAuditRecommendations;
