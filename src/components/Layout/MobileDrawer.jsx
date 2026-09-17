import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  X, Calendar, Columns, Folder, BarChart2, Play, Sparkles, 
  HelpCircle, Smartphone, Trash2, Sun, Moon, Globe, RefreshCw,
  Award, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

const MobileDrawer = ({ 
  isOpen, 
  onClose, 
  isDark, 
  onToggleTheme, 
  onOpenFocus, 
  onOpenBriefing, 
  onOpenCoach,
  onOpenTour,
  onOpenInstall,
  onClearSchedule,
  syncStatus,
  lastSyncTime,
  onForceSync
}) => {
  const { lang, toggleLanguage, t } = useLanguage();

  const navLinks = [
    { name: t('navToday'), path: '/', icon: Calendar },
    { name: t('navWeek'), path: '/week', icon: Columns },
    { name: t('navProjects'), path: '/projects', icon: Folder },
    { name: t('navStats'), path: '/stats', icon: BarChart2 },
    { name: t('navChallenge'), path: '/challenge', icon: Flame, isSpecial: true },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop with slow-motion fluid fade */}
          <motion.div 
            key="mobile-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-colors" 
            onClick={onClose} 
          />

          {/* Slide-in Drawer Container with slow-motion fluid deceleration */}
          <motion.div 
            key="mobile-drawer-panel"
            initial={{ x: '100%', opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.8 }}
            transition={{
              duration: 0.75, // Slow-motion 750ms fluid entrance
              ease: [0.16, 1, 0.3, 1] // Custom quintic ease-out for ultra-smooth gliding deceleration
            }}
            className="relative w-[85%] max-w-sm bg-card h-full shadow-2xl border-l border-gray-100 dark:border-darkBorder flex flex-col justify-between p-5 z-10 overflow-y-auto"
          >
        
        {/* Top Header: Profile & Close */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-darkBorder">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-pink-500 text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-primary/25 flex-shrink-0">
                M
              </div>
              <div className="min-w-0">
                <h2 className="font-extrabold text-sm text-textMain leading-tight truncate">
                  {t('appName')}
                </h2>
                <p className="text-xs text-textMuted font-medium truncate">
                  {t('userName')}
                </p>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-pink-500/10 dark:bg-pink-500/20 px-2 py-0.5 text-[9px] font-bold text-pink-600 dark:text-pink-300">
                  <Award size={10} /> {t('badgeTag')}
                </span>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-textMuted hover:text-textMain hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={t('close')}
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Preferences Row: Language & Theme */}
          <div className="grid grid-cols-2 gap-2 my-4">
            {/* Language Switch */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-gray-200 dark:border-darkBorder bg-background hover:border-primary text-xs font-bold text-textMain transition-all active:scale-95 shadow-sm"
              title="Change language"
            >
              <Globe size={15} className="text-primary" />
              <span>{lang === 'en' ? '🇬🇧 English' : '🇫🇷 Français'}</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-gray-200 dark:border-darkBorder bg-background hover:border-primary text-xs font-bold text-textMain transition-all active:scale-95 shadow-sm"
              title={isDark ? t('themeLight') : t('themeDark')}
            >
              {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-600" />}
              <span>{isDark ? t('themeLight') : t('themeDark')}</span>
            </button>
          </div>

          {/* Install on iPhone / Mobile CTA */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenInstall && onOpenInstall();
            }}
            className="w-full mb-4 p-3 rounded-2xl bg-gradient-to-r from-primary/15 via-violet-500/15 to-pink-500/15 border border-primary/30 flex items-center justify-between gap-3 text-left hover:border-primary transition-all active:scale-95 group shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Smartphone size={16} />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-textMain block leading-tight">
                  {t('navInstall')}
                </span>
                <span className="text-[10px] text-primary font-medium">Add to Home Screen</span>
              </div>
            </div>
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-md">iOS</span>
          </button>

          {/* Navigation Links */}
          <div className="space-y-1 mb-4">
            <span className="text-[10px] font-extrabold text-textMuted uppercase tracking-wider px-2 block mb-1">
              Navigation
            </span>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={onClose}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-primary text-white shadow-sm shadow-primary/30' 
                        : 'text-textMuted hover:text-textMain hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  <Icon size={17} />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Productivity Utilities */}
          <div className="space-y-1 mb-4">
            <span className="text-[10px] font-extrabold text-textMuted uppercase tracking-wider px-2 block mb-1">
              Tools & Focus
            </span>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFocus && onOpenFocus();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-textMain hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Play size={16} className="text-primary fill-primary" />
              <span>{t('navFocus')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBriefing && onOpenBriefing();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-textMain hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Sparkles size={16} className="text-amber-500" />
              <span>{t('navBriefing')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenTour && onOpenTour();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-textMain hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <HelpCircle size={16} className="text-indigo-500" />
              <span>{t('navTutorial')}</span>
            </button>
          </div>
        </div>

        {/* Bottom Section: Clear Schedule & Cloud Sync */}
        <div className="pt-4 border-t border-gray-100 dark:border-darkBorder space-y-3">
          {/* Clear Schedule Action */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (window.confirm(t('navResetConfirm'))) {
                onClearSchedule && onClearSchedule();
              }
            }}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs text-rose-500 hover:bg-rose-500/10 font-bold transition-colors"
          >
            <Trash2 size={14} />
            <span>{t('navClearSchedule')}</span>
          </button>

          {/* Cloud Sync Status */}
          <div className="flex items-center justify-between bg-background p-2.5 rounded-xl border border-gray-100 dark:border-darkBorder text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${syncStatus === 'synced' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : syncStatus === 'syncing' ? 'bg-amber-500 animate-ping' : 'bg-slate-400'}`} />
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-textMain block truncate">
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
              className="text-textMuted hover:text-primary p-1 rounded-lg transition-colors"
            >
              <RefreshCw size={13} className={syncStatus === 'syncing' ? 'animate-spin text-primary' : ''} />
            </button>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
  );
};

export default MobileDrawer;
