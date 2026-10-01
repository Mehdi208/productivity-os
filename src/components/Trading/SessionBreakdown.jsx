import React from 'react';
import { Globe, Clock, ArrowUpRight, ArrowDownRight, Compass, ShieldCheck, Flame, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const SessionBreakdown = ({ sessions }) => {
  if (!sessions) return null;

  const sessionList = [
    {
      key: 'london',
      data: sessions.london || {},
      icon: Zap,
      region: 'Londres (Europe)',
      hours: '07:00 — 13:00 UTC',
      flag: '🇬🇧 🇪🇺',
      status: 'Opportunité Majeure (07h00)',
      statusColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      insight: 'Liquidité bancaire maximale. Idéal pour scalps SMC sur XAU/USD & GBP/USD.'
    },
    {
      key: 'newyork',
      data: sessions.newyork || {},
      icon: Flame,
      region: 'New York (Wall Street)',
      hours: '13:00 — 21:00 UTC',
      flag: '🇺🇸',
      status: 'Coeur de Rentabilité',
      statusColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      insight: 'Forte volatilité USD & cryptos. Zone de prédilection des alertes du H et de Jarvis.'
    },
    {
      key: 'asia',
      data: sessions.asia || {},
      icon: Compass,
      region: 'Asie (Tokyo / Sydney)',
      hours: '00:00 — 07:00 UTC',
      flag: '🇯🇵 🇦🇺',
      status: 'Historique Ancien Copy-Trading',
      statusColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      insight: 'Zone des trades passés non optimisés. Jarvis privilégie le repos ou crypto M15.'
    },
    {
      key: 'night',
      data: sessions.night || {},
      icon: ShieldCheck,
      region: 'Clôture Nocturne (0 Swap)',
      hours: '21:00 — 00:00 UTC',
      flag: '🌙',
      status: 'Conformité Sharia 100%',
      statusColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      insight: 'Aucun trade nocturne. 0 intérêt usuraire (riba) et protection contre les gaps.'
    }
  ];

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-card border border-gray-200/80 dark:border-darkBorder shadow-sm mb-6 select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 pb-3.5 border-b border-gray-100 dark:border-darkBorder/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
            <Globe size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg text-textMain leading-tight">
                Répartition des Gains par Séance (Style Cubrik AI)
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                Multi-Sessions
              </span>
            </div>
            <p className="text-xs text-textMuted font-medium mt-0.5">
              Analyse détaillée de votre PnL selon les 3 grands carrefours de liquidité mondiale.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-textMuted font-medium bg-gray-100/70 dark:bg-darkCard px-3 py-1.5 rounded-xl border border-gray-200/50 dark:border-darkBorder">
          <Clock size={13} className="text-primary" />
          <span>Heures de référence : <strong>Temps Universel (UTC)</strong></span>
        </div>
      </div>

      {/* Grid of Sessions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sessionList.map(({ key, data, icon: Icon, region, hours, flag, status, statusColor, insight }) => {
          const pnl = data.pnl || 0;
          const isPos = pnl >= 0;
          const count = data.count || 0;
          const winRate = data.winRate || 0;

          return (
            <motion.div
              key={key}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className={`p-4 rounded-2xl border flex flex-col justify-between transition-all relative overflow-hidden ${
                isPos && count > 0
                  ? 'bg-emerald-500/[0.03] border-emerald-500/20 dark:border-emerald-500/20'
                  : count > 0 && !isPos
                  ? 'bg-rose-500/[0.03] border-rose-500/20 dark:border-rose-500/20'
                  : 'bg-card border-gray-200/80 dark:border-darkBorder'
              }`}
            >
              {/* Card Top */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{flag}</span>
                    <span className="font-black text-xs sm:text-sm text-textMain">
                      {region}
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-darkCard text-textMuted flex items-center justify-center">
                    <Icon size={14} />
                  </div>
                </div>

                <div className="text-[10px] text-textMuted font-semibold mb-3 flex items-center gap-1">
                  <Clock size={10} />
                  <span>{hours}</span>
                </div>

                {/* Big PnL Display */}
                <div className="mb-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-textMuted mb-0.5">
                    PnL Net Clôturé
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-xl sm:text-2xl font-black tracking-tight ${isPos ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {isPos ? '+' : ''}{pnl.toFixed(2)} $
                    </span>
                    {count > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
                        isPos ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {isPos ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {winRate}% WR
                      </span>
                    )}
                  </div>
                </div>

                {/* Mini Stats Bar */}
                <div className="bg-gray-100/60 dark:bg-darkCard/60 rounded-xl p-2.5 mb-3 border border-gray-100 dark:border-darkBorder/40">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-textMuted mb-1.5">
                    <span>Volume Trades :</span>
                    <strong className="text-textMain">{count} trades</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-textMuted mb-2">
                    <span>Gagnants / Pertes :</span>
                    <span className="text-textMain">
                      <strong className="text-emerald-500">{data.wins || 0}W</strong> / <strong className="text-rose-500">{data.losses || 0}L</strong>
                    </span>
                  </div>

                  {/* Visual Winrate Progress */}
                  <div className="w-full bg-gray-200 dark:bg-darkBorder h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isPos ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.max(5, winRate)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer Badge & Insight */}
              <div className="pt-2 border-t border-gray-100 dark:border-darkBorder/40">
                <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border mb-1.5 ${statusColor}`}>
                  {status}
                </span>
                <p className="text-[10px] text-textMuted font-medium leading-relaxed">
                  {insight}
                </p>
              </div>

            </motion.div>
          );
        })}
      </div>

    </div>
  );
};

export default SessionBreakdown;
