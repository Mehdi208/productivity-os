import React from 'react';
import { TrendingUp, Award, Target, ShieldCheck, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

const TradingKPIs = ({ kpis }) => {
  const isPositiveDay = (kpis.todayPnL || 0) >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* 1. Capital Total MoonX */}
      <motion.div 
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="p-4 rounded-3xl bg-card border border-gray-200/80 dark:border-darkBorder shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider">
            Capital Consolidé MoonX
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center font-bold">
            <Wallet size={16} />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-black text-textMain tracking-tight">
            {kpis.currentCapital.toFixed(2)} $
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            En direct
          </span>
        </div>

        {/* PnL global cumulé depuis dépôt */}
        <div className="mt-1 flex items-center gap-1.5 text-xs">
          <span className="text-[11px] text-textMuted font-medium">P&L Global :</span>
          <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-black text-[11px] ${
            (kpis.currentCapital - kpis.startingCapital) >= 0
              ? 'text-emerald-500 bg-emerald-500/10'
              : 'text-rose-500 bg-rose-500/10'
          }`}>
            {(kpis.currentCapital - kpis.startingCapital) >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {(kpis.currentCapital - kpis.startingCapital) >= 0 ? '+' : ''}
            {(kpis.currentCapital - kpis.startingCapital).toFixed(2)} $
          </span>
        </div>
        <div className="mt-2.5 pt-2.5 border-t border-gray-100 dark:border-darkBorder/60 flex items-center justify-between text-[10px] text-textMuted font-medium">
          <span>🏦 Forex : <strong className="text-textMain">{kpis.forexBalance.toFixed(2)} $</strong></span>
          <span>🪙 Futures : <strong className="text-textMain">{kpis.futuresBalance.toFixed(2)} $</strong></span>
        </div>
      </motion.div>

      {/* 2. PnL du Jour */}
      <motion.div 
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className={`p-4 rounded-3xl border shadow-sm relative overflow-hidden transition-colors ${
          isPositiveDay 
            ? 'bg-emerald-500/5 border-emerald-500/30' 
            : 'bg-rose-500/5 border-rose-500/30'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider">
            PnL Net du Jour
          </span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
            isPositiveDay ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
          }`}>
            <TrendingUp size={16} />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className={`text-2xl font-black tracking-tight ${isPositiveDay ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {isPositiveDay ? '+' : ''}{kpis.todayPnL.toFixed(2)} $
          </h3>
          <span className={`text-xs font-bold ${isPositiveDay ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            ({isPositiveDay ? '+' : ''}{kpis.todayPnLPct} %)
          </span>
        </div>
        <div className="mt-2.5 pt-2.5 border-t border-gray-100 dark:border-darkBorder/60 flex items-center justify-between text-[10px] text-textMuted font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck size={11} className="text-primary" />
            0 Swap (Intraday Halal)
          </span>
          <span className="font-bold text-textMain">Tolérance max : -25 $</span>
        </div>
      </motion.div>

      {/* 3. Taux de Succès & Profit Factor */}
      <motion.div 
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="p-4 rounded-3xl bg-card border border-gray-200/80 dark:border-darkBorder shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider">
            Taux de Réussite (Win Rate)
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 dark:text-purple-400 flex items-center justify-center font-bold">
            <Award size={16} />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-black text-textMain tracking-tight">
            {kpis.winRate} %
          </h3>
          <span className="text-xs font-bold text-textMuted">
            Factor : <strong className="text-primary">{kpis.profitFactor}</strong>
          </span>
        </div>
        <div className="mt-2.5 pt-2.5 border-t border-gray-100 dark:border-darkBorder/60 flex items-center justify-between text-[10px] text-textMuted font-medium">
          <span>Gagnants : <strong className="text-emerald-500">{kpis.winTrades}</strong></span>
          <span>Perdants : <strong className="text-rose-500">{kpis.lossTrades}</strong></span>
          <span>BE : <strong className="text-blue-500">{kpis.beTrades}</strong></span>
        </div>
      </motion.div>

      {/* 4. Objectifs & Jalons de Retrait */}
      <motion.div 
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="p-4 rounded-3xl bg-gradient-to-br from-card via-card to-amber-500/5 border border-amber-500/30 dark:border-darkBorder shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Cap Premier Retrait (500 $)
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
            <Target size={16} />
          </div>
        </div>
        <div className="flex items-baseline justify-between mb-1.5">
          <h3 className="text-lg font-black text-textMain">
            {kpis.withProgress} %
          </h3>
          <span className="text-[11px] font-bold text-textMuted">
            Reste <strong className="text-amber-500">{kpis.remainingToWithdrawal} $</strong>
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden mb-2">
          <div 
            className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, kpis.withProgress)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-textMuted">
          <span>Jalon 1 (BE 330 $) : <strong className="text-primary">{kpis.beProgress}%</strong></span>
          <span className="text-amber-600 dark:text-amber-400 font-bold">Cashout 150-300 $</span>
        </div>
      </motion.div>

    </div>
  );
};

export default TradingKPIs;
