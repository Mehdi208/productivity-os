import React, { useState, useEffect, useMemo } from 'react';
import { 
  Flame, Target, Calendar, Clock, Trophy, CheckCircle2, Circle, 
  Plus, Trash2, Edit3, ArrowRight, TrendingUp, Users, Building, 
  PhoneCall, FileText, Sparkles, AlertCircle, Award, BookOpen, 
  ChevronDown, ChevronUp, Share2, CheckSquare, ExternalLink, ShieldCheck,
  MapPin, DollarSign, Zap, Check, Gift, BarChart3,
  CalendarDays, UserCheck, UserX, UserMinus, PhoneForwarded, MessageSquare,
  History, ArrowUpRight, ArrowDownRight, Activity, X, Printer, Archive
} from 'lucide-react';

// Timezone Helper: Côte d'Ivoire (Africa/Abidjan, UTC+0 / GMT)
export const getAbidjanDateStr = () => {
  const now = new Date();
  return new Intl.DateTimeFormat('fr-CA', {
    timeZone: 'Africa/Abidjan',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now); // YYYY-MM-DD
};

export const getAbidjanDateDisplay = (dateStr) => {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  } catch (e) {
    return dateStr;
  }
};

export const getMonthNameDisplay = (monthKey) => {
  try {
    const [yearStr, monthStr] = monthKey.split('-');
    const year = parseInt(yearStr, 10) || 2026;
    const month = parseInt(monthStr, 10) || 9;
    const date = new Date(year, month - 1, 1);
    const str = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return str.charAt(0).toUpperCase() + str.slice(1);
  } catch (e) {
    return monthKey;
  }
};

export const getRoadmapWeeksForMonth = (monthKey) => {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10) || 2026;
  const month = parseInt(monthStr, 10) || 9;
  const lastDay = new Date(year, month, 0).getDate();
  const date = new Date(year, month - 1, 1);
  const rawMonthName = date.toLocaleDateString('fr-FR', { month: 'short' });
  const monthShort = rawMonthName.charAt(0).toUpperCase() + rawMonthName.slice(1);

  return [
    {
      id: `${monthKey}_w1_2`,
      title: `Semaines 1 & 2 (1 - 15 ${monthShort}) : Prospection Massive, Visites & Démos Directes`,
      subtitle: 'Objectif : 50+ contacts qualifiés, visites physiques, 5 à 8 démos live de dashboard',
      isCurrent: true,
      tasks: [
        { id: `wt_${monthKey}_1`, title: 'Lister 50 PME, cliniques, commerces et agences cibles en Côte d\'Ivoire', completed: false, isCustom: false },
        { id: `wt_${monthKey}_2`, title: 'Préparer un dashboard démo interactif sur PC/tablette prêt à être montré', completed: false, isCustom: false },
        { id: `wt_${monthKey}_3`, title: 'Réaliser 25 premiers appels directs & visites de terrain', completed: false, isCustom: false },
        { id: `wt_${monthKey}_4`, title: 'Présenter la démo live aux décideurs / gérants avec l\'offre 30k F/mois', completed: false, isCustom: false },
        { id: `wt_${monthKey}_5`, title: 'Obtenir 3 à 5 accords d\'intérêt pour transmission de propositions', completed: false, isCustom: false }
      ]
    },
    {
      id: `${monthKey}_w3`,
      title: `Semaine 3 (16 - 22 ${monthShort}) : Négociations, Relances & Signature / Acompte`,
      subtitle: 'Objectif : Relances stratégiques, négociation ferme et encaissement du 1er mois ou de l\'année',
      isCurrent: false,
      tasks: [
        { id: `wt_${monthKey}_6`, title: 'Relancer les décideurs par WhatsApp / appels directs et visites de suivi', completed: false, isCustom: false },
        { id: `wt_${monthKey}_7`, title: 'Valider le choix de paiement : 30 000 F/mois OU 300 000 F pour l\'année', completed: false, isCustom: false },
        { id: `wt_${monthKey}_8`, title: 'Finaliser l\'accord financier et signer le bon de commande / contrat', completed: false, isCustom: false },
        { id: `wt_${monthKey}_9`, title: 'Encaisser le paiement initial (Feu vert officiel pour la réalisation !)', completed: false, isCustom: false }
      ]
    },
    {
      id: `${monthKey}_w4`,
      title: `Semaine 4 (23 - ${lastDay} ${monthShort}) : Build Éclair (1-2 Jours), Déploiement & Livraison Client`,
      subtitle: 'Objectif : Dashboard codé et déployé en sprint express (1-2j), démo finale & prise en main',
      isCurrent: false,
      tasks: [
        { id: `wt_${monthKey}_10`, title: 'Sprint de développement express (Frontend, Backend, BDD) en 1 à 2 jours', completed: false, isCustom: false },
        { id: `wt_${monthKey}_11`, title: 'Déploiement en ligne et tests des fonctionnalités du dashboard', completed: false, isCustom: false },
        { id: `wt_${monthKey}_12`, title: 'Présentation de l\'application fonctionnelle au client & remise des accès', completed: false, isCustom: false },
        { id: `wt_${monthKey}_13`, title: 'Validation triomphale du Challenge 30 Jours B2B ! 🏆', completed: false, isCustom: false }
      ]
    }
  ];
};

export const calculateChallengeStats = (dailyLogs = [], prospects = [], todayDateStr = '') => {
  const totalDaysLogged = dailyLogs.length;

  // Strict mathematical sums
  const totalInterested = dailyLogs.reduce((sum, l) => sum + (l.interestedCount || 0), 0);
  const totalCallback = dailyLogs.reduce((sum, l) => sum + (l.callbackCount || 0), 0);
  const totalRefused = dailyLogs.reduce((sum, l) => sum + (l.refusedCount || 0), 0);
  const totalUnreachable = dailyLogs.reduce((sum, l) => sum + (l.unreachableCount || 0), 0);

  // TOTAL CONTACTED = EXACT SUM OF ALL OUTCOMES
  const totalContacted = totalInterested + totalCallback + totalRefused + totalUnreachable;

  const conversionRate = totalContacted > 0 ? Math.round((totalInterested / totalContacted) * 100) : 0;
  const callbackRate = totalContacted > 0 ? Math.round((totalCallback / totalContacted) * 100) : 0;
  const refusalRate = totalContacted > 0 ? Math.round((totalRefused / totalContacted) * 100) : 0;
  const unreachableRate = totalContacted > 0 ? Math.round((totalUnreachable / totalContacted) * 100) : 0;

  // Today's log in Abidjan
  const todayLog = dailyLogs.find(l => l.date === todayDateStr) || {
    date: todayDateStr,
    contactedCount: 0,
    interestedCount: 0,
    callbackCount: 0,
    refusedCount: 0,
    unreachableCount: 0
  };

  // Sort logs descending by date for history
  const sortedLogs = [...dailyLogs].sort((a, b) => b.date.localeCompare(a.date));
  const yesterdayLog = sortedLogs.find(l => l.date < todayDateStr) || null;

  // Monthly Target (200 contacts)
  const monthlyGoal = 200;
  const monthlyProgressPercent = Math.min(100, Math.round((totalContacted / monthlyGoal) * 100));

  // Pipeline Analytics
  const wonProspects = prospects.filter(p => p.status === 'won');
  const meetingProspects = prospects.filter(p => p.status === 'meeting');
  const proposalProspects = prospects.filter(p => p.status === 'proposal');

  // Revenue Generated strictly DURING the challenge
  const totalCashEarned = wonProspects.reduce((sum, p) => {
    if (p.pricingModel === 'yearly') return sum + 300000;
    return sum + 30000;
  }, 0);

  const mrrGained = wonProspects.reduce((sum, p) => {
    if (p.pricingModel === 'monthly') return sum + 30000;
    return sum + 25000; // 300k/year = 25k/month
  }, 0);

  return {
    totalDaysLogged,
    totalContacted,
    totalInterested,
    totalCallback,
    totalRefused,
    totalUnreachable,
    conversionRate,
    callbackRate,
    refusalRate,
    unreachableRate,
    todayLog,
    yesterdayLog,
    monthlyGoal,
    monthlyProgressPercent,
    wonProspects,
    meetingProspects,
    proposalProspects,
    totalCashEarned,
    mrrGained
  };
};

const Challenge30Days = ({ 
  challengeData = {}, 
  onUpdateChallenge,
  onScheduleChallengeRdv
}) => {
  // Current Date in Côte d'Ivoire (Abidjan)
  const todayAbidjanStr = getAbidjanDateStr();
  const currentRealMonthKey = todayAbidjanStr.substring(0, 7); // e.g. '2026-09' or '2026-10'

  // Default to October once October 1st arrives, otherwise September 2026
  const [selectedMonthKey, setSelectedMonthKey] = useState(() => {
    return currentRealMonthKey >= '2026-10' ? '2026-10' : '2026-09';
  });

  // Editions map with automatic backward-compatible migration of legacy data
  const [editions, setEditions] = useState(() => {
    const rawEditions = (challengeData && challengeData.editions) ? challengeData.editions : {};

    // 1. Septembre 2026 edition (migrates top-level legacy fields if present)
    const sepLogs = rawEditions['2026-09']?.dailyLogs || challengeData.dailyLogs || [];
    const sepProspects = rawEditions['2026-09']?.prospects || challengeData.prospects || [];
    const sepWeeks = rawEditions['2026-09']?.weeksData || challengeData.weeksData || getRoadmapWeeksForMonth('2026-09');

    const sepEdition = {
      monthKey: '2026-09',
      name: 'Challenge Septembre 2026',
      dailyLogs: sepLogs.filter(l => l.id !== 'log_2026_09_01'),
      prospects: sepProspects.filter(p => p.id !== 'p_1' && p.id !== 'p_2'),
      weeksData: sepWeeks
    };

    // 2. Octobre 2026 edition (starts pristine when October arrives or when previewed)
    const octEdition = rawEditions['2026-10'] || {
      monthKey: '2026-10',
      name: 'Challenge Octobre 2026',
      dailyLogs: [],
      prospects: [],
      weeksData: getRoadmapWeeksForMonth('2026-10')
    };

    return {
      ...rawEditions,
      '2026-09': sepEdition,
      '2026-10': octEdition
    };
  });

  // Keep editions in sync with cloud mutations if challengeData updates from outside
  useEffect(() => {
    if (challengeData?.editions && typeof challengeData.editions === 'object') {
      setEditions(prev => ({
        ...prev,
        ...challengeData.editions
      }));
    }
  }, [challengeData?.editions]);

  // Active edition dataset for the selected month
  const activeEdition = editions[selectedMonthKey] || {
    monthKey: selectedMonthKey,
    name: getMonthNameDisplay(selectedMonthKey),
    dailyLogs: [],
    prospects: [],
    weeksData: getRoadmapWeeksForMonth(selectedMonthKey)
  };

  const [dailyLogs, setDailyLogs] = useState(() => activeEdition.dailyLogs || []);
  const [prospects, setProspects] = useState(() => activeEdition.prospects || []);
  const [weeksData, setWeeksData] = useState(() => activeEdition.weeksData || getRoadmapWeeksForMonth(selectedMonthKey));

  // Date Configuration for the selected month
  const monthConfig = useMemo(() => {
    const [yearStr, monthStr] = selectedMonthKey.split('-');
    const year = parseInt(yearStr, 10) || 2026;
    const month = parseInt(monthStr, 10) || 9;
    const lastDay = new Date(year, month, 0).getDate();
    const startDate = new Date(year, month - 1, 1, 0, 0, 0);
    const endDate = new Date(year, month - 1, lastDay, 23, 59, 59);
    const monthName = getMonthNameDisplay(selectedMonthKey);

    const isPastMonth = todayAbidjanStr > `${yearStr}-${monthStr.padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    const isCurrentMonth = todayAbidjanStr.startsWith(`${yearStr}-${monthStr.padStart(2, '0')}`);
    const isFutureMonth = todayAbidjanStr < `${yearStr}-${monthStr.padStart(2, '0')}-01`;

    const now = new Date();
    const nowMs = now.getTime();
    const startMs = startDate.getTime();
    const endMs = endDate.getTime();
    const totalDurationMs = Math.max(1, endMs - startMs);

    let currentDayNumber = 1;
    let daysRemaining = lastDay;
    let progressPercent = 0;

    if (isPastMonth) {
      currentDayNumber = lastDay;
      daysRemaining = 0;
      progressPercent = 100;
    } else if (isCurrentMonth) {
      currentDayNumber = Math.min(lastDay, Math.max(1, Math.floor((nowMs - startMs) / (1000 * 60 * 60 * 24)) + 1));
      daysRemaining = Math.max(0, Math.ceil((endMs - nowMs) / (1000 * 60 * 60 * 24)));
      progressPercent = Math.min(100, Math.max(0, Math.round(((nowMs - startMs) / totalDurationMs) * 100)));
    } else {
      currentDayNumber = 1;
      daysRemaining = lastDay;
      progressPercent = 0;
    }

    return {
      year,
      month,
      lastDay,
      startDate,
      endDate,
      monthName,
      isPastMonth,
      isCurrentMonth,
      isFutureMonth,
      currentDayNumber,
      daysRemaining,
      progressPercent
    };
  }, [selectedMonthKey, todayAbidjanStr]);

  const { 
    currentDayNumber, 
    daysRemaining, 
    isPastMonth, 
    isCurrentMonth, 
    isFutureMonth, 
    monthName, 
    lastDay,
    progressPercent 
  } = monthConfig;

  // Selected date in the active journal
  const [selectedDate, setSelectedDate] = useState(() => {
    if (todayAbidjanStr.startsWith(selectedMonthKey)) {
      return todayAbidjanStr;
    }
    return `${selectedMonthKey}-01`;
  });

  // Switch active dataset and date clamp when switching month edition
  useEffect(() => {
    const ed = editions[selectedMonthKey] || {
      monthKey: selectedMonthKey,
      dailyLogs: [],
      prospects: [],
      weeksData: getRoadmapWeeksForMonth(selectedMonthKey)
    };
    setDailyLogs(ed.dailyLogs || []);
    setProspects(ed.prospects || []);
    setWeeksData(ed.weeksData || getRoadmapWeeksForMonth(selectedMonthKey));

    if (todayAbidjanStr.startsWith(selectedMonthKey)) {
      setSelectedDate(todayAbidjanStr);
    } else {
      setSelectedDate(`${selectedMonthKey}-01`);
    }
  }, [selectedMonthKey]);

  // Sub-Pages / Navigation Tabs
  const [activeSubPage, setActiveSubPage] = useState('journal'); // 'journal' | 'analytics' | 'pipeline' | 'roadmap' | 'verdict' | 'reporting'

  // State for adding custom tasks to roadmap
  const [addingTaskWeekId, setAddingTaskWeekId] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Form for adding or editing an individual interaction / RDV
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [editingInteractionId, setEditingInteractionId] = useState(null);
  const [interactionForm, setInteractionForm] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    location: '',
    status: 'interested', // 'interested' | 'callback' | 'refused' | 'unreachable'
    appointmentDate: '',
    appointmentStartTime: '10:00',
    appointmentEndTime: '11:30',
    callbackDate: '',
    notes: '',
    pricingModel: 'monthly'
  });

  // Synchronize state with parent (LocalStorage + Firestore push)
  const syncChanges = (newLogs, newProspects, newWeeks) => {
    const updatedEdition = {
      ...activeEdition,
      monthKey: selectedMonthKey,
      name: getMonthNameDisplay(selectedMonthKey),
      dailyLogs: newLogs,
      prospects: newProspects,
      weeksData: newWeeks
    };

    const updatedEditions = {
      ...editions,
      [selectedMonthKey]: updatedEdition
    };

    setEditions(updatedEditions);

    if (onUpdateChallenge) {
      onUpdateChallenge({
        ...challengeData,
        editions: updatedEditions,
        // Mirror to top-level for backward compatibility if editing the real active month
        dailyLogs: selectedMonthKey === currentRealMonthKey ? newLogs : (challengeData.dailyLogs || newLogs),
        prospects: selectedMonthKey === currentRealMonthKey ? newProspects : (challengeData.prospects || newProspects),
        weeksData: selectedMonthKey === currentRealMonthKey ? newWeeks : (challengeData.weeksData || newWeeks)
      });
    }
  };

  // Active Month Stats
  const stats = useMemo(() => {
    return calculateChallengeStats(dailyLogs, prospects, todayAbidjanStr);
  }, [dailyLogs, prospects, todayAbidjanStr]);

  // Septembre 2026 Stats (for archiving and comparative analysis)
  const sepStats = useMemo(() => {
    const sep = editions['2026-09'];
    return calculateChallengeStats(sep?.dailyLogs || [], sep?.prospects || [], '2026-09-30');
  }, [editions]);

  // Octobre 2026 Stats (for archiving and comparative analysis)
  const octStats = useMemo(() => {
    const oct = editions['2026-10'];
    return calculateChallengeStats(oct?.dailyLogs || [], oct?.prospects || [], todayAbidjanStr);
  }, [editions, todayAbidjanStr]);

  // Current active day log
  // Current active day log
  const currentDayLog = dailyLogs.find(l => l.date === selectedDate) || {
    id: `log_${selectedDate}`,
    date: selectedDate,
    dateDisplay: getAbidjanDateDisplay(selectedDate),
    dayNum: currentDayNumber,
    targetGoal: 10,
    contactedCount: 0,
    interestedCount: 0,
    callbackCount: 0,
    refusedCount: 0,
    unreachableCount: 0,
    notes: '',
    interactions: []
  };

  // Open modal in create mode
  const handleOpenNewInteraction = () => {
    setEditingInteractionId(null);
    setInteractionForm({
      companyName: '',
      contactPerson: '',
      phone: '',
      location: '',
      status: 'interested',
      appointmentDate: '',
      appointmentStartTime: '10:00',
      appointmentEndTime: '11:30',
      callbackDate: '',
      notes: '',
      pricingModel: 'monthly'
    });
    setShowInteractionModal(true);
  };

  // Open modal specifically to schedule an appointment
  const handleOpenScheduleRdvModal = (initialData = {}) => {
    setEditingInteractionId(null);
    setInteractionForm({
      companyName: initialData.companyName || initialData.name || '',
      contactPerson: initialData.contactPerson || initialData.contact || '',
      phone: initialData.phone || '',
      location: initialData.location || '',
      status: 'interested',
      appointmentDate: initialData.appointmentDate || selectedDate,
      appointmentStartTime: initialData.appointmentStartTime || '10:00',
      appointmentEndTime: initialData.appointmentEndTime || '11:30',
      callbackDate: '',
      notes: initialData.notes || initialData.need || '',
      pricingModel: initialData.pricingModel || 'monthly'
    });
    setShowInteractionModal(true);
  };

  // Open modal in edit mode
  const handleOpenEditInteraction = (int) => {
    setEditingInteractionId(int.id);
    setInteractionForm({
      companyName: int.companyName || '',
      contactPerson: int.contactPerson || '',
      phone: int.phone || '',
      location: int.location || '',
      status: int.status || 'interested',
      appointmentDate: int.appointmentDate || '',
      appointmentStartTime: int.appointmentStartTime || '10:00',
      appointmentEndTime: int.appointmentEndTime || '11:30',
      callbackDate: int.callbackDate || '',
      notes: int.notes || '',
      pricingModel: int.pricingModel || 'monthly'
    });
    setShowInteractionModal(true);
  };

  // Save (Create or Update) individual interaction / discussion to current day log
  const handleSaveInteraction = (e) => {
    e.preventDefault();
    if (!interactionForm.companyName.trim()) return;

    let updatedLogs;
    if (editingInteractionId) {
      // EDIT MODE: Update existing interaction
      updatedLogs = dailyLogs.map(l => {
        if (l.date !== selectedDate) return l;
        const currentInteractions = l.interactions || [];
        const updatedInteractions = currentInteractions.map(i => {
          if (i.id !== editingInteractionId) return i;
          return {
            ...i,
            ...interactionForm
          };
        });

        // Recompute strict metrics
        const intCount = updatedInteractions.filter(i => i.status === 'interested').length;
        const cbCount = updatedInteractions.filter(i => i.status === 'callback').length;
        const refCount = updatedInteractions.filter(i => i.status === 'refused').length;
        const unreachCount = updatedInteractions.filter(i => i.status === 'unreachable').length;
        const totalCount = intCount + cbCount + refCount + unreachCount;

        return {
          ...l,
          contactedCount: totalCount,
          interestedCount: intCount,
          callbackCount: cbCount,
          refusedCount: refCount,
          unreachableCount: unreachCount,
          interactions: updatedInteractions
        };
      });
    } else {
      // CREATE MODE: Add new interaction
      const newInt = {
        id: `int_${Date.now()}`,
        ...interactionForm
      };

      const exists = dailyLogs.some(l => l.date === selectedDate);
      if (exists) {
        updatedLogs = dailyLogs.map(l => {
          if (l.date !== selectedDate) return l;
          const currentInteractions = l.interactions || [];
          const updatedInteractions = [newInt, ...currentInteractions];
          
          const intCount = updatedInteractions.filter(i => i.status === 'interested').length;
          const cbCount = updatedInteractions.filter(i => i.status === 'callback').length;
          const refCount = updatedInteractions.filter(i => i.status === 'refused').length;
          const unreachCount = updatedInteractions.filter(i => i.status === 'unreachable').length;
          const totalCount = intCount + cbCount + refCount + unreachCount;

          return {
            ...l,
            contactedCount: totalCount,
            interestedCount: intCount,
            callbackCount: cbCount,
            refusedCount: refCount,
            unreachableCount: unreachCount,
            interactions: updatedInteractions
          };
        });
      } else {
        const isInt = interactionForm.status === 'interested' ? 1 : 0;
        const isCb = interactionForm.status === 'callback' ? 1 : 0;
        const isRef = interactionForm.status === 'refused' ? 1 : 0;
        const isUnreach = interactionForm.status === 'unreachable' ? 1 : 0;

        const newDayEntry = {
          id: `log_${selectedDate}`,
          date: selectedDate,
          dateDisplay: getAbidjanDateDisplay(selectedDate),
          dayNum: currentDayNumber,
          targetGoal: 10,
          contactedCount: 1,
          interestedCount: isInt,
          callbackCount: isCb,
          refusedCount: isRef,
          unreachableCount: isUnreach,
          notes: '',
          interactions: [newInt]
        };
        updatedLogs = [newDayEntry, ...dailyLogs];
      }
    }

    setDailyLogs(updatedLogs);

    // Auto-schedule meeting in calendar if interested or appointmentDate provided
    if (onScheduleChallengeRdv && (interactionForm.status === 'interested' || interactionForm.appointmentDate)) {
      onScheduleChallengeRdv({
        date: interactionForm.appointmentDate || selectedDate,
        start: interactionForm.appointmentStartTime || '10:00',
        end: interactionForm.appointmentEndTime || '11:30',
        companyName: interactionForm.companyName.trim(),
        contactPerson: interactionForm.contactPerson.trim() || 'Décideur',
        phone: interactionForm.phone ? interactionForm.phone.trim() : '',
        location: interactionForm.location ? interactionForm.location.trim() : '',
        pricingModel: interactionForm.pricingModel,
        budget: interactionForm.pricingModel === 'yearly' ? '300 000 FCFA / an' : '30 000 FCFA / mois',
        objective: interactionForm.notes || 'Présentation et démo du dashboard de gestion métier'
      });
    }

    // Auto-add to Pipeline CRM if interested or callback (for new interactions)
    let updatedProspects = prospects;
    if (!editingInteractionId && (interactionForm.status === 'interested' || interactionForm.status === 'callback')) {
      const budgetText = interactionForm.pricingModel === 'yearly' ? '300 000 FCFA / an' : '30 000 FCFA / mois';
      const newProspect = {
        id: `p_${Date.now()}`,
        name: interactionForm.companyName,
        contact: interactionForm.contactPerson || 'Gérant',
        phone: interactionForm.phone || '',
        location: interactionForm.location || '',
        channel: 'Prospection directe Abidjan',
        need: interactionForm.notes || 'Dashboard de gestion métier',
        status: interactionForm.status === 'interested' ? 'meeting' : 'contacted',
        pricingModel: interactionForm.pricingModel,
        budget: budgetText,
        appointmentDate: interactionForm.appointmentDate ? `${interactionForm.appointmentDate} (${interactionForm.appointmentStartTime || '10:00'})` : '',
        notes: interactionForm.notes
      };
      updatedProspects = [newProspect, ...prospects];
      setProspects(updatedProspects);
    }

    syncChanges(updatedLogs, updatedProspects, weeksData);

    setShowInteractionModal(false);
    setEditingInteractionId(null);
    setInteractionForm({
      companyName: '',
      contactPerson: '',
      phone: '',
      location: '',
      status: 'interested',
      appointmentDate: '',
      appointmentStartTime: '10:00',
      appointmentEndTime: '11:30',
      callbackDate: '',
      notes: '',
      pricingModel: 'monthly'
    });
  };

  // Delete an individual interaction with safe confirmation
  const handleDeleteInteraction = (intId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet échange ?")) return;

    const updatedLogs = dailyLogs.map(l => {
      if (l.date !== selectedDate) return l;
      const updatedInteractions = (l.interactions || []).filter(i => i.id !== intId);
      const intCount = updatedInteractions.filter(i => i.status === 'interested').length;
      const cbCount = updatedInteractions.filter(i => i.status === 'callback').length;
      const refCount = updatedInteractions.filter(i => i.status === 'refused').length;
      const unreachCount = updatedInteractions.filter(i => i.status === 'unreachable').length;
      const totalCount = intCount + cbCount + refCount + unreachCount;

      return {
        ...l,
        contactedCount: totalCount,
        interestedCount: intCount,
        callbackCount: cbCount,
        refusedCount: refCount,
        unreachableCount: unreachCount,
        interactions: updatedInteractions
      };
    }).filter(l => (l.interactions && l.interactions.length > 0) || l.date === todayAbidjanStr);

    setDailyLogs(updatedLogs);
    syncChanges(updatedLogs, prospects, weeksData);
  };

  // Delete an entire day log entry from history with confirmation
  const handleDeleteDayLog = (dateStr) => {
    const display = getAbidjanDateDisplay(dateStr);
    if (!window.confirm(`Supprimer définitivement la journée du ${display} et tous ses échanges enregistrés ?`)) return;

    const updatedLogs = dailyLogs.filter(l => l.date !== dateStr);
    setDailyLogs(updatedLogs);
    syncChanges(updatedLogs, prospects, weeksData);
  };

  const handleChangeProspectStatus = (prospectId, newStatus) => {
    const updated = prospects.map(p => p.id === prospectId ? { ...p, status: newStatus } : p);
    setProspects(updated);
    syncChanges(dailyLogs, updated, weeksData);
  };

  const handleDeleteProspect = (prospectId) => {
    if (window.confirm("Supprimer ce prospect du pipeline ?")) {
      const updated = prospects.filter(p => p.id !== prospectId);
      setProspects(updated);
      syncChanges(dailyLogs, updated, weeksData);
    }
  };

  const handleToggleRoadmapTask = (weekId, taskId) => {
    const updatedWeeks = weeksData.map(w => {
      if (w.id !== weekId) return w;
      return {
        ...w,
        tasks: w.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
      };
    });
    setWeeksData(updatedWeeks);
    syncChanges(dailyLogs, prospects, updatedWeeks);
  };

  const handleAddCustomRoadmapTask = (weekId) => {
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: `wt_custom_${Date.now()}`,
      title: newTaskTitle.trim(),
      completed: false,
      isCustom: true
    };

    const updatedWeeks = weeksData.map(w => {
      if (w.id !== weekId) return w;
      return {
        ...w,
        tasks: [...w.tasks, newTask]
      };
    });

    setWeeksData(updatedWeeks);
    syncChanges(dailyLogs, prospects, updatedWeeks);
    setNewTaskTitle('');
    setAddingTaskWeekId(null);
  };

  const handleDeleteCustomRoadmapTask = (weekId, taskId, e) => {
    e.stopPropagation();
    const updatedWeeks = weeksData.map(w => {
      if (w.id !== weekId) return w;
      return {
        ...w,
        tasks: w.tasks.filter(t => t.id !== taskId)
      };
    });
    setWeeksData(updatedWeeks);
    syncChanges(dailyLogs, prospects, updatedWeeks);
  };


  const pipelineStages = [
    { key: 'lead', label: '🎯 Entreprises Cibles', color: 'bg-slate-600' },
    { key: 'contacted', label: '📞 Visité / Contacté', color: 'bg-indigo-600' },
    { key: 'meeting', label: '🤝 Démo Live Montrée', color: 'bg-amber-500' },
    { key: 'proposal', label: '📝 Offre 30k / 300k Présentée', color: 'bg-blue-600' },
    { key: 'won', label: '🏆 SIGNÉ & ENCAISSÉ !', color: 'bg-emerald-600' }
  ];

  return (
    <div className="space-y-6 pb-28 md:pb-12 animate-in fade-in duration-300">
      
      {/* 1. HERO WAR ROOM COCKPIT */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/50">
        
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-3 max-w-2xl">
            {/* Top Badge & Edition Selector */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-sm border ${
                monthConfig.isPastMonth
                  ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                  : 'bg-amber-500/20 border-amber-400/40 text-amber-300'
              }`}>
                {monthConfig.isPastMonth ? (
                  <Archive size={14} className="text-amber-400" />
                ) : (
                  <Flame size={14} className="animate-pulse text-amber-400" />
                )}
                <span>
                  {monthConfig.isPastMonth 
                    ? `ARCHIVE • ${monthConfig.monthName.toUpperCase()} (CLÔTURÉ)`
                    : monthConfig.isFutureMonth
                      ? `APERÇU • ${monthConfig.monthName.toUpperCase()}`
                      : `CHALLENGE 30 JOURS • ${monthConfig.monthName.toUpperCase()}`}
                </span>
              </div>

              {/* Quick Edition Switcher Pills */}
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1 rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedMonthKey('2026-09')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    selectedMonthKey === '2026-09'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                  title="Voir l'édition de Septembre 2026"
                >
                  <History size={12} />
                  <span>Sept. 2026</span>
                  {currentRealMonthKey > '2026-09' && (
                    <span className="text-[9px] opacity-75 font-normal">Archivé</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMonthKey('2026-10')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    selectedMonthKey === '2026-10'
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                  title="Voir l'édition d'Octobre 2026"
                >
                  <Flame size={12} />
                  <span>Oct. 2026</span>
                  {currentRealMonthKey === '2026-10' ? (
                    <span className="text-[9px] bg-emerald-950/40 text-emerald-900 font-bold px-1 rounded">En cours</span>
                  ) : (
                    <span className="text-[9px] opacity-75 font-normal">Nouveau</span>
                  )}
                </button>
              </div>

              <span className="text-[11px] font-bold text-slate-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                Abidjan : {getAbidjanDateDisplay(todayAbidjanStr)}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Cockpit & Journal de Prospection B2B
            </h1>
            
            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
              Objectif standard : <strong>10 entreprises ciblées et contactées par jour</strong> (du Lundi au Vendredi). 
              Offre no-brainer : <strong>30 000 F / mois</strong> ou <strong>300 000 F / an</strong>.
            </p>
          </div>

          {/* Countdown & Quick Stats */}
          <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-3xl shadow-2xl flex-shrink-0">
            <div className="text-center px-3">
              <div className="text-3xl sm:text-4xl font-black text-amber-400">
                {monthConfig.isPastMonth 
                  ? 'Clôturé' 
                  : monthConfig.isFutureMonth
                    ? `J-${monthConfig.lastDay}`
                    : `J-${monthConfig.daysRemaining}`}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-300 tracking-wider mt-0.5">
                {monthConfig.isPastMonth ? 'Édition archivée' : 'Jours restants'}
              </div>
            </div>
            <div className="h-10 w-[1px] bg-white/20" />
            <div className="text-center px-3">
              <div className="text-3xl sm:text-4xl font-black text-white">
                {stats.totalContacted}<span className="text-lg text-slate-400 font-bold">/{stats.monthlyGoal}</span>
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-300 tracking-wider mt-0.5">Contacts cumulés</div>
            </div>
          </div>

        </div>

        {/* Global Metric Strips */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="text-[10px] uppercase font-bold text-slate-400">Taux d'Intérêt / RDV</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">{stats.conversionRate}%</div>
            <div className="text-[10px] text-slate-300">{stats.totalInterested} intéressés / démos</div>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="text-[10px] uppercase font-bold text-slate-400">À Rappeler (Relance)</div>
            <div className="text-lg font-black text-amber-400 mt-0.5">{stats.callbackRate}%</div>
            <div className="text-[10px] text-slate-300">{stats.totalCallback} dates fixées</div>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="text-[10px] uppercase font-bold text-slate-400">Taux de Refus</div>
            <div className="text-lg font-black text-red-400 mt-0.5">{stats.refusalRate}%</div>
            <div className="text-[10px] text-slate-300">{stats.totalRefused} refus documentés</div>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="text-[10px] uppercase font-bold text-slate-400">Injoignables</div>
            <div className="text-lg font-black text-slate-300 mt-0.5">{stats.unreachableRate}%</div>
            <div className="text-[10px] text-slate-300">{stats.totalUnreachable} non aboutis</div>
          </div>
        </div>

        {/* Mathematical Coherence Pill */}
        <div className="mt-3 text-[11px] text-slate-400 font-medium">
          📐 Total : <strong className="text-white">{stats.totalContacted} contactés</strong> = {stats.totalInterested} intéressés + {stats.totalCallback} à rappeler + {stats.totalRefused} refus + {stats.totalUnreachable} injoignables
        </div>

      </div>

      {/* Archive Notice Banner when inspecting an archived month */}
      {monthConfig.isPastMonth && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-amber-300 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Archive size={20} />
            </div>
            <div>
              <div className="font-extrabold text-sm text-textMain dark:text-amber-200">
                Édition Archivée : {monthConfig.monthName}
              </div>
              <p className="text-xs text-textMuted dark:text-slate-300 mt-0.5">
                Ce challenge est clôturé. Toutes vos données ont été sauvegardées pour l'historique et la comparaison avec vos challenges futurs.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveSubPage('reporting')}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-2xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 flex-shrink-0 cursor-pointer"
          >
            <FileText size={14} />
            <span>Consulter le Bilan & Reporting</span>
          </button>
        </div>
      )}

      {/* 2. SUB-PAGES / TAB NAVIGATION BAR (6 SUB-PAGES AÉRÉES) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
        {[
          { key: 'journal', label: '📖 Journal de Bord Quotidien', icon: BookOpen },
          { key: 'analytics', label: '📈 Comparaisons & Statistiques', icon: BarChart3 },
          { key: 'pipeline', label: `📊 Pipeline B2B & RDV (${prospects.length})`, icon: Building },
          { key: 'roadmap', label: '🗺️ Feuille de Route 4 Semaines', icon: Calendar },
          { key: 'verdict', label: '🏆 Verdict Mensuel', icon: Trophy },
          { key: 'reporting', label: '📑 Bilan & Comparatif', icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubPage === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSubPage(tab.key)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all flex-shrink-0 border cursor-pointer ${
                isActive 
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/25 scale-[1.02]' 
                  : 'bg-card text-textMuted border-gray-100 dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. SUB-PAGE CONTENTS */}

      {/* ========================================================= */}
      {/* SUB-PAGE 1 : JOURNAL DE BORD QUOTIDIEN (Saisie & Détails) */}
      {/* ========================================================= */}
      {activeSubPage === 'journal' && (
        <div className="space-y-6">
          
          {/* Header & Date Selector */}
          <div className="bg-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-darkBorder flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-xl font-extrabold text-textMain">Journal des Échanges Quotidiens</h3>
                <span className="bg-primary/15 text-primary text-xs font-bold px-2.5 py-0.5 rounded-lg">
                  {currentDayLog.interactions?.length || 0} contact(s) documenté(s)
                </span>
              </div>
              <p className="text-xs text-textMuted mt-1">
                Documentez chaque échange, fixez vos dates de RDV et de relance.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-background border border-gray-200 dark:border-darkBorder px-3 py-1.5 rounded-2xl">
                <Calendar size={14} className="text-primary" />
                <input 
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs font-bold text-textMain focus:outline-none cursor-pointer"
                />
              </div>

                <button
                  type="button"
                  onClick={() => handleOpenScheduleRdvModal()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                  title="Planifier un rendez-vous prospect dans l'agenda"
                >
                  <Calendar size={14} />
                  <span>🤝 Fixer un RDV Agenda</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenNewInteraction}
                  className="bg-primary hover:bg-primary/90 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Ajouter une entreprise</span>
                </button>
              </div>
            </div>

          {/* Today's Scorecard Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-card p-4 rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.03] space-y-1">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                <span className="text-xs font-extrabold flex items-center gap-1"><UserCheck size={14} /> Intéressés / RDV</span>
                <span className="text-lg font-black">{currentDayLog.interactions?.filter(i => i.status === 'interested').length || 0}</span>
              </div>
              <p className="text-[10px] text-textMuted">Prêts pour démo / devis</p>
            </div>

            <div className="bg-card p-4 rounded-3xl border border-amber-500/30 bg-amber-500/[0.03] space-y-1">
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                <span className="text-xs font-extrabold flex items-center gap-1"><PhoneForwarded size={14} /> À Rappeler</span>
                <span className="text-lg font-black">{currentDayLog.interactions?.filter(i => i.status === 'callback').length || 0}</span>
              </div>
              <p className="text-[10px] text-textMuted">Relance programmée</p>
            </div>

            <div className="bg-card p-4 rounded-3xl border border-red-500/30 bg-red-500/[0.03] space-y-1">
              <div className="flex items-center justify-between text-red-600 dark:text-red-400">
                <span className="text-xs font-extrabold flex items-center gap-1"><UserX size={14} /> Refus</span>
                <span className="text-lg font-black">{currentDayLog.interactions?.filter(i => i.status === 'refused').length || 0}</span>
              </div>
              <p className="text-[10px] text-textMuted">Motif documenté</p>
            </div>

            <div className="bg-card p-4 rounded-3xl border border-gray-200 dark:border-darkBorder space-y-1">
              <div className="flex items-center justify-between text-textMain">
                <span className="text-xs font-extrabold flex items-center gap-1"><UserMinus size={14} /> Injoignables</span>
                <span className="text-lg font-black">{currentDayLog.interactions?.filter(i => i.status === 'unreachable').length || 0}</span>
              </div>
              <p className="text-[10px] text-textMuted">À recontacter plus tard</p>
            </div>
          </div>

          {/* Interactions List */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-textMain flex items-center gap-2">
              <MessageSquare size={16} className="text-primary" />
              <span>Détail des échanges pour le {currentDayLog.dateDisplay} :</span>
            </h4>

            {(!currentDayLog.interactions || currentDayLog.interactions.length === 0) ? (
              <div className="bg-card rounded-3xl p-10 text-center border border-gray-100 dark:border-darkBorder space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <PhoneCall size={24} />
                </div>
                <h4 className="font-extrabold text-sm text-textMain">Aucune prospection saisie pour cette date</h4>
                <p className="text-xs text-textMuted max-w-md mx-auto">
                  Cliquez sur "Enregistrer un échange" pour consigner vos visites physiques, appels et retours des décideurs.
                </p>
                <button
                  type="button"
                  onClick={handleOpenNewInteraction}
                  className="bg-primary hover:bg-primary/90 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Plus size={14} />
                  Enregistrer un échange
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {currentDayLog.interactions.map((int) => {
                  let statusBadge = { bg: 'bg-slate-500', text: 'Injoignable', color: 'text-slate-500' };
                  if (int.status === 'interested') statusBadge = { bg: 'bg-emerald-600', text: '🤝 Intéressé / RDV Fixé', color: 'text-emerald-600' };
                  else if (int.status === 'callback') statusBadge = { bg: 'bg-amber-500', text: '⏳ À Rappeler / En Réflexion', color: 'text-amber-600' };
                  else if (int.status === 'refused') statusBadge = { bg: 'bg-red-600', text: '❌ Refus', color: 'text-red-600' };

                  return (
                    <div 
                      key={int.id}
                      className="bg-card p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-darkBorder space-y-3 hover:border-primary/30 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-darkBorder">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            🏢
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-textMain">{int.companyName}</h4>
                            <span className="text-xs text-textMuted font-medium">Contact : {int.contactPerson || 'Gérant'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className={`text-[11px] font-extrabold text-white px-3 py-1 rounded-xl shadow-sm ${statusBadge.bg}`}>
                            {statusBadge.text}
                          </span>
                          <button 
                            type="button"
                            onClick={() => handleOpenEditInteraction(int)} 
                            className="text-textMuted hover:text-primary p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="Modifier cet échange"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDeleteInteraction(int.id)} 
                            className="text-textMuted hover:text-danger p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Supprimer cet échange"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Dates details */}
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        {int.appointmentDate && (
                          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-extrabold bg-emerald-500/15 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                            <CalendarDays size={13} className="text-emerald-600 dark:text-emerald-400" />
                            <span>RDV fixé : {int.appointmentDate} {int.appointmentStartTime ? `de ${int.appointmentStartTime} à ${int.appointmentEndTime || ''}` : ''}</span>
                          </div>
                        )}

                        {int.phone && (
                          <a
                            href={`tel:${int.phone.replace(/[^0-9+]/g, '')}`}
                            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold bg-blue-500/10 px-2.5 py-1 rounded-xl border border-blue-500/20 hover:underline"
                            title="Appeler directement"
                          >
                            <PhoneCall size={12} />
                            <span>{int.phone}</span>
                          </a>
                        )}

                        {int.location && (
                          <div className="flex items-center gap-1 text-textMuted font-medium bg-background px-2.5 py-1 rounded-xl border border-gray-200 dark:border-darkBorder">
                            <MapPin size={12} className="text-orange-500" />
                            <span>{int.location}</span>
                          </div>
                        )}

                        {int.callbackDate && (
                          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                            <Clock size={13} />
                            <span>Date de relance prévue : {int.callbackDate.replace('T', ' à ')}</span>
                          </div>
                        )}
                      </div>

                      {/* Notes / Conversation Detail */}
                      {int.notes && (
                        <div className="bg-background p-3 rounded-2xl border border-gray-100 dark:border-darkBorder text-xs text-textMain leading-relaxed">
                          <span className="font-bold text-textMuted block text-[10px] uppercase mb-0.5">Détail de la conversation & objections :</span>
                          {int.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-PAGE 2 : COMPARAISONS & STATISTIQUES */}
      {/* ========================================================= */}
      {activeSubPage === 'analytics' && (
        <div className="space-y-6">
          
          <div className="bg-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-darkBorder">
            <h3 className="text-xl font-extrabold text-textMain">Tableau de Bord Comparatif & Momentum</h3>
            <p className="text-xs text-textMuted mt-0.5">Mesurez votre régularité et comparez vos résultats par rapport à vos objectifs et aux jours précédents.</p>
          </div>

          {/* 3-Column Comparative Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. AUJOURD'HUI vs OBJECTIF */}
            <div className="bg-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-darkBorder space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-textMuted uppercase">1. Aujourd'hui</span>
                <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-md">Objectif 10</span>
              </div>

              <div>
                <div className="text-3xl font-black text-textMain">
                  {stats.todayLog?.contactedCount || 0} <span className="text-base text-textMuted font-bold">/ 10</span>
                </div>
                <div className="text-xs text-textMuted mt-1">
                  {(stats.todayLog?.contactedCount || 0) >= 10 
                    ? '🎉 Objectif du jour atteint !' 
                    : `${10 - (stats.todayLog?.contactedCount || 0)} contact(s) restant(s) aujourd'hui.`}
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-darkBorder text-xs">
                <div className="flex justify-between">
                  <span className="text-textMuted">Intéressés / RDV :</span>
                  <span className="font-bold text-emerald-500">{stats.todayLog?.interestedCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textMuted">À rappeler :</span>
                  <span className="font-bold text-amber-500">{stats.todayLog?.callbackCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textMuted">Refus :</span>
                  <span className="font-bold text-red-500">{stats.todayLog?.refusedCount || 0}</span>
                </div>
              </div>
            </div>

            {/* 2. COMPARAISON AVEC HIER */}
            <div className="bg-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-darkBorder space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-textMuted uppercase">2. Évolution vs Hier</span>
                <Activity size={15} className="text-primary" />
              </div>

              <div>
                <div className="text-3xl font-black text-textMain flex items-center gap-2">
                  <span>{stats.todayLog?.contactedCount || 0} vs {stats.yesterdayLog?.contactedCount || 0}</span>
                  {(stats.todayLog?.contactedCount || 0) >= (stats.yesterdayLog?.contactedCount || 0) ? (
                    <ArrowUpRight className="text-emerald-500" size={24} />
                  ) : (
                    <ArrowDownRight className="text-red-500" size={24} />
                  )}
                </div>
                <div className="text-xs text-textMuted mt-1">
                  Hier : {stats.yesterdayLog?.contactedCount || 0} contact(s) réalisés.
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-darkBorder text-xs">
                <div className="flex justify-between">
                  <span className="text-textMuted">Taux RDV Hier :</span>
                  <span className="font-bold text-emerald-500">
                    {stats.yesterdayLog?.contactedCount 
                      ? Math.round((stats.yesterdayLog.interestedCount / stats.yesterdayLog.contactedCount) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textMuted">Taux RDV Aujourd'hui :</span>
                  <span className="font-bold text-primary">
                    {stats.todayLog?.contactedCount 
                      ? Math.round((stats.todayLog.interestedCount / stats.todayLog.contactedCount) * 100) 
                      : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* 3. COMPARAISON AVEC J-7 & CUMUL MOIS */}
            <div className="bg-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-darkBorder space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-textMuted uppercase">3. Cumul sur 30 Jours</span>
                <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-md">
                  {stats.monthlyProgressPercent}% du total
                </span>
              </div>

              <div>
                <div className="text-3xl font-black text-primary">
                  {stats.totalContacted} <span className="text-base text-textMuted font-bold">/ 200</span>
                </div>
                <div className="text-xs text-textMuted mt-1">
                  {stats.totalInterested} entreprises prêtes pour une démo live.
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-darkBorder text-xs">
                <div className="flex justify-between">
                  <span className="text-textMuted">Jours journalisés :</span>
                  <span className="font-bold text-textMain">{stats.totalDaysLogged} jour(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textMuted">Moyenne quotidienne :</span>
                  <span className="font-bold text-primary">
                    {stats.totalDaysLogged > 0 ? (stats.totalContacted / stats.totalDaysLogged).toFixed(1) : 0} contacts/j
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Historical Log Entries Table */}
          <div className="bg-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-darkBorder space-y-4">
            <h4 className="font-extrabold text-base text-textMain flex items-center gap-2">
              <History size={16} className="text-primary" />
              <span>Historique Journalier de Prospection</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-darkBorder text-textMuted font-bold">
                    <th className="pb-3">Date</th>
                    <th className="pb-3 text-center">Contactés</th>
                    <th className="pb-3 text-center">🤝 Intéressés</th>
                    <th className="pb-3 text-center">⏳ À Rappeler</th>
                    <th className="pb-3 text-center">❌ Refus</th>
                    <th className="pb-3 text-center">Taux Réussite</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-darkBorder">
                  {dailyLogs.map((log) => {
                    const cRate = log.contactedCount > 0 ? Math.round((log.interestedCount / log.contactedCount) * 100) : 0;
                    return (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="py-3 font-bold text-textMain">{log.dateDisplay || log.date}</td>
                        <td className="py-3 text-center font-extrabold text-primary">{log.contactedCount} / {log.targetGoal || 10}</td>
                        <td className="py-3 text-center font-bold text-emerald-500">{log.interestedCount}</td>
                        <td className="py-3 text-center font-bold text-amber-500">{log.callbackCount}</td>
                        <td className="py-3 text-center font-bold text-red-500">{log.refusedCount}</td>
                        <td className="py-3 text-center font-black text-emerald-600 dark:text-emerald-400">{cRate}%</td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteDayLog(log.date)}
                            className="text-textMuted hover:text-danger p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title={`Supprimer la journée du ${log.dateDisplay || log.date}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-PAGE 3 : PIPELINE B2B & CRM KANBAN */}
      {/* ========================================================= */}
      {activeSubPage === 'pipeline' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-darkBorder">
            <div>
              <h3 className="text-xl font-extrabold text-textMain">Pipeline d'Acquisition & Suivi des RDV</h3>
              <p className="text-xs text-textMuted mt-0.5">Retrouvez toutes les entreprises intéressées et planifiez les signatures.</p>
            </div>
            <button
              onClick={() => setShowInteractionModal(true)}
              className="bg-primary hover:bg-primary/90 text-white font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus size={16} />
              <span>Ajouter une entreprise ciblée</span>
            </button>
          </div>

          {/* Kanban Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {pipelineStages.map((stage) => {
              const stageProspects = prospects.filter(p => p.status === stage.key);
              return (
                <div key={stage.key} className="bg-card p-4 rounded-3xl border border-gray-100 dark:border-darkBorder space-y-3 flex flex-col">
                  
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-darkBorder">
                    <span className="text-xs font-bold text-textMain truncate">{stage.label}</span>
                    <span className={`text-[10px] font-extrabold text-white px-2 py-0.5 rounded-md ${stage.color}`}>
                      {stageProspects.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1 min-h-[150px]">
                    {stageProspects.length === 0 ? (
                      <div className="h-full flex items-center justify-center p-4 border border-dashed border-gray-200 dark:border-darkBorder rounded-2xl text-[11px] text-textMuted text-center">
                        Aucun prospect
                      </div>
                    ) : (
                      stageProspects.map((p) => (
                        <div key={p.id} className="bg-background p-3.5 rounded-2xl border border-gray-200 dark:border-darkBorder space-y-2 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="font-extrabold text-xs text-textMain leading-tight">{p.name}</h4>
                            <button onClick={() => handleDeleteProspect(p.id)} className="text-textMuted hover:text-danger p-0.5">
                              <Trash2 size={12} />
                            </button>
                          </div>
                          
                          {p.contact && <div className="text-[11px] text-textMuted flex items-center gap-1 font-medium"><Users size={11} /> {p.contact}</div>}
                          {p.appointmentDate ? (
                            <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-extrabold flex items-center gap-1 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/25">
                              <CalendarDays size={10} /> <span>{p.appointmentDate}</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenScheduleRdvModal({
                                companyName: p.name,
                                contactPerson: p.contact,
                                phone: p.phone,
                                location: p.location,
                                notes: p.need,
                                pricingModel: p.pricingModel
                              })}
                              className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded-lg flex items-center gap-1 w-full justify-center border border-emerald-500/20 transition-colors cursor-pointer"
                            >
                              <Calendar size={10} />
                              <span>Planifier dans l'Agenda</span>
                            </button>
                          )}
                          {p.need && <p className="text-[11px] text-textMain line-clamp-2 bg-card p-1.5 rounded-xl border border-gray-100 dark:border-darkBorder">{p.need}</p>}
                          
                          <div className="flex items-center justify-between text-[10px] pt-1">
                            <span className="font-extrabold text-primary">{p.budget}</span>
                            <span className="text-textMuted">{p.channel}</span>
                          </div>

                          <select
                            value={p.status}
                            onChange={(e) => handleChangeProspectStatus(p.id, e.target.value)}
                            className="w-full bg-card border border-gray-200 dark:border-darkBorder rounded-lg px-2 py-1 text-[10px] font-bold text-textMain focus:outline-none cursor-pointer mt-1"
                          >
                            <option value="lead">🎯 Piste ciblée</option>
                            <option value="contacted">📞 Visité / Contacté</option>
                            <option value="meeting">🤝 Démo live montrée</option>
                            <option value="proposal">📝 Offre 30k/300k transmise</option>
                            <option value="won">🏆 SIGNÉ & ENCAISSÉ</option>
                          </select>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-PAGE 4 : FEUILLE DE ROUTE 4 SEMAINES (Avec ajout de tâches perso) */}
      {/* ========================================================= */}
      {activeSubPage === 'roadmap' && (
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-darkBorder flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-textMain">Feuille de Route des 4 Semaines</h3>
              <p className="text-xs text-textMuted mt-0.5">
                Suivez votre progression étape par étape et ajoutez vos propres tâches personnalisées pour chaque semaine.
              </p>
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-xl">
              Abidjan : Semaine {currentDayNumber <= 15 ? '1 & 2' : currentDayNumber <= 22 ? '3' : '4'}
            </span>
          </div>

          <div className="space-y-6">
            {weeksData.map((week) => {
              const completedCount = week.tasks.filter(t => t.completed).length;
              const totalCount = week.tasks.length;
              const isWeekDone = totalCount > 0 && completedCount === totalCount;
              const isAdding = addingTaskWeekId === week.id;

              return (
                <div 
                  key={week.id} 
                  className={`bg-card p-6 rounded-3xl shadow-sm border transition-all ${
                    week.isCurrent 
                      ? 'border-2 border-primary/50 ring-2 ring-primary/10' 
                      : isWeekDone 
                        ? 'border-emerald-500/40 bg-emerald-500/[0.02]' 
                        : 'border-gray-100 dark:border-darkBorder'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        {week.isCurrent && (
                          <span className="bg-primary text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                            Phase en cours
                          </span>
                        )}
                        {isWeekDone && (
                          <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                            Terminée ✅
                          </span>
                        )}
                        <h4 className="font-extrabold text-base text-textMain">{week.title}</h4>
                      </div>
                      <p className="text-xs text-textMuted mt-0.5 font-medium">{week.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-xl">
                        {completedCount}/{totalCount}
                      </span>
                      <button
                        onClick={() => {
                          setAddingTaskWeekId(isAdding ? null : week.id);
                          setNewTaskTitle('');
                        }}
                        className="bg-background border border-gray-200 dark:border-darkBorder hover:border-primary/50 text-textMain text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-sm transition-all"
                      >
                        {isAdding ? <X size={13} /> : <Plus size={13} />}
                        <span>{isAdding ? 'Fermer' : 'Ajouter une tâche'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Form to add custom task */}
                  {isAdding && (
                    <div className="mt-3 p-3 bg-background rounded-2xl border border-primary/30 flex items-center gap-2 animate-in fade-in duration-200">
                      <input
                        type="text"
                        placeholder="Titre de votre tâche personnalisée pour cette semaine..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomRoadmapTask(week.id);
                          }
                        }}
                        className="flex-1 bg-card border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-1.5 text-xs text-textMain focus:outline-none focus:border-primary"
                        autoFocus
                      />
                      <button
                        onClick={() => handleAddCustomRoadmapTask(week.id)}
                        disabled={!newTaskTitle.trim()}
                        className="bg-primary disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm"
                      >
                        <Check size={14} />
                        <span>Ajouter</span>
                      </button>
                    </div>
                  )}

                  {/* Tasks List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-4">
                    {week.tasks.map((task) => (
                      <div 
                        key={task.id}
                        onClick={() => handleToggleRoadmapTask(week.id, task.id)}
                        className={`flex items-center justify-between gap-3 p-3 rounded-2xl border cursor-pointer select-none transition-all group ${
                          task.completed 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-textMuted' 
                            : 'bg-background border-gray-100 dark:border-darkBorder text-textMain hover:border-primary/40'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            task.completed ? 'bg-emerald-600 text-white shadow-sm' : 'border-2 border-gray-300 dark:border-gray-600'
                          }`}>
                            {task.completed && <CheckCircle2 size={13} strokeWidth={3} />}
                          </div>
                          <span className={`text-xs font-semibold truncate ${task.completed ? 'line-through opacity-70' : ''}`}>
                            {task.title}
                          </span>
                        </div>

                        {task.isCustom && (
                          <button
                            onClick={(e) => handleDeleteCustomRoadmapTask(week.id, task.id, e)}
                            className="opacity-0 group-hover:opacity-100 text-textMuted hover:text-danger p-1 rounded-lg transition-all"
                            title="Supprimer cette tâche"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-PAGE 5 : VERDICT FINAL (Agrégation dynamique complète) */}
      {/* ========================================================= */}
      {activeSubPage === 'verdict' && (
        <div className="bg-card p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-darkBorder space-y-6 max-w-4xl mx-auto">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-primary text-white flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
              <Trophy size={32} />
            </div>
            <h3 className="text-2xl font-black text-textMain">Bilan & Verdict du Challenge 30 Jours</h3>
            <p className="text-xs text-textMuted max-w-lg mx-auto">
              Synthèse en direct de toutes les métriques de prospection, des rendez-vous et des encaissements réels.
            </p>
          </div>

          {/* 3 Core Metric Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            
            {/* 1. Prospection Totale */}
            <div className="bg-background p-5 rounded-3xl border border-gray-200 dark:border-darkBorder space-y-2">
              <div className="flex items-center justify-between text-textMuted">
                <span className="text-[10px] font-extrabold uppercase tracking-wider">1. Prospection Réalisée</span>
                <PhoneCall size={15} className="text-primary" />
              </div>
              <div className="text-2xl font-black text-textMain">
                {stats.totalContacted} <span className="text-sm font-bold text-textMuted">/ {stats.monthlyGoal}</span>
              </div>
              <div className="space-y-1 text-xs text-textMuted pt-2 border-t border-gray-100 dark:border-darkBorder">
                <div>• Intéressés : <strong className="text-emerald-500 font-bold">{stats.totalInterested}</strong></div>
                <div>• À rappeler : <strong className="text-amber-500 font-bold">{stats.totalCallback}</strong></div>
                <div>• Refus : <strong className="text-red-500 font-bold">{stats.totalRefused}</strong></div>
              </div>
            </div>

            {/* 2. Clients Signés & Encaissés (Performance Réelle) */}
            <div className="bg-background p-5 rounded-3xl border border-gray-200 dark:border-darkBorder space-y-2">
              <div className="flex items-center justify-between text-textMuted">
                <span className="text-[10px] font-extrabold uppercase tracking-wider">2. Clients Signés</span>
                <Award size={15} className="text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {stats.wonProspects.length} <span className="text-sm font-bold text-textMuted">/ 1 contrat</span>
              </div>
              <div className="space-y-1 text-xs text-textMuted pt-2 border-t border-gray-100 dark:border-darkBorder">
                <div>• Démo live montrées : <strong className="text-textMain font-bold">{stats.meetingProspects.length}</strong></div>
                <div>• Propositions transmises : <strong className="text-textMain font-bold">{stats.proposalProspects.length}</strong></div>
                <div className="font-extrabold text-[11px] text-emerald-600">
                  {stats.wonProspects.length >= 1 ? '✅ Objectif 1er Client Validé !' : '⏳ Sprint de signature en cours'}
                </div>
              </div>
            </div>

            {/* 3. Revenu Total Encaissé durant le Challenge */}
            <div className="bg-background p-5 rounded-3xl border border-gray-200 dark:border-darkBorder space-y-2">
              <div className="flex items-center justify-between text-textMuted">
                <span className="text-[10px] font-extrabold uppercase tracking-wider">3. Revenu Encaissé</span>
                <DollarSign size={15} className="text-amber-500" />
              </div>
              <div className="text-2xl font-black text-primary">
                {stats.totalCashEarned.toLocaleString('fr-FR')} <span className="text-sm font-bold">FCFA</span>
              </div>
              <div className="space-y-1 text-xs text-textMuted pt-2 border-t border-gray-100 dark:border-darkBorder">
                <div>Cash réellement encaissé durant le challenge.</div>
                {stats.mrrGained > 0 && (
                  <div className="text-emerald-600 font-bold">
                    + {stats.mrrGained.toLocaleString('fr-FR')} F/mois de récurrent
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Roadmap Completion Status */}
          <div className="p-4 bg-background rounded-2xl border border-gray-200 dark:border-darkBorder flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="text-primary" size={20} />
              <div>
                <h5 className="font-extrabold text-xs text-textMain">Avancement de la Feuille de Route</h5>
                <p className="text-[11px] text-textMuted">
                  {weeksData.reduce((acc, w) => acc + w.tasks.filter(t => t.completed).length, 0)} sur {weeksData.reduce((acc, w) => acc + w.tasks.length, 0)} étapes clés validées.
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-primary">
              {Math.round((weeksData.reduce((acc, w) => acc + w.tasks.filter(t => t.completed).length, 0) / Math.max(1, weeksData.reduce((acc, w) => acc + w.tasks.length, 0))) * 100)}%
            </span>
          </div>

          {/* Verdict Banner */}
          <div className={`p-5 rounded-2xl border text-xs leading-relaxed ${
            stats.wonProspects.length >= 1
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200 font-semibold'
              : 'bg-primary/10 border-primary/20 text-textMain font-medium'
          }`}>
            {stats.wonProspects.length >= 1 ? (
              <div className="space-y-1">
                <div className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Trophy size={16} />
                  <span>CHALLENGE ACCOMPLI AVEC SUCCÈS ! 🏆</span>
                </div>
                <p>
                  Vous avez prouvé votre capacité à prospecter directement des entreprises, présenter votre solution logicielle, signer un client ferme et encaisser des revenus récurrents en Côte d'Ivoire.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="font-extrabold text-sm text-primary flex items-center gap-1.5">
                  <Flame size={16} className="text-amber-500" />
                  <span>CHALLENGE EN COURS • {daysRemaining} JOURS RESTANTS</span>
                </div>
                <p>
                  Maintenez la discipline des <strong>10 contacts ciblés par jour</strong> du Lundi au Vendredi. Chaque visite et chaque appel vous rapproche de la signature de votre premier abonnement à 30 000 FCFA/mois ou 300 000 FCFA/an !
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-PAGE 6 : BILAN MENSUEL & COMPARATIF D'ÉDITIONS */}
      {/* ========================================================= */}
      {activeSubPage === 'reporting' && (
        <div className="space-y-6" id="challenge-printable-report">
          
          {/* Header & Quick Export Action */}
          <div className="bg-card rounded-3xl p-6 sm:p-7 border border-gray-100 dark:border-darkBorder shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                <History size={14} />
                <span>Reporting Analytique & Comparatif Multi-Mois</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-textMain tracking-tight">
                Bilan & Comparatif des Challenges
              </h2>
              <p className="text-xs sm:text-sm text-textMuted max-w-2xl leading-relaxed">
                Visualisez l'archive complète du <strong>Challenge Septembre 2026</strong> et comparez vos métriques en face à face avec le <strong>Challenge Octobre 2026</strong> pour mesurer votre progression commerciale.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-primary hover:bg-primary/90 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Printer size={15} />
                <span>Imprimer / Exporter en PDF</span>
              </button>
            </div>
          </div>

          {/* Side-by-Side Edition Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* SEPTEMBRE 2026 (ARCHIVE CLÔTURÉE) */}
            <div className="bg-card rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-800 shadow-sm space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-darkBorder">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-black">
                    <Archive size={18} />
                  </div>
                  <div>
                    <div className="text-xs uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400">Édition Précédente</div>
                    <h3 className="text-base font-black text-textMain">Septembre 2026 (Archivé)</h3>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Clôturé au 30 Sept.
                </span>
              </div>

              {/* September Core KPIs */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-background/80 p-3.5 rounded-2xl border border-gray-100 dark:border-darkBorder">
                  <div className="text-[10px] uppercase font-bold text-textMuted">Contacts Réalisés</div>
                  <div className="text-xl font-black text-textMain mt-1">
                    {sepStats.totalContacted} <span className="text-xs font-bold text-textMuted">/ {sepStats.monthlyGoal}</span>
                  </div>
                  <div className="text-[10px] text-textMuted mt-0.5">{sepStats.monthlyProgressPercent}% de l'objectif atteint</div>
                </div>

                <div className="bg-background/80 p-3.5 rounded-2xl border border-gray-100 dark:border-darkBorder">
                  <div className="text-[10px] uppercase font-bold text-textMuted">Taux d'Intérêt / RDV</div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {sepStats.conversionRate}%
                  </div>
                  <div className="text-[10px] text-textMuted mt-0.5">{sepStats.totalInterested} retours positifs</div>
                </div>

                <div className="bg-background/80 p-3.5 rounded-2xl border border-gray-100 dark:border-darkBorder">
                  <div className="text-[10px] uppercase font-bold text-textMuted">Clients Gagnés</div>
                  <div className="text-xl font-black text-primary mt-1">
                    {sepStats.wonProspects.length}
                  </div>
                  <div className="text-[10px] text-textMuted mt-0.5">Signature ferme</div>
                </div>

                <div className="bg-background/80 p-3.5 rounded-2xl border border-gray-100 dark:border-darkBorder">
                  <div className="text-[10px] uppercase font-bold text-textMuted">Revenu Encaissé</div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {sepStats.totalCashEarned.toLocaleString('fr-FR')} <span className="text-[10px] font-bold">F</span>
                  </div>
                  <div className="text-[10px] text-textMuted mt-0.5">{sepStats.mrrGained.toLocaleString('fr-FR')} F/mois MRR</div>
                </div>
              </div>

              {/* Quick Pipeline Status */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Pipeline Commercial :</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {sepStats.meetingProspects.length} démos • {sepStats.proposalProspects.length} offres
                  </span>
                </div>
                <div className="text-[11px] text-textMuted flex items-center justify-between">
                  <span>Discipline journalière :</span>
                  <span>{sepStats.totalDaysLogged} jours actifs documentés</span>
                </div>
              </div>
            </div>

            {/* OCTOBRE 2026 (NOUVELLE ÉDITION) */}
            <div className="bg-card rounded-3xl p-6 border-2 border-primary/30 dark:border-primary/40 shadow-sm space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-darkBorder">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">
                    <Flame size={18} className="text-amber-500" />
                  </div>
                  <div>
                    <div className="text-xs uppercase font-extrabold tracking-wider text-primary">Challenge Actuel</div>
                    <h3 className="text-base font-black text-textMain">Octobre 2026</h3>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${
                  currentRealMonthKey >= '2026-10'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                }`}>
                  {currentRealMonthKey >= '2026-10' ? 'En cours (Actif)' : 'Démarrage le 1er Oct.'}
                </span>
              </div>

              {/* October Core KPIs */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-background/80 p-3.5 rounded-2xl border border-gray-100 dark:border-darkBorder">
                  <div className="text-[10px] uppercase font-bold text-textMuted">Contacts Réalisés</div>
                  <div className="text-xl font-black text-textMain mt-1">
                    {octStats.totalContacted} <span className="text-xs font-bold text-textMuted">/ {octStats.monthlyGoal}</span>
                  </div>
                  <div className="text-[10px] text-textMuted mt-0.5">{octStats.monthlyProgressPercent}% de l'objectif</div>
                </div>

                <div className="bg-background/80 p-3.5 rounded-2xl border border-gray-100 dark:border-darkBorder">
                  <div className="text-[10px] uppercase font-bold text-textMuted">Taux d'Intérêt / RDV</div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {octStats.conversionRate}%
                  </div>
                  <div className="text-[10px] text-textMuted mt-0.5">{octStats.totalInterested} retours positifs</div>
                </div>

                <div className="bg-background/80 p-3.5 rounded-2xl border border-gray-100 dark:border-darkBorder">
                  <div className="text-[10px] uppercase font-bold text-textMuted">Clients Gagnés</div>
                  <div className="text-xl font-black text-primary mt-1">
                    {octStats.wonProspects.length}
                  </div>
                  <div className="text-[10px] text-textMuted mt-0.5">Signature ferme</div>
                </div>

                <div className="bg-background/80 p-3.5 rounded-2xl border border-gray-100 dark:border-darkBorder">
                  <div className="text-[10px] uppercase font-bold text-textMuted">Revenu Encaissé</div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {octStats.totalCashEarned.toLocaleString('fr-FR')} <span className="text-[10px] font-bold">F</span>
                  </div>
                  <div className="text-[10px] text-textMuted mt-0.5">{octStats.mrrGained.toLocaleString('fr-FR')} F/mois MRR</div>
                </div>
              </div>

              {/* October Pipeline Status */}
              <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/10 text-xs space-y-1.5">
                <div className="font-bold text-textMain flex items-center justify-between">
                  <span>Pipeline Commercial :</span>
                  <span className="font-extrabold text-primary">
                    {octStats.meetingProspects.length} démos • {octStats.proposalProspects.length} offres
                  </span>
                </div>
                <div className="text-[11px] text-textMuted flex items-center justify-between">
                  <span>Discipline journalière :</span>
                  <span>{octStats.totalDaysLogged} jours actifs documentés</span>
                </div>
              </div>
            </div>

          </div>

          {/* Comparative Detail Table */}
          <div className="bg-card rounded-3xl p-6 sm:p-7 border border-gray-100 dark:border-darkBorder shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-textMain">Tableau Comparatif des Indicateurs Clés</h3>
                <p className="text-xs text-textMuted">
                  Mesure rigoureuse de la cadence, de la conversion et des revenus générés.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMonthKey('2026-09')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                    selectedMonthKey === '2026-09' 
                      ? 'bg-slate-800 text-white border-slate-700' 
                      : 'bg-background text-textMuted border-gray-200 dark:border-darkBorder hover:bg-gray-100'
                  }`}
                >
                  Voir Septembre
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMonthKey('2026-10')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                    selectedMonthKey === '2026-10' 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-background text-textMuted border-gray-200 dark:border-darkBorder hover:bg-gray-100'
                  }`}
                >
                  Voir Octobre
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-darkBorder text-[11px] font-bold text-textMuted uppercase tracking-wider">
                    <th className="py-3 px-3">Indicateur Commercial</th>
                    <th className="py-3 px-3 text-center">Septembre 2026 (Archive)</th>
                    <th className="py-3 px-3 text-center">Octobre 2026 (Actif)</th>
                    <th className="py-3 px-3 text-right">Progression / Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-darkBorder font-medium">
                  <tr>
                    <td className="py-3 px-3 font-bold text-textMain flex items-center gap-2">
                      <PhoneCall size={14} className="text-primary" />
                      <span>Volume de contacts total</span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-textMain">{sepStats.totalContacted} / 200</td>
                    <td className="py-3 px-3 text-center font-bold text-textMain">{octStats.totalContacted} / 200</td>
                    <td className="py-3 px-3 text-right font-bold text-primary">
                      {octStats.totalContacted - sepStats.totalContacted >= 0 ? `+${octStats.totalContacted - sepStats.totalContacted}` : `${octStats.totalContacted - sepStats.totalContacted}`}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-3 font-bold text-textMain flex items-center gap-2">
                      <Sparkles size={14} className="text-emerald-500" />
                      <span>Décideurs intéressés (retours positifs)</span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">{sepStats.totalInterested}</td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">{octStats.totalInterested}</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {octStats.totalInterested - sepStats.totalInterested >= 0 ? `+${octStats.totalInterested - sepStats.totalInterested}` : `${octStats.totalInterested - sepStats.totalInterested}`}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-3 font-bold text-textMain flex items-center gap-2">
                      <TrendingUp size={14} className="text-emerald-500" />
                      <span>Taux d'intérêt initial (%)</span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-textMain">{sepStats.conversionRate}%</td>
                    <td className="py-3 px-3 text-center font-bold text-textMain">{octStats.conversionRate}%</td>
                    <td className="py-3 px-3 text-right font-bold">
                      {octStats.conversionRate - sepStats.conversionRate >= 0 ? `+${octStats.conversionRate - sepStats.conversionRate} pts` : `${octStats.conversionRate - sepStats.conversionRate} pts`}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-3 font-bold text-textMain flex items-center gap-2">
                      <Clock size={14} className="text-amber-500" />
                      <span>À rappeler / Relances convenues</span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-amber-600 dark:text-amber-400">{sepStats.totalCallback}</td>
                    <td className="py-3 px-3 text-center font-bold text-amber-600 dark:text-amber-400">{octStats.totalCallback}</td>
                    <td className="py-3 px-3 text-right font-bold text-amber-600 dark:text-amber-400">
                      {octStats.totalCallback - sepStats.totalCallback >= 0 ? `+${octStats.totalCallback - sepStats.totalCallback}` : `${octStats.totalCallback - sepStats.totalCallback}`}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-3 font-bold text-textMain flex items-center gap-2">
                      <Building size={14} className="text-indigo-500" />
                      <span>Démos logicielles présentées</span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-textMain">{sepStats.meetingProspects.length}</td>
                    <td className="py-3 px-3 text-center font-bold text-textMain">{octStats.meetingProspects.length}</td>
                    <td className="py-3 px-3 text-right font-bold text-indigo-500">
                      {octStats.meetingProspects.length - sepStats.meetingProspects.length >= 0 ? `+${octStats.meetingProspects.length - sepStats.meetingProspects.length}` : `${octStats.meetingProspects.length - sepStats.meetingProspects.length}`}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-3 font-bold text-textMain flex items-center gap-2">
                      <FileText size={14} className="text-blue-500" />
                      <span>Propositions / Devis transmis</span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-textMain">{sepStats.proposalProspects.length}</td>
                    <td className="py-3 px-3 text-center font-bold text-textMain">{octStats.proposalProspects.length}</td>
                    <td className="py-3 px-3 text-right font-bold text-blue-500">
                      {octStats.proposalProspects.length - sepStats.proposalProspects.length >= 0 ? `+${octStats.proposalProspects.length - sepStats.proposalProspects.length}` : `${octStats.proposalProspects.length - sepStats.proposalProspects.length}`}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-3 font-bold text-textMain flex items-center gap-2">
                      <Trophy size={14} className="text-amber-500" />
                      <span>Clients signés (Gagnés)</span>
                    </td>
                    <td className="py-3 px-3 text-center font-black text-emerald-600 dark:text-emerald-400">{sepStats.wonProspects.length}</td>
                    <td className="py-3 px-3 text-center font-black text-emerald-600 dark:text-emerald-400">{octStats.wonProspects.length}</td>
                    <td className="py-3 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                      {octStats.wonProspects.length - sepStats.wonProspects.length >= 0 ? `+${octStats.wonProspects.length - sepStats.wonProspects.length}` : `${octStats.wonProspects.length - sepStats.wonProspects.length}`}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-3 font-bold text-textMain flex items-center gap-2">
                      <DollarSign size={14} className="text-emerald-500" />
                      <span>Revenu Immédiat Encaissé (Cash)</span>
                    </td>
                    <td className="py-3 px-3 text-center font-black text-emerald-600 dark:text-emerald-400">
                      {sepStats.totalCashEarned.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-3 px-3 text-center font-black text-emerald-600 dark:text-emerald-400">
                      {octStats.totalCashEarned.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-3 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                      {(octStats.totalCashEarned - sepStats.totalCashEarned) >= 0 ? `+${(octStats.totalCashEarned - sepStats.totalCashEarned).toLocaleString('fr-FR')} FCFA` : `${(octStats.totalCashEarned - sepStats.totalCashEarned).toLocaleString('fr-FR')} FCFA`}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-3 font-bold text-textMain flex items-center gap-2">
                      <Zap size={14} className="text-indigo-500" />
                      <span>Revenu Récurrent Mensuel (MRR)</span>
                    </td>
                    <td className="py-3 px-3 text-center font-black text-indigo-600 dark:text-indigo-400">
                      {sepStats.mrrGained.toLocaleString('fr-FR')} FCFA / mois
                    </td>
                    <td className="py-3 px-3 text-center font-black text-indigo-600 dark:text-indigo-400">
                      {octStats.mrrGained.toLocaleString('fr-FR')} FCFA / mois
                    </td>
                    <td className="py-3 px-3 text-right font-black text-indigo-600 dark:text-indigo-400">
                      {(octStats.mrrGained - sepStats.mrrGained) >= 0 ? `+${(octStats.mrrGained - sepStats.mrrGained).toLocaleString('fr-FR')} FCFA/m` : `${(octStats.mrrGained - sepStats.mrrGained).toLocaleString('fr-FR')} FCFA/m`}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Strategic Retrospective & Action Plan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-card rounded-3xl p-6 border border-gray-100 dark:border-darkBorder shadow-sm space-y-3">
              <div className="flex items-center gap-2 font-black text-sm text-textMain">
                <BookOpen size={16} className="text-slate-500" />
                <span>Enseignements Clés du Challenge Septembre</span>
              </div>
              <ul className="text-xs text-textMuted space-y-2 list-disc list-inside">
                <li>
                  <strong>Offre 30 000 FCFA/mois :</strong> Très bien accueillie par les PME ivoiriennes par rapport aux devis d'agences classiques (1 à 2 millions FCFA).
                </li>
                <li>
                  <strong>Visite physique directe :</strong> Le contact humain en face-à-face à Abidjan génère un taux de démo 3x supérieur au simple démarchage téléphonique.
                </li>
                <li>
                  <strong>Relance WhatsApp :</strong> 80% des décisions se débloquent lors de la relance à J+2 avec envoi du lien de démo.
                </li>
              </ul>
            </div>

            <div className="bg-card rounded-3xl p-6 border border-gray-100 dark:border-darkBorder shadow-sm space-y-3">
              <div className="flex items-center gap-2 font-black text-sm text-textMain">
                <Target size={16} className="text-primary" />
                <span>Plan de Bataille pour le Challenge Octobre</span>
              </div>
              <ul className="text-xs text-textMuted space-y-2 list-disc list-inside">
                <li>
                  <strong>Objectif volume strict :</strong> 10 entreprises contactées chaque jour ouvré, soit 200 contacts sur le mois.
                </li>
                <li>
                  <strong>Secteurs cibles prioritaires :</strong> Cliniques & cabinets médicaux, agences immobilières, quincailleries et grossistes.
                </li>
                <li>
                  <strong>Objectif financier :</strong> Signer 2 nouveaux clients récurrents pour atteindre 60 000 FCFA de MRR supplémentaire ou 600 000 FCFA en annuel.
                </li>
              </ul>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL : SAISIE / ÉDITION D'UN ÉCHANGE COMMERCIAL */}
      {/* ========================================================= */}
      {showInteractionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-darkBorder space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-darkBorder">
              <h3 className="text-base font-bold text-textMain">
                {editingInteractionId ? "✏️ Modifier l'Échange Commercial" : "🏢 Enregistrer un Échange Commercial"}
              </h3>
              <button 
                type="button"
                onClick={() => {
                  setShowInteractionModal(false);
                  setEditingInteractionId(null);
                }} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-textMuted hover:text-textMain hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                title="Fermer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveInteraction} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-textMuted block mb-1">Nom de l'entreprise</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Clinique Médicale Cocody, Agence Immo"
                  value={interactionForm.companyName}
                  onChange={(e) => setInteractionForm({ ...interactionForm, companyName: e.target.value })}
                  className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-xs text-textMain focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-textMuted block mb-1">Contact / Décideur</label>
                <input
                  type="text"
                  placeholder="ex: Dr. Kouamé, Gérant"
                  value={interactionForm.contactPerson}
                  onChange={(e) => setInteractionForm({ ...interactionForm, contactPerson: e.target.value })}
                  className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-xs text-textMain focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-textMuted block mb-1">Téléphone (Appel / WhatsApp)</label>
                  <input
                    type="tel"
                    placeholder="ex: +225 07 00 00 00"
                    value={interactionForm.phone}
                    onChange={(e) => setInteractionForm({ ...interactionForm, phone: e.target.value })}
                    className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-xs text-textMain focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-textMuted block mb-1">Lieu ou Lien Visio</label>
                  <input
                    type="text"
                    placeholder="ex: Cocody, Google Meet"
                    value={interactionForm.location}
                    onChange={(e) => setInteractionForm({ ...interactionForm, location: e.target.value })}
                    className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-xs text-textMain focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-textMuted block mb-1">Résultat de l'échange</label>
                <select
                  value={interactionForm.status}
                  onChange={(e) => setInteractionForm({ ...interactionForm, status: e.target.value })}
                  className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-xs font-bold text-textMain focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="interested">🤝 Accepté / Intéressé (Fixer un RDV dans l'Agenda)</option>
                  <option value="callback">⏳ En réflexion / À rappeler (Fixer une date de relance)</option>
                  <option value="refused">❌ Refus / Pas intéressé</option>
                  <option value="unreachable">📵 Injoignable</option>
                </select>
              </div>

              {/* Conditional RDV Date & Time Pickers for Agenda Blocking */}
              {interactionForm.status === 'interested' && (
                <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-500/40 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
                    <Calendar size={14} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Créneau du Rendez-vous (Bloque l'Agenda)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-textMuted uppercase block mb-0.5">Date</label>
                      <input
                        type="date"
                        required
                        value={interactionForm.appointmentDate || selectedDate}
                        onChange={(e) => setInteractionForm({ ...interactionForm, appointmentDate: e.target.value })}
                        className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-2.5 py-1.5 text-xs font-bold text-textMain focus:outline-none focus:border-emerald-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-textMuted uppercase block mb-0.5">Heure Début</label>
                      <input
                        type="time"
                        required
                        value={interactionForm.appointmentStartTime}
                        onChange={(e) => setInteractionForm({ ...interactionForm, appointmentStartTime: e.target.value })}
                        className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-2.5 py-1.5 text-xs font-bold text-textMain focus:outline-none focus:border-emerald-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-textMuted uppercase block mb-0.5">Heure Fin</label>
                      <input
                        type="time"
                        required
                        value={interactionForm.appointmentEndTime}
                        onChange={(e) => setInteractionForm({ ...interactionForm, appointmentEndTime: e.target.value })}
                        className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-2.5 py-1.5 text-xs font-bold text-textMain focus:outline-none focus:border-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
                    ✨ Ce créneau sera automatiquement synchronisé dans vos vues <strong>Aujourd'hui</strong> et <strong>Semaine</strong> avec badge 🤝 RDV PROSPECT et accès direct aux détails.
                  </p>
                </div>
              )}

              {interactionForm.status === 'callback' && (
                <div>
                  <label className="text-xs font-semibold text-amber-600 dark:text-amber-400 block mb-1">
                    ⏰ Date & Heure de Relance convenue :
                  </label>
                  <input
                    type="datetime-local"
                    value={interactionForm.callbackDate}
                    onChange={(e) => setInteractionForm({ ...interactionForm, callbackDate: e.target.value })}
                    className="w-full bg-background border border-amber-500/40 rounded-xl px-3 py-2 text-xs font-bold text-textMain focus:outline-none cursor-pointer"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-textMuted block mb-1">Formule Tarifaire proposée</label>
                <select
                  value={interactionForm.pricingModel}
                  onChange={(e) => setInteractionForm({ ...interactionForm, pricingModel: e.target.value })}
                  className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-xs font-bold text-textMain focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="monthly">30 000 FCFA / mois (Mensuel)</option>
                  <option value="yearly">300 000 FCFA / an (Annuel 🔥)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-textMuted block mb-1">Détails de la conversation & objectifs du RDV</label>
                <textarea
                  rows={3}
                  placeholder="Ce qui a été dit, besoins du prospect, objections soulevées, démo à préparer..."
                  value={interactionForm.notes}
                  onChange={(e) => setInteractionForm({ ...interactionForm, notes: e.target.value })}
                  className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-xs text-textMain focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-darkBorder">
                <button
                  type="button"
                  onClick={() => {
                    setShowInteractionModal(false);
                    setEditingInteractionId(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-textMuted hover:bg-gray-100 dark:hover:bg-darkCard cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-sm cursor-pointer"
                >
                  {editingInteractionId 
                    ? "Enregistrer les modifications" 
                    : (interactionForm.status === 'interested' ? "🤝 Bloquer le RDV dans l'Agenda" : "Enregistrer l'échange")}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Challenge30Days;
