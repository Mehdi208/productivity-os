// Concentration & Focus techniques catalog with full English and French support
export const FOCUS_TECHNIQUES = [
  {
    id: 'pomodoro_classic',
    name: 'Pomodoro Classic',
    nameFr: 'Pomodoro Classique',
    creator: 'Francesco Cirillo',
    workMinutes: 25,
    breakMinutes: 5,
    longBreakMinutes: 15,
    cyclesBeforeLongBreak: 4,
    color: '#FF4757',
    tag: 'Quick Tasks & Inbox',
    tagFr: 'Tâches rapides & Inbox',
    description: '25 min of high-intensity focus without distractions + 5 min of active recovery. Ideal for initiating action and beating procrastination.',
    descriptionFr: '25 min de focus intense sans distraction + 5 min de pause active. Idéal pour amorcer l\'action et surmonter la procrastination.',
    protocol: [
      'Pick a single, well-defined task',
      'Set the timer for 25 minutes and silence all notifications',
      'Work continuously until the alarm sounds',
      'Take 5 minutes of active rest (stretch, drink water, look away from screens)'
    ],
    protocolFr: [
      'Choisissez une seule tâche précise',
      'Réglez le timer à 25 minutes et éliminez toute notification',
      'Travaillez en continu jusqu\'au signal sonore',
      'Prenez 5 minutes de pause (étirements, eau, regard au loin)'
    ]
  },
  {
    id: 'pomodoro_extended',
    name: 'Pomodoro 50/10',
    nameFr: 'Pomodoro 50/10',
    creator: 'Modern Tech & Design Adaptation',
    workMinutes: 50,
    breakMinutes: 10,
    longBreakMinutes: 20,
    cyclesBeforeLongBreak: 3,
    color: '#6C63FF',
    tag: 'Engineering & Creative Work',
    tagFr: 'Développement & Design',
    description: '50 min of sustained focus + 10 min regeneration pause. Perfect for complex creative tasks and coding that require deep flow.',
    descriptionFr: '50 min de focus soutenu + 10 min de pause de régénération. Parfait pour les tâches créatives et la programmation nécessitant d\'entrer dans le flow.',
    protocol: [
      'Define the deliverable for the 50-minute block',
      'Enter the focus zone with zero tab switching',
      'When the bell rings, step away from your desk for 10 minutes',
      'Hydrate and take a short walk before the next session'
    ],
    protocolFr: [
      'Fixez l\'objectif du bloc de 50 min',
      'Entrez dans la zone de concentration sans basculer d\'onglet',
      'À la sonnerie, levez-vous impérativement pendant 10 minutes',
      'Hydratez-vous et marchez un peu avant la session suivante'
    ]
  },
  {
    id: 'deep_work',
    name: 'Deep Work 90 min (Ultradian Rhythm)',
    nameFr: 'Deep Work 90 min (Rythme Ultradien)',
    creator: 'Cal Newport & Dr. Nathaniel Kleitman',
    workMinutes: 90,
    breakMinutes: 20,
    longBreakMinutes: 30,
    cyclesBeforeLongBreak: 2,
    color: '#00D4AA',
    tag: 'Strategy & High Complexity',
    tagFr: 'Stratégie & Haute complexité',
    description: '90 min of maximum cognitive immersion aligned with the brain\'s natural ultradian cycles + 20 min of total mental rest.',
    descriptionFr: '90 min d\'immersion cognitive maximale alignée sur les cycles ultradiens naturels du cerveau + 20 min de repos complet.',
    protocol: [
      'Define a high-value, complex milestone',
      'Eliminate every interruption (phone in Do Not Disturb mode)',
      'Work in total immersion without multitasking',
      'Take 20 minutes of complete screen-free mental relaxation'
    ],
    protocolFr: [
      'Définissez un livrable clair et complexe',
      'Bannissez toute interruption (téléphone en mode avion)',
      'Travaillez en immersion totale sans multitâche',
      'Pause de 20 min de repos mental (sans écran)'
    ]
  },
  {
    id: 'rule_52_17',
    name: 'The 52 / 17 Rule',
    nameFr: 'Règle des 52 / 17',
    creator: 'DeskTime Productivity Research',
    workMinutes: 52,
    breakMinutes: 17,
    longBreakMinutes: 25,
    cyclesBeforeLongBreak: 3,
    color: '#FFA502',
    tag: 'Endurance & Steady Energy',
    tagFr: 'Endurance & Énergie constante',
    description: '52 min of 100% focused engagement followed by 17 min of complete detachment. Scientifically proven to sustain peak energy levels.',
    descriptionFr: '52 min d\'engagement à 100% suivies de 17 min de déconnexion totale. Reconnue scientifiquement pour maintenir un niveau d\'énergie stable.',
    protocol: [
      'Work with maximum intensity for 52 minutes',
      'Step away from screens completely for 17 minutes',
      'Breathe deeply, walk, and rest your eyes',
      'Resume with renewed clarity and composure'
    ],
    protocolFr: [
      'Travaillez avec intensité maximale pendant 52 min',
      'Coupez immédiatement l\'écran pendant 17 min',
      'Bougez, respirez et reposez vos yeux',
      'Reprenez avec une clarté mentale renouvelée'
    ]
  },
  {
    id: 'timeboxing',
    name: 'Rigorous Timeboxing',
    nameFr: 'Timeboxing Rigoureux',
    creator: 'Elon Musk & Marc Zao-Sanders',
    workMinutes: 45,
    breakMinutes: 15,
    longBreakMinutes: 20,
    cyclesBeforeLongBreak: 4,
    color: '#3B82F6',
    tag: 'Project Milestones & Deadlines',
    tagFr: 'Gestion de projet & Échéances',
    description: 'Allocate a fixed, non-negotiable time window to a task. Parkinson\'s law states that work expands to fill the time available.',
    descriptionFr: 'Allouer un créneau horaire fixe et non négociable à une tâche. La loi de Parkinson indique que le travail s\'étend au temps imparti.',
    protocol: [
      'Lock in the exact slot in your calendar',
      'Stop working precisely when the timer ends',
      'Move onto the next scheduled block with discipline'
    ],
    protocolFr: [
      'Déterminez le créneau exact dans votre calendrier',
      'Arrêtez la tâche exactement à la fin du temps imparti',
      'Passez au bloc suivant selon le planning'
    ]
  }
];

export const getLocalizedTechnique = (tech, lang = 'en') => {
  if (!tech) return FOCUS_TECHNIQUES[0];
  const isFr = lang === 'fr';
  return {
    ...tech,
    name: isFr && tech.nameFr ? tech.nameFr : tech.name,
    tag: isFr && tech.tagFr ? tech.tagFr : tech.tag,
    description: isFr && tech.descriptionFr ? tech.descriptionFr : tech.description,
    protocol: isFr && tech.protocolFr ? tech.protocolFr : tech.protocol,
  };
};

export const recommendFocusTechnique = (taskTitle = '', durationMinutes = 60, lang = 'en') => {
  const lower = (taskTitle || '').toLowerCase();
  let tech = FOCUS_TECHNIQUES[3];
  if (lower.includes('profond') || lower.includes('deep') || lower.includes('strat') || durationMinutes >= 90) {
    tech = FOCUS_TECHNIQUES[2]; // Deep work
  } else if (lower.includes('code') || lower.includes('dev') || lower.includes('design') || lower.includes('project') || lower.includes('projet') || durationMinutes >= 45) {
    tech = FOCUS_TECHNIQUES[1]; // Pomodoro 50/10
  } else if (lower.includes('email') || lower.includes('admin') || lower.includes('task') || lower.includes('tâche') || durationMinutes <= 30) {
    tech = FOCUS_TECHNIQUES[0]; // Pomodoro 25/5
  }
  return getLocalizedTechnique(tech, lang);
};
