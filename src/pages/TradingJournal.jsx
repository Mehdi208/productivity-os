import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Plus } from 'lucide-react';
import { 
  loadTradingData, 
  saveTradingData, 
  subscribeTradingUpdates, 
  computeTradingKPIs 
} from '../data/tradingJournalEngine';
import TradingKPIs from '../components/Trading/TradingKPIs';
import TradingHeatmap from '../components/Trading/TradingHeatmap';
import TradingEquityChart from '../components/Trading/TradingEquityChart';
import TradeLogTable from '../components/Trading/TradeLogTable';
import NewTradeModal from '../components/Trading/NewTradeModal';
import DayDetailModal from '../components/Trading/DayDetailModal';
import { useLanguage } from '../context/LanguageContext';

const TradingJournal = () => {
  const { lang } = useLanguage();
  const [data, setData] = useState(() => loadTradingData());
  const [isNewTradeOpen, setIsNewTradeOpen] = useState(false);
  const [tradeToEdit, setTradeToEdit] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Month state for Heatmap (Default: current month, September 2026)
  const now = new Date();
  const [curYear, setCurYear] = useState(now.getFullYear());
  const [curMonth, setCurMonth] = useState(now.getMonth());

  // Subscribe to real-time updates from Jarvis Cloud via Firestore
  useEffect(() => {
    const unsubscribe = subscribeTradingUpdates((updated) => {
      setData(updated);
    });
    return () => unsubscribe();
  }, []);

  // Compute current KPIs
  const currentMonthKey = `${curYear}-${String(curMonth + 1).padStart(2, '0')}`;
  const kpis = useMemo(() => computeTradingKPIs(data, currentMonthKey), [data, currentMonthKey]);

  const handlePrevMonth = () => {
    if (curMonth === 0) {
      setCurMonth(11);
      setCurYear(y => y - 1);
    } else {
      setCurMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (curMonth === 11) {
      setCurMonth(0);
      setCurYear(y => y + 1);
    } else {
      setCurMonth(m => m + 1);
    }
  };

  const handleSelectDay = (cell) => {
    setSelectedDay(cell);
    setIsDayDetailOpen(true);
  };

  const handleSaveTrade = async (trade) => {
    const existingIndex = data.trades.findIndex(t => t.id === trade.id);
    let newTrades;
    if (existingIndex >= 0) {
      newTrades = [...data.trades];
      newTrades[existingIndex] = trade;
    } else {
      newTrades = [trade, ...data.trades];
    }

    // Recompute capital
    const newCapital = Number((data.account.startingCapital + newTrades.reduce((acc, t) => acc + (t.pnl || 0), 0)).toFixed(2));
    const updatedData = {
      ...data,
      trades: newTrades,
      account: {
        ...data.account,
        totalCapital: newCapital,
        lastSyncTime: 'Mis à jour à l\'instant'
      }
    };

    setData(updatedData);
    await saveTradingData(updatedData);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    // Simulate query & reload from storage/cloud
    setTimeout(async () => {
      const refreshed = loadTradingData();
      setData(refreshed);
      setIsSyncing(false);
    }, 700);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full select-none">
      
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-darkBorder/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-wider uppercase">
              Trading & Performance OS
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black tracking-wider uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Jarvis Sentinel H24 Connecté
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-textMain tracking-tight">
            Journal de Trading & PnL
          </h1>
          <p className="text-xs text-textMuted font-medium mt-0.5">
            Suivi asymétrique des gains, respect du money management et conformité Sharia (0 Riba).
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="p-2.5 rounded-2xl bg-card border border-gray-200/80 dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-darkCard text-textMuted hover:text-textMain transition-all text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Rafraîchir la synchronisation"
          >
            <RefreshCw size={15} className={isSyncing ? 'animate-spin text-primary' : ''} />
            <span className="hidden sm:inline">Sync Cloud</span>
          </button>

          <button
            onClick={() => {
              setTradeToEdit(null);
              setIsNewTradeOpen(true);
            }}
            className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 shadow-md shadow-primary/25 transition-all text-xs active:scale-95"
          >
            <Plus size={16} />
            <span>Nouveau Trade</span>
          </button>
        </div>
      </div>

      {/* 1. KPIs Bento Grid */}
      <TradingKPIs kpis={kpis} />

      {/* 2. Monthly Heatmap (TradeZella Style) */}
      <TradingHeatmap
        year={curYear}
        monthZeroIndexed={curMonth}
        trades={data.trades || []}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onSelectDay={handleSelectDay}
        lang={lang}
      />

      {/* 3. Equity Curve (Recharts) */}
      <TradingEquityChart data={data} kpis={kpis} />

      {/* 4. Detailed Trade Log Table */}
      <TradeLogTable
        trades={data.trades || []}
        onNewTrade={() => {
          setTradeToEdit(null);
          setIsNewTradeOpen(true);
        }}
        onSelectTrade={(t) => {
          setTradeToEdit(t);
          setIsNewTradeOpen(true);
        }}
      />

      {/* Modals */}
      <NewTradeModal
        isOpen={isNewTradeOpen}
        onClose={() => setIsNewTradeOpen(false)}
        onSave={handleSaveTrade}
        tradeToEdit={tradeToEdit}
      />

      <DayDetailModal
        isOpen={isDayDetailOpen}
        onClose={() => setIsDayDetailOpen(false)}
        selectedDay={selectedDay}
        onAddTradeForDay={(dateStr) => {
          setTradeToEdit({
            date: dateStr,
            time: '14:00',
            symbol: 'XAU/USD',
            side: 'BUY',
            lot: 0.10,
            entryPrice: 4151.50,
            exitPrice: 4160.88,
            pips: 93.8,
            pnl: 50.00,
            status: 'TP1 + BE',
            source: 'Analyse du H',
            setup: '',
            notes: ''
          });
          setIsNewTradeOpen(true);
        }}
      />

    </div>
  );
};

export default TradingJournal;
