import React, { useState } from 'react';
import { Sparkles, Calendar, CheckCircle2, Folder, Zap, X, ChevronRight, ChevronLeft, Award } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const OnboardingModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      icon: Sparkles,
      iconBg: 'from-pink-500 to-violet-600',
      title: t('tourStep1Title'),
      desc: t('tourStep1Desc'),
      tip: 'Entrepreneur & High Performance ⚡'
    },
    {
      icon: Calendar,
      iconBg: 'from-blue-500 to-indigo-600',
      title: t('tourStep2Title'),
      desc: t('tourStep2Desc'),
      tip: 'Daily Score & Hydration'
    },
    {
      icon: CheckCircle2,
      iconBg: 'from-emerald-500 to-teal-600',
      title: t('tourStep3Title'),
      desc: t('tourStep3Desc'),
      tip: 'Time Blocking Made Easy'
    },
    {
      icon: Folder,
      iconBg: 'from-amber-500 to-orange-600',
      title: t('tourStep4Title'),
      desc: t('tourStep4Desc'),
      tip: 'Milestones & Subtasks'
    },
    {
      icon: Zap,
      iconBg: 'from-purple-500 to-pink-600',
      title: t('tourStep5Title'),
      desc: t('tourStep5Desc'),
      tip: 'Deep Work & Productivity'
    }
  ];

  const step = steps[currentStep];
  const IconComponent = step.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="bg-card w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 dark:border-darkBorder relative flex flex-col justify-between max-h-[90vh] overflow-y-auto">
        
        {/* Top bar: Skip & Close */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep 
                    ? 'w-6 bg-primary' 
                    : idx < currentStep 
                      ? 'w-3 bg-primary/40' 
                      : 'w-2 bg-gray-200 dark:bg-darkBorder'
                }`}
              />
            ))}
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-textMuted hover:text-textMain hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={t('close')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Card */}
        <div className="my-auto py-2 text-center flex flex-col items-center">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr ${step.iconBg} text-white flex items-center justify-center shadow-lg shadow-primary/25 mb-4 animate-in zoom-in-95 duration-200`}>
            <IconComponent size={32} className="sm:size-9" />
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 dark:bg-primary/20 px-3 py-1 rounded-full mb-2">
            <Award size={12} /> {step.tip}
          </span>

          <h3 className="text-xl sm:text-2xl font-extrabold text-textMain tracking-tight mb-2.5">
            {step.title}
          </h3>

          <p className="text-sm text-textMuted leading-relaxed max-w-xs">
            {step.desc}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-darkBorder flex items-center justify-between gap-3">
          {currentStep > 0 ? (
            <button
              onClick={handlePrev}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-darkBorder text-textMain font-bold text-xs flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-95"
            >
              <ChevronLeft size={16} />
              <span>{t('tourPrev')}</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="text-xs text-textMuted hover:text-textMain font-medium px-2 py-2 transition-colors"
            >
              {t('tourSkip')}
            </button>
          )}

          <button
            onClick={handleNext}
            className="flex-1 sm:flex-initial bg-primary hover:bg-primary/90 text-white font-extrabold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs shadow-md shadow-primary/25 transition-all active:scale-95"
          >
            <span>{currentStep === steps.length - 1 ? t('tourFinish') : t('tourNext')}</span>
            <ChevronRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default OnboardingModal;
