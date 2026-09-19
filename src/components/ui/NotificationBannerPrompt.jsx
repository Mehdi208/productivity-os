import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Check, X, Sparkles } from 'lucide-react';
import { 
  isNotificationSupported, 
  getNotificationPermission, 
  requestNotificationPermission, 
  testNotification 
} from '../../utils/notificationService';
import { useLanguage } from '../../context/LanguageContext';

export const NotificationBadgeButton = ({ className = '', isCompact = false }) => {
  const { t } = useLanguage();
  const [permission, setPermission] = useState('default');
  const [isTesting, setIsTesting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!isNotificationSupported()) return;
    setPermission(getNotificationPermission());
  }, []);

  if (!isNotificationSupported()) return null;

  const handleEnable = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      setIsTesting(true);
      await testNotification();
      setIsTesting(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    await testNotification();
    setIsTesting(false);
  };

  return (
    <div className={`relative inline-block max-w-full ${className}`}>
      <button
        type="button"
        onClick={() => {
          if (permission !== 'granted') {
            handleEnable();
          } else {
            setShowMenu(prev => !prev);
          }
        }}
        className={`rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 border max-w-full ${
          isCompact ? 'w-8 h-8 p-0 flex-shrink-0' : 'px-2 py-1'
        } ${
          permission === 'granted'
            ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
            : 'bg-primary/10 dark:bg-primary/20 text-primary border-primary/30 hover:bg-primary/20'
        }`}
        title={permission === 'granted' ? t('notifBadgeTitleActive') : t('notifBadgeTitleEnable')}
      >
        {permission === 'granted' ? (
          <>
            <BellRing size={13} className="text-emerald-500 animate-pulse flex-shrink-0" />
            {!isCompact && <span className="text-[10px] font-bold truncate">{t('notifBadgeActive')}</span>}
          </>
        ) : (
          <div className="relative flex items-center min-w-0">
            <Bell size={13} className="text-primary flex-shrink-0" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary absolute -top-0.5 -right-0.5 animate-pulse" />
            {!isCompact && <span className="text-[10px] font-bold truncate ml-1">{t('notifBadgeEnable')}</span>}
          </div>
        )}
      </button>

      {/* Dropdown menu when already granted */}
      {showMenu && permission === 'granted' && (
        <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-32px)] bg-card dark:bg-darkCard rounded-2xl p-3 shadow-2xl border border-gray-200 dark:border-darkBorder z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-darkBorder mb-2">
            <div className="flex items-center gap-1.5 font-bold text-textMain dark:text-darkTextMain">
              <Check size={14} className="text-emerald-500" />
              <span>{t('notifMenuTitle')}</span>
            </div>
            <button onClick={() => setShowMenu(false)} className="text-textMuted hover:text-textMain">✕</button>
          </div>
          <p className="text-[11px] text-textMuted dark:text-darkTextMuted mb-3 leading-relaxed">
            {t('notifMenuDesc')}
          </p>
          <button
            type="button"
            onClick={async () => {
              await handleTest();
              setShowMenu(false);
            }}
            disabled={isTesting}
            className="w-full py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Sparkles size={13} />
            <span>{isTesting ? t('notifMenuSending') : t('notifMenuTestBtn')}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export const NotificationBannerPrompt = () => {
  const { t } = useLanguage();
  const [permission, setPermission] = useState('default');
  const [dismissed, setDismissed] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    if (!isNotificationSupported()) return;
    const current = getNotificationPermission();
    setPermission(current);

    const dismissedUntil = localStorage.getItem('pos_emmanuella_notif_prompt_dismissed');
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      setDismissed(true);
    }
  }, []);

  if (!isNotificationSupported() || permission === 'granted' || dismissed) {
    return null;
  }

  const handleEnable = async () => {
    setIsActivating(true);
    const res = await requestNotificationPermission();
    setPermission(res);
    setIsActivating(false);
    if (res === 'granted') {
      await testNotification();
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Dismiss for 7 days
    localStorage.setItem('pos_emmanuella_notif_prompt_dismissed', (Date.now() + 7 * 86400000).toString());
  };

  return (
    <div className="bg-gradient-to-r from-primary/15 via-primary/5 to-secondary/15 border border-primary/30 dark:border-primary/40 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-in fade-in duration-300">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
          <BellRing size={18} className="animate-bounce" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-textMain dark:text-darkTextMain flex items-center gap-2">
            <span>{t('notifBannerTitle')}</span>
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
              {t('notifBannerBadge')}
            </span>
          </h4>
          <p className="text-[11px] text-textMuted dark:text-darkTextMuted mt-0.5 leading-relaxed">
            {t('notifBannerDesc')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-shrink-0">
        <button
          type="button"
          onClick={handleDismiss}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-textMuted hover:text-textMain hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          {t('notifBannerDismiss')}
        </button>

        <button
          type="button"
          onClick={handleEnable}
          disabled={isActivating}
          className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/20 flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <Bell size={13} />
          <span>{isActivating ? t('notifBannerActivating') : t('notifBannerEnable')}</span>
        </button>
      </div>
    </div>
  );
};
