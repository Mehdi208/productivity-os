import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';

const TradeLogTable = ({ trades = [], onNewTrade, onSelectTrade }) => {
  const [filterSymbol, setFilterSymbol] = useState('ALL');
  const [filterSource, setFilterSource] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Extract unique symbols & sources
  const symbols = ['ALL', ...new Set(trades.map(t => t.symbol))];
  const sources = ['ALL', ...new Set(trades.map(t => t.source))];

  // Filtered trades
  const filtered = trades.filter(t => {
    const matchSymbol = filterSymbol === 'ALL' || t.symbol === filterSymbol;
    const matchSource = filterSource === 'ALL' || t.source === filterSource;
    const matchSearch = searchTerm === '' || 
      t.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.setup || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchSymbol && matchSource && matchSearch;
  });

  return (
    <div className="p-5 rounded-3xl bg-card border border-gray-200/80 dark:border-darkBorder shadow-sm mb-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-darkBorder/60">
        <div>
          <h3 className="font-extrabold text-base text-textMain leading-tight">
            Journal de Bord Détaillé (Trade Log)
          </h3>
          <span className="text-xs text-textMuted font-medium">
            Historique granulaire de chaque position et justification contextuelle
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={onNewTrade}
          className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 shadow-sm shadow-primary/25 transition-all text-xs active:scale-95"
        >
          <Plus size={16} />
          <span>Nouveau Trade</span>
        </button>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" />
          <input
            type="text"
            placeholder="Rechercher par actif, setup ou note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full min-h-[44px] pl-9 pr-3 py-2.5 rounded-2xl bg-gray-100 dark:bg-darkCard border border-gray-200/60 dark:border-darkBorder text-xs text-textMain focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Filter Symbol */}
          <select
            value={filterSymbol}
            onChange={(e) => setFilterSymbol(e.target.value)}
            className="flex-1 sm:flex-none min-h-[44px] px-3 py-2.5 rounded-2xl bg-gray-100 dark:bg-darkCard border border-gray-200/60 dark:border-darkBorder text-xs font-bold text-textMain focus:outline-none focus:border-primary cursor-pointer"
          >
            {symbols.map(s => (
              <option key={s} value={s}>{s === 'ALL' ? 'Tous les Actifs' : s}</option>
            ))}
          </select>

          {/* Filter Source */}
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="flex-1 sm:flex-none min-h-[44px] px-3 py-2.5 rounded-2xl bg-gray-100 dark:bg-darkCard border border-gray-200/60 dark:border-darkBorder text-xs font-bold text-textMain focus:outline-none focus:border-primary cursor-pointer"
          >
            {sources.map(src => (
              <option key={src} value={src}>{src === 'ALL' ? 'Toutes les Sources' : src}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-200/60 dark:border-darkBorder">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100/70 dark:bg-darkCard/60 border-b border-gray-200/80 dark:border-darkBorder text-[10px] font-black uppercase tracking-wider text-textMuted">
              <th className="py-3 px-3.5">Date & Heure</th>
              <th className="py-3 px-3.5">Actif & Sens</th>
              <th className="py-3 px-3.5">Lot</th>
              <th className="py-3 px-3.5">Prix Entrée / Sortie</th>
              <th className="py-3 px-3.5">Pips</th>
              <th className="py-3 px-3.5">PnL Net ($)</th>
              <th className="py-3 px-3.5">Statut</th>
              <th className="py-3 px-3.5">Origine & Justification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-darkBorder/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-textMuted font-medium">
                  Aucun trade trouvé pour ces filtres.
                </td>
              </tr>
            ) : (
              filtered.map((trade) => {
                const isWin = (trade.pnl || 0) > 0;
                const isLoss = (trade.pnl || 0) < 0;

                return (
                  <tr 
                    key={trade.id}
                    onClick={() => onSelectTrade && onSelectTrade(trade)}
                    className="hover:bg-gray-50 dark:hover:bg-darkCard/40 transition-colors cursor-pointer group"
                  >
                    {/* Date */}
                    <td className="py-3 px-3.5 font-bold text-textMain whitespace-nowrap">
                      <div>{trade.date}</div>
                      <div className="text-[10px] text-textMuted font-normal">{trade.time || 'Intraday'}</div>
                    </td>

                    {/* Asset & Side */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                          trade.side === 'BUY' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        }`}>
                          {trade.side}
                        </span>
                        <strong className="text-textMain font-black">{trade.symbol}</strong>
                      </div>
                    </td>

                    {/* Lot */}
                    <td className="py-3 px-3.5 font-mono font-bold text-textMain whitespace-nowrap">
                      {trade.lot.toFixed(2)}
                    </td>

                    {/* Entry / Exit */}
                    <td className="py-3 px-3.5 font-mono text-textMuted whitespace-nowrap">
                      <span className="text-textMain font-semibold">{trade.entryPrice}</span>
                      <span className="mx-1">➔</span>
                      <span className="text-textMain font-semibold">{trade.exitPrice}</span>
                    </td>

                    {/* Pips */}
                    <td className="py-3 px-3.5 font-mono font-bold text-textMain whitespace-nowrap">
                      +{trade.pips} p
                    </td>

                    {/* PnL Net */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className={`font-black text-sm ${
                        isWin ? 'text-emerald-600 dark:text-emerald-400' : (isLoss ? 'text-rose-600 dark:text-rose-400' : 'text-blue-500')
                      }`}>
                        {isWin ? '+' : ''}{trade.pnl.toFixed(2)} $
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-darkCard text-[10px] font-bold text-textMain border border-gray-200/60 dark:border-darkBorder">
                        {trade.status}
                      </span>
                    </td>

                    {/* Source & Setup */}
                    <td className="py-3 px-3.5 max-w-xs">
                      <div className="flex items-center gap-1.5 font-bold text-textMain text-[11px]">
                        <span>{trade.source === 'Analyse du H' ? '👑' : (trade.source === 'Scan SMC Jarvis' ? '🧠' : '👥')}</span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          trade.source === 'Analyse du H' 
                            ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                            : (trade.source === 'Scan SMC Jarvis' 
                                ? 'bg-primary/15 text-primary border border-primary/30' 
                                : 'bg-gray-100 dark:bg-darkCard text-textMuted border border-gray-200/60 dark:border-darkBorder')
                        }`}>
                          {trade.source}
                        </span>
                      </div>
                      <div className="text-[10px] text-textMuted truncate mt-0.5 max-w-[200px]">
                        {trade.setup || trade.notes}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (< md) */}
      <div className="block md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-textMuted font-medium text-xs bg-gray-50/50 dark:bg-darkCard/30 rounded-2xl border border-gray-200/50 dark:border-darkBorder/40">
            Aucun trade trouvé pour ces filtres.
          </div>
        ) : (
          filtered.map((trade) => {
            const isWin = (trade.pnl || 0) > 0;
            const isLoss = (trade.pnl || 0) < 0;

            return (
              <div 
                key={trade.id}
                onClick={() => onSelectTrade && onSelectTrade(trade)}
                className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-darkCard/50 border border-gray-200/70 dark:border-darkBorder/70 space-y-2.5 active:scale-[0.98] transition-all cursor-pointer shadow-xs min-h-[48px]"
              >
                {/* Top: Asset, Side, Lot, and PnL */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                      trade.side === 'BUY' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    }`}>
                      {trade.side}
                    </span>
                    <strong className="text-textMain font-black text-sm">{trade.symbol}</strong>
                    <span className="text-[10px] font-mono font-bold text-textMuted bg-gray-200/60 dark:bg-darkBorder/60 px-1.5 py-0.5 rounded-md">
                      {trade.lot.toFixed(2)} lot
                    </span>
                  </div>

                  <div className="text-right">
                    <span className={`font-black text-base ${
                      isWin ? 'text-emerald-600 dark:text-emerald-400' : (isLoss ? 'text-rose-600 dark:text-rose-400' : 'text-blue-500')
                    }`}>
                      {isWin ? '+' : ''}{trade.pnl.toFixed(2)} $
                    </span>
                  </div>
                </div>

                {/* Middle: In / Out price and Pips */}
                <div className="flex items-center justify-between text-xs font-mono bg-card dark:bg-darkCard px-3 py-2 rounded-xl border border-gray-200/50 dark:border-darkBorder/50">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-[10px] uppercase font-sans text-textMuted font-bold">In:</span>
                    <span className="text-textMain font-semibold">{trade.entryPrice}</span>
                    <span className="text-textMuted mx-0.5">➔</span>
                    <span className="text-[10px] uppercase font-sans text-textMuted font-bold">Out:</span>
                    <span className="text-textMain font-semibold">{trade.exitPrice}</span>
                  </div>
                  <span className={`font-bold font-mono text-[11px] ${trade.pips >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {trade.pips > 0 ? `+${trade.pips}` : trade.pips} p
                  </span>
                </div>

                {/* Bottom: Source, Status, and Date */}
                <div className="flex items-center justify-between pt-0.5 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      trade.source === 'Analyse du H' 
                        ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                        : (trade.source === 'Scan SMC Jarvis' 
                            ? 'bg-primary/15 text-primary border border-primary/30' 
                            : 'bg-gray-100 dark:bg-darkCard text-textMuted border border-gray-200/60 dark:border-darkBorder')
                    }`}>
                      {trade.source}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-darkCard text-[10px] font-bold text-textMain border border-gray-200/60 dark:border-darkBorder">
                      {trade.status}
                    </span>
                  </div>

                  <div className="text-[10px] text-textMuted font-medium text-right">
                    {trade.date} · {trade.time || 'Intraday'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default TradeLogTable;
