// Collection of impactful quotes on focus, discipline, and personal growth with bilingual support
export const DAILY_QUOTES = [
  {
    quote: "Concentration is the root of all higher abilities in man.",
    quoteFr: "La concentration est la racine de toutes les capacités supérieures chez l'homme.",
    author: "Bruce Lee",
    role: "Martial Arts Master & Philosopher",
    roleFr: "Maître des arts martiaux & Philosophe",
    theme: "Focus & Mastery",
    themeFr: "Focus & Maîtrise"
  },
  {
    quote: "You do not rise to the level of your goals. You fall to the level of your systems.",
    quoteFr: "Ce que vous faites tous les jours compte plus que ce que vous faites de temps en temps.",
    author: "James Clear",
    role: "Author of 'Atomic Habits'",
    roleFr: "Auteur de 'Atomic Habits'",
    theme: "Discipline & Habits",
    themeFr: "Discipline & Habitudes"
  },
  {
    quote: "Deep work is the superpower of the 21st century in an economy saturated with distractions.",
    quoteFr: "Le travail profond (Deep Work) est la superpuissance du 21e siècle dans une économie saturée de distractions.",
    author: "Cal Newport",
    role: "Professor & Author of 'Deep Work'",
    roleFr: "Professeur & Auteur de 'Deep Work'",
    theme: "Deep Concentration",
    themeFr: "Concentration profonde"
  },
  {
    quote: "Clarity precedes mastery. What gets measured gets improved.",
    quoteFr: "La clarté précède la maîtrise. Ce qui est mesuré est amélioré.",
    author: "Robin Sharma",
    role: "Author of 'The 5 AM Club'",
    roleFr: "Auteur de 'Le Club des 5h du matin'",
    theme: "Morning Productivity",
    themeFr: "Productivité matinale"
  },
  {
    quote: "It is not because things are difficult that we do not dare; it is because we do not dare that they are difficult.",
    quoteFr: "Ce n'est pas parce que les choses sont difficiles que nous n'osons pas, c'est parce que nous n'osons pas qu'elles sont difficiles.",
    author: "Seneca",
    role: "Stoic Philosopher",
    roleFr: "Philosophe Stoïcien",
    theme: "Resilience & Action",
    themeFr: "Résilience & Action"
  },
  {
    quote: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    quoteFr: "Vous n'avez de pouvoir que sur votre esprit, pas sur les événements extérieurs. Comprenez cela et vous trouverez la force.",
    author: "Marcus Aurelius",
    role: "Roman Emperor & Stoic",
    roleFr: "Empereur romain & Stoïcien",
    theme: "Self-Mastery",
    themeFr: "Maîtrise de soi"
  },
  {
    quote: "Deciding to do what you must do to achieve what you truly desire is the real secret of success.",
    quoteFr: "La décision de faire ce que l'on ne veut pas faire pour obtenir ce que l'on a toujours voulu est le secret de la réussite.",
    author: "Brian Tracy",
    role: "Time Management Expert ('Eat That Frog')",
    roleFr: "Expert en gestion du temps ('Avalez le crapaud')",
    theme: "Prioritization",
    themeFr: "Priorisation"
  },
  {
    quote: "Simplicity is the ultimate sophistication. Eliminate the unnecessary so the necessary may speak.",
    quoteFr: "La simplicité est la sophistication suprême. Éliminez le superflu pour faire briller l'essentiel.",
    author: "Steve Jobs",
    role: "Apple Co-Founder",
    roleFr: "Co-fondateur d'Apple",
    theme: "Eliminating Distraction",
    themeFr: "Élimination des distractions"
  },
  {
    quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    quoteFr: "L'excellence n'est pas un acte, mais une habitude.",
    author: "Aristotle",
    role: "Greek Philosopher",
    roleFr: "Philosophe grec",
    theme: "Consistency",
    themeFr: "Constance"
  },
  {
    quote: "The way to get started is to quit talking and begin doing.",
    quoteFr: "La façon de commencer est d'arrêter de parler et de commencer à faire.",
    author: "Walt Disney",
    role: "Visionary & Creator",
    roleFr: "Visionnaire & Créateur",
    theme: "Immediate Action",
    themeFr: "Action immédiate"
  },
  {
    quote: "Don't count the days, make the days count.",
    quoteFr: "Ne comptez pas les jours, faites que les jours comptent.",
    author: "Muhammad Ali",
    role: "Legendary Athlete & Champion",
    roleFr: "Légende du sport",
    theme: "Daily Focus",
    themeFr: "Intensité journalière"
  }
];

export const getDailyQuote = (lang = 'en') => {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const index = dayOfYear % DAILY_QUOTES.length;
  const item = DAILY_QUOTES[index];
  const isFr = lang === 'fr';

  return {
    quote: isFr && item.quoteFr ? item.quoteFr : item.quote,
    author: item.author,
    role: isFr && item.roleFr ? item.roleFr : item.role,
    theme: isFr && item.themeFr ? item.themeFr : item.theme,
  };
};
