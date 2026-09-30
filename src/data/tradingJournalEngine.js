import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

const STORAGE_KEY = 'pos_trading_journal_v2';

// Initial realistic seed data matching Méhdi's live MoonX account
export const INITIAL_TRADING_DATA = {
  "account": {
    "broker": "MoonX (Forex & Futures)",
    "totalCapital": 193.64,
    "forexBalance": 166.8413,
    "futuresBalance": 26.8004,
    "startingCapital": 334.03,
    "netProfit": -140.39,
    "currency": "USD",
    "lastSyncTime": "Synchronisé en direct depuis MoonX (30/09/2026 18:48)",
    "milestones": {
      "breakevenTarget": 330,
      "firstWithdrawalTarget": 500
    }
  },
  "trades": [
    {
      "id": "6abbd4bd8d88154de8c0f01d",
      "date": "2026-09-30",
      "time": "14:18",
      "symbol": "BTC/USDT",
      "name": "Bitcoin Futures",
      "side": "BUY",
      "lot": 0.0038,
      "entryPrice": 83586.77,
      "exitPrice": 83992.51,
      "pips": 405.74,
      "pnl": 1.53,
      "status": "TP Validé",
      "source": "Scan SMC Jarvis",
      "setup": "Futures BTC (Levier 35x - isolated)",
      "notes": "Marge allouée: 9.0 $. Clôturé à 14:18 UTC."
    },
    {
      "id": "6abbd7578d88154de8c10c8f",
      "date": "2026-09-30",
      "time": "13:36",
      "symbol": "ETH/USDT",
      "name": "Ethereum Futures",
      "side": "BUY",
      "lot": 0.1172,
      "entryPrice": 2688.6,
      "exitPrice": 2698.72,
      "pips": 10.12,
      "pnl": 1.19,
      "status": "TP Validé",
      "source": "Scan SMC Jarvis",
      "setup": "Futures ETH (Levier 35x - isolated)",
      "notes": "Marge allouée: 9.0 $. Clôturé à 13:36 UTC."
    },
    {
      "id": "6abc75148d88154de8c2ebf7",
      "date": "2026-09-30",
      "time": "02:59",
      "symbol": "XAU/USD",
      "name": "Gold Spot",
      "side": "BUY",
      "lot": 0.0802,
      "entryPrice": 4173.7,
      "exitPrice": 4177.63,
      "pips": 393,
      "pnl": 7.88,
      "status": "TP Validé",
      "source": "Copy Trading (Passé)",
      "setup": "Copy Trade Forex (nikosgeorgo.pro@gmail.com)",
      "notes": "Levier 500x. Clôturé à 02:59 UTC. Pips: +393.0. Zéro swap."
    },
    {
      "id": "6abc6c378d88154de8c2bb1c",
      "date": "2026-09-30",
      "time": "02:31",
      "symbol": "XAU/USD",
      "name": "Gold Spot",
      "side": "BUY",
      "lot": 0.0802,
      "entryPrice": 4172.73,
      "exitPrice": 4172.6,
      "pips": -13.5,
      "pnl": -0.27,
      "status": "SL Exécuté",
      "source": "Copy Trading (Passé)",
      "setup": "Copy Trade Forex (nikosgeorgo.pro@gmail.com)",
      "notes": "Levier 500x. Clôturé à 02:31 UTC. Pips: -13.5. Zéro swap."
    },
    {
      "id": "6abc67f58d88154de8c2aaa3",
      "date": "2026-09-30",
      "time": "01:38",
      "symbol": "XAU/USD",
      "name": "Gold Spot",
      "side": "BUY",
      "lot": 0.0802,
      "entryPrice": 4170.49,
      "exitPrice": 4167.79,
      "pips": -270,
      "pnl": -5.41,
      "status": "SL Exécuté",
      "source": "Copy Trading (Passé)",
      "setup": "Copy Trade Forex (nikosgeorgo.pro@gmail.com)",
      "notes": "Levier 500x. Clôturé à 01:38 UTC. Pips: -270.0. Zéro swap."
    },
    {
      "id": "6abc64208d88154de8c297c0",
      "date": "2026-09-30",
      "time": "01:23",
      "symbol": "XAU/USD",
      "name": "Gold Spot",
      "side": "BUY",
      "lot": 0.0802,
      "entryPrice": 4173.05,
      "exitPrice": 4168.86,
      "pips": -418.5,
      "pnl": -8.39,
      "status": "SL Exécuté",
      "source": "Copy Trading (Passé)",
      "setup": "Copy Trade Forex (nikosgeorgo.pro@gmail.com)",
      "notes": "Levier 500x. Clôturé à 01:23 UTC. Pips: -418.5. Zéro swap."
    },
    {
      "id": "6abc60378d88154de8c28719",
      "date": "2026-09-30",
      "time": "01:06",
      "symbol": "XAU/USD",
      "name": "Gold Spot",
      "side": "BUY",
      "lot": 0.0802,
      "entryPrice": 4180.12,
      "exitPrice": 4175.48,
      "pips": -463.5,
      "pnl": -9.29,
      "status": "SL Exécuté",
      "source": "Copy Trading (Passé)",
      "setup": "Copy Trade Forex (nikosgeorgo.pro@gmail.com)",
      "notes": "Levier 500x. Clôturé à 01:06 UTC. Pips: -463.5. Zéro swap."
    },
    {
      "id": "6abc5b438d88154de8c27642",
      "date": "2026-09-30",
      "time": "00:49",
      "symbol": "XAU/USD",
      "name": "Gold Spot",
      "side": "BUY",
      "lot": 0.0802,
      "entryPrice": 4180.3,
      "exitPrice": 4176.42,
      "pips": -387.5,
      "pnl": -7.77,
      "status": "SL Exécuté",
      "source": "Copy Trading (Passé)",
      "setup": "Copy Trade Forex (nikosgeorgo.pro@gmail.com)",
      "notes": "Levier 500x. Clôturé à 00:49 UTC. Pips: -387.5. Zéro swap."
    },
    {
      "id": "6abc42e58d88154de8c1edbc",
      "date": "2026-09-30",
      "time": "00:36",
      "symbol": "XAU/USD",
      "name": "Gold Spot",
      "side": "BUY",
      "lot": 0.2198,
      "entryPrice": 4179.56,
      "exitPrice": 4179.52,
      "pips": -3.5,
      "pnl": -0.19,
      "status": "SL Exécuté",
      "source": "Copy Trading (Passé)",
      "setup": "Copy Trade Forex (nikosgeorgo.pro@gmail.com)",
      "notes": "Levier 500x. Clôturé à 00:36 UTC. Pips: -3.5. Zéro swap."
    },
    {
      "id": "6abc43318d88154de8c2133d",
      "date": "2026-09-30",
      "time": "00:17",
      "symbol": "XAU/USD",
      "name": "Gold Spot",
      "side": "BUY",
      "lot": 0.0354,
      "entryPrice": 4181.31,
      "exitPrice": 4181.24,
      "pips": -7,
      "pnl": -0.06,
      "status": "SL Exécuté",
      "source": "Copy Trading (Passé)",
      "setup": "Copy Trade Forex (nikosgeorgo.pro@gmail.com)",
      "notes": "Levier 500x. Clôturé à 00:17 UTC. Pips: -7.0. Zéro swap."
    },
    {
      "id": "6abc432e8d88154de8c2061a",
      "date": "2026-09-30",
      "time": "00:17",
      "symbol": "XAU/USD",
      "name": "Gold Spot",
      "side": "BUY",
      "lot": 0.0354,
      "entryPrice": 4181.32,
      "exitPrice": 4181.25,
      "pips": -7.5,
      "pnl": -0.07,
      "status": "SL Exécuté",
      "source": "Copy Trading (Passé)",
      "setup": "Copy Trade Forex (nikosgeorgo.pro@gmail.com)",
      "notes": "Levier 500x. Clôturé à 00:17 UTC. Pips: -7.5. Zéro swap."
    },
    {
      "id": "6abc2e258d88154de8c1d81f",
      "date": "2026-09-29",
      "time": "23:45",
      "symbol": "INJ/USDT",
      "name": "Injective Futures",
      "side": "BUY",
      "lot": 81.8853,
      "entryPrice": 7.69,
      "exitPrice": 7.59,
      "pips": -0.1,
      "pnl": -8.74,
      "status": "SL Exécuté",
      "source": "Manuel / Crypto",
      "setup": "Futures INJ (Levier 35x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 23:45 UTC."
    },
    {
      "id": "6aba95058d88154de8bdcfe4",
      "date": "2026-09-29",
      "time": "22:58",
      "symbol": "NAS100/USD",
      "name": "Nasdaq 100 CFD",
      "side": "SELL",
      "lot": 0.0002,
      "entryPrice": 30410.35,
      "exitPrice": 30438.25,
      "pips": -27.9,
      "pnl": -0.02,
      "status": "BE (Neutre)",
      "source": "Copy Trading (Passé)",
      "setup": "Copy Trade Forex (nikosgeorgo.pro@gmail.com)",
      "notes": "Levier 500x. Clôturé à 22:58 UTC. Pips: -27.9. Zéro swap."
    },
    {
      "id": "6abc063c8d88154de8c199fb",
      "date": "2026-09-29",
      "time": "21:26",
      "symbol": "INJ/USDT",
      "name": "Injective Futures",
      "side": "BUY",
      "lot": 82.0027,
      "entryPrice": 7.68,
      "exitPrice": 7.69,
      "pips": 0.01,
      "pnl": 0.35,
      "status": "TP Validé",
      "source": "Manuel / Crypto",
      "setup": "Futures INJ (Levier 35x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 21:26 UTC."
    },
    {
      "id": "6abbd8de8d88154de8c12ba8",
      "date": "2026-09-29",
      "time": "18:36",
      "symbol": "INJ/USDT",
      "name": "Injective Futures",
      "side": "BUY",
      "lot": 83.0304,
      "entryPrice": 7.59,
      "exitPrice": 7.64,
      "pips": 0.05,
      "pnl": 4.6,
      "status": "TP Validé",
      "source": "Manuel / Crypto",
      "setup": "Futures INJ (Levier 35x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 18:36 UTC."
    },
    {
      "id": "6abac1d48d88154de8bed6f5",
      "date": "2026-09-29",
      "time": "15:19",
      "symbol": "ETH/USDT",
      "name": "Ethereum Futures",
      "side": "BUY",
      "lot": 0.2357,
      "entryPrice": 2673.32,
      "exitPrice": 2686.24,
      "pips": 12.92,
      "pnl": 3.05,
      "status": "TP Validé",
      "source": "Scan SMC Jarvis",
      "setup": "Futures ETH (Levier 35x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 15:19 UTC."
    },
    {
      "id": "6abb116b8d88154de8bfd2b3",
      "date": "2026-09-29",
      "time": "15:07",
      "symbol": "BTC/USDT",
      "name": "Bitcoin Futures",
      "side": "BUY",
      "lot": 0.0076,
      "entryPrice": 82983.87,
      "exitPrice": 83512.8,
      "pips": 528.93,
      "pnl": 4.02,
      "status": "TP Validé",
      "source": "Scan SMC Jarvis",
      "setup": "Futures BTC (Levier 35x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 15:07 UTC."
    },
    {
      "id": "6abac0f78d88154de8beb7c6",
      "date": "2026-09-29",
      "time": "01:20",
      "symbol": "SOL/USDT",
      "name": "Solana Futures",
      "side": "BUY",
      "lot": 5.3026,
      "entryPrice": 118.81,
      "exitPrice": 117.02,
      "pips": -1.79,
      "pnl": -9.49,
      "status": "SL Exécuté",
      "source": "Manuel / Crypto",
      "setup": "Futures SOL (Levier 35x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 01:20 UTC."
    },
    {
      "id": "6aba7ece8d88154de8bd6ae6",
      "date": "2026-09-29",
      "time": "01:13",
      "symbol": "BTC/USDT",
      "name": "Bitcoin Futures",
      "side": "BUY",
      "lot": 0.0076,
      "entryPrice": 83061.61,
      "exitPrice": 82972.8,
      "pips": -88.81,
      "pnl": -0.67,
      "status": "SL Exécuté",
      "source": "Scan SMC Jarvis",
      "setup": "Futures BTC (Levier 35x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 01:13 UTC."
    },
    {
      "id": "6abad2c88d88154de8bf68ca",
      "date": "2026-09-29",
      "time": "00:17",
      "symbol": "XAU/USD",
      "name": "Gold Spot",
      "side": "BUY",
      "lot": 0.0259,
      "entryPrice": 4113.11,
      "exitPrice": 4117.22,
      "pips": 410.5,
      "pnl": 2.66,
      "status": "TP Validé",
      "source": "Copy Trading (Passé)",
      "setup": "Copy Trade Forex (nikosgeorgo.pro@gmail.com)",
      "notes": "Levier 500x. Clôturé à 00:17 UTC. Pips: +410.5. Zéro swap."
    },
    {
      "id": "6abac95e8d88154de8bf3952",
      "date": "2026-09-28",
      "time": "20:43",
      "symbol": "XAU/USD",
      "name": "Gold Spot",
      "side": "BUY",
      "lot": 0.0258,
      "entryPrice": 4118.52,
      "exitPrice": 4113.72,
      "pips": -481,
      "pnl": -3.11,
      "status": "SL Exécuté",
      "source": "Copy Trading (Passé)",
      "setup": "Copy Trade Forex (nikosgeorgo.pro@gmail.com)",
      "notes": "Levier 500x. Clôturé à 20:43 UTC. Pips: -481.0. Zéro swap."
    },
    {
      "id": "6abab3a98d88154de8be51fd",
      "date": "2026-09-28",
      "time": "20:02",
      "symbol": "HYPE/USDT",
      "name": "Hyperliquid Futures",
      "side": "BUY",
      "lot": 7.0972,
      "entryPrice": 88.77,
      "exitPrice": 87.18,
      "pips": -1.59,
      "pnl": -11.28,
      "status": "SL Exécuté",
      "source": "Manuel / Crypto",
      "setup": "Futures HYPE (Levier 35x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 20:02 UTC."
    },
    {
      "id": "6abac5598d88154de8bf0872",
      "date": "2026-09-28",
      "time": "20:00",
      "symbol": "XAU/USD",
      "name": "Gold Spot",
      "side": "BUY",
      "lot": 0.0269,
      "entryPrice": 4127.56,
      "exitPrice": 4121.2,
      "pips": -635.5,
      "pnl": -4.27,
      "status": "SL Exécuté",
      "source": "Copy Trading (Passé)",
      "setup": "Copy Trade Forex (nikosgeorgo.pro@gmail.com)",
      "notes": "Levier 500x. Clôturé à 20:00 UTC. Pips: -635.5. Zéro swap."
    },
    {
      "id": "6abac1b38d88154de8bec710",
      "date": "2026-09-28",
      "time": "19:39",
      "symbol": "XAU/USD",
      "name": "Gold Spot",
      "side": "BUY",
      "lot": 0.0268,
      "entryPrice": 4133.32,
      "exitPrice": 4129.01,
      "pips": -431,
      "pnl": -2.89,
      "status": "SL Exécuté",
      "source": "Copy Trading (Passé)",
      "setup": "Copy Trade Forex (nikosgeorgo.pro@gmail.com)",
      "notes": "Levier 500x. Clôturé à 19:39 UTC. Pips: -431.0. Zéro swap."
    },
    {
      "id": "6aba7ed78d88154de8bd7f09",
      "date": "2026-09-28",
      "time": "19:33",
      "symbol": "ETH/USDT",
      "name": "Ethereum Futures",
      "side": "BUY",
      "lot": 0.2361,
      "entryPrice": 2668.19,
      "exitPrice": 2680.61,
      "pips": 12.42,
      "pnl": 2.93,
      "status": "TP Validé",
      "source": "Scan SMC Jarvis",
      "setup": "Futures ETH (Levier 35x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 19:33 UTC."
    },
    {
      "id": "6abaa0ea8d88154de8be0133",
      "date": "2026-09-28",
      "time": "19:31",
      "symbol": "SOL/USDT",
      "name": "Solana Futures",
      "side": "BUY",
      "lot": 5.2243,
      "entryPrice": 120.59,
      "exitPrice": 118.76,
      "pips": -1.83,
      "pnl": -9.56,
      "status": "SL Exécuté",
      "source": "Manuel / Crypto",
      "setup": "Futures SOL (Levier 35x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 19:31 UTC."
    },
    {
      "id": "6ababe0d8d88154de8be80d7",
      "date": "2026-09-28",
      "time": "19:21",
      "symbol": "XAU/USD",
      "name": "Gold Spot",
      "side": "BUY",
      "lot": 0.0066,
      "entryPrice": 4135.15,
      "exitPrice": 4133.23,
      "pips": -193,
      "pnl": -0.32,
      "status": "SL Exécuté",
      "source": "Copy Trading (Passé)",
      "setup": "Copy Trade Forex (nikosgeorgo.pro@gmail.com)",
      "notes": "Levier 500x. Clôturé à 19:21 UTC. Pips: -193.0. Zéro swap."
    },
    {
      "id": "6aba7c228d88154de8bd2dd1",
      "date": "2026-09-28",
      "time": "18:32",
      "symbol": "HYPE/USDT",
      "name": "Hyperliquid Futures",
      "side": "BUY",
      "lot": 7.1578,
      "entryPrice": 88.02,
      "exitPrice": 88.39,
      "pips": 0.37,
      "pnl": 2.7,
      "status": "TP Validé",
      "source": "Manuel / Crypto",
      "setup": "Futures HYPE (Levier 35x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 18:32 UTC."
    },
    {
      "id": "6aba7c1c8d88154de8bd1aad",
      "date": "2026-09-28",
      "time": "17:04",
      "symbol": "SOL/USDT",
      "name": "Solana Futures",
      "side": "BUY",
      "lot": 5.2995,
      "entryPrice": 118.88,
      "exitPrice": 118.79,
      "pips": -0.09,
      "pnl": -0.47,
      "status": "SL Exécuté",
      "source": "Manuel / Crypto",
      "setup": "Futures SOL (Levier 35x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 17:04 UTC."
    },
    {
      "id": "6aba93bf8d88154de8bdbd50",
      "date": "2026-09-28",
      "time": "16:25",
      "symbol": "OIL/USD",
      "name": "OIL/USD",
      "side": "BUY",
      "lot": 0.0023,
      "entryPrice": 92.4,
      "exitPrice": 91.49,
      "pips": -91,
      "pnl": -2.26,
      "status": "SL Exécuté",
      "source": "Copy Trading (Passé)",
      "setup": "Copy Trade Forex (nikosgeorgo.pro@gmail.com)",
      "notes": "Levier 500x. Clôturé à 16:25 UTC. Pips: -91.0. Zéro swap."
    },
    {
      "id": "6ab9c92d8d88154de8bb2cf2",
      "date": "2026-09-28",
      "time": "14:49",
      "symbol": "ETH/USDT",
      "name": "Ethereum Futures",
      "side": "BUY",
      "lot": 0.2369,
      "entryPrice": 2659.58,
      "exitPrice": 2664.45,
      "pips": 4.87,
      "pnl": 1.15,
      "status": "TP Validé",
      "source": "Scan SMC Jarvis",
      "setup": "Futures ETH (Levier 35x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 14:49 UTC."
    },
    {
      "id": "6ab9fcf48d88154de8bc0f62",
      "date": "2026-09-28",
      "time": "14:46",
      "symbol": "BTC/USDT",
      "name": "Bitcoin Futures",
      "side": "BUY",
      "lot": 0.0076,
      "entryPrice": 82899.53,
      "exitPrice": 82940,
      "pips": 40.47,
      "pnl": 0.31,
      "status": "TP Validé",
      "source": "Scan SMC Jarvis",
      "setup": "Futures BTC (Levier 35x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 14:46 UTC."
    },
    {
      "id": "6aba2e088d88154de8bc8ae3",
      "date": "2026-09-28",
      "time": "14:30",
      "symbol": "SOL/USDT",
      "name": "Solana Futures",
      "side": "BUY",
      "lot": 5.3422,
      "entryPrice": 117.93,
      "exitPrice": 118.7,
      "pips": 0.77,
      "pnl": 4.12,
      "status": "TP Validé",
      "source": "Manuel / Crypto",
      "setup": "Futures SOL (Levier 35x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 14:30 UTC."
    },
    {
      "id": "6aba69b78d88154de8bce4ce",
      "date": "2026-09-28",
      "time": "14:18",
      "symbol": "HYPE/USDT",
      "name": "Hyperliquid Futures",
      "side": "BUY",
      "lot": 7.0104,
      "entryPrice": 89.87,
      "exitPrice": 88.62,
      "pips": -1.25,
      "pnl": -8.73,
      "status": "SL Exécuté",
      "source": "Manuel / Crypto",
      "setup": "Futures HYPE (Levier 35x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 14:18 UTC."
    },
    {
      "id": "6ab9e81c8d88154de8bb8d92",
      "date": "2026-09-28",
      "time": "13:07",
      "symbol": "HYPE/USDT",
      "name": "Hyperliquid Futures",
      "side": "BUY",
      "lot": 7.0117,
      "entryPrice": 89.85,
      "exitPrice": 89.76,
      "pips": -0.09,
      "pnl": -0.63,
      "status": "SL Exécuté",
      "source": "Manuel / Crypto",
      "setup": "Futures HYPE (Levier 35x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 13:07 UTC."
    },
    {
      "id": "6ab9e8138d88154de8bb7983",
      "date": "2026-09-28",
      "time": "09:06",
      "symbol": "SOL/USDT",
      "name": "Solana Futures",
      "side": "BUY",
      "lot": 5.2636,
      "entryPrice": 119.69,
      "exitPrice": 117.92,
      "pips": -1.77,
      "pnl": -9.32,
      "status": "SL Exécuté",
      "source": "Manuel / Crypto",
      "setup": "Futures SOL (Levier 35x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 09:06 UTC."
    },
    {
      "id": "6aba19138d88154de8bc5353",
      "date": "2026-09-28",
      "time": "09:03",
      "symbol": "INJ/USDT",
      "name": "Injective Futures",
      "side": "BUY",
      "lot": 85.0457,
      "entryPrice": 7.41,
      "exitPrice": 7.33,
      "pips": -0.08,
      "pnl": -6.53,
      "status": "SL Exécuté",
      "source": "Manuel / Crypto",
      "setup": "Futures INJ (Levier 35x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 09:03 UTC."
    },
    {
      "id": "6aba098f8d88154de8bc3177",
      "date": "2026-09-28",
      "time": "07:35",
      "symbol": "INJ/USDT",
      "name": "Injective Futures",
      "side": "BUY",
      "lot": 84.169,
      "entryPrice": 7.48,
      "exitPrice": 7.39,
      "pips": -0.09,
      "pnl": -7.91,
      "status": "SL Exécuté",
      "source": "Manuel / Crypto",
      "setup": "Futures INJ (Levier 35x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 07:35 UTC."
    },
    {
      "id": "6ab9fbb18d88154de8bbe5a7",
      "date": "2026-09-28",
      "time": "06:29",
      "symbol": "INJ/USDT",
      "name": "Injective Futures",
      "side": "BUY",
      "lot": 83.2661,
      "entryPrice": 7.57,
      "exitPrice": 7.46,
      "pips": -0.11,
      "pnl": -8.92,
      "status": "SL Exécuté",
      "source": "Manuel / Crypto",
      "setup": "Futures INJ (Levier 35x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 06:29 UTC."
    },
    {
      "id": "6ab99b868d88154de8ba8bf9",
      "date": "2026-09-28",
      "time": "05:36",
      "symbol": "BTC/USDT",
      "name": "Bitcoin Futures",
      "side": "BUY",
      "lot": 0.0043,
      "entryPrice": 84220.29,
      "exitPrice": 82863.7,
      "pips": -1356.59,
      "pnl": -5.8,
      "status": "SL Exécuté",
      "source": "Scan SMC Jarvis",
      "setup": "Futures BTC (Levier 20x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 05:36 UTC."
    },
    {
      "id": "6ab9f6f78d88154de8bbc2b0",
      "date": "2026-09-28",
      "time": "05:19",
      "symbol": "INJ/USDT",
      "name": "Injective Futures",
      "side": "BUY",
      "lot": 82.1456,
      "entryPrice": 7.67,
      "exitPrice": 7.57,
      "pips": -0.1,
      "pnl": -7.99,
      "status": "SL Exécuté",
      "source": "Manuel / Crypto",
      "setup": "Futures INJ (Levier 35x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 05:19 UTC."
    },
    {
      "id": "6ab9e8258d88154de8bb9faf",
      "date": "2026-09-28",
      "time": "05:08",
      "symbol": "INJ/USDT",
      "name": "Injective Futures",
      "side": "BUY",
      "lot": 81.9422,
      "entryPrice": 7.69,
      "exitPrice": 7.66,
      "pips": -0.03,
      "pnl": -2.49,
      "status": "SL Exécuté",
      "source": "Manuel / Crypto",
      "setup": "Futures INJ (Levier 35x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 05:08 UTC."
    },
    {
      "id": "6ab9b7bb8d88154de8bac621",
      "date": "2026-09-28",
      "time": "04:07",
      "symbol": "INJ/USDT",
      "name": "Injective Futures",
      "side": "BUY",
      "lot": 81.4433,
      "entryPrice": 7.74,
      "exitPrice": 7.67,
      "pips": -0.07,
      "pnl": -5.17,
      "status": "SL Exécuté",
      "source": "Manuel / Crypto",
      "setup": "Futures INJ (Levier 35x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 04:07 UTC."
    },
    {
      "id": "6ab9c72f8d88154de8bb04d6",
      "date": "2026-09-28",
      "time": "04:05",
      "symbol": "SOL/USDT",
      "name": "Solana Futures",
      "side": "BUY",
      "lot": 5.2023,
      "entryPrice": 121.1,
      "exitPrice": 119.2,
      "pips": -1.9,
      "pnl": -9.89,
      "status": "SL Exécuté",
      "source": "Manuel / Crypto",
      "setup": "Futures SOL (Levier 35x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 04:05 UTC."
    },
    {
      "id": "6ab9b7c78d88154de8bada04",
      "date": "2026-09-28",
      "time": "04:02",
      "symbol": "HYPE/USDT",
      "name": "Hyperliquid Futures",
      "side": "BUY",
      "lot": 6.9411,
      "entryPrice": 90.76,
      "exitPrice": 89.37,
      "pips": -1.39,
      "pnl": -9.69,
      "status": "SL Exécuté",
      "source": "Manuel / Crypto",
      "setup": "Futures HYPE (Levier 35x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 04:02 UTC."
    },
    {
      "id": "6ab99aa68d88154de8ba62f2",
      "date": "2026-09-28",
      "time": "01:43",
      "symbol": "SOL/USDT",
      "name": "Solana Futures",
      "side": "BUY",
      "lot": 2.971,
      "entryPrice": 121.17,
      "exitPrice": 121.22,
      "pips": 0.05,
      "pnl": 0.15,
      "status": "TP Validé",
      "source": "Manuel / Crypto",
      "setup": "Futures SOL (Levier 20x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 01:43 UTC."
    },
    {
      "id": "6ab995038d88154de8ba3cdd",
      "date": "2026-09-28",
      "time": "00:41",
      "symbol": "INJ/USDT",
      "name": "Injective Futures",
      "side": "BUY",
      "lot": 46.5632,
      "entryPrice": 7.73,
      "exitPrice": 7.72,
      "pips": -0.01,
      "pnl": -0.53,
      "status": "SL Exécuté",
      "source": "Manuel / Crypto",
      "setup": "Futures INJ (Levier 20x - isolated)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 00:41 UTC."
    },
    {
      "id": "6ab970298d88154de8ba125b",
      "date": "2026-09-27",
      "time": "22:12",
      "symbol": "INJ/USDT",
      "name": "Injective Futures",
      "side": "BUY",
      "lot": 80.4327,
      "entryPrice": 7.83,
      "exitPrice": 7.72,
      "pips": -0.11,
      "pnl": -8.9,
      "status": "SL Exécuté",
      "source": "Manuel / Crypto",
      "setup": "Futures INJ (Levier 35x - cross)",
      "notes": "Marge allouée: 18.0 $. Clôturé à 22:12 UTC."
    }
  ],
  "dailyNotes": {
    "2026-09-30": {
      "note": "Clôture de session propre : Capital consolidé à 193.64 $ (Forex 166.84 $, Futures 26.80 $). 0 position ouverte la nuit (Conformité Sharia 100% Intraday garantie).",
      "sentiment": "Discipline Maximale 💎",
      "focusScore": 100
    },
    "2026-09-29": {
      "note": "Consolidation post-volatilité : Trades Gold et Nasdaq clôturés. Arrêt des copy traders pour basculer sur les analyses snipers du H et le scanner Jarvis.",
      "sentiment": "Pivot Stratégique 🛡️",
      "focusScore": 95
    },
    "2026-09-28": {
      "note": "Journée de haute volatilité crypto (INJ, SOL, HYPE) et copy trading initial. Décision salutaire de basculer vers un risk management strict à 12 $ max par trade.",
      "sentiment": "Leçon & Calibrage 🧠",
      "focusScore": 90
    },
    "2026-09-27": {
      "note": "Première prise de position suite au dépôt initial MoonX.",
      "sentiment": "Démarrage du Compte 🚀",
      "focusScore": 90
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
