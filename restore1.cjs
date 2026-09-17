const fs = require('fs');
const path = require('path');

const files = {
  'package.json': `{
  "name": "productivity-os",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "firebase": "^12.15.0",
    "lucide-react": "^1.23.0",
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "react-router-dom": "^7.18.1",
    "recharts": "^3.9.1"
  },
  "devDependencies": {
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.3",
    "autoprefixer": "^10.5.2",
    "oxlint": "^1.71.0",
    "postcss": "^8.5.16",
    "tailwindcss": "^3.4.19",
    "vite": "^8.1.1"
  }
}`,
  'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F5F5FA',
        card: '#FFFFFF',
        primary: '#6C63FF',
        secondary: '#00D4AA',
        textMain: '#1A1A2E',
        textMuted: '#8B8BA7',
        danger: '#FF4757',
        warning: '#FFA502',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}`,
  'postcss.config.js': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
  'index.html': `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Productivity OS</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body class="bg-background text-textMain font-sans antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
  'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}

body {
  margin: 0;
  padding: 0;
  background-color: #F5F5FA;
  color: #1A1A2E;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
}`,
  'src/main.jsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);`,
  'src/firebase/config.js': `import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "FIREBASE_API_KEY",
  authDomain: "FIREBASE_AUTH_DOMAIN",
  projectId: "FIREBASE_PROJECT_ID",
  storageBucket: "FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "FIREBASE_MESSAGING_SENDER_ID",
  appId: "FIREBASE_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;`,
  'src/data/fixedBlocks.js': `const generateId = (dateStr, title) => \`\${dateStr}_\${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}\`;

export const getBlocksForDate = (dateObj = new Date()) => {
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const dayOfMonth = dateObj.getDate();
  const dayOfWeek = dateObj.getDay();
  const dateStr = dateObj.toISOString().split('T')[0];

  const blocks = [];

  if (year === 2026 && month === 7 && dayOfMonth >= 3 && dayOfMonth <= 22) {
    return [{ id: generateId(dateStr, "Voyage Ghana"), title: "Voyage Ghana", start: "05:00", end: "23:00", color: "#FF4757", checkable: false, subtitle: "Vacances / Déplacement" }];
  }

  if (year === 2026 && month === 6 && dayOfMonth === 6) {
    return [{ id: generateId(dateStr, "Proclamation Bac"), title: "Proclamation Bac", start: "08:00", end: "18:00", color: "#FF4757", checkable: false, subtitle: "Événement important" }];
  }

  const isTournagePub = (year === 2026 && month === 6 && dayOfMonth >= 2 && dayOfMonth <= 31 && (dayOfWeek === 4 || dayOfWeek === 5));

  blocks.push({ id: generateId(dateStr, "Fajr & Prière"), title: "Fajr & Prière", start: "05:00", end: "05:30", color: "#3B82F6", checkable: true, subtitle: "Routine matinale spirituelle" });
  blocks.push({ id: generateId(dateStr, "Travail Profond"), title: "Travail Profond", start: "05:30", end: "08:00", color: "#6C63FF", checkable: true, subtitle: "Focus sans distraction" });

  if (isTournagePub) {
    blocks.push({ id: generateId(dateStr, "Tournage Star de Pub"), title: "Tournage Star de Pub", start: "08:00", end: "18:00", color: "#FF4757", checkable: true, subtitle: "Plateau de tournage publicitaire" });
  } else if (dayOfWeek === 5) {
    blocks.push({ id: generateId(dateStr, "Travail Matin"), title: "Travail", start: "08:00", end: "12:30", color: "#6C63FF", checkable: true });
    blocks.push({ id: generateId(dateStr, "Mosquée"), title: "Mosquée", start: "12:30", end: "14:00", color: "#3B82F6", checkable: true, subtitle: "Prière du Vendredi" });
    blocks.push({ id: generateId(dateStr, "Travail Après-midi"), title: "Travail", start: "14:00", end: "17:30", color: "#6C63FF", checkable: true });
  } else {
    blocks.push({ id: generateId(dateStr, "Travail Matin"), title: "Travail", start: "08:00", end: "11:40", color: "#6C63FF", checkable: true });
    blocks.push({ id: generateId(dateStr, "Déjeuner"), title: "Déjeuner", start: "13:00", end: "13:45", color: "#F97316", checkable: false, subtitle: "Pause repas & lecture" });
    blocks.push({ id: generateId(dateStr, "Travail Après-midi"), title: "Travail", start: "13:45", end: (dayOfWeek === 2) ? "17:00" : "18:00", color: "#6C63FF", checkable: true });
  }

  if (year === 2026 && month === 6 && dayOfMonth === 15) {
    blocks.push({ id: generateId(dateStr, "Festival BEM"), title: "Festival BEM", start: "14:00", end: "19:00", color: "#FF4757", checkable: true, subtitle: "Événement Marketing Q3" });
  }

  if (dayOfWeek === 2 || dayOfWeek === 5) {
    const prepStart = (dayOfWeek === 2) ? "17:00" : "17:30";
    const judoStart = (dayOfWeek === 2) ? "17:45" : "18:30";
    blocks.push({ id: generateId(dateStr, "Préparation Judo"), title: "Préparation Judo", start: prepStart, end: judoStart, color: "#00D4AA", checkable: false, subtitle: "Trajet et échauffement" });
    blocks.push({ id: generateId(dateStr, "Judo"), title: "Judo", start: judoStart, end: "20:00", color: "#00D4AA", checkable: true, subtitle: "Entraînement dojo" });
    blocks.push({ id: generateId(dateStr, "Retour + Douche"), title: "Retour + Douche", start: "20:00", end: "22:00", color: "#8B8BA7", checkable: false, subtitle: "Récupération" });
  }

  blocks.push({ id: generateId(dateStr, "Coucher"), title: "Coucher", start: "23:00", end: "23:30", color: "#8B8BA7", checkable: false, subtitle: "Fin de journée & sommeil" });
  return blocks.sort((a, b) => a.start.localeCompare(b.start));
};

export const getWeekBlocks = (referenceDate = new Date()) => {
  const currentDayOfWeek = referenceDate.getDay();
  const distanceToMonday = (currentDayOfWeek + 6) % 7;
  const mondayDate = new Date(referenceDate);
  mondayDate.setDate(referenceDate.getDate() - distanceToMonday);

  const blocksByDay = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + i);
    blocksByDay[i] = getBlocksForDate(d);
  }
  return blocksByDay;
};`,
  'src/components/Layout/Sidebar.jsx': `import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Columns, Folder, BarChart2, Settings, HelpCircle, Plus } from 'lucide-react';

const Sidebar = ({ onNewTask }) => {
  const navItems = [
    { name: 'Today', path: '/', icon: Calendar },
    { name: 'Week', path: '/week', icon: Columns },
    { name: 'Projects', path: '/projects', icon: Folder },
    { name: 'Stats', path: '/stats', icon: BarChart2 },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-background border-r border-gray-200/60 min-h-screen p-6 select-none flex-shrink-0">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">M</div>
        <div>
          <h1 className="font-bold text-textMain text-base leading-tight">Productivity OS</h1>
          <p className="text-xs text-textMuted font-medium">Hello, Méhdi</p>
        </div>
      </div>
      <button onClick={onNewTask} className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-primary/20 transition-all duration-200 mb-8 active:scale-[0.98]">
        <Plus size={18} /><span>New Task</span>
      </button>
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.name} to={item.path} className={({ isActive }) => \`flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 \${isActive ? 'bg-primary/10 text-primary font-semibold shadow-sm' : 'text-textMuted hover:text-textMain hover:bg-gray-100/60'}\`}>
              <Icon size={20} /><span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="pt-6 border-t border-gray-200/60 space-y-1.5 mt-auto">
        <button className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium text-textMuted hover:text-textMain hover:bg-gray-100/60 transition-colors"><Settings size={18} /><span>Settings</span></button>
        <button className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium text-textMuted hover:text-textMain hover:bg-gray-100/60 transition-colors"><HelpCircle size={18} /><span>Support</span></button>
      </div>
    </aside>
  );
};
export default Sidebar;`,
  'src/components/Layout/BottomNav.jsx': `import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Columns, Folder, BarChart2 } from 'lucide-react';

const BottomNav = () => {
  const navItems = [
    { name: 'Today', path: '/', icon: Calendar },
    { name: 'Week', path: '/week', icon: Columns },
    { name: 'Projects', path: '/projects', icon: Folder },
    { name: 'Stats', path: '/stats', icon: BarChart2 },
  ];
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-gray-200/80 px-4 py-2 flex items-center justify-around z-50 shadow-lg select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink key={item.name} to={item.path} className={({ isActive }) => \`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 \${isActive ? 'text-primary font-semibold scale-105' : 'text-textMuted hover:text-textMain'}\`}>
            {({ isActive }) => (
              <><div className={\`p-1.5 rounded-xl \${isActive ? 'bg-primary/10' : ''}\`}><Icon size={20} /></div><span className="text-[11px] mt-0.5 font-medium">{item.name}</span></>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
export default BottomNav;`,
  'src/components/Dashboard/ScoreCard.jsx': `import React from 'react';
import { ArrowUpRight, Activity } from 'lucide-react';

const ScoreCard = ({ score = 0, completedCount = 0, totalCount = 0 }) => {
  const getDynamicColors = (val) => {
    if (val < 50) return { text: 'text-danger', bg: 'bg-danger' };
    if (val <= 70) return { text: 'text-warning', bg: 'bg-warning' };
    return { text: 'text-secondary', bg: 'bg-secondary' };
  };
  const colors = getDynamicColors(score);
  return (
    <div className="bg-card rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-full transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs md:text-sm font-medium text-textMuted md:block hidden">Score Journalier</span>
        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center md:hidden"><Activity size={18} /></div>
      </div>
      <div className="my-2 md:my-3 flex items-baseline gap-2">
        <div className="hidden md:flex items-baseline gap-2">
          <span className={\`text-3xl lg:text-4xl font-bold \${colors.text}\`}>{Math.round(score)}%</span>
          <span className="inline-flex items-center text-xs font-semibold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded"><ArrowUpRight size={14} className="mr-0.5" />12%</span>
        </div>
        <div className="md:hidden flex flex-col">
          <div className="flex items-baseline"><span className="text-2xl font-bold text-textMain">{Math.round(score)}</span><span className="text-sm font-normal text-textMuted">/100</span></div>
          <span className="text-xs font-medium text-textMuted mt-1">Score</span>
        </div>
      </div>
      <div className="hidden md:block w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-2">
        <div className={\`h-full transition-all duration-500 ease-out rounded-full \${colors.bg}\`} style={{ width: \`\${Math.min(100, Math.max(0, score))}%\` }} />
      </div>
    </div>
  );
};
export default ScoreCard;`,
  'src/components/Dashboard/TasksCard.jsx': `import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const TasksCard = ({ completedCount = 5, totalCount = 8 }) => {
  const remainingCount = Math.max(0, totalCount - completedCount);
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  return (
    <div className="bg-card rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-full transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs md:text-sm font-medium text-textMuted md:block hidden">Tâches</span>
        <div className="hidden md:flex text-textMuted/60"><CheckCircle2 size={18} /></div>
        <div className="w-9 h-9 rounded-full bg-secondary/10 text-secondary flex items-center justify-center md:hidden"><CheckCircle2 size={18} /></div>
      </div>
      <div className="my-2 md:my-3">
        <div className="hidden md:flex items-baseline gap-1.5">
          <span className="text-3xl lg:text-4xl font-bold text-textMain">{completedCount}</span><span className="text-xl font-medium text-textMuted">/{totalCount}</span>
        </div>
        <p className="hidden md:block text-xs text-textMuted mt-0.5">complétées</p>
        <div className="md:hidden flex flex-col">
          <span className="text-2xl font-bold text-textMain">{remainingCount}</span><span className="text-xs font-medium text-textMuted mt-1">Tâches restantes</span>
        </div>
      </div>
      <div className="hidden md:block w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-2">
        <div className="h-full bg-primary rounded-full transition-all duration-500 ease-out" style={{ width: \`\${progressPercentage}%\` }} />
      </div>
    </div>
  );
};
export default TasksCard;`,
  'src/components/Dashboard/StreakCard.jsx': `import React from 'react';
import { Flame } from 'lucide-react';

const StreakCard = ({ streak = 12 }) => {
  return (
    <>
      <div className="hidden md:flex bg-[#FFFDF0] border border-amber-100/80 rounded-2xl p-5 shadow-sm flex-col items-center justify-center text-center h-full transition-all hover:shadow-md">
        <div className="text-3xl mb-1 filter drop-shadow-sm animate-bounce-slow">🔥</div>
        <span className="text-xs font-medium text-textMuted mb-1">Current Streak</span>
        <span className="text-2xl lg:text-3xl font-bold text-warning">{streak} jours</span>
      </div>
      <div className="md:hidden bg-card rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-full">
        <div className="w-9 h-9 rounded-full bg-warning/10 text-warning flex items-center justify-center"><Flame size={18} className="fill-warning/20" /></div>
        <div className="my-2 flex flex-col">
          <div className="flex items-baseline gap-1"><span className="text-2xl font-bold text-textMain">{streak}</span><span className="text-sm font-normal text-textMuted">jours</span></div>
          <span className="text-xs font-medium text-textMuted mt-1">Streak actuel</span>
        </div>
      </div>
    </>
  );
};
export default StreakCard;`,
  'src/components/Dashboard/HydrationCard.jsx': `import React, { useState } from 'react';
import { Droplet, Plus } from 'lucide-react';

const HydrationCard = ({ currentMl = 1200, targetMl = 1925, onAddWater }) => {
  const [customAmount, setCustomAmount] = useState('');
  const [error, setError] = useState('');
  const [showMobileModal, setShowMobileModal] = useState(false);

  const progressPercentage = Math.min(100, Math.max(0, (currentMl / targetMl) * 100));
  const formattedCurrent = (currentMl / 1000).toFixed(1);
  const formattedTarget = (targetMl / 1000).toFixed(1);

  const handleCustomAdd = (e) => {
    e.preventDefault();
    const val = parseInt(customAmount, 10);
    if (isNaN(val) || val < 1) return setError('Min 1 ml');
    if (val > 2000) return setError('Max 2000 ml');
    setError('');
    if (onAddWater) onAddWater(val);
    setCustomAmount('');
    setShowMobileModal(false);
  };

  return (
    <>
      <div className="hidden md:flex bg-card rounded-2xl p-5 shadow-sm border border-gray-100 flex-col justify-between h-full transition-all hover:shadow-md">
        <div className="flex items-center justify-between"><span className="text-xs md:text-sm font-medium text-textMuted">Hydratation</span><span className="text-blue-500 text-lg">💧</span></div>
        <div className="my-2 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1"><span className="text-3xl lg:text-4xl font-bold text-blue-600">{formattedCurrent}L</span><span className="text-base font-medium text-textMuted">/ {formattedTarget}L</span></div>
          <button onClick={() => onAddWater && onAddWater(250)} className="bg-blue-100/80 hover:bg-blue-200 text-blue-700 font-semibold text-xs py-1.5 px-2.5 rounded-lg transition-colors flex items-center gap-0.5 active:scale-95"><Plus size={12} /> 250ml</button>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden my-2"><div className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out" style={{ width: \`\${progressPercentage}%\` }} /></div>
        <form onSubmit={handleCustomAdd} className="mt-2 flex items-center gap-1.5 pt-2 border-t border-gray-100">
          <input type="number" min="1" max="2000" placeholder="ml..." value={customAmount} onChange={(e) => { setCustomAmount(e.target.value); if (error) setError(''); }} className="w-full bg-background border border-gray-200 rounded-lg px-2 py-1 text-xs text-textMain focus:outline-none focus:border-blue-500 transition-colors" />
          <button type="submit" className="bg-primary hover:bg-primary/90 text-white font-medium text-xs px-2.5 py-1 rounded-lg transition-colors flex-shrink-0">Ajouter</button>
        </form>
        {error && <span className="text-[10px] text-danger font-medium mt-0.5">{error}</span>}
      </div>
      <div onClick={() => setShowMobileModal(true)} className="md:hidden bg-card rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-full cursor-pointer active:scale-[0.98] transition-transform">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center"><Droplet size={18} className="fill-blue-500/20" /></div>
          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">+ H₂O</span>
        </div>
        <div className="my-2 flex flex-col"><div className="flex items-baseline gap-1"><span className="text-2xl font-bold text-textMain">{formattedCurrent}L</span><span className="text-xs text-textMuted">/ {formattedTarget}L</span></div><span className="text-xs font-medium text-textMuted mt-1">Hydratation</span></div>
        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-1"><div className="h-full bg-blue-500 rounded-full" style={{ width: \`\${progressPercentage}%\` }} /></div>
      </div>
      {showMobileModal && (
        <div className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-xs shadow-xl space-y-4">
            <div className="flex items-center justify-between"><h3 className="font-bold text-textMain flex items-center gap-2"><span>💧</span> Ajouter de l'eau</h3><button onClick={() => setShowMobileModal(false)} className="text-textMuted text-sm font-bold">✕</button></div>
            <p className="text-xs text-textMuted">Objectif journalier : {targetMl} ml. Actuel : {currentMl} ml.</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { onAddWater && onAddWater(250); setShowMobileModal(false); }} className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-2.5 rounded-xl text-sm transition-colors border border-blue-200/50">+250 ml</button>
              <button onClick={() => { onAddWater && onAddWater(500); setShowMobileModal(false); }} className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-2.5 rounded-xl text-sm transition-colors border border-blue-200/50">+500 ml</button>
            </div>
            <form onSubmit={handleCustomAdd} className="space-y-2 pt-2 border-t border-gray-100">
              <label className="text-xs font-medium text-textMuted block">Saisie manuelle (ml) :</label>
              <div className="flex gap-2"><input type="number" min="1" max="2000" placeholder="ex: 330" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} className="flex-1 bg-background border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500" /><button type="submit" className="bg-primary text-white font-medium px-4 py-2 rounded-xl text-sm">OK</button></div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
export default HydrationCard;`,
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), filepath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content);
}
console.log('Restored config and components batch 1!');
