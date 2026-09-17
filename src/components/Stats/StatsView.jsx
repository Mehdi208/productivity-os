import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, ReferenceLine } from 'recharts';
import { Award, TrendingUp, Calendar as CalendarIcon, Search, Droplet } from 'lucide-react';
import { getLastNDaysScores, getCurrentWeekScores, getWeeklyAverages, getBestDay, getAverageScore, getDayScore, getTodayStr, getHydrationStats } from '../../data/scoreHistory';
import { useLanguage } from '../../context/LanguageContext';

const StatsView = ({ hydrationMl = 0 }) => {
  const { lang, t } = useLanguage();
  const [timeRange, setTimeRange] = useState('7 Days'); // 'Today' | '3 Days' | '7 Days' | '30 Days'
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [chartMetric, setChartMetric] = useState('score'); // 'score' | 'hydration'
  
  // Custom Date Picker Selection
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [dateDetail, setDateDetail] = useState(null);

  const daysCount = timeRange === 'Today' ? 1 : timeRange === '3 Days' ? 3 : timeRange === '7 Days' ? 7 : 30;

  useEffect(() => {
    const days = timeRange === '7 Days' ? getCurrentWeekScores() : getLastNDaysScores(daysCount);
    setDailyData(days);
    setWeeklyData(getWeeklyAverages(4));
  }, [timeRange, daysCount]);

  useEffect(() => {
    if (selectedDate) {
      const detail = getDayScore(selectedDate);
      setDateDetail(detail);
    }
  }, [selectedDate]);

  const best = getBestDay(dailyData);
  const avg = getAverageScore(dailyData);
  const hydrationStats = getHydrationStats(dailyData, 1925);

  const metrics = [
    { 
      title: t('bestDay'), 
      value: best.score > 0 ? `${best.day} (${best.score}%)` : '—', 
      subtitle: best.score > 0 ? t('peakProductivity') : t('noSessionLogged'), 
      icon: Award, 
      iconColor: 'bg-secondary/15 text-[#006E57] dark:text-secondary', 
      badgeText: best.score > 0 ? `${best.score}%` : null, 
      badgeColor: 'text-secondary bg-secondary/10' 
    },
    { 
      title: timeRange === '7 Days' ? t('weeklyAverageFull') : t('averageScore'), 
      value: `${avg}%`, 
      subtitle: timeRange === '7 Days' ? t('currentWeekDesc') : t('pastDaysDesc', daysCount), 
      icon: TrendingUp, 
      iconColor: 'bg-primary/10 dark:bg-primary/20 text-primary', 
      badgeText: avg > 0 ? (lang === 'en' ? 'Active' : 'Actif') : '0%', 
      badgeColor: 'text-primary bg-primary/10'
    },
    { 
      title: t('averageHydration'), 
      value: `${hydrationStats.avgMl.toLocaleString(lang === 'en' ? 'en-US' : 'fr-FR')} ml / ${lang === 'en' ? 'day' : 'jour'}`, 
      subtitle: t('hydrationTargetDesc', hydrationStats.overallPercent, hydrationStats.targetMetDays, daysCount), 
      icon: Droplet, 
      iconColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400', 
      badgeText: hydrationStats.overallPercent >= 100 ? (lang === 'en' ? 'Optimal (100%+)' : 'Optimal (100%+)') : hydrationStats.overallPercent >= 75 ? (lang === 'en' ? 'Good' : 'Bien') : (lang === 'en' ? 'Moderate' : 'Modéré'), 
      badgeColor: hydrationStats.overallPercent >= 75 ? 'text-secondary bg-secondary/10' : hydrationStats.overallPercent >= 40 ? 'text-warning bg-warning/10' : 'text-danger bg-danger/10'
    }
  ];

  const formattedSelectedDate = new Date(selectedDate).toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in duration-200">
      
      {/* Header with Custom Date Picker & Period Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-darkBorder transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-textMain tracking-tight">
              {t('statsTitle')}
            </h1>
            <span className="bg-secondary/15 text-[#006E57] dark:text-secondary text-xs font-bold px-2.5 py-0.5 rounded-full">
              {lang === 'en' ? 'Real-time' : 'Temps Réel'}
            </span>
          </div>
          <p className="text-xs text-textMuted mt-1">
            {lang === 'en' ? 'Track your performance history by date or time range.' : "Consultez l'historique exact de vos performances par date ou par période."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          
          {/* Custom Specific Date Picker */}
          <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-2xl border border-gray-200/80 dark:border-darkBorder">
            <CalendarIcon size={14} className="text-primary" />
            <span className="text-xs font-bold text-textMuted hidden sm:inline">Date :</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-textMain focus:outline-none cursor-pointer"
            />
          </div>

          {/* Period Tabs: Today, 3 Days, 7 Days, 30 Days */}
          <div className="flex items-center bg-background p-1 rounded-2xl border border-gray-200/80 dark:border-darkBorder">
            <button
              onClick={() => setTimeRange('Today')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeRange === 'Today' 
                  ? 'bg-card text-textMain shadow-sm' 
                  : 'text-textMuted hover:text-textMain'
              }`}
            >
              {lang === 'en' ? 'Today' : "Aujourd'hui"}
            </button>
            <button
              onClick={() => setTimeRange('3 Days')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeRange === '3 Days' 
                  ? 'bg-card text-textMain shadow-sm' 
                  : 'text-textMuted hover:text-textMain'
              }`}
            >
              3 {lang === 'en' ? 'Days' : 'Jours'}
            </button>
            <button
              onClick={() => setTimeRange('7 Days')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeRange === '7 Days' 
                  ? 'bg-card text-textMain shadow-sm' 
                  : 'text-textMuted hover:text-textMain'
              }`}
            >
              7 {lang === 'en' ? 'Days' : 'Jours'}
            </button>
            <button
              onClick={() => setTimeRange('30 Days')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeRange === '30 Days' 
                  ? 'bg-card text-textMain shadow-sm' 
                  : 'text-textMuted hover:text-textMain'
              }`}
            >
              30 {lang === 'en' ? 'Days' : 'Jours'}
            </button>
          </div>
        </div>
      </div>

      {/* Selected Date Detail Banner */}
      {selectedDate && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
              <Search size={18} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-textMain">
                {t('dateReport', formattedSelectedDate)}
              </h4>
              <p className="text-xs text-textMuted">
                {dateDetail 
                  ? t('scoreDetail', dateDetail.score, dateDetail.completed, dateDetail.total) 
                  : t('noActivityOnDate', selectedDate)}
              </p>
              
              {/* Hydration Specific Evaluation */}
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                  <Droplet size={13} className="fill-blue-500/20" />
                  <span>{t('hydrationDetail', dateDetail?.hydration || 0, '1 925')}</span>
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  (dateDetail?.hydration || 0) >= 1925 
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                    : (dateDetail?.hydration || 0) >= 1000 
                      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30' 
                      : (dateDetail?.hydration || 0) > 0 
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
                        : 'bg-gray-100 dark:bg-darkBorder text-textMuted'
                }`}>
                  {(dateDetail?.hydration || 0) >= 1925 
                    ? t('hydration100Reached') 
                    : (dateDetail?.hydration || 0) > 0 
                      ? t('hydrationPercentOfTarget', Math.round(((dateDetail?.hydration || 0) / 1925) * 100)) 
                      : t('hydrationNotLogged')}
                </span>
              </div>
            </div>
          </div>
          {dateDetail && (
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-primary/10">
              <span className="text-xl font-extrabold text-primary bg-card px-3 py-1.5 rounded-xl border border-primary/20 shadow-sm">
                {dateDetail.score}%
              </span>
              <span className="text-[10px] font-bold text-textMuted uppercase">{t('dailyScoreLabel')}</span>
            </div>
          )}
        </div>
      )}

      {/* 3 Key Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((m, idx) => {
          const IconComp = m.icon;
          return (
            <div key={idx} className="bg-card rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-darkBorder flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-textMuted uppercase tracking-wider">{m.title}</span>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${m.iconColor}`}>
                  <IconComp size={18} />
                </div>
              </div>
              <div className="my-3">
                <div className="text-2xl font-extrabold text-textMain truncate">{m.value}</div>
                <div className="text-xs text-textMuted mt-1">{m.subtitle}</div>
              </div>
              {m.badgeText && (
                <div className="pt-2 border-t border-gray-100 dark:border-darkBorder flex items-center justify-between text-xs">
                  <span className="text-[11px] text-textMuted font-medium">{t('statusLabel')}</span>
                  <span className={`inline-flex items-center gap-0.5 font-bold px-2 py-0.5 rounded-md text-[10px] ${m.badgeColor}`}>
                    <span>{m.badgeText}</span>
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Daily Score & Hydration Interactive Bar Chart */}
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-darkBorder flex flex-col justify-between transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-bold text-base text-textMain">
                {chartMetric === 'score' 
                  ? (timeRange === '7 Days' ? (lang === 'en' ? 'Productivity Score (Mon → Sun)' : 'Score de Productivité (Semaine : Lun → Dim)') : `${t('productivityScoreChart')} (${timeRange})`) 
                  : (timeRange === '7 Days' ? (lang === 'en' ? 'Hydration Volume (Mon → Sun)' : "Volume d'Hydratation (Semaine : Lun → Dim)") : `${t('hydrationVolumeChart')} (${timeRange})`)}
              </h3>
              <p className="text-xs text-textMuted">
                {chartMetric === 'score' 
                  ? t('chartScoreSubtitle') 
                  : t('chartHydrationSubtitle')}
              </p>
            </div>
            
            {/* Toggle Score vs Hydration */}
            <div className="flex items-center bg-background p-1 rounded-xl border border-gray-200/80 dark:border-darkBorder">
              <button
                onClick={() => setChartMetric('score')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  chartMetric === 'score' ? 'bg-primary text-white shadow-sm' : 'text-textMuted hover:text-textMain'
                }`}
              >
                🎯 {lang === 'en' ? 'Score' : 'Score'}
              </button>
              <button
                onClick={() => setChartMetric('hydration')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  chartMetric === 'hydration' ? 'bg-blue-600 text-white shadow-sm' : 'text-textMuted hover:text-textMain'
                }`}
              >
                💧 {lang === 'en' ? 'Water' : 'Eau'}
              </button>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartMetric === 'score' ? (
                <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#8B8BA720" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8B8BA7', fontSize: 12, fontWeight: 600 }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#8B8BA7', fontSize: 12 }} />
                  <Tooltip 
                    formatter={(val) => [`${val}%`, lang === 'en' ? 'Score' : 'Score']}
                    contentStyle={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-main)', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} 
                  />
                  <Bar dataKey="score" fill="#6C63FF" radius={[8, 8, 0, 0]} barSize={28} />
                </BarChart>
              ) : (
                <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#8B8BA720" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8B8BA7', fontSize: 12, fontWeight: 600 }} />
                  <YAxis domain={[0, 2500]} axisLine={false} tickLine={false} tick={{ fill: '#8B8BA7', fontSize: 12 }} />
                  <Tooltip 
                    formatter={(val) => [`${val} ml (${Math.round((val / 1925) * 100)}% ${lang === 'en' ? 'of target' : 'de l\'objectif'})`, t('waterUnit')]}
                    contentStyle={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-main)', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} 
                  />
                  <ReferenceLine y={1925} stroke="#3B82F6" strokeDasharray="4 4" label={{ value: t('targetWaterLabel'), fill: '#3B82F6', fontSize: 10, position: 'top' }} />
                  <Bar dataKey="hydration" fill="#3B82F6" radius={[8, 8, 0, 0]} barSize={28} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Evolution Line Chart */}
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-darkBorder flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-textMain">{t('past4WeeksTitle')}</h3>
              <p className="text-xs text-textMuted">{t('consistencySubtitle')}</p>
            </div>
            <span className="text-xs font-bold text-secondary bg-secondary/15 text-[#006E57] dark:text-secondary px-2.5 py-1 rounded-xl">
              {t('historyBadge')}
            </span>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#8B8BA720" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#8B8BA7', fontSize: 12, fontWeight: 600 }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#8B8BA7', fontSize: 12 }} />
                <Tooltip 
                  formatter={(val) => [`${val}%`, lang === 'en' ? 'Average' : 'Moyenne']}
                  contentStyle={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-main)', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} 
                />
                <Line type="monotone" dataKey="score" stroke="#00D4AA" strokeWidth={3} dot={{ fill: '#00D4AA', r: 5, strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

export default StatsView;