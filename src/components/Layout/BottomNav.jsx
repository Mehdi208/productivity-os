import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Columns, Folder, BarChart2, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const BottomNav = ({ onOpenCoach }) => {
  const { t } = useLanguage();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-darkBorder px-3 py-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex items-center justify-around z-40 shadow-2xl select-none transition-colors">
      
      {/* 1. Today Tab */}
      <NavLink 
        to="/" 
        className={({ isActive }) => 
          `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 ${
            isActive 
              ? 'text-primary font-bold scale-105' 
              : 'text-textMuted hover:text-textMain'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className={`p-1.5 rounded-xl ${isActive ? 'bg-primary/15' : ''}`}>
              <Calendar size={19} />
            </div>
            <span className="text-[10px] mt-0.5 font-bold tracking-tight">{t('navToday')}</span>
          </>
        )}
      </NavLink>

      {/* 2. Week Tab */}
      <NavLink 
        to="/week" 
        className={({ isActive }) => 
          `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 ${
            isActive 
              ? 'text-primary font-bold scale-105' 
              : 'text-textMuted hover:text-textMain'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className={`p-1.5 rounded-xl ${isActive ? 'bg-primary/15' : ''}`}>
              <Columns size={19} />
            </div>
            <span className="text-[10px] mt-0.5 font-bold tracking-tight">{t('navWeek')}</span>
          </>
        )}
      </NavLink>

      {/* 3. Center Priority Coach Trigger Button */}
      <button 
        type="button"
        onClick={onOpenCoach}
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 -mt-3 text-white active:scale-95 group"
        title="AI Coach"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
          <Sparkles size={18} className="animate-pulse text-white" />
        </div>
        <span className="text-[10px] mt-0.5 font-extrabold text-primary">{t('navCoach')}</span>
      </button>

      {/* 4. Projects Tab */}
      <NavLink 
        to="/projects" 
        className={({ isActive }) => 
          `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 ${
            isActive 
              ? 'text-primary font-bold scale-105' 
              : 'text-textMuted hover:text-textMain'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className={`p-1.5 rounded-xl ${isActive ? 'bg-primary/15' : ''}`}>
              <Folder size={19} />
            </div>
            <span className="text-[10px] mt-0.5 font-bold tracking-tight">{t('navProjects')}</span>
          </>
        )}
      </NavLink>

      {/* 5. Stats Tab */}
      <NavLink 
        to="/stats" 
        className={({ isActive }) => 
          `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 ${
            isActive 
              ? 'text-primary font-bold scale-105' 
              : 'text-textMuted hover:text-textMain'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className={`p-1.5 rounded-xl ${isActive ? 'bg-primary/15' : ''}`}>
              <BarChart2 size={19} />
            </div>
            <span className="text-[10px] mt-0.5 font-bold tracking-tight">{t('navStats')}</span>
          </>
        )}
      </NavLink>

    </nav>
  );
};

export default BottomNav;