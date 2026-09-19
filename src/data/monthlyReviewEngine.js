// Monthly Review Engine — Data Aggregator & AI Diagnostic Generator
import { loadScoreHistory } from './scoreHistory';

/**
 * Returns an array of available month keys (e.g. ['2026-09', '2026-08']) found in history or recent past
 */
export const getAvailableMonths = () => {
  const history = loadScoreHistory();
  const monthsSet = new Set();

  // Extract from existing history
  Object.keys(history).forEach((dateStr) => {
    if (typeof dateStr === 'string' && dateStr.length >= 7) {
      monthsSet.add(dateStr.substring(0, 7));
    }
  });

  // Always ensure current month and previous month are in the list
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  monthsSet.add(currentMonthKey);
  monthsSet.add(prevMonthKey);

  // Sort descending (most recent first)
  return Array.from(monthsSet).sort().reverse();
};

/**
 * Formats a month key (YYYY-MM) into human friendly name (e.g. "Septembre 2026")
 */
export const formatMonthLabel = (monthKey, lang = 'fr') => {
  if (!monthKey || monthKey.length < 7) return monthKey;
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  const locale = lang === 'en' ? 'en-US' : 'fr-FR';
  const name = date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  return name.charAt(0).toUpperCase() + name.slice(1);
};

/**
 * Returns previous month key (e.g. if given '2026-09', returns '2026-08')
 */
export const getPreviousMonthKey = (monthKey) => {
  const [year, month] = monthKey.split('-').map(Number);
  const prevDate = new Date(year, month - 2, 1);
  return `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Consolidates all metrics for a given monthKey ('YYYY-MM')
 */
export const computeMonthlyMetrics = (monthKey, projects = []) => {
  const history = loadScoreHistory();
  const [year, month] = monthKey.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  let totalScore = 0;
  let recordedDaysCount = 0;
  let totalTasksCompleted = 0;
  let totalTasksScheduled = 0;
  let totalHydrationMl = 0;
  let daysMetHydration = 0;
  let currentStreakInMonth = 0;
  let maxStreakInMonth = 0;

  const dailyScores = [];
  const weeks = [
    { weekIndex: 1, label: 'Semaine 1', scores: [] },
    { weekIndex: 2, label: 'Semaine 2', scores: [] },
    { weekIndex: 3, label: 'Semaine 3', scores: [] },
    { weekIndex: 4, label: 'Semaine 4+', scores: [] },
  ];

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = `${monthKey}-${String(day).padStart(2, '0')}`;
    const entry = history[dayStr];

    if (entry && entry.score !== undefined) {
      recordedDaysCount++;
      totalScore += entry.score;
      totalTasksCompleted += entry.completed || 0;
      totalTasksScheduled += entry.total || 0;
      totalHydrationMl += entry.hydration || 0;

      if ((entry.hydration || 0) >= 1925) {
        daysMetHydration++;
      }

      if (entry.score >= 50) {
        currentStreakInMonth++;
        if (currentStreakInMonth > maxStreakInMonth) {
          maxStreakInMonth = currentStreakInMonth;
        }
      } else {
        currentStreakInMonth = 0;
      }

      dailyScores.push({ date: dayStr, day, score: entry.score, completed: entry.completed || 0, hydration: entry.hydration || 0 });

      // Group by weeks
      const weekIdx = Math.min(3, Math.floor((day - 1) / 7));
      weeks[weekIdx].scores.push(entry.score);
    } else {
      currentStreakInMonth = 0;
      dailyScores.push({ date: dayStr, day, score: null, completed: 0, hydration: 0 });
    }
  }

  // Averages
  const avgScore = recordedDaysCount > 0 ? Math.round(totalScore / recordedDaysCount) : 0;
  const avgHydration = recordedDaysCount > 0 ? Math.round(totalHydrationMl / recordedDaysCount) : 0;
  const completionRate = totalTasksScheduled > 0 ? Math.round((totalTasksCompleted / totalTasksScheduled) * 100) : 0;
  const hydrationSuccessRate = recordedDaysCount > 0 ? Math.round((daysMetHydration / recordedDaysCount) * 100) : 0;

  // Weekly Averages
  const weeklyTrends = weeks.map(w => {
    const avg = w.scores.length > 0 ? Math.round(w.scores.reduce((a, b) => a + b, 0) / w.scores.length) : 0;
    return {
      label: w.label,
      averageScore: avg,
      daysRecorded: w.scores.length
    };
  });

  // Projects closed during this month
  const closedProjects = (projects || []).filter(p => {
    if (p.completedAt && typeof p.completedAt === 'string') {
      return p.completedAt.startsWith(monthKey);
    }
    return false;
  });

  // Subtasks completed in projects
  let subtasksCompletedCount = 0;
  (projects || []).forEach(p => {
    (p.subtasks || []).forEach(st => {
      if (st.completed || st.status === 'done') {
        subtasksCompletedCount++;
      }
    });
  });

  return {
    monthKey,
    daysInMonth,
    recordedDaysCount,
    avgScore,
    totalTasksCompleted,
    totalTasksScheduled,
    completionRate,
    avgHydration,
    hydrationSuccessRate,
    maxStreakInMonth,
    closedProjectsCount: closedProjects.length,
    closedProjects,
    subtasksCompletedCount,
    weeklyTrends,
    dailyScores
  };
};

/**
 * AI Performance Diagnostic & Goal Acceleration Generator
 */
export const generateAIMonthlyCoaching = (metrics, lang = 'fr') => {
  const { avgScore, completionRate, avgHydration, maxStreakInMonth, recordedDaysCount } = metrics;
  const isFr = lang === 'fr';

  // 1. Performance Tier & Tone
  let tier = 'solid';
  let badge = isFr ? 'Solide & En Progression' : 'Solid & Growing';
  let color = '#3B82F6';

  if (avgScore >= 80 || (completionRate >= 85 && recordedDaysCount >= 10)) {
    tier = 'elite';
    badge = isFr ? 'Performance Élite 🏆' : 'Elite Performance 🏆';
    color = '#10B981';
  } else if (avgScore >= 60 || completionRate >= 65) {
    tier = 'solid';
    badge = isFr ? 'Régularité Établie ⚡' : 'Established Consistency ⚡';
    color = '#3B82F6';
  } else if (recordedDaysCount > 0) {
    tier = 'developing';
    badge = isFr ? 'Phase de Consolidation 🔄' : 'Consolidation Phase 🔄';
    color = '#F59E0B';
  } else {
    tier = 'fresh';
    badge = isFr ? 'Nouveau Mois Prêt à Décoller 🚀' : 'New Month Ready to Launch 🚀';
    color = '#8B5CF6';
  }

  // 2. Executive Summary
  let summary = '';
  if (isFr) {
    if (tier === 'elite') {
      summary = `Un mois exceptionnel ! Avec une moyenne de productivité de ${avgScore}% et un taux de complétion de ${completionRate}%, vous avez maintenu une intensité d'exécution remarquable. Votre discipline a directement accéléré vos grands jalons.`;
    } else if (tier === 'solid') {
      summary = `Bilan très encourageant ! Vous avez validé ${metrics.totalTasksCompleted} créneaux ce mois-ci avec une efficacité de ${completionRate}%. Les bases sont fermement posées ; la clé du mois à venir sera d'éliminer les petites pertes d'élan en milieu de semaine.`;
    } else if (tier === 'developing') {
      summary = `Mois de construction et d'apprentissage. Avec un score moyen de ${avgScore}%, vous avez posé des actions concrètes. Le diagnostic met en lumière un besoin d'automatiser vos routines pour éviter la surcharge mentale.`;
    } else {
      summary = `Le mois démarre sur une feuille vierge ! C'est le moment idéal pour verrouiller vos créneaux clés, calibrer vos priorités et installer des habitudes à haute valeur ajoutée.`;
    }
  } else {
    if (tier === 'elite') {
      summary = `An exceptional month! With an average productivity score of ${avgScore}% and a ${completionRate}% completion rate, you maintained outstanding focus. Your consistency directly accelerated your main milestones.`;
    } else if (tier === 'solid') {
      summary = `Very encouraging performance! You completed ${metrics.totalTasksCompleted} focus slots this month with ${completionRate}% efficiency. Key foundations are set; next month's breakthrough relies on reducing mid-week friction.`;
    } else {
      summary = `A month of foundation building. Your ${avgScore}% average demonstrates real progress. The main AI focus is automating daily routines to prevent cognitive fatigue.`;
    }
  }

  // 3. Top Strengths (3 Points Forts)
  const strengths = [];
  if (isFr) {
    if (completionRate >= 70 || metrics.totalTasksCompleted >= 15) {
      strengths.push({
        title: 'Capacité d’Exécution & Rigueur',
        description: `Vous avez complété ${metrics.totalTasksCompleted} sessions de travail planifiées, confirmant votre capacité à abattre du travail concret.`
      });
    } else {
      strengths.push({
        title: 'Prise en main des Outils',
        description: 'Maintien d’une vision claire de vos projets et de votre calendrier sur l’ensemble de vos créneaux.'
      });
    }

    if (avgHydration >= 1500) {
      strengths.push({
        title: 'Discipline Énergétique & Hydratation',
        description: `Excellente moyenne de ${avgHydration} ml/jour, garantissant un niveau de clarté cognitive et d'endurance élevé.`
      });
    } else {
      strengths.push({
        title: 'Gestion des Priorités Stratégiques',
        description: 'Capacité à identifier les urgences et à orienter l’effort sur les tâches créatrices de valeur.'
      });
    }

    if (maxStreakInMonth >= 3) {
      strengths.push({
        title: 'Momentum & Série Positive',
        description: `Meilleure série de ${maxStreakInMonth} jours consécutifs au-dessus de 50%, gage d'une dynamique durable.`
      });
    } else {
      strengths.push({
        title: 'Résilience & Réactivité',
        description: 'Capacité de relance rapide après chaque imprévu ou interruption d’agenda.'
      });
    }
  } else {
    strengths.push({
      title: 'Execution Discipline',
      description: `Completed ${metrics.totalTasksCompleted} scheduled slots with steady commitment to personal standards.`
    });
    strengths.push({
      title: 'Energy & Cognitive Focus',
      description: `Sustained an average of ${avgHydration} ml/day hydration, supporting sharp mental stamina.`
    });
    strengths.push({
      title: 'Goal Momentum',
      description: `Peak consistency streak of ${maxStreakInMonth} consecutive high-performance days.`
    });
  }

  // 4. Priority Effort Points to Progress (3 Points d'Efforts pour progresser)
  const priorityEfforts = [];
  if (isFr) {
    if (completionRate < 80) {
      priorityEfforts.push({
        tag: 'Focus & Agenda',
        title: 'Protéger 1 Créneau Deep Work Inviolable le Matin',
        action: 'Réservez votre créneau de 09h00 à 10h30 sans notification ni message pour liquider votre tâche la plus difficile de la journée.'
      });
    } else {
      priorityEfforts.push({
        tag: 'Optimisation',
        title: 'Monter le Niveau de Complexité des Tâches',
        action: 'Votre régularité est excellente : déléguez ou réduisez les micro-tâches pour vous consacrer aux 20% d’actions qui produisent 80% des résultats.'
      });
    }

    if (avgHydration < 1925) {
      priorityEfforts.push({
        tag: 'Énergie & Corps',
        title: 'Verrouiller le Palier des 1 925 ml d’Eau',
        action: 'Placez une bouteille pleine sur votre bureau dès le réveil et validez votre première prise de 500 ml avant 10h00.'
      });
    } else {
      priorityEfforts.push({
        tag: 'Constance',
        title: 'Stabiliser la Transition Fin de Semaine',
        action: 'Anticipez le vendredi après-midi en préparant le plan du lundi matin pour démarrer la semaine sans inertie.'
      });
    }

    priorityEfforts.push({
      tag: 'Livraison & Résultats',
      title: 'Accélérer la Clôture Définitive des Projets',
      action: 'Découpez chaque grand projet en micro-jalons de 45 minutes maximum pour transformer les "En cours" en "Terminé" plus rapidement.'
    });
  } else {
    priorityEfforts.push({
      tag: 'Deep Work',
      title: 'Shield Morning Focus Window',
      action: 'Protect a distraction-free 90-minute morning deep work block for your highest-leverage priority.'
    });
    priorityEfforts.push({
      tag: 'Energy',
      title: 'Lock Daily 1,925 ml Hydration Target',
      action: 'Start with 500 ml upon waking to fuel early cognitive clarity.'
    });
    priorityEfforts.push({
      tag: 'Velocity',
      title: 'Accelerate Project Completion Cycle',
      action: 'Break open projects into 45-minute sprint items to convert progress into shipped deliverables.'
    });
  }

  // 5. Recommended Attack Plan for New Month
  const newMonthGoals = isFr ? [
    { id: 'g1', text: 'Atteindre un score moyen de productivité supérieur à 75%', target: '75%+' },
    { id: 'g2', text: 'Boucler et livrer au moins 1 projet majeur (statut Done)', target: '1 Projet' },
    { id: 'g3', text: 'Maintenir une série de 7 jours consécutifs d’objectifs atteints', target: '7 Jours' }
  ] : [
    { id: 'g1', text: 'Achieve an average monthly score above 75%', target: '75%+' },
    { id: 'g2', text: 'Ship and close at least 1 major project (Done status)', target: '1 Project' },
    { id: 'g3', text: 'Reach a 7-day unbroken high-performance streak', target: '7 Days' }
  ];

  return {
    tier,
    badge,
    color,
    summary,
    strengths,
    priorityEfforts,
    newMonthGoals
  };
};
