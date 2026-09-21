// Smart Scheduler AI — Contextual Chronobiology & Semantic Task Timing Engine
import { checkSlotConflict, minutesToTimeStr } from '../utils/calendarLayout';
import { getAbidjanDateStr } from './scoreHistory';

export const TASK_PROFILES = [
  {
    type: 'deep_work',
    keywords: [
      'code', 'coder', 'dev', 'programmat', 'feature', 'api', 'bug', 'debug',
      'react', 'backend', 'frontend', 'redaction', 'ecrire', 'rapport', 'dossier',
      'memoire', 'these', 'business plan', 'etude', 'recherche', 'analyse',
      'conception', 'strategie', 'architecture', 'comptabilite', 'bilan', 'deep work',
      'focus', 'rediger', 'redaction', 'audit', 'plan', 'design system', 'maquette'
    ],
    defaultDuration: 90, // 1h30
    icon: '🧠',
    labelFr: 'Deep Work & Concentration',
    labelEn: 'Deep Work & Focus',
    reasonFr: 'Tâche cognitive intense : idéale durant le pic d\'énergie mentale matinal ou en milieu d\'après-midi.',
    reasonEn: 'High-cognitive task: best placed during morning peak focus or mid-afternoon.',
    windows: [
      { startH: 8.5, endH: 12, labelFr: 'Pic matinal de concentration (recommandé)', labelEn: 'Morning focus peak (recommended)', weight: 100 },
      { startH: 15, endH: 17.5, labelFr: 'Deuxième pic d\'énergie mentale', labelEn: 'Second focus peak window', weight: 80 },
      { startH: 17.5, endH: 19.5, labelFr: 'Focus fin de journée sans interruption', labelEn: 'Late afternoon quiet focus', weight: 60 }
    ]
  },
  {
    type: 'sport',
    keywords: [
      'sport', 'muscu', 'musculation', 'workout', 'gym', 'fitness', 'course',
      'running', 'jogging', 'marche', 'yoga', 'stretching', 'cardio', 'natation',
      'velo', 'boxe', 'entrainement', 'etirement', 'pompes', 'abdos'
    ],
    defaultDuration: 60, // 1h
    icon: '💪',
    labelFr: 'Sport & Santé Physique',
    labelEn: 'Workout & Fitness',
    reasonFr: 'Activité physique : idéale tôt le matin pour activer le métabolisme ou en fin d\'après-midi pour décompresser.',
    reasonEn: 'Physical workout: ideal early morning or late afternoon to decompress.',
    windows: [
      { startH: 6.5, endH: 8.5, labelFr: 'Boost métabolique matinal (recommandé)', labelEn: 'Morning metabolism boost (recommended)', weight: 95 },
      { startH: 17.5, endH: 20, labelFr: 'Décompression fin de journée (recommandé)', labelEn: 'End of day decompression (recommended)', weight: 100 },
      { startH: 12, endH: 13.5, labelFr: 'Pause midi active', labelEn: 'Active midday break', weight: 70 }
    ]
  },
  {
    type: 'meeting',
    keywords: [
      'appel', 'call', 'reunion', 'meeting', 'zoom', 'teams', 'google meet',
      'point', 'sync', 'briefing', 'client', 'prospect', 'entretien', 'debrief',
      'coaching', 'rendez-vous', 'rdv', 'discussion', 'presentation', 'pitch'
    ],
    defaultDuration: 45, // 45 min
    icon: '📞',
    labelFr: 'Communication & Réunions',
    labelEn: 'Meetings & Sync',
    reasonFr: 'Échange & collaboration : idéal en fin de matinée ou milieu d\'après-midi pour préserver vos créneaux de travail en solitaire.',
    reasonEn: 'Communication: best placed late morning or mid-afternoon to preserve uninterrupted deep focus.',
    windows: [
      { startH: 10.5, endH: 12.5, labelFr: 'Échanges fin de matinée (recommandé)', labelEn: 'Late morning window (recommended)', weight: 90 },
      { startH: 14.5, endH: 17, labelFr: 'Échanges après-midi', labelEn: 'Afternoon meeting window', weight: 85 }
    ]
  },
  {
    type: 'learning',
    keywords: [
      'lecture', 'lire', 'livre', 'book', 'veille', 'formation', 'cours',
      'tuto', 'tutorial', 'podcast', 'anglais', 'langue', 'learn', 'apprendre',
      'documentation', 'article'
    ],
    defaultDuration: 45, // 45 min
    icon: '📖',
    labelFr: 'Apprentissage & Lecture',
    labelEn: 'Learning & Reading',
    reasonFr: 'Développement personnel : propice au calme en soirée ou lors d\'une matinée douce.',
    reasonEn: 'Personal development: best placed in calm evening hours or relaxed early morning.',
    windows: [
      { startH: 19.5, endH: 22, labelFr: 'Calme & assimilation en soirée (recommandé)', labelEn: 'Calm evening assimilation (recommended)', weight: 95 },
      { startH: 7, endH: 8.5, labelFr: 'Inspiration matinale', labelEn: 'Morning inspiration', weight: 80 }
    ]
  },
  {
    type: 'admin',
    keywords: [
      'admin', 'facture', 'papier', 'mail', 'email', 'courrier', 'banque',
      'mutuelle', 'declaration', 'classement', 'tri', 'rangement', 'organisation',
      'planning', 'course', 'achat', 'supermarche', 'pressing', 'menage'
    ],
    defaultDuration: 45, // 45 min
    icon: '📋',
    labelFr: 'Administratif & Logistique',
    labelEn: 'Administrative & Logistics',
    reasonFr: 'Tâche d\'exécution : recommandée en début d\'après-midi (creux digestif) sans entamer votre énergie créative.',
    reasonEn: 'Execution tasks: recommended for early afternoon without draining creative energy.',
    windows: [
      { startH: 13.5, endH: 15.5, labelFr: 'Tâches d\'exécution post-déjeuner (recommandé)', labelEn: 'Post-lunch execution window (recommended)', weight: 90 },
      { startH: 17, endH: 18.5, labelFr: 'Clôture administrative du jour', labelEn: 'End of day admin wrap-up', weight: 85 }
    ]
  },
  {
    type: 'wellness',
    keywords: [
      'meditation', 'respiration', 'pause', 'repos', 'sieste', 'detente',
      'journaling', 'prier', 'priere', 'routine matinale', 'marche digestive'
    ],
    defaultDuration: 30, // 30 min
    icon: '🧘',
    labelFr: 'Bien-être & Récupération',
    labelEn: 'Wellness & Mindfulness',
    reasonFr: 'Régénération mentale : idéal au réveil, en milieu de journée ou pour une transition sereine.',
    reasonEn: 'Mental regeneration: ideal upon waking or for a mindful transition.',
    windows: [
      { startH: 6, endH: 8, labelFr: 'Éveil & intention matinale (recommandé)', labelEn: 'Morning awakening & intention (recommended)', weight: 95 },
      { startH: 13, endH: 14, labelFr: 'Pause régénératrice midi', labelEn: 'Midday recharge break', weight: 80 },
      { startH: 20, endH: 22, labelFr: 'Détente avant le sommeil', labelEn: 'Evening relaxation before sleep', weight: 90 }
    ]
  }
];

export const normalizeSearchText = (str) => {
  if (!str) return '';
  return str.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

export const parseExplicitDuration = (text) => {
  if (!text) return null;
  // Patterns like "1h30", "1h 30", "2h", "2 h"
  const hMinMatch = text.match(/(\d+)\s*h\s*(\d{1,2})?/i);
  if (hMinMatch) {
    const h = parseInt(hMinMatch[1], 10);
    const m = hMinMatch[2] ? parseInt(hMinMatch[2], 10) : 0;
    const total = h * 60 + m;
    if (total >= 15 && total <= 360) return total;
  }
  // Patterns like "45 min", "45min", "30 mins", "20 minutes"
  const minMatch = text.match(/(\d+)\s*(?:min|mins|minutes)\b/i);
  if (minMatch) {
    const m = parseInt(minMatch[1], 10);
    if (m >= 15 && m <= 360) return m;
  }
  return null;
};

export const formatDurationLabel = (min, lang = 'fr') => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0 && m > 0) {
    return lang === 'en' ? `${h}h ${m}m` : `${h}h${m.toString().padStart(2, '0')}`;
  }
  if (h > 0) {
    return `${h}h`;
  }
  return `${m} min`;
};

/**
 * Analyzes task title and subtitle to determine category, realistic duration, and ideal biological windows.
 */
export const analyzeTask = (title = '', subtitle = '') => {
  const fullText = normalizeSearchText(`${title} ${subtitle}`);
  const explicitDuration = parseExplicitDuration(`${title} ${subtitle}`);

  for (const profile of TASK_PROFILES) {
    const matched = profile.keywords.some(kw => fullText.includes(normalizeSearchText(kw)));
    if (matched) {
      const finalDuration = explicitDuration || profile.defaultDuration;
      return {
        ...profile,
        estimatedDurationMin: finalDuration,
        durationLabelFr: formatDurationLabel(finalDuration, 'fr'),
        durationLabelEn: formatDurationLabel(finalDuration, 'en'),
        hasExplicitDuration: Boolean(explicitDuration)
      };
    }
  }

  // Default general task profile
  const defaultDur = explicitDuration || 60;
  return {
    type: 'general',
    defaultDuration: defaultDur,
    estimatedDurationMin: defaultDur,
    durationLabelFr: formatDurationLabel(defaultDur, 'fr'),
    durationLabelEn: formatDurationLabel(defaultDur, 'en'),
    icon: '✨',
    labelFr: 'Tâche & Créneau Calibré',
    labelEn: 'Calibrated Task Slot',
    reasonFr: 'Créneau optimisé pour un avancement ciblé sans fatigue.',
    reasonEn: 'Calibrated slot optimized for steady focused progress.',
    windows: [
      { startH: 9, endH: 12, labelFr: 'Matinée productive (recommandé)', labelEn: 'Productive morning (recommended)', weight: 90 },
      { startH: 14.5, endH: 18, labelFr: 'Créneau d\'après-midi', labelEn: 'Afternoon slot', weight: 80 }
    ],
    hasExplicitDuration: Boolean(explicitDuration)
  };
};

/**
 * Generates up to 3 intelligent, conflict-free, future-only slot propositions.
 */
export const getSmartSlotSuggestions = ({
  title = '',
  subtitle = '',
  targetDate = '',
  existingBlocks = [],
  ignoreBlockId = null,
  dailyRoutines = [],
  isRoutine = false,
  simulatedNow = null
}) => {
  const analysis = analyzeTask(title, subtitle);
  const dur = analysis.estimatedDurationMin;

  // Determine current Abidjan time (UTC+0)
  let nowH, nowM;
  if (simulatedNow) {
    nowH = simulatedNow.h;
    nowM = simulatedNow.m;
  } else {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Africa/Abidjan',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      }).formatToParts(new Date());
      nowH = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
      nowM = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
    } catch {
      const d = new Date();
      nowH = d.getUTCHours();
      nowM = d.getUTCMinutes();
    }
  }

  const todayStr = getAbidjanDateStr();
  const effectiveTargetDate = targetDate || todayStr;
  const isToday = effectiveTargetDate === todayStr && !isRoutine;
  const nowTotalMin = nowH * 60 + nowM;

  // STRICT FUTURE-ONLY FILTER FOR TODAY:
  // If scheduling on today, start strictly in the future with a 10-minute buffer rounded to the next 15-min mark.
  // Never propose past hours (e.g., at 07:00, 05:00-06:00 is forbidden).
  let minAllowedStartMin = 6 * 60; // 06:00 AM minimum opening
  if (isToday) {
    const bufferedNow = nowTotalMin + 10;
    minAllowedStartMin = Math.max(6 * 60, Math.ceil(bufferedNow / 15) * 15);
  }

  const maxDayEndMin = 22 * 60 + 30; // 22:30 PM latest end

  // Collect all occupied blocks
  const blocksToConsider = isRoutine
    ? (Array.isArray(dailyRoutines) ? dailyRoutines : [])
    : (Array.isArray(existingBlocks) ? existingBlocks : []);

  // Generate candidates every 15 minutes
  const candidates = [];

  for (let sMin = minAllowedStartMin; sMin + dur <= maxDayEndMin; sMin += 15) {
    const eMin = sMin + dur;
    const startStr = minutesToTimeStr(sMin);
    const endStr = minutesToTimeStr(eMin);

    const conflict = checkSlotConflict(startStr, endStr, blocksToConsider, ignoreBlockId);
    if (conflict.hasConflict) continue;

    // Score based on task biological windows
    const startHourFloat = sMin / 60;
    let windowScore = 30; // base score for any collision-free slot
    let bestWindowLabelFr = '';
    let bestWindowLabelEn = '';

    for (const w of analysis.windows) {
      if (startHourFloat >= w.startH && (startHourFloat + dur / 60) <= w.endH + 0.5) {
        if (w.weight > windowScore) {
          windowScore = w.weight;
          bestWindowLabelFr = w.labelFr;
          bestWindowLabelEn = w.labelEn;
        }
      }
    }

    // Clean half-hour or top-of-hour ergonomics bonus (:00 and :30 preferred over :15 / :45)
    if (sMin % 60 === 0) windowScore += 8;
    else if (sMin % 30 === 0) windowScore += 5;

    candidates.push({
      start: startStr,
      end: endStr,
      startMin: sMin,
      endMin: eMin,
      durationMin: dur,
      durationLabelFr: analysis.durationLabelFr,
      durationLabelEn: analysis.durationLabelEn,
      score: windowScore,
      windowLabelFr: bestWindowLabelFr,
      windowLabelEn: bestWindowLabelEn
    });
  }

  if (candidates.length === 0) {
    return {
      analysis,
      isToday,
      currentAbidjanTimeStr: `${nowH.toString().padStart(2, '0')}:${nowM.toString().padStart(2, '0')}`,
      minAllowedStartStr: minutesToTimeStr(minAllowedStartMin),
      suggestions: []
    };
  }

  // Rank candidates by score descending, then earlier time
  candidates.sort((a, b) => b.score - a.score || a.startMin - b.startMin);

  // Pick up to 3 diverse options:
  // Option 1: Top scoring optimal candidate
  const optimal = candidates[0];

  // Option 2: Earliest upcoming candidate (distinct from optimal by at least 45 min)
  const earliestCandidates = [...candidates].sort((a, b) => a.startMin - b.startMin);
  const earliest = earliestCandidates.find(c => Math.abs(c.startMin - optimal.startMin) >= 45) || null;

  // Option 3: Candidate in a distinct time phase (Morning vs Afternoon vs Evening)
  const getPhase = (min) => {
    if (min < 12 * 60) return 'morning';
    if (min < 17 * 60) return 'afternoon';
    return 'evening';
  };
  const optimalPhase = getPhase(optimal.startMin);
  const earliestPhase = earliest ? getPhase(earliest.startMin) : null;

  let alternative = candidates.find(c => {
    const p = getPhase(c.startMin);
    return p !== optimalPhase && (!earliest || p !== earliestPhase) && Math.abs(c.startMin - optimal.startMin) >= 60;
  });

  if (!alternative) {
    alternative = candidates.find(c => 
      Math.abs(c.startMin - optimal.startMin) >= 90 && 
      (!earliest || Math.abs(c.startMin - earliest.startMin) >= 60)
    );
  }

  const suggestions = [];

  // 1. Optimal Option
  suggestions.push({
    id: 'optimal',
    tagFr: '🌟 Option Idéale',
    tagEn: '🌟 Best Fit',
    start: optimal.start,
    end: optimal.end,
    durationMin: optimal.durationMin,
    durationLabelFr: optimal.durationLabelFr,
    durationLabelEn: optimal.durationLabelEn,
    reasonFr: optimal.windowLabelFr || analysis.reasonFr,
    reasonEn: optimal.windowLabelEn || analysis.reasonEn,
    isRecommended: true
  });

  // 2. Earliest Option
  if (earliest) {
    suggestions.push({
      id: 'earliest',
      tagFr: '⚡ Plus Rapide',
      tagEn: '⚡ Earliest',
      start: earliest.start,
      end: earliest.end,
      durationMin: earliest.durationMin,
      durationLabelFr: earliest.durationLabelFr,
      durationLabelEn: earliest.durationLabelEn,
      reasonFr: earliest.windowLabelFr || (isToday ? 'Prochain créneau libre disponible' : 'Créneau matinal le plus tôt'),
      reasonEn: earliest.windowLabelEn || (isToday ? 'Earliest upcoming open slot' : 'Earliest open slot'),
      isRecommended: false
    });
  }

  // 3. Alternative Phase Option
  if (alternative) {
    const altPhase = getPhase(alternative.startMin);
    const tagFr = altPhase === 'afternoon' ? '🌤️ Après-midi' : (altPhase === 'evening' ? '🌅 Fin de journée' : '🎯 Matinée');
    const tagEn = altPhase === 'afternoon' ? '🌤️ Afternoon' : (altPhase === 'evening' ? '🌅 End of day' : '🎯 Morning');

    suggestions.push({
      id: 'alternative',
      tagFr,
      tagEn,
      start: alternative.start,
      end: alternative.end,
      durationMin: alternative.durationMin,
      durationLabelFr: alternative.durationLabelFr,
      durationLabelEn: alternative.durationLabelEn,
      reasonFr: alternative.windowLabelFr || 'Créneau équilibré alternatif',
      reasonEn: alternative.windowLabelEn || 'Balanced alternative slot',
      isRecommended: false
    });
  }

  return {
    analysis,
    isToday,
    currentAbidjanTimeStr: `${nowH.toString().padStart(2, '0')}:${nowM.toString().padStart(2, '0')}`,
    minAllowedStartStr: minutesToTimeStr(minAllowedStartMin),
    suggestions
  };
};
