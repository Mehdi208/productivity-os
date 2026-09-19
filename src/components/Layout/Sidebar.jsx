import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Columns, Folder, BarChart2, Sparkles, Plus, RefreshCw, Flame, Award, HelpCircle, Globe } from 'lucide-react';
import { NotificationBadgeButton } from '../ui/NotificationBannerPrompt';
import { useLanguage } from '../../context/LanguageContext';

const Sidebar = ({ onNewTask, syncStatus = 'synced', lastSyncTime = '', onForceSync, onOpenTour, hasUnreadMonthlyRecap = false }) => {
  const { lang, toggleLanguage, t } = useLanguage();

  const navItems = [
    { name: t('navToday'), path: '/', icon: Calendar },
    { name: t('navWeek'), path: '/week', icon: Columns },
    { name: t('navProjects'), path: '/projects', icon: Folder },
    { name: t('navStats'), path: '/stats', icon: BarChart2 },
    { name: t('navMonthlyReview'), path: '/monthly-review', icon: Sparkles, badge: hasUnreadMonthlyRecap ? '1er' : null },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-background border-r border-gray-200/60 dark:border-darkBorder min-h-screen p-5 pb-24 select-none flex-shrink-0 transition-colors duration-300">
      
      {/* Redesigned Elegant Profile Card */}
      <div className="mb-4 p-4 rounded-3xl bg-card border border-gray-200/80 dark:border-darkBorder shadow-sm flex flex-col gap-3 transition-colors">
        {/* Identity row */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary via-purple-600 to-pink-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-primary/25 flex-shrink-0 ring-2 ring-primary/20">
            M
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-black tracking-wider uppercase text-primary block leading-none">
              {t('appName')}
            </span>
            <h2 className="font-extrabold text-textMain text-sm leading-tight truncate mt-1" title={t('userName')}>
              {t('userName')}
            </h2>
            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 dark:bg-primary/20 px-2 py-0.5 text-[9px] font-bold text-primary max-w-full">
                <Award size={10} className="flex-shrink-0" />
                <span className="truncate">{t('badgeTag')}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action / Notification quick bar */}
        <div className="pt-2.5 border-t border-gray-100 dark:border-darkBorder flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider">
            {lang === 'en' ? 'Alerts' : 'Alertes'}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-2 py-1 rounded-xl bg-background hover:border-primary border border-gray-200/70 dark:border-darkBorder text-[10px] font-black text-textMain flex items-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer"
              title={lang === 'en' ? 'Passer en Français' : 'Switch to English'}
              aria-label="Changer de langue"
            >
              <Globe size={11} className="text-primary" />
              <span>{lang.toUpperCase()}</span>
            </button>
            <NotificationBadgeButton isCompact={false} />
          </div>
        </div>
      </div>

      {/* Cloud Sync Live Status Bar */}
      <div className="mb-4 flex items-center justify-between bg-card p-2.5 rounded-2xl border border-gray-200/80 dark:border-darkBorder text-xs shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${syncStatus === 'synced' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : syncStatus === 'syncing' ? 'bg-amber-500 animate-ping' : 'bg-slate-400'}`} />
          <div className="min-w-0">
            <span className="text-[11px] font-extrabold text-textMain block leading-tight truncate">
              {syncStatus === 'synced' ? t('syncLive') : syncStatus === 'syncing' ? t('syncing') : t('syncOffline')}
            </span>
            {lastSyncTime && (
              <span className="text-[9px] text-textMuted block font-medium">
                {lastSyncTime}
              </span>
            )}
          </div>
        </div>
        <button 
          onClick={onForceSync}
          title={t('refreshSync')}
          className="text-textMuted hover:text-primary p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <RefreshCw size={12} className={syncStatus === 'syncing' ? 'animate-spin text-primary' : ''} />
        </button>
      </div>

      {/* Special Challenge 30 Days Card Highlight (CONSERVED FOR MEHDI) */}
      <NavLink
        to="/challenge"
        className={({ isActive }) => 
          `mb-4 p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-2.5 group ${
            isActive 
              ? 'bg-gradient-to-r from-amber-500/20 to-primary/20 border-amber-500/50 shadow-md ring-2 ring-amber-400/20' 
              : 'bg-gradient-to-r from-amber-500/10 to-primary/10 border-amber-500/30 hover:border-amber-500/60'
          }`
        }
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-110 transition-transform">
            <Flame size={16} className="animate-pulse" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-textMain leading-tight truncate">Mission Septembre</h4>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">30 Jours / 1 Web App</span>
          </div>
        </div>
        <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-md flex-shrink-0 shadow-sm">
          J-30
        </span>
      </NavLink>

      {/* New Task Action Button */}
      <button 
        onClick={onNewTask} 
        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm shadow-primary/25 transition-all duration-200 mb-4 active:scale-[0.98] text-xs"
      >
        <Plus size={18} strokeWidth={2.5} />
        <span>{t('newTask')}</span>
      </button>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink 
              key={item.name} 
              to={item.path} 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary text-white shadow-sm shadow-primary/20 scale-[1.02]' 
                    : 'text-textMuted hover:text-textMain hover:bg-gray-100/80 dark:hover:bg-darkCard'
                }`
              }
            >
              <Icon size={16} strokeWidth={2.5} />
              <span className="flex-1 truncate">{item.name}</span>
              {item.badge && (
                <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-full shadow-sm animate-pulse flex-shrink-0">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Desktop Preferences Bar (Language & Tour) */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-darkBorder space-y-2">
        {/* Language Switch */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="w-full p-2.5 rounded-2xl border border-gray-200/80 dark:border-darkBorder bg-card hover:border-primary/50 dark:hover:border-primary/50 flex items-center justify-between text-xs font-bold text-textMain transition-all active:scale-[0.98] shadow-xs group cursor-pointer"
          title={lang === 'en' ? 'Passer en Français' : 'Switch to English'}
          aria-label="Changer de langue"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Globe size={13} />
            </div>
            <span className="truncate">{lang === 'en' ? 'Language' : 'Langue'}</span>
          </div>
          <span className="px-2 py-0.5 rounded-lg bg-background border border-gray-200/70 dark:border-darkBorder text-[11px] font-extrabold text-primary flex items-center gap-1 shadow-xs">
            {lang === 'en' ? 'English' : 'Français'}
          </span>
        </button>

        {/* App Guide / Tour Trigger */}
        <button
          onClick={onOpenTour}
          className="w-full p-2.5 rounded-2xl border border-gray-200/80 dark:border-darkBorder bg-card hover:bg-gray-100 dark:hover:bg-darkCard flex items-center gap-2 text-textMuted hover:text-textMain text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer"
          title={t('navTutorial')}
        >
          <HelpCircle size={15} className="text-primary flex-shrink-0" />
          <span className="truncate">{t('navTutorial')}</span>
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;
