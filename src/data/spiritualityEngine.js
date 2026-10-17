// src/data/spiritualityEngine.js
// Système de Gestion Spirituelle & Suivi du Coran pour Méhdi
// Intègre le suivi du Coran (604 pages du Mushaf), les 5 prières quotidiennes, le Dhikr (Tasbih) et les Hadiths du jour.

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getTodayStr, getAbidjanDateStr } from './scoreHistory';

const STORAGE_KEY = 'pos_spirituality_state_v1';
export const TOTAL_QURAN_PAGES = 604;

// Liste des 114 Sourates avec numéro, nom phonétique, nom arabe, traduction et page de début
export const QURAN_SURAHS = [
  { num: 1, name: 'Al-Fatiha', arabic: 'الفاتحة', french: "L'Ouverture", startPage: 1 },
  { num: 2, name: 'Al-Baqarah', arabic: 'البقرة', french: 'La Vache', startPage: 2 },
  { num: 3, name: 'Ali Imran', arabic: 'آل عمران', french: "La Famille d'Imran", startPage: 50 },
  { num: 4, name: 'An-Nisa', arabic: 'النساء', french: 'Les Femmes', startPage: 77 },
  { num: 5, name: 'Al-Maidah', arabic: 'المائدة', french: 'La Table Servie', startPage: 106 },
  { num: 6, name: "Al-An'am", arabic: 'الأنعام', french: 'Les Bestiaux', startPage: 128 },
  { num: 7, name: "Al-A'raf", arabic: 'الأعراف', french: 'Les Murailles', startPage: 151 },
  { num: 8, name: 'Al-Anfal', arabic: 'الأنفال', french: 'Le Butin', startPage: 177 },
  { num: 9, name: 'At-Tawbah', arabic: 'التوبة', french: 'Le Repentir', startPage: 187 },
  { num: 10, name: 'Yunus', arabic: 'يونس', french: 'Jonas', startPage: 208 },
  { num: 11, name: 'Hud', arabic: 'هود', french: 'Hûd', startPage: 221 },
  { num: 12, name: 'Yusuf', arabic: 'يوسف', french: 'Joseph', startPage: 235 },
  { num: 13, name: "Ar-Ra'd", arabic: 'الرعد', french: 'Le Tonnerre', startPage: 249 },
  { num: 14, name: 'Ibrahim', arabic: 'إبراهيم', french: 'Abraham', startPage: 255 },
  { num: 15, name: 'Al-Hijr', arabic: 'الحجر', french: 'Al-Hijr', startPage: 262 },
  { num: 16, name: 'An-Nahl', arabic: 'النحل', french: 'Les Abeilles', startPage: 267 },
  { num: 17, name: 'Al-Isra', arabic: 'الإسراء', french: 'Le Voyage Nocturne', startPage: 282 },
  { num: 18, name: 'Al-Kahf', arabic: 'الكهف', french: 'La Caverne', startPage: 293 },
  { num: 19, name: 'Maryam', arabic: 'مريم', french: 'Marie', startPage: 305 },
  { num: 20, name: 'Ta-Ha', arabic: 'طه', french: 'Tâ-Hâ', startPage: 312 },
  { num: 21, name: 'Al-Anbiya', arabic: 'الأنبياء', french: 'Les Prophètes', startPage: 322 },
  { num: 22, name: 'Al-Hajj', arabic: 'الحج', french: 'Le Pèlerinage', startPage: 332 },
  { num: 23, name: "Al-Mu'minun", arabic: 'المؤمنون', french: 'Les Croyants', startPage: 342 },
  { num: 24, name: 'An-Nur', arabic: 'النور', french: 'La Lumière', startPage: 350 },
  { num: 25, name: 'Al-Furqan', arabic: 'الفرقان', french: 'Le Discernement', startPage: 359 },
  { num: 26, name: "Ash-Shu'ara", arabic: 'الشعراء', french: 'Les Poètes', startPage: 367 },
  { num: 27, name: 'An-Naml', arabic: 'النمل', french: 'Les Fourmis', startPage: 377 },
  { num: 28, name: 'Al-Qasas', arabic: 'القصص', french: 'Le Récit', startPage: 385 },
  { num: 29, name: 'Al-Ankabut', arabic: 'العنكبوت', french: "L'Araignée", startPage: 396 },
  { num: 30, name: 'Ar-Rum', arabic: 'الروم', french: 'Les Romains', startPage: 404 },
  { num: 31, name: 'Luqman', arabic: 'لقمان', french: 'Luqmân', startPage: 411 },
  { num: 32, name: 'As-Sajdah', arabic: 'السجدة', french: 'La Prosternation', startPage: 415 },
  { num: 33, name: 'Al-Ahzab', arabic: 'الأحزاب', french: 'Les Coalisés', startPage: 418 },
  { num: 34, name: 'Saba', arabic: 'سبأ', french: 'Saba', startPage: 428 },
  { num: 35, name: 'Fatir', arabic: 'فاطر', french: 'Le Créateur', startPage: 434 },
  { num: 36, name: 'Ya-Sin', arabic: 'يس', french: 'Yâ-Sîn', startPage: 440 },
  { num: 37, name: 'As-Saffat', arabic: 'الصافات', french: 'Les Rangés', startPage: 446 },
  { num: 38, name: 'Sad', arabic: 'ص', french: 'Sâd', startPage: 453 },
  { num: 39, name: 'Az-Zumar', arabic: 'الزمر', french: 'Les Groupes', startPage: 458 },
  { num: 40, name: 'Ghafir', arabic: 'غافر', french: 'Le Pardonneur', startPage: 467 },
  { num: 41, name: 'Fussilat', arabic: 'فصلت', french: 'Les Versets Détaillés', startPage: 477 },
  { num: 42, name: 'Ash-Shura', arabic: 'الشورى', french: 'La Consultation', startPage: 483 },
  { num: 43, name: 'Az-Zukhruf', arabic: 'الزخرف', french: "L'Ornement", startPage: 489 },
  { num: 44, name: 'Ad-Dukhan', arabic: 'الدخان', french: 'La Fumée', startPage: 496 },
  { num: 45, name: 'Al-Jathiyah', arabic: 'الجاثية', french: "L'Agenouillée", startPage: 499 },
  { num: 46, name: 'Al-Ahqaf', arabic: 'الأحقاف', french: 'Al-Ahqâf', startPage: 502 },
  { num: 47, name: 'Muhammad', arabic: 'محمد', french: 'Muhammad', startPage: 507 },
  { num: 48, name: 'Al-Fath', arabic: 'الفتح', french: 'La Victoire Éclatante', startPage: 511 },
  { num: 49, name: 'Al-Hujurat', arabic: 'الحجرات', french: 'Les Appartements', startPage: 515 },
  { num: 50, name: 'Qaf', arabic: 'ق', french: 'Qâf', startPage: 518 },
  { num: 51, name: 'Adh-Dhariyat', arabic: 'الذاريات', french: 'Qui Éparpillent', startPage: 520 },
  { num: 52, name: 'At-Tur', arabic: 'الطور', french: 'Le Mont', startPage: 523 },
  { num: 53, name: 'An-Najm', arabic: 'النجم', french: "L'Étoile", startPage: 526 },
  { num: 54, name: 'Al-Qamar', arabic: 'القمر', french: 'La Lune', startPage: 528 },
  { num: 55, name: 'Ar-Rahman', arabic: 'الرحمن', french: 'Le Tout Miséricordieux', startPage: 531 },
  { num: 56, name: 'Al-Waqi’ah', arabic: 'الواقعة', french: "L'Événement Inéluctable", startPage: 534 },
  { num: 57, name: 'Al-Hadid', arabic: 'الحديد', french: 'Le Fer', startPage: 537 },
  { num: 58, name: 'Al-Mujadilah', arabic: 'المجادلة', french: 'La Discussion', startPage: 542 },
  { num: 59, name: 'Al-Hashr', arabic: 'الحشر', french: "L'Exode", startPage: 545 },
  { num: 60, name: 'Al-Mumtahanah', arabic: 'الممتحنة', french: "L'Éprouvée", startPage: 549 },
  { num: 61, name: 'As-Saff', arabic: 'الصف', french: 'Le Rang', startPage: 551 },
  { num: 62, name: "Al-Jumu'ah", arabic: 'الجمعة', french: 'Le Vendredi', startPage: 553 },
  { num: 63, name: 'Al-Munafiqun', arabic: 'المنافقون', french: 'Les Hypocrites', startPage: 554 },
  { num: 64, name: 'At-Taghabun', arabic: 'التغابن', french: 'La Grande Perte', startPage: 556 },
  { num: 65, name: 'At-Talaq', arabic: 'الطلاق', french: 'Le Divorce', startPage: 558 },
  { num: 66, name: 'At-Tahrim', arabic: 'التحريم', french: "L'Interdiction", startPage: 560 },
  { num: 67, name: 'Al-Mulk', arabic: 'الملك', french: 'La Royauté', startPage: 562 },
  { num: 68, name: 'Al-Qalam', arabic: 'القلم', french: 'La Plume', startPage: 564 },
  { num: 69, name: 'Al-Haqqah', arabic: 'الحاقة', french: "L'Inévitable", startPage: 566 },
  { num: 70, name: "Al-Ma'arij", arabic: 'المعارج', french: 'Les Voies d’Ascension', startPage: 568 },
  { num: 71, name: 'Nuh', arabic: 'نوح', french: 'Noé', startPage: 570 },
  { num: 72, name: 'Al-Jinn', arabic: 'الجن', french: 'Les Djinns', startPage: 572 },
  { num: 73, name: 'Al-Muzzammil', arabic: 'المزمل', french: "L'Enveloppé", startPage: 574 },
  { num: 74, name: 'Al-Muddaththir', arabic: 'المدثر', french: 'Le Revêtu d’un Manteau', startPage: 575 },
  { num: 75, name: 'Al-Qiyamah', arabic: 'القيامة', french: 'La Résurrection', startPage: 577 },
  { num: 76, name: 'Al-Insan', arabic: 'الإنسان', french: "L'Homme", startPage: 578 },
  { num: 77, name: 'Al-Mursalat', arabic: 'المرسلات', french: 'Les Envoyés', startPage: 580 },
  { num: 78, name: 'An-Naba', arabic: 'النبأ', french: 'La Nouvelle', startPage: 582 },
  { num: 79, name: "An-Nazi'at", arabic: 'النازعات', french: 'Les Anges qui Arrachent', startPage: 583 },
  { num: 80, name: 'Abasa', arabic: 'عبس', french: 'Il s’est Renfrogné', startPage: 585 },
  { num: 81, name: 'At-Takwir', arabic: 'التكوير', french: "L'Obscurcissement", startPage: 586 },
  { num: 82, name: 'Al-Infitar', arabic: 'الانفطار', french: 'La Rupture', startPage: 587 },
  { num: 83, name: 'Al-Mutaffifin', arabic: 'المطففين', french: 'Les Fraudeurs', startPage: 587 },
  { num: 84, name: 'Al-Inshiqaq', arabic: 'الانشقاق', french: 'La Déchirure', startPage: 589 },
  { num: 85, name: 'Al-Buruj', arabic: 'البروج', french: 'Les Constellations', startPage: 590 },
  { num: 86, name: 'At-Tariq', arabic: 'الطارق', french: "L'Astre Nocturne", startPage: 591 },
  { num: 87, name: "Al-A'la", arabic: 'الأعلى', french: 'Le Très-Haut', startPage: 591 },
  { num: 88, name: 'Al-Ghashiyah', arabic: 'الغاشية', french: "L'Enveloppante", startPage: 592 },
  { num: 89, name: 'Al-Fajr', arabic: 'الفجر', french: "L'Aube", startPage: 593 },
  { num: 90, name: 'Al-Balad', arabic: 'البلد', french: 'La Cité', startPage: 594 },
  { num: 91, name: 'Ash-Shams', arabic: 'الشمس', french: 'Le Soleil', startPage: 595 },
  { num: 92, name: 'Al-Layl', arabic: 'الليل', french: 'La Nuit', startPage: 595 },
  { num: 93, name: 'Ad-Duha', arabic: 'الضحى', french: 'Le Jour Montant', startPage: 596 },
  { num: 94, name: 'Ash-Sharh', arabic: 'الشرح', french: "L'Ouverture du Cœur", startPage: 596 },
  { num: 95, name: 'At-Tin', arabic: 'التين', french: 'Le Figuier', startPage: 597 },
  { num: 96, name: 'Al-Alaq', arabic: 'العلق', french: "L'Adhérence", startPage: 597 },
  { num: 97, name: 'Al-Qadr', arabic: 'القدر', french: 'La Destinée', startPage: 598 },
  { num: 98, name: 'Al-Bayyinah', arabic: 'البينة', french: 'La Preuve Évidente', startPage: 598 },
  { num: 99, name: 'Az-Zalzalah', arabic: 'الزلزلة', french: 'La Secousse', startPage: 599 },
  { num: 100, name: 'Al-Adiyat', arabic: 'العاديات', french: 'Les Coursiers', startPage: 599 },
  { num: 101, name: 'Al-Qari’ah', arabic: 'القارعة', french: 'Le Fracas', startPage: 600 },
  { num: 102, name: 'At-Takathur', arabic: 'التكاثر', french: 'La Course aux Richesses', startPage: 600 },
  { num: 103, name: 'Al-Asr', arabic: 'العصر', french: 'Le Temps', startPage: 601 },
  { num: 104, name: 'Al-Humazah', arabic: 'الهمزة', french: 'Les Calomniateurs', startPage: 601 },
  { num: 105, name: 'Al-Fil', arabic: 'الفيل', french: "L'Éléphant", startPage: 601 },
  { num: 106, name: 'Quraysh', arabic: 'قريش', french: 'Les Quraych', startPage: 602 },
  { num: 107, name: "Al-Ma'un", arabic: 'الماعون', french: "L'Entraide", startPage: 602 },
  { num: 108, name: 'Al-Kawthar', arabic: 'الكوثر', french: "L'Abondance", startPage: 602 },
  { num: 109, name: 'Al-Kafirun', arabic: 'الكافرون', french: 'Les Infidèles', startPage: 603 },
  { num: 110, name: 'An-Nasr', arabic: 'النصر', french: 'Le Secours', startPage: 603 },
  { num: 111, name: 'Al-Masad', arabic: 'المسد', french: 'Les Fibres', startPage: 603 },
  { num: 112, name: 'Al-Ikhlas', arabic: 'الإخلاص', french: 'Le Monothéisme Pur', startPage: 604 },
  { num: 113, name: 'Al-Falaq', arabic: 'الفلق', french: "L'Aube Naissante", startPage: 604 },
  { num: 114, name: 'An-Nas', arabic: 'الناس', french: 'Les Hommes', startPage: 604 }
];

// Helper: Trouve la Sourate courante selon la page
export const getSurahForPage = (page) => {
  const p = Math.max(1, Math.min(TOTAL_QURAN_PAGES, Number(page) || 1));
  let current = QURAN_SURAHS[0];
  for (let i = 0; i < QURAN_SURAHS.length; i++) {
    if (QURAN_SURAHS[i].startPage <= p) {
      current = QURAN_SURAHS[i];
    } else {
      break;
    }
  }
  return current;
};

// Versets et Hadiths inspirants avec traduction et référence
export const SPIRITUAL_QUOTES = [
  {
    id: 1,
    arabic: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
    french: "« Et dis : Ô mon Seigneur, accrois mes connaissances ! »",
    reference: "Sourate Tâ-Hâ (20:114)"
  },
  {
    id: 2,
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    french: "« À côté de la difficulté est, certes, une facilité ! À côté de la difficulté est, certes, une facilité ! »",
    reference: "Sourate Ash-Sharh (94:5-6)"
  },
  {
    id: 3,
    arabic: "إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ",
    french: "« Allah aime que lorsque l'un de vous accomplit une œuvre, il la perfectionne avec excellence (Ihsân). »",
    reference: "Hadith rapporté par Al-Bayhaqi"
  },
  {
    id: 4,
    arabic: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
    french: "« Les actions les plus aimées d'Allah sont les plus régulières, même si elles sont peu nombreuses. »",
    reference: "Hadith Sahih Al-Bukhari & Muslim"
  },
  {
    id: 5,
    arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    french: "« Et quiconque place sa confiance en Allah, Il lui suffit. »",
    reference: "Sourate At-Talaq (65:3)"
  },
  {
    id: 6,
    arabic: "الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ",
    french: "« Le croyant fort est meilleur et plus aimé d'Allah que le croyant faible, et en chacun il y a du bien. »",
    reference: "Hadith Sahih Muslim"
  }
];

// Formules de Dhikr / Tasbih
export const DHIKR_ITEMS = [
  { id: 'subhanallah', arabic: 'سُبْحَانَ اللَّهِ', text: 'Subhân Allâh', meaning: 'Gloire à Allah', target: 33 },
  { id: 'alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', text: 'Al-Hamdou Lillâh', meaning: 'Louange à Allah', target: 33 },
  { id: 'allahuakbar', arabic: 'اللَّهُ أَكْبَرُ', text: 'Allâhou Akbar', meaning: 'Allah est le Plus Grand', target: 34 },
  { id: 'astaghfirullah', arabic: 'أَسْتَغْفِرُ اللَّهَ', text: 'Astaghfiroullâh', meaning: 'Je demande pardon à Allah', target: 100 },
  { id: 'lailahaillallah', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ', text: 'Lâ ilâha illa Allâh', meaning: 'Nulle divinité digne d’adoration sauf Allah', target: 100 }
];

// Configuration par défaut de l'état
const INITIAL_STATE = {
  quran: {
    currentPage: 1,
    lastReadDate: '',
    pagesReadToday: 0,
    dailyTarget: 1, // 1 page / jour par défaut
    totalKhatmas: 0,
    readingStreak: 0,
    history: {} // { '2026-10-17': { pages: 1, endPage: 2 } }
  },
  prayers: {
    // { '2026-10-17': { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false } }
  },
  tasbih: {
    // { 'subhanallah': count, ... }
  },
  notes: ''
};

// Chargement sécurisé de l'état
export const loadSpiritualityState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw);
    
    // Vérification de réinitialisation journalière pour pagesReadToday
    const today = getAbidjanDateStr ? getAbidjanDateStr() : getTodayStr();
    const lastDate = parsed.quran?.lastReadDate || '';
    
    const state = {
      ...INITIAL_STATE,
      ...parsed,
      quran: {
        ...INITIAL_STATE.quran,
        ...parsed.quran,
        pagesReadToday: lastDate === today ? (parsed.quran?.pagesReadToday || 0) : 0
      }
    };
    return state;
  } catch (e) {
    console.warn('Erreur chargement état spiritualité:', e);
    return INITIAL_STATE;
  }
};

// Sauvegarde locale + synchro Firestore
export const saveSpiritualityState = async (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Synchronisation Firestore discrète si possible
    try {
      const docRef = doc(db, 'productivity_user', 'spirituality');
      await setDoc(docRef, state, { merge: true });
    } catch {
      // Offline fallback silent
    }
  } catch (e) {
    console.warn('Erreur sauvegarde état spiritualité:', e);
  }
};

// Action : Valider +1 page de lecture
export const incrementQuranPage = (customAmount = 1) => {
  const current = loadSpiritualityState();
  const today = getAbidjanDateStr ? getAbidjanDateStr() : getTodayStr();
  
  let newPage = (current.quran.currentPage || 1) + customAmount;
  let newKhatmas = current.quran.totalKhatmas || 0;
  
  // Bouclage en cas d'achèvement de la Khatma (page 604)
  if (newPage > TOTAL_QURAN_PAGES) {
    newKhatmas += 1;
    newPage = newPage - TOTAL_QURAN_PAGES;
  }

  const isNewDay = current.quran.lastReadDate !== today;
  const newPagesToday = isNewDay ? customAmount : (current.quran.pagesReadToday || 0) + customAmount;
  
  // Mise à jour du streak
  let newStreak = current.quran.readingStreak || 0;
  if (isNewDay) {
    newStreak += 1;
  }

  const updated = {
    ...current,
    quran: {
      ...current.quran,
      currentPage: newPage,
      lastReadDate: today,
      pagesReadToday: newPagesToday,
      totalKhatmas: newKhatmas,
      readingStreak: newStreak,
      history: {
        ...(current.quran.history || {}),
        [today]: {
          pagesRead: newPagesToday,
          endPage: newPage,
          timestamp: Date.now()
        }
      }
    }
  };

  saveSpiritualityState(updated);
  return updated;
};

// Action : Reculer d'une page (si fausse manipulation)
export const decrementQuranPage = () => {
  const current = loadSpiritualityState();
  const today = getAbidjanDateStr ? getAbidjanDateStr() : getTodayStr();
  
  let newPage = Math.max(1, (current.quran.currentPage || 1) - 1);
  const pagesToday = Math.max(0, (current.quran.pagesReadToday || 1) - 1);

  const updated = {
    ...current,
    quran: {
      ...current.quran,
      currentPage: newPage,
      pagesReadToday: pagesToday
    }
  };

  saveSpiritualityState(updated);
  return updated;
};

// Action : Définir la page exacte
export const setExactQuranPage = (pageNumber) => {
  const current = loadSpiritualityState();
  const safePage = Math.max(1, Math.min(TOTAL_QURAN_PAGES, Number(pageNumber) || 1));
  const today = getAbidjanDateStr ? getAbidjanDateStr() : getTodayStr();

  const updated = {
    ...current,
    quran: {
      ...current.quran,
      currentPage: safePage,
      lastReadDate: today
    }
  };

  saveSpiritualityState(updated);
  return updated;
};

// Action : Cocher/Décocher une prière pour aujourd'hui
export const toggleDailyPrayer = (prayerKey) => {
  const current = loadSpiritualityState();
  const today = getAbidjanDateStr ? getAbidjanDateStr() : getTodayStr();

  const todayPrayers = current.prayers[today] || {
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false
  };

  const updatedPrayers = {
    ...current.prayers,
    [today]: {
      ...todayPrayers,
      [prayerKey]: !todayPrayers[prayerKey]
    }
  };

  const updated = {
    ...current,
    prayers: updatedPrayers
  };

  saveSpiritualityState(updated);
  return updated;
};

// Action : Incrémenter le Tasbih
export const incrementTasbih = (dhikrId) => {
  const current = loadSpiritualityState();
  const prevCount = current.tasbih[dhikrId] || 0;
  const updated = {
    ...current,
    tasbih: {
      ...current.tasbih,
      [dhikrId]: prevCount + 1
    }
  };
  saveSpiritualityState(updated);
  return updated;
};

// Action : Reset d'un compteur de Tasbih
export const resetTasbih = (dhikrId) => {
  const current = loadSpiritualityState();
  const updated = {
    ...current,
    tasbih: {
      ...current.tasbih,
      [dhikrId]: 0
    }
  };
  saveSpiritualityState(updated);
  return updated;
};
