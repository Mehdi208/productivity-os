import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

export const LanguageSlideToggle = ({ className = '' }) => {
  const { lang, setLang } = useLanguage();
  const isEn = lang === 'en';

  const handleToggle = () => {
    setLang(isEn ? 'fr' : 'en');
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Outer Sliding Container */}
      <div 
        onClick={handleToggle}
        className="relative flex items-center bg-gray-100/90 dark:bg-darkCard p-1 rounded-2xl border border-gray-200/80 dark:border-darkBorder cursor-pointer select-none h-9 shadow-inner transition-colors"
        role="radiogroup"
        aria-label="Sélecteur de langue glissant"
      >
        {/* Animated Sliding Background Thumb */}
        <motion.div
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-card dark:bg-primary shadow-sm border border-gray-200/60 dark:border-primary/40 pointer-events-none"
          animate={{
            x: isEn ? 'calc(100% + 4px)' : '0%'
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 35
          }}
        />

        {/* FR Option (Left) */}
        <button
          type="button"
          role="radio"
          aria-checked={!isEn}
          onClick={(e) => {
            e.stopPropagation();
            setLang('fr');
          }}
          className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 h-full text-xs font-black transition-colors cursor-pointer ${
            !isEn 
              ? 'text-primary dark:text-white' 
              : 'text-textMuted hover:text-textMain'
          }`}
        >
          <span className="text-xs">🇫🇷</span>
          <span>FR</span>
          <span className="text-[10px] font-semibold opacity-70 hidden sm:inline">Français</span>
        </button>

        {/* EN Option (Right) */}
        <button
          type="button"
          role="radio"
          aria-checked={isEn}
          onClick={(e) => {
            e.stopPropagation();
            setLang('en');
          }}
          className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 h-full text-xs font-black transition-colors cursor-pointer ${
            isEn 
              ? 'text-primary dark:text-white' 
              : 'text-textMuted hover:text-textMain'
          }`}
        >
          <span className="text-xs">🇬🇧</span>
          <span>EN</span>
          <span className="text-[10px] font-semibold opacity-70 hidden sm:inline">English</span>
        </button>
      </div>
    </div>
  );
};

export default LanguageSlideToggle;
