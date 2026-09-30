import React from 'react';
import { X, Calendar, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DayDetailModal = ({ isOpen, onClose, selectedDay, onAddTradeForDay }) => {
  if (!isOpen || !selectedDay) return null;

  const isPositive = (selectedDay.pnl || 0) >= 0;
  const hasTrades = selectedDay.hasTrade && selectedDay.trades.length > 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-card rounded-3xl border border-gray-200 dark:border-darkBorder shadow-2xl overflow-hidden p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-darkBorder/60 mb-4">
            <div className="flex items-center gap-2.5">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                isPositive ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'
              }`}>
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="font-black text-base text-textMain leading-tight">
                  Bilan de la Journée : {selectedDay.dateStr}
                </h3>
                <span className="text-xs text-textMuted font-medium">
                  {selectedDay.tradeCount} trade(s) exécuté(s)
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-textMuted hover:text-textMain hover:bg-gray-100 dark:hover:bg-darkCard transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* PnL Banner */}
          <div className={`p-4 rounded-2xl mb-4 border flex items-center justify-between ${
            isPositive ? 'bg-emerald-500/10 border-emerald-500/25' : 'bg-rose-500/10 border-rose-500/25'
          }`}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted block">
                Résultat Net du Jour
              </span>
              <h2 className={`text-2xl font-black ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isPositive ? '+' : ''}{selectedDay.pnl.toFixed(2)} $
              </h2>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-card border border-gray-200/60 dark:border-darkBorder text-[11px] font-bold text-textMain shadow-xs">
                <ShieldCheck size={12} className="text-primary" />
                Zéro Swap Intraday
              </span>
            </div>
          </div>

          {/* Trades of the day */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 mb-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-textMuted mb-2">
              Trades Réalisés
            </h4>
            {!hasTrades ? (
              <p className="text-xs text-textMuted py-4 text-center">
                Aucun trade enregistré pour ce jour.
              </p>
            ) : (
              selectedDay.trades.map((t) => (
                <div 
                  key={t.id}
                  className="p-3 rounded-2xl bg-gray-50 dark:bg-darkCard/50 border border-gray-200/60 dark:border-darkBorder text-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${
                        t.side === 'BUY' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'
                      }`}>
                        {t.side}
                      </span>
                      <strong className="font-black text-textMain">{t.symbol}</strong>
                      <span className="text-textMuted font-mono text-[11px]">({t.lot.toFixed(2)} lot)</span>
                    </div>
                    <span className={`font-black text-xs ${t.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {t.pnl >= 0 ? '+' : ''}{t.pnl.toFixed(2)} $
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-textMuted">
                    <span>{t.source === 'Analyse du H' ? '👑 Analyse du H' : '🧠 Scan SMC Jarvis'}</span>
                    <span>Statut : <strong className="text-textMain">{t.status}</strong></span>
                  </div>

                  {t.setup && (
                    <div className="mt-1.5 pt-1.5 border-t border-gray-200/40 dark:border-darkBorder/40 text-[10px] text-textMuted italic">
                      « {t.setup} »
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-gray-100 dark:border-darkBorder/60 flex items-center justify-between">
            <button
              onClick={() => {
                onClose();
                if (onAddTradeForDay) onAddTradeForDay(selectedDay.dateStr);
              }}
              className="text-primary hover:text-primary/80 font-bold text-xs"
            >
              + Ajouter un trade ce jour
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-2xl bg-gray-100 dark:bg-darkCard font-bold text-xs text-textMain hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              Fermer
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DayDetailModal;
