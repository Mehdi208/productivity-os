import React, { useState } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SYMBOL_OPTIONS = [
  'XAU/USD',
  'BTC/USDT',
  'ETH/USDT',
  'SOL/USDT',
  'GBP/USD',
  'EUR/USD',
  'AUD/USD',
  'USD/JPY',
  'GBP/JPY'
];

const NewTradeModal = ({ isOpen, onClose, onSave, tradeToEdit = null }) => {
  const [formData, setFormData] = useState(() => {
    if (tradeToEdit) return { ...tradeToEdit };
    return {
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5),
      symbol: 'XAU/USD',
      name: 'Gold Spot',
      side: 'BUY',
      lot: 0.10,
      entryPrice: 4160.00,
      exitPrice: 4170.00,
      pips: 100.0,
      pnl: 50.00,
      status: 'TP1 + BE',
      source: 'Analyse du H',
      setup: '',
      notes: ''
    };
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: formData.id || `trade_${Date.now()}`,
      lot: Number(formData.lot),
      entryPrice: Number(formData.entryPrice),
      exitPrice: Number(formData.exitPrice),
      pips: Number(formData.pips),
      pnl: Number(formData.pnl)
    });
    onClose();
  };

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
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-darkBorder/60 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <TrendingUp size={18} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-textMain leading-tight">
                  {tradeToEdit ? 'Modifier le Trade' : 'Enregistrer un Nouveau Trade'}
                </h3>
                <span className="text-xs text-textMuted font-medium">
                  Journalisation contextuelle dans Productivity OS
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Row 1: Symbol & Side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-textMuted uppercase text-[10px] mb-1">
                  Actif / Paire
                </label>
                <select
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  className="w-full p-2.5 rounded-2xl bg-gray-100 dark:bg-darkCard border border-gray-200/60 dark:border-darkBorder text-textMain font-bold focus:outline-none focus:border-primary"
                >
                  {SYMBOL_OPTIONS.map(sym => (
                    <option key={sym} value={sym}>{sym}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-textMuted uppercase text-[10px] mb-1">
                  Sens (BUY / SELL)
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-gray-100 dark:bg-darkCard border border-gray-200/60 dark:border-darkBorder">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, side: 'BUY' })}
                    className={`py-1.5 rounded-xl font-black text-xs transition-colors ${
                      formData.side === 'BUY' ? 'bg-emerald-500 text-white shadow-sm' : 'text-textMuted hover:text-textMain'
                    }`}
                  >
                    BUY
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, side: 'SELL' })}
                    className={`py-1.5 rounded-xl font-black text-xs transition-colors ${
                      formData.side === 'SELL' ? 'bg-rose-500 text-white shadow-sm' : 'text-textMuted hover:text-textMain'
                    }`}
                  >
                    SELL
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: Lot & PnL ($) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-textMuted uppercase text-[10px] mb-1">
                  Taille de Lot
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.lot}
                  onChange={(e) => setFormData({ ...formData, lot: e.target.value })}
                  className="w-full p-2.5 rounded-2xl bg-gray-100 dark:bg-darkCard border border-gray-200/60 dark:border-darkBorder text-textMain font-mono font-bold focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-textMuted uppercase text-[10px] mb-1">
                  Gain / Perte Net ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pnl}
                  onChange={(e) => setFormData({ ...formData, pnl: e.target.value })}
                  className="w-full p-2.5 rounded-2xl bg-gray-100 dark:bg-darkCard border border-gray-200/60 dark:border-darkBorder text-textMain font-mono font-black focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            {/* Row 3: Entry, Exit & Pips */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-textMuted uppercase text-[10px] mb-1">
                  Prix d'Entrée
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.entryPrice}
                  onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                  className="w-full p-2 rounded-xl bg-gray-100 dark:bg-darkCard border border-gray-200/60 dark:border-darkBorder text-textMain font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-textMuted uppercase text-[10px] mb-1">
                  Prix de Sortie
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.exitPrice}
                  onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
                  className="w-full p-2 rounded-xl bg-gray-100 dark:bg-darkCard border border-gray-200/60 dark:border-darkBorder text-textMain font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-textMuted uppercase text-[10px] mb-1">
                  Pips
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.pips}
                  onChange={(e) => setFormData({ ...formData, pips: e.target.value })}
                  className="w-full p-2 rounded-xl bg-gray-100 dark:bg-darkCard border border-gray-200/60 dark:border-darkBorder text-textMain font-mono"
                />
              </div>
            </div>

            {/* Row 4: Source & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-textMuted uppercase text-[10px] mb-1">
                  Origine du Trade
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full p-2.5 rounded-2xl bg-gray-100 dark:bg-darkCard border border-gray-200/60 dark:border-darkBorder text-textMain font-bold focus:outline-none focus:border-primary"
                >
                  <option value="Analyse du H">👑 Analyse du H</option>
                  <option value="Scan SMC Jarvis">🧠 Scan SMC Jarvis</option>
                  <option value="Trade Manuel Méhdi">👤 Trade Manuel Méhdi</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-textMuted uppercase text-[10px] mb-1">
                  Statut de Sortie
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2.5 rounded-2xl bg-gray-100 dark:bg-darkCard border border-gray-200/60 dark:border-darkBorder text-textMain font-bold focus:outline-none focus:border-primary"
                >
                  <option value="TP1 + BE">🎯 TP1 + Breakeven</option>
                  <option value="TP2">💰 TP2 Atteint</option>
                  <option value="TP3">🤑 TP3 Atteint</option>
                  <option value="Breakeven (0$)">🛡 Breakeven (0$)</option>
                  <option value="Stop Loss">🛑 Stop Loss Touché</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block font-bold text-textMuted uppercase text-[10px] mb-1">
                Setup & Justification Technique
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Rejet propre sur FVG 15M, balayage de liquidité..."
                value={formData.setup}
                onChange={(e) => setFormData({ ...formData, setup: e.target.value })}
                className="w-full p-2.5 rounded-2xl bg-gray-100 dark:bg-darkCard border border-gray-200/60 dark:border-darkBorder text-textMain focus:outline-none focus:border-primary"
              />
            </div>

            {/* Submit buttons */}
            <div className="pt-3 border-t border-gray-100 dark:border-darkBorder/60 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl font-bold text-textMuted hover:text-textMain hover:bg-gray-100 dark:hover:bg-darkCard transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-md shadow-primary/25 transition-all active:scale-95"
              >
                Enregistrer dans le Journal
              </button>
            </div>
          </form>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NewTradeModal;
