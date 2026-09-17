import React from 'react';
import { AnimatedThemeToggler } from '../ui/animated-theme-toggler';

const ThemeToggle = ({ isDark, onToggle, className = '' }) => {
  return (
    <AnimatedThemeToggler 
      isDark={isDark} 
      onToggle={onToggle} 
      className={className} 
    />
  );
};

export default ThemeToggle;
