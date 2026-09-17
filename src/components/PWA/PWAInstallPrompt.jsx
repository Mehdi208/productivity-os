import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share, PlusSquare, Check, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const PWAInstallModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIosDevice);

    // Capture Android beforeinstallprompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        onClose();
      }
      setDeferredPrompt(null);
    } else if (!isIOS) {
      alert('To install, open your browser menu (three dots) and tap "Install app" or "Add to Home screen".');
    }
  };

  const handleDismiss = () => {
    // Dismiss for 7 days
    try {
      localStorage.setItem('pos_pwa_dismissed', (Date.now() + 7 * 86400000).toString());
    } catch {
      // ignore
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-card w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-darkBorder relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-primary/30 flex-shrink-0">
              <Smartphone size={24} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base text-textMain leading-tight">
                  {isIOS ? t('installModalTitle') : t('installAndroidTitle')}
                </h3>
              </div>
              <p className="text-xs text-textMuted mt-0.5 font-medium">
                {isIOS ? t('installModalSubtitle') : t('installAndroidDesc')}
              </p>
            </div>
          </div>

          <button 
            onClick={handleDismiss}
            className="p-1.5 rounded-full text-textMuted hover:text-textMain hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={t('close')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {isIOS ? (
          <div className="space-y-3 my-2">
            {/* Step 1 */}
            <div className="bg-background/80 p-3.5 rounded-2xl border border-gray-100 dark:border-darkBorder flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 font-bold">
                <Share size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-textMain">{t('installStep1Title')}</h4>
                <p className="text-[11px] text-textMuted mt-0.5">{t('installStep1Desc')}</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-background/80 p-3.5 rounded-2xl border border-gray-100 dark:border-darkBorder flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0 font-bold">
                <PlusSquare size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-textMain">{t('installStep2Title')}</h4>
                <p className="text-[11px] text-textMuted mt-0.5">{t('installStep2Desc')}</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-background/80 p-3.5 rounded-2xl border border-gray-100 dark:border-darkBorder flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold">
                <Check size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-textMain">{t('installStep3Title')}</h4>
                <p className="text-[11px] text-textMuted mt-0.5">{t('installStep3Desc')}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 py-3 px-4 rounded-2xl border border-gray-200 dark:border-darkBorder text-xs font-bold text-textMuted hover:text-textMain transition-all"
              >
                {t('pwaAutoLater')}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-extrabold py-3 px-4 rounded-2xl text-xs shadow-md shadow-primary/25 transition-all active:scale-95"
              >
                {t('installGotIt')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 my-3">
            <p className="text-xs text-textMuted leading-relaxed">
              {t('installAndroidDesc')}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-darkBorder text-xs font-bold text-textMuted hover:text-textMain"
              >
                {t('pwaAutoLater')}
              </button>
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-extrabold py-3 px-4 rounded-2xl text-xs shadow-md shadow-primary/25 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Download size={15} />
                <span>{t('installNow')}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Auto welcome prompt triggered on arrival for mobile/browser visitors not running in standalone PWA
export const PWAInstallPrompt = ({ onOpenModal }) => {
  const [showAutoModal, setShowAutoModal] = useState(false);

  useEffect(() => {
    // 1. Check if running in standalone mode (already installed)
    const isStandaloneMode = 
      (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || 
      (typeof window !== 'undefined' && window.navigator && window.navigator.standalone) || 
      (typeof document !== 'undefined' && document.referrer && document.referrer.includes('android-app://'));

    if (isStandaloneMode) {
      return;
    }

    // 2. Check dismissal preference
    const dismissedUntil = localStorage.getItem('pos_pwa_dismissed');
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      return;
    }

    // 3. Trigger automatically after 1.5s delay
    const timer = setTimeout(() => {
      setShowAutoModal(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <PWAInstallModal 
      isOpen={showAutoModal} 
      onClose={() => setShowAutoModal(false)} 
    />
  );
};

export default PWAInstallPrompt;
