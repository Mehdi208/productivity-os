const fs = require('fs');
const path = require('path');

const files = {
  'src/components/Calendar/TimeBlock.jsx': `import React from 'react';
import { Check, Video } from 'lucide-react';

const TimeBlock = ({ block, onToggleCheck, style, isMobile = false }) => {
  const { id, title, start, end, color = '#6C63FF', checkable, checked, subtitle, hasVideo } = block;

  const getBackgroundColor = (hex) => {
    switch (hex) {
      case '#3B82F6': return { bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-900', subText: 'text-blue-700/80', accent: '#3B82F6' };
      case '#6C63FF': return { bg: 'bg-[#6C63FF]/15', border: 'border-[#6C63FF]/30', text: 'text-[#2D2870]', subText: 'text-[#6C63FF]', accent: '#6C63FF' };
      case '#00D4AA': return { bg: 'bg-[#00D4AA]/20', border: 'border-[#00D4AA]/40', text: 'text-[#005242]', subText: 'text-[#008F72]', accent: '#00D4AA' };
      case '#F97316': return { bg: 'bg-orange-500/15', border: 'border-orange-500/30', text: 'text-orange-900', subText: 'text-orange-700/80', accent: '#F97316' };
      case '#FF4757': return { bg: 'bg-[#FF4757]/15', border: 'border-[#FF4757]/30', text: 'text-red-900', subText: 'text-[#FF4757]', accent: '#FF4757' };
      default: return { bg: 'bg-gray-200/60', border: 'border-gray-300/60', text: 'text-gray-800', subText: 'text-gray-600', accent: '#8B8BA7' };
    }
  };

  const theme = getBackgroundColor(color);
  const handleCheckboxClick = (e) => { e.stopPropagation(); if (checkable && onToggleCheck) onToggleCheck(id); };

  return (
    <div style={style} onClick={checkable ? handleCheckboxClick : undefined} className={\`absolute inset-x-1 rounded-xl p-2 md:p-2.5 border transition-all duration-200 overflow-hidden flex flex-col justify-between select-none \${theme.bg} \${theme.border} \${checked ? 'opacity-50 grayscale-[20%]' : 'hover:shadow-sm'} \${checkable ? 'cursor-pointer active:scale-[0.99]' : ''}\`}>
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: theme.accent }} />
      <div className="pl-1.5 flex items-start justify-between gap-1">
        <div className="flex items-start gap-1.5 min-w-0">
          {checkable && (
            <button type="button" onClick={handleCheckboxClick} className={\`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-colors flex-shrink-0 \${checked ? 'bg-primary border-primary text-white' : 'bg-white/80 border-gray-400/60 hover:border-primary'}\`}>{checked && <Check size={12} strokeWidth={3} />}</button>
          )}
          <div className="min-w-0">
            <h4 className={\`font-semibold text-xs md:text-sm truncate leading-tight \${theme.text} \${checked ? 'line-through' : ''}\`}>{title}</h4>
            <p className={\`text-[10px] md:text-xs font-medium mt-0.5 \${theme.subText}\`}>{start} - {end} {subtitle ? \`• \${subtitle}\` : ''}</p>
          </div>
        </div>
        {hasVideo && <Video size={14} className="text-primary flex-shrink-0 mt-0.5 mr-1 hidden md:block" />}
      </div>
    </div>
  );
};
export default TimeBlock;`,
  'src/components/Calendar/WeekView.jsx': `import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TimeBlock from './TimeBlock';

const WeekView = ({ blocksByDay = {}, onToggleCheck }) => {
  const hours = Array.from({ length: 19 }, (_, i) => i + 5);
  const hourHeight = 64;
  const [currentTimeOffset, setCurrentTimeOffset] = useState(null);

  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      if (h >= 5 && h <= 23) {
        setCurrentTimeOffset(((h - 5) + m / 60) * hourHeight);
      } else {
        setCurrentTimeOffset(((10 - 5) + 30 / 60) * hourHeight);
      }
    };
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000);
    return () => clearInterval(interval);
  }, [hourHeight]);

  const days = [
    { name: 'Mon', dayIndex: 0 }, { name: 'Tue', dayIndex: 1 }, { name: 'Wed', dayIndex: 2, isToday: true },
    { name: 'Thu', dayIndex: 3 }, { name: 'Fri', dayIndex: 4 }, { name: 'Sat', dayIndex: 5 }, { name: 'Sun', dayIndex: 6 }
  ];

  const timeToTop = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return ((h - 5) + (m || 0) / 60) * hourHeight;
  };

  const getDurationHeight = (startStr, endStr) => {
    if (!startStr || !endStr) return hourHeight;
    const [sH, sM] = startStr.split(':').map(Number);
    const [eH, eM] = endStr.split(':').map(Number);
    return Math.max(32, ((eH * 60 + eM) - (sH * 60 + sM)) / 60 * hourHeight);
  };

  return (
    <div className="hidden md:flex flex-col bg-card rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex-1">
      <div className="p-6 border-b border-gray-200/60 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h2 className="text-2xl font-bold text-textMain">Oct 23 - Oct 29</h2>
          <div className="flex items-center bg-background rounded-xl p-1 border border-gray-200/80">
            <button className="p-1.5 rounded-lg hover:bg-card text-textMuted"><ChevronLeft size={16} /></button>
            <button className="px-3 py-1 font-semibold text-xs text-textMain">Today</button>
            <button className="p-1.5 rounded-lg hover:bg-card text-textMuted"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-gray-200/60 bg-card select-none">
        <div className="p-3" />
        {days.map((d, index) => (
          <div key={d.name} className={\`py-3 px-2 text-center border-l border-gray-100 \${d.isToday ? 'bg-primary/10 text-primary font-bold border-t-2 border-t-primary' : ''}\`}>
            <div className="text-xs font-medium uppercase text-textMuted">{d.name}</div>
            <div className={\`text-base font-bold mt-0.5 \${d.isToday ? 'text-primary' : 'text-textMain'}\`}>{23 + index}</div>
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto relative max-h-[750px] no-scrollbar">
        <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] relative min-h-[1216px]">
          <div className="border-r border-gray-200/60 bg-card z-10">
            {hours.map((h) => <div key={h} style={{ height: \`\${hourHeight}px\` }} className="text-[11px] font-medium text-textMuted text-right pr-2 -mt-2">{h.toString().padStart(2, '0')}:00</div>)}
          </div>
          {currentTimeOffset !== null && (
            <div style={{ top: \`\${currentTimeOffset}px\` }} className="absolute left-[60px] right-0 z-20 flex items-center pointer-events-none">
              <div className="w-2 h-2 rounded-full bg-danger -ml-1 flex-shrink-0" />
              <div className="h-[1px] w-full bg-danger" />
            </div>
          )}
          {days.map((d) => {
            const dayBlocks = blocksByDay[d.dayIndex] || [];
            return (
              <div key={d.name} className={\`relative border-l border-gray-100 \${d.isToday ? 'bg-primary/[0.02]' : ''}\`}>
                {hours.map((h) => <div key={h} style={{ height: \`\${hourHeight}px\` }} className="border-b border-gray-100/80 w-full" />)}
                {dayBlocks.map((block) => (
                  <TimeBlock key={block.id} block={block} onToggleCheck={onToggleCheck} style={{ top: \`\${timeToTop(block.start)}px\`, height: \`\${getDurationHeight(block.start, block.end)}px\` }} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default WeekView;`,
  'src/components/Calendar/DayView.jsx': `import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import TimeBlock from './TimeBlock';

const DayView = ({ dayBlocks = [], onToggleCheck, onNewTask, dateLabel = "Mer. 24 Oct" }) => {
  const hours = Array.from({ length: 19 }, (_, i) => i + 5);
  const hourHeight = 72;
  const [currentTimeOffset, setCurrentTimeOffset] = useState(null);

  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      if (h >= 5 && h <= 23) {
        setCurrentTimeOffset(((h - 5) + m / 60) * hourHeight);
      } else {
        setCurrentTimeOffset(((11 - 5) + 0 / 60) * hourHeight);
      }
    };
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000);
    return () => clearInterval(interval);
  }, [hourHeight]);

  const timeToTop = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return ((h - 5) + (m || 0) / 60) * hourHeight;
  };

  const getDurationHeight = (startStr, endStr) => {
    if (!startStr || !endStr) return hourHeight;
    const [sH, sM] = startStr.split(':').map(Number);
    const [eH, eM] = endStr.split(':').map(Number);
    return Math.max(48, ((eH * 60 + eM) - (sH * 60 + sM)) / 60 * hourHeight);
  };

  return (
    <div className="md:hidden flex flex-col min-h-screen pb-24 bg-background relative">
      <div className="px-5 pt-4 pb-3 flex items-center justify-between bg-card border-b border-gray-100 sticky top-14 z-30">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted">AUJOURD'HUI</span>
          <h2 className="text-xl font-bold text-textMain leading-tight">{dateLabel}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-textMuted"><ChevronLeft size={16} /></button>
          <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-textMuted"><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="flex-1 relative overflow-x-hidden mt-2">
        <div className="grid grid-cols-[56px_1fr] relative min-h-[1368px]">
          <div className="border-r border-gray-200/60 bg-background select-none z-10">
            {hours.map((h) => <div key={h} style={{ height: \`\${hourHeight}px\` }} className="text-xs font-medium text-textMuted text-right pr-2.5 -mt-2">{h.toString().padStart(2, '0')}:00</div>)}
          </div>
          <div className="relative pl-1 pr-3">
            {hours.map((h) => <div key={h} style={{ height: \`\${hourHeight}px\` }} className="border-b border-gray-200/60 w-full" />)}
            {currentTimeOffset !== null && (
              <div style={{ top: \`\${currentTimeOffset}px\` }} className="absolute -left-[56px] right-0 z-20 flex items-center pointer-events-none">
                <div className="w-2.5 h-2.5 rounded-full bg-danger ml-[52px] flex-shrink-0" />
                <div className="h-[1.5px] w-full bg-danger" />
              </div>
            )}
            {dayBlocks.map((block) => (
              <TimeBlock key={block.id} block={block} onToggleCheck={onToggleCheck} style={{ top: \`\${timeToTop(block.start)}px\`, height: \`\${getDurationHeight(block.start, block.end) - 4}px\` }} isMobile={true} />
            ))}
          </div>
        </div>
      </div>
      <button onClick={onNewTask} className="fixed bottom-20 right-5 w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 z-40 active:scale-95 transition-transform">
        <Plus size={26} strokeWidth={2.5} />
      </button>
    </div>
  );
};
export default DayView;`,
  'src/components/Projects/ProjectCard.jsx': `import React from 'react';
import { CheckSquare, Clock, AlertTriangle, RefreshCw, Calendar as CalendarIcon } from 'lucide-react';

const ProjectCard = ({ project }) => {
  const { name, subtitle, description, progress = 0, status, statusType = 'primary', tasksCount = "12/14 Tasks", avatars = ['M', '+2'], icon: IconComponent, iconColor = 'text-primary bg-primary/10', deadline } = project;

  const getTheme = (type) => {
    switch (type) {
      case 'danger': return { badge: 'bg-danger/10 text-danger border border-danger/20', bar: 'bg-danger', icon: AlertTriangle };
      case 'warning': return { badge: 'bg-warning/10 text-warning border border-warning/20', bar: 'bg-warning', icon: RefreshCw };
      case 'amber': return { badge: 'bg-amber-100 text-amber-800 border border-amber-300', bar: 'bg-amber-400', icon: CalendarIcon };
      default: return { badge: 'bg-primary/10 text-primary border border-primary/20', bar: 'bg-primary', icon: RefreshCw };
    }
  };

  const theme = getTheme(statusType);
  const StatusIcon = theme.icon;

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all duration-200">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className={\`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg \${iconColor}\`}>
              {IconComponent ? <IconComponent size={22} /> : name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg text-textMain leading-tight">{name}</h3>
              <p className="text-xs text-textMuted mt-0.5">{subtitle || description}</p>
            </div>
          </div>
          <span className={\`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold \${theme.badge} flex-shrink-0\`}>
            <StatusIcon size={12} /><span>{status}</span>
          </span>
        </div>
      </div>
      <div className="my-6">
        <div className="flex items-center justify-between text-xs font-medium mb-2"><span className="text-textMuted">Progress</span><span className="font-bold text-textMain">{progress}%</span></div>
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden"><div className={\`h-full rounded-full transition-all duration-700 ease-out \${theme.bar}\`} style={{ width: \`\${progress}%\` }} /></div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-100/80 text-xs text-textMuted font-medium">
        <div className="flex items-center gap-2"><CheckSquare size={16} className="text-textMuted/70" /><span>{tasksCount}</span></div>
      </div>
    </div>
  );
};
export default ProjectCard;`,
  'src/components/Stats/StatsView.jsx': `import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';
import { Award, CheckCircle, XCircle, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatsView = () => {
  const [timeRange, setTimeRange] = useState('7 Days');

  const dailyScoreData = [ { day: 'Lun', score: 85 }, { day: 'Mar', score: 78 }, { day: 'Mer', score: 92 }, { day: 'Jeu', score: 95 }, { day: 'Ven', score: 88 }, { day: 'Sam', score: 70 }, { day: 'Dim', score: 82 } ];
  const evolutionData = [ { week: 'W1', score: 75 }, { week: 'W2', score: 82 }, { week: 'W3', score: 80 }, { week: 'W4', score: 88 } ];

  const metrics = [
    { title: 'Meilleur Jour', value: 'Jeudi', subtitle: '92% comp.', icon: Award, iconColor: 'bg-secondary/10 text-secondary', badgeText: '+12%', badgeColor: 'text-secondary bg-secondary/10', badgeIcon: ArrowUpRight },
    { title: 'Tâche + Complétée', value: 'Deep Work (2h)', subtitle: '14 occurrences', icon: CheckCircle, iconColor: 'bg-primary/10 text-primary', badgeText: 'Top 1', badgeColor: 'text-primary bg-primary/10' },
    { title: 'Tâche + Ratée', value: 'Inbox Zero', subtitle: 'Missed 3 times', subtitleColor: 'text-danger font-semibold', icon: XCircle, iconColor: 'bg-danger/10 text-danger', badgeText: '-5%', badgeColor: 'text-danger bg-danger/10', badgeIcon: ArrowDownRight },
    { title: 'Moyenne Hebdo', value: '85%', subtitle: 'Sur 7 jours', icon: TrendingUp, iconColor: 'bg-amber-500/10 text-amber-500', badgeText: '+5% vs last week', badgeColor: 'text-secondary bg-secondary/10', badgeIcon: ArrowUpRight }
  ];

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-textMain">Analytics Overview</h1>
          <p className="text-xs text-textMuted mt-0.5">Suivez votre productivité et vos tendances de performance</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const IconComp = m.icon;
          return (
            <div key={idx} className="bg-card rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-center justify-between"><span className="text-xs font-medium text-textMuted">{m.title}</span><div className={\`w-9 h-9 rounded-xl flex items-center justify-center \${m.iconColor}\`}><IconComp size={18} /></div></div>
              <div className="my-3"><div className="text-xl lg:text-2xl font-bold text-textMain truncate">{m.value}</div><div className={\`text-xs mt-1 \${m.subtitleColor || 'text-textMuted'}\`}>{m.subtitle}</div></div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyScoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8B8BA7', fontSize: 12 }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#8B8BA7', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="score" fill="#6C63FF" radius={[8, 8, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
export default StatsView;`,
  'src/pages/Today.jsx': `import React from 'react';
import { Sun, Bell, User, Check } from 'lucide-react';
import ScoreCard from '../components/Dashboard/ScoreCard';
import TasksCard from '../components/Dashboard/TasksCard';
import StreakCard from '../components/Dashboard/StreakCard';
import HydrationCard from '../components/Dashboard/HydrationCard';

const Today = ({ score = 85, completedCount = 5, totalCount = 8, streak = 12, hydrationMl = 1200, onAddWater, todayBlocks = [], onToggleCheckBlock, weekDays = [] }) => {
  const getCategoryBadge = (title) => {
    if (title.includes('Prière')) return { label: 'Spirituel', bg: 'bg-blue-100 text-blue-700' };
    if (title.includes('Judo')) return { label: 'Sport', bg: 'bg-[#00D4AA]/20 text-[#006A55]' };
    return { label: 'Travail', bg: 'bg-primary/10 text-primary' };
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-20 md:pb-8">
      <header className="hidden md:flex items-center justify-between bg-card p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-textMain flex items-center gap-2">Bonjour Méhdi 👋</h1>
          <p className="text-sm text-textMuted mt-1">Here is your overview for today.</p>
        </div>
      </header>
      <header className="md:hidden flex flex-col gap-3 bg-card p-5 rounded-2xl shadow-sm border border-gray-100">
        <div><h1 className="text-xl font-bold text-textMain">Bonjour Méhdi 👋</h1></div>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-5">
        <ScoreCard score={score} completedCount={completedCount} totalCount={totalCount} />
        <TasksCard completedCount={completedCount} totalCount={totalCount} />
        <StreakCard streak={streak} />
        <HydrationCard currentMl={hydrationMl} targetMl={1925} onAddWater={onAddWater} />
      </section>

      <section className="hidden md:block bg-card rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-bold text-textMain">Cette Semaine</h2></div>
      </section>

      <section className="md:hidden space-y-3">
        <div className="flex items-center justify-between px-1"><h2 className="text-base font-bold text-textMain">Aujourd'hui</h2></div>
        <div className="space-y-2.5">
          {todayBlocks.map((block) => {
            const badge = getCategoryBadge(block.title);
            return (
              <div key={block.id} onClick={() => block.checkable && onToggleCheckBlock && onToggleCheckBlock(block.id)} className={\`bg-card rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3 transition-all \${block.checkable ? 'cursor-pointer' : ''} \${block.checked ? 'opacity-60 bg-gray-50/50' : ''}\`}>
                <div className="flex items-center gap-3.5 min-w-0">
                  {block.checkable ? (
                    <div className={\`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors \${block.checked ? 'bg-primary border-primary text-white' : 'border-gray-300 bg-background'}\`}>
                      {block.checked && <Check size={14} strokeWidth={3} />}
                    </div>
                  ) : <div className="w-5 h-5 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-gray-400" /></div>}
                  <div className="min-w-0">
                    <h4 className={\`font-semibold text-sm text-textMain truncate \${block.checked ? 'line-through text-textMuted' : ''}\`}>{block.title}</h4>
                    <p className="text-xs text-textMuted font-medium mt-0.5">🕒 {block.start} - {block.end}</p>
                  </div>
                </div>
                <span className={\`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex-shrink-0 \${badge.bg}\`}>{badge.label}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
export default Today;`,
  'src/pages/Week.jsx': `import React from 'react';
import WeekView from '../components/Calendar/WeekView';
import DayView from '../components/Calendar/DayView';

const Week = ({ blocksByDay = {}, todayBlocks = [], onToggleCheckBlock, onNewTask }) => {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="hidden md:flex flex-col flex-1"><WeekView blocksByDay={blocksByDay} onToggleCheck={onToggleCheckBlock} /></div>
      <div className="md:hidden flex-1"><DayView dayBlocks={todayBlocks} onToggleCheck={onToggleCheckBlock} onNewTask={onNewTask} dateLabel="Mer. 24 Oct" /></div>
    </div>
  );
};
export default Week;`,
  'src/pages/Projects.jsx': `import React from 'react';
import { Plus, Filter, Briefcase, Smartphone, Megaphone, Terminal } from 'lucide-react';
import ProjectCard from '../components/Projects/ProjectCard';

const Projects = ({ projects: customProjects, onNewProject }) => {
  const defaultProjects = [
    { id: 'biogroupe', name: 'Biogroupe', subtitle: 'Client externe', description: 'Refonte portail.', progress: 85, status: 'Overdue', statusType: 'danger', tasksCount: '12/14 Tasks', icon: Briefcase, iconColor: 'text-danger bg-danger/10', deadline: 'Oct 22' },
    { id: 'pharma-poche', name: 'Pharma Poche', subtitle: 'Application Mobile', description: 'Suivi médicaments.', progress: 45, status: 'In Progress', statusType: 'warning', tasksCount: '18/40 Tasks', icon: Smartphone, iconColor: 'text-warning bg-warning/10', deadline: 'Nov 10' }
  ];
  const displayProjects = customProjects && customProjects.length > 0 ? customProjects : defaultProjects;

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      <div className="hidden md:flex items-center justify-between bg-card p-6 rounded-3xl shadow-sm border border-gray-100">
        <div><h1 className="text-2xl font-bold text-textMain">Projets</h1></div>
        <button onClick={onNewProject} className="bg-primary text-white font-medium px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm"><Plus size={18} /><span>Nouveau projet</span></button>
      </div>
      <div className="md:hidden flex items-center justify-between px-1 pt-2">
        <div><h1 className="text-xl font-bold text-textMain">Projets Actifs</h1></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {displayProjects.map((proj) => <ProjectCard key={proj.id} project={proj} />)}
      </div>
      <button onClick={onNewProject} className="md:hidden fixed bottom-20 right-5 w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg"><Plus size={26} strokeWidth={2.5} /></button>
    </div>
  );
};
export default Projects;`,
  'src/pages/Stats.jsx': `import React from 'react';
import StatsView from '../components/Stats/StatsView';

const Stats = () => <div className="flex-1"><StatsView /></div>;
export default Stats;`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), filepath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content);
}
console.log('Restored config and components batch 2!');
