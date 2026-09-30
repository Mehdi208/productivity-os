import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

const STORAGE_KEY = 'pos_trading_journal_v1';

// Initial realistic seed data matching Méhdi's live MoonX account
export const INITIAL_TRADING_DATA = {
  account: {
    broker: 'MoonX (Forex & Futures)',
    totalCapital: 193.64,
    forexBalance: 166.84,
    futuresBalance: 26.80,
    startingCapital: 173.00,
    netProfit: 20.64,
    currency: 'USD',
    lastSyncTime: 'Aujourd\'hui à 21:00 UTC (Jarvis H24)',
    milestones: {
      breakevenTarget: 330.00,
      firstWithdrawalTarget: 500.00
    }
  },
  trades: [
    {
      id: 'trade_001',
      date: '2026-09-30',
      time: '14:32',
      symbol: 'XAU/USD',
      name: 'Gold Spot',
      side: 'BUY',
      lot: 0.10,
      entryPrice: 4151.50,
      exitPrice: 4160.88,
      pips: 93.8,
      pnl: 50.00,
      status: 'TP1 + BE',
      source: 'Analyse du H',
      setup: 'Rebond propre sur support institutionnel 4151.50 $',
      notes: '50% clôturés en cash, 50% restants protégés à Breakeven. Zéro swap (Intraday).'
    },
    {
      id: 'trade_002',
      date: '2026-09-28',
      time: '11:15',
      symbol: 'BTC/USDT',
      name: 'Bitcoin Futures',
      side: 'BUY',
      lot: 0.01,
      entryPrice: 83200,
      exitPrice: 84250,
      pips: 1050,
      pnl: 10.50,
      status: 'TP2',
      source: 'Scan SMC Jarvis',
      setup: 'Fair Value Gap (FVG) en M15 après balayage de liquidité',
      notes: 'Trade crypto de week-end exécuté avec rigueur.'
    },
    {
      id: 'trade_003',
      date: '2026-09-26',
      time: '09:40',
      symbol: 'EUR/USD',
      name: 'Euro / US Dollar',
      side: 'BUY',
      lot: 0.05,
      entryPrice: 1.0815,
      exitPrice: 1.0845,
      pips: 30.0,
      pnl: 15.00,
      status: 'TP1 + BE',
      source: 'Scan SMC Jarvis',
      setup: 'Rejet Order Block 1H en session de Londres',
      notes: 'Respect strict du money management.'
    },
    {
      id: 'trade_004',
      date: '2026-09-24',
      time: '15:20',
      symbol: 'XAU/USD',
      name: 'Gold Spot',
      side: 'SELL',
      lot: 0.10,
      entryPrice: 4175.20,
      exitPrice: 4163.20,
      pips: 120.0,
      pnl: 60.00,
      status: 'TP2',
      source: 'Analyse du H',
      setup: 'Cassure baissière et comblement de liquidité',
      notes: 'Exécution chirurgicale du H.'
    }
  ],
  dailyNotes: {
    '2026-09-30': {
      note: 'Session dorée : Rebond parfait sur 4151.50 $. Capital consolidé à 193.64 $. 0 risque ouvert la nuit (Zéro Riba).',
      sentiment: 'Discipline Maximale 💎',
      focusScore: 98
    }
  }
};

// Load saved data from localStorage or fallback to initial
export const loadTradingData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...INITIAL_TRADING_DATA, ...parsed };
    }
  } catch (e) {
    console.warn('Error reading trading journal from localStorage:', e);
  }
  return INITIAL_TRADING_DATA;
};

// Save data to localStorage and Firestore
export const saveTradingData = async (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Error saving trading journal to localStorage:', e);
  }

  // Sync to Firestore if online
  if (db) {
    try {
      const docRef = doc(db, 'productivity_user', 'trading_journal');
      await setDoc(docRef, { 
        ...data, 
        totalCapital: data.account?.totalCapital,
        forexBalance: data.account?.forexBalance,
        futuresBalance: data.account?.futuresBalance,
        lastSyncTime: data.account?.lastSyncTime,
        updatedAt: new Date().toISOString() 
      }, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore offline sync notice:', fsErr);
    }
  }
};

// Listen to Firestore real-time updates (sync with Jarvis Cloud)
export const subscribeTradingUpdates = (onUpdate) => {
  if (!db) return () => {};
  try {
    const docRef = doc(db, 'productivity_user', 'trading_journal');
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const cloudData = snapshot.data();
        const prev = loadTradingData();
        const mergedAccount = {
          ...prev.account,
          ...(cloudData.account || {}),
          totalCapital: cloudData.totalCapital ?? cloudData.account?.totalCapital ?? prev.account.totalCapital,
          forexBalance: cloudData.forexBalance ?? cloudData.account?.forexBalance ?? prev.account.forexBalance,
          futuresBalance: cloudData.futuresBalance ?? cloudData.account?.futuresBalance ?? prev.account.futuresBalance,
          lastSyncTime: cloudData.lastSyncTime ?? prev.account.lastSyncTime,
        };
        const merged = { 
          ...prev, 
          ...cloudData,
          account: mergedAccount,
          trades: (cloudData.trades && cloudData.trades.length > 0) ? cloudData.trades : prev.trades,
          dailyNotes: { ...prev.dailyNotes, ...(cloudData.dailyNotes || {}) }
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        onUpdate(merged);
      }
    }, (err) => {
      console.warn('Snapshot error:', err);
    });
  } catch (e) {
    console.warn('Subscription error:', e);
    return () => {};
  }
};

// Compute KPI Metrics for a given month or all-time
export const computeTradingKPIs = (data, selectedYearMonth) => {
  const trades = data?.trades || [];
  
  // Filter trades for selected month (YYYY-MM)
  const monthTrades = selectedYearMonth 
    ? trades.filter(t => t.date.startsWith(selectedYearMonth))
    : trades;

  const totalTrades = monthTrades.length;
  const winTrades = monthTrades.filter(t => (t.pnl || 0) > 0);
  const lossTrades = monthTrades.filter(t => (t.pnl || 0) < 0);
  const beTrades = monthTrades.filter(t => (t.pnl || 0) === 0);

  const grossProfit = winTrades.reduce((acc, t) => acc + t.pnl, 0);
  const grossLoss = Math.abs(lossTrades.reduce((acc, t) => acc + t.pnl, 0));
  const netPnL = grossProfit - grossLoss;

  const winRate = totalTrades > 0 ? Math.round((winTrades.length / totalTrades) * 100) : 100;
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : (grossProfit > 0 ? '∞' : '1.00');

  // Today's PnL
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTrades = trades.filter(t => t.date === todayStr);
  const todayPnL = todayTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const currentCapital = data?.account?.totalCapital || 193.64;
  const todayPnLPct = currentCapital > 0 ? ((todayPnL / (currentCapital - todayPnL)) * 100).toFixed(2) : '0.00';

  // Milestone Progress
  const beTarget = data?.account?.milestones?.breakevenTarget || 330.00;
  const withTarget = data?.account?.milestones?.firstWithdrawalTarget || 500.00;
  
  const beProgress = Math.min(100, Math.max(0, (currentCapital / beTarget) * 100)).toFixed(1);
  const withProgress = Math.min(100, Math.max(0, (currentCapital / withTarget) * 100)).toFixed(1);

  return {
    totalTrades,
    winTrades: winTrades.length,
    lossTrades: lossTrades.length,
    beTrades: beTrades.length,
    winRate,
    profitFactor,
    grossProfit,
    grossLoss,
    netPnL,
    todayPnL,
    todayPnLPct,
    currentCapital,
    forexBalance: data?.account?.forexBalance || 166.84,
    futuresBalance: data?.account?.futuresBalance || 26.80,
    startingCapital: data?.account?.startingCapital || 173.00,
    beTarget,
    withTarget,
    beProgress,
    withProgress,
    remainingToBE: Math.max(0, beTarget - currentCapital).toFixed(2),
    remainingToWithdrawal: Math.max(0, withTarget - currentCapital).toFixed(2)
  };
};

// Generate Days matrix for Monthly Heatmap (TradeZella style)
export const getMonthlyHeatmapDays = (year, monthZeroIndexed, trades = []) => {
  const firstDay = new Date(year, monthZeroIndexed, 1);
  const lastDay = new Date(year, monthZeroIndexed + 1, 0);
  const totalDays = lastDay.getDate();

  // Day of week of 1st day (0 = Sunday, 1 = Monday ...)
  // Shift so Monday is 0
  let startDayOfWeek = firstDay.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  // Group trades by date string YYYY-MM-DD
  const tradesByDate = {};
  trades.forEach(t => {
    if (!tradesByDate[t.date]) {
      tradesByDate[t.date] = { count: 0, pnl: 0, wins: 0, losses: 0, trades: [] };
    }
    tradesByDate[t.date].count += 1;
    tradesByDate[t.date].pnl += (t.pnl || 0);
    tradesByDate[t.date].trades.push(t);
    if ((t.pnl || 0) > 0) tradesByDate[t.date].wins += 1;
    if ((t.pnl || 0) < 0) tradesByDate[t.date].losses += 1;
  });

  const cells = [];
  // Empty pad cells for start of month
  for (let i = 0; i < startDayOfWeek; i++) {
    cells.push({ isEmpty: true, id: `empty-pre-${i}` });
  }

  // Real month days
  for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
    const dayStr = `${year}-${String(monthZeroIndexed + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dayData = tradesByDate[dayStr] || null;
    
    // Check if weekend
    const curDate = new Date(year, monthZeroIndexed, dayNum);
    const isWeekend = curDate.getDay() === 0 || curDate.getDay() === 6;

    cells.push({
      isEmpty: false,
      id: `day-${dayStr}`,
      dayNum,
      dateStr: dayStr,
      isWeekend,
      hasTrade: Boolean(dayData),
      tradeCount: dayData ? dayData.count : 0,
      pnl: dayData ? dayData.pnl : 0,
      trades: dayData ? dayData.trades : []
    });
  }

  return cells;
};

// Generate Equity Curve historical series for Recharts
export const getEquityCurveData = (data) => {
  const trades = [...(data?.trades || [])].sort((a, b) => a.date.localeCompare(b.date));
  let runningCapital = data?.account?.startingCapital || 173.00;

  const points = [
    { date: 'Départ', capital: runningCapital, pnl: 0, event: 'Reprise en main rigoureuse' }
  ];

  trades.forEach((t) => {
    runningCapital += (t.pnl || 0);
    points.push({
      date: t.date.slice(5), // MM-DD
      capital: Number(runningCapital.toFixed(2)),
      pnl: t.pnl,
      symbol: t.symbol,
      event: `${t.symbol} (${t.side} ${t.pnl >= 0 ? '+' : ''}${t.pnl} $)`
    });
  });

  return points;
};
