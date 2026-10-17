import React, { useState } from 'react';
import { Ban, ShieldAlert, X, Check, Droplet, Clock, Plus, Trash2, Bell, AlertTriangle, BookOpen, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { testNotification, showSystemNotification } from '../../utils/notificationService';

const MustNotDoModal = ({ 
  isOpen, 
  onClose, 
  mustNotDoData, 
  onUpdateMustNotDoData,
  onAddWater 
}) => {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('rules'); // 'rules' | 'science' | 'settings'
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [testSent, setTestSent] = useState(false);

  if (!isOpen) return null;

  const handleToggleRule = (ruleId) => {
    if (!mustNotDoData || !onUpdateMustNotDoData) return;
    const updated = {
      ...mustNotDoData,
      customRules: (mustNotDoData.customRules || []).map(r => 
        r.id === ruleId ? { ...r, active: !r.active } : r
      )
    };
    onUpdateMustNotDoData(updated);
  };

  const handleAddCustomRule = (e) => {
    e.preventDefault();
    if (!newRuleTitle.trim() || !onUpdateMustNotDoData) return;
    const newRule = {
      id: `custom_${Date.now()}`,
      title: newRuleTitle.trim(),
      active: true
    };
    const updated = {
      ...mustNotDoData,
      customRules: [...(mustNotDoData.customRules || []), newRule]
    };
    onUpdateMustNotDoData(updated);
    setNewRuleTitle('');
  };

  const handleDeleteCustomRule = (ruleId) => {
    if (!onUpdateMustNotDoData) return;
    const updated = {
      ...mustNotDoData,
      customRules: (mustNotDoData.customRules || []).filter(r => r.id !== ruleId)
    };
    onUpdateMustNotDoData(updated);
  };

  const handleChangeInterval = (mins) => {
    if (!onUpdateMustNotDoData) return;
    const updated = {
      ...mustNotDoData,
      hydrationIntervalMinutes: mins
    };
    onUpdateMustNotDoData(updated);
  };

  const handleToggleNotifications = () => {
    if (!onUpdateMustNotDoData) return;
    const updated = {
      ...mustNotDoData,
      notificationsEnabled: !mustNotDoData.notificationsEnabled
    };
    onUpdateMustNotDoData(updated);
  };

  const handleTestNotification = async () => {
    setTestSent(true);
    await showSystemNotification('💧 Test Must-Not-Do : Alerte Hydratation', {
      body: 'Ceci est votre rappel automatique d\'hydratation toutes les 60 minutes.',
      tag: 'test-hydration'
    });
    setTimeout(() => setTestSent(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 dark:border-darkBorder overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-darkBorder flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
              <Ban size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-textMain">
                {lang === 'en' ? 'Must Not Do System' : 'Système Must Not Do'}
              </h2>
              <p className="text-xs text-textMuted font-medium">
                {lang === 'en' ? 'The non-negotiable rules for daily progress' : 'Les règles non-négociables pour progresser chaque jour'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-textMuted hover:text-textMain hover:bg-gray-100 dark:hover:bg-darkBorder transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 dark:border-darkBorder px-6 pt-2 bg-background/50">
          <button
            onClick={() => setActiveTab('rules')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'rules'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-textMuted hover:text-textMain'
            }`}
          >
            <ShieldAlert size={14} />
            <span>{lang === 'en' ? 'Active Rules' : 'Mes Règles'}</span>
          </button>

          <button
            onClick={() => setActiveTab('science')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'science'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-textMuted hover:text-textMain'
            }`}
          >
            <BookOpen size={14} />
            <span>{lang === 'en' ? 'Scientific Research' : 'Recherches Médicales'}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-primary text-primary'
                : 'border-transparent text-textMuted hover:text-textMain'
            }`}
          >
            <Bell size={14} />
            <span>{lang === 'en' ? 'Notifications' : 'Alertes & Réglages'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          
          {/* TAB 1: RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <span>
                  {lang === 'en'
                    ? 'A "Must-Not-Do" list is more powerful than a to-do list. It protects your energy and prevents decision fatigue.'
                    : 'La liste "Must Not Do" élimine les pièges qui sabotent vos journées : repas tardifs, grignotages parasites et déshydratation.'}
                </span>
              </div>

              {/* The Core Non-Negotiable Rules */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold text-textMuted uppercase tracking-wider">
                  {lang === 'en' ? 'Core Daily Injunctions' : 'Règles Fondamentales Méhdi'}
                </h4>

                {/* Core Rule 1 */}
                <div className="p-3.5 rounded-2xl bg-background border border-gray-200 dark:border-darkBorder space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-textMain">
                      🚫 {lang === 'en' ? 'Rule 1: Stop eating at 07:00 AM' : 'Règle 1 : Arrêt strict du repas à 07h00'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      {lang === 'en' ? 'Morning window' : 'Matin'}
                    </span>
                  </div>
                  <p className="text-xs text-textMuted">
                    {lang === 'en'
                      ? 'Eat between waking up and 07:00 AM. Past 07:00, zero food until lunch to maintain focus and insulin stability.'
                      : 'Manger entre le réveil et 07h00 pile. À 07h00, arrêt total de l\'alimentation jusqu\'à midi pour maintenir un pic de concentration cérébrale.'}
                  </p>
                </div>

                {/* Core Rule 2 */}
                <div className="p-3.5 rounded-2xl bg-background border border-gray-200 dark:border-darkBorder space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-textMain">
                      🚫 {lang === 'en' ? 'Rule 2: Lunch only between 12:00 - 12:45' : 'Règle 2 : Déjeuner strict entre 12h00 et 12h45'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                      {lang === 'en' ? '45 min' : '45 min'}
                    </span>
                  </div>
                  <p className="text-xs text-textMuted">
                    {lang === 'en'
                      ? 'Do not skip lunch and do not eat past 12:45. A disciplined 45-min window prevents post-lunch sluggishness.'
                      : 'Ne jamais sauter le déjeuner et ne pas dépasser 12h45. Un créneau calibré évite la somnolence digestive de l\'après-midi.'}
                  </p>
                </div>

                {/* Core Rule 3 */}
                <div className="p-3.5 rounded-2xl bg-background border border-gray-200 dark:border-darkBorder space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-textMain">
                      🍽️ {lang === 'en' ? 'Rule 3: Minimum 3 meals every day' : 'Règle 3 : Au moins 3 repas complets par jour'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      {lang === 'en' ? '3 / day' : '3 / jour'}
                    </span>
                  </div>
                  <p className="text-xs text-textMuted">
                    {lang === 'en'
                      ? 'Breakfast (before 7h) + Lunch (12h-12h45) + Dinner (evening). Essential for sustaining high cognitive energy.'
                      : 'Petit-déjeuner (avant 7h) + Déjeuner (12h-12h45) + Dîner (soir). Indispensable pour nourrir le cerveau et les muscles.'}
                  </p>
                </div>

                {/* Core Rule 4 */}
                <div className="p-3.5 rounded-2xl bg-background border border-gray-200 dark:border-darkBorder space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-textMain">
                      💧 {lang === 'en' ? 'Rule 4: Never >60 min without drinking' : 'Règle 4 : Jamais plus de 60 min sans eau'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400">
                      {lang === 'en' ? 'Hourly' : 'Chaque heure'}
                    </span>
                  </div>
                  <p className="text-xs text-textMuted">
                    {lang === 'en'
                      ? 'Drink 200-250 ml of water every 60 minutes. Automatic pop-up reminders alert you as soon as the timer expires.'
                      : 'Boire un verre d\'eau (200-250 ml) toutes les 60 minutes. Des pop-ups automatiques se déclenchent pour vous rappeler à l\'ordre.'}
                  </p>
                </div>
              </div>

              {/* Add Custom Rules Form */}
              <div className="pt-2">
                <h4 className="text-xs font-extrabold text-textMuted uppercase tracking-wider mb-2">
                  {lang === 'en' ? 'Add Personal Forbidden Habit' : 'Ajouter une interdiction personnelle'}
                </h4>
                <form onSubmit={handleAddCustomRule} className="flex gap-2">
                  <input
                    type="text"
                    value={newRuleTitle}
                    onChange={(e) => setNewRuleTitle(e.target.value)}
                    placeholder={lang === 'en' ? 'e.g. No social media before noon...' : 'ex: Ne pas regarder les réseaux avant 12h...'}
                    className="flex-1 bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-xs text-textMain focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="submit"
                    disabled={!newRuleTitle.trim()}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all"
                  >
                    +
                  </button>
                </form>

                {/* List of custom rules */}
                {(mustNotDoData?.customRules || []).filter(r => r.id.startsWith('custom_')).length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {(mustNotDoData?.customRules || []).filter(r => r.id.startsWith('custom_')).map(r => (
                      <div key={r.id} className="p-2.5 rounded-xl bg-background border border-gray-100 dark:border-darkBorder flex items-center justify-between text-xs">
                        <span className="font-semibold text-textMain">🚫 {r.title}</span>
                        <button 
                          onClick={() => handleDeleteCustomRule(r.id)} 
                          className="text-textMuted hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SCIENCE & HEALTH RESEARCH */}
          {activeTab === 'science' && (
            <div className="space-y-4 text-xs text-textMain leading-relaxed">
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                <h4 className="font-extrabold text-sm text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <span>🔬</span> Que disent les spécialistes sur l'intervalle d'hydratation ?
                </h4>
                <p className="text-textMuted">
                  Selon les recommandations conjointes de l'<strong>EFSA (European Food Safety Authority)</strong>, de la <strong>Harvard T.H. Chan School of Public Health</strong> et de la <strong>Société Française de Néphrologie</strong> :
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-background border border-gray-200 dark:border-darkBorder space-y-1">
                  <h5 className="font-bold text-textMain">1. L'intestin ne peut absorber que 200 à 250 ml par 20 minutes</h5>
                  <p className="text-textMuted">
                    Boire 1 litre d'eau d'un seul coup surcharge les reins et est évacué presque immédiatement dans les urines sans hydrater les cellules. La <strong>micro-hydratation régulière toutes les 45 à 60 minutes</strong> permet une absorption cellulaire maximale.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-background border border-gray-200 dark:border-darkBorder space-y-1">
                  <h5 className="font-bold text-textMain">2. Une baisse de 1,5% d'eau = chute de 20% de concentration</h5>
                  <p className="text-textMuted">
                    Le cerveau humain est composé à 75% d'eau. Attendre d'avoir soif est une erreur : la sensation de soif apparaît seulement lorsque le corps a déjà perdu 1 à 2% de son hydratation, ce qui déclenche fatigue mentale, maux de tête et baisse de réactivité.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-background border border-gray-200 dark:border-darkBorder space-y-1">
                  <h5 className="font-bold text-textMain">3. Climat tropical & concentration (Abidjan)</h5>
                  <p className="text-textMuted">
                    Dans une zone à forte hygrométrie et chaleur comme Abidjan, les pertes hydriques insensibles (sudation imperceptible) sont multipliées par deux. <strong>L'intervalle de 60 minutes avec 200-250 ml est le calibrage d'or des sportifs et entrepreneurs performants.</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS & SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-background border border-gray-200 dark:border-darkBorder space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-textMain">
                      {lang === 'en' ? 'System Push Alerts' : 'Alertes Pop-Up Automatiques'}
                    </h4>
                    <p className="text-xs text-textMuted">
                      {lang === 'en' ? 'Banners & chimes on your screen' : 'Bannières système et sonnerie sur PC & Mobile'}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleNotifications}
                    className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                      mustNotDoData?.notificationsEnabled ? 'bg-primary' : 'bg-gray-300 dark:bg-darkBorder'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      mustNotDoData?.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Interval selection */}
                <div className="pt-3 border-t border-gray-100 dark:border-darkBorder space-y-2">
                  <label className="text-xs font-bold text-textMuted uppercase tracking-wider block">
                    {lang === 'en' ? 'Hydration Reminder Frequency' : 'Fréquence du Rappel Hydratation'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[45, 60, 90].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => handleChangeInterval(mins)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                          (mustNotDoData?.hydrationIntervalMinutes || 60) === mins
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-background border-gray-200 dark:border-darkBorder text-textMain hover:border-blue-400'
                        }`}
                      >
                        {mins} min {mins === 60 ? '⭐' : ''}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-textMuted">
                    ⭐ 60 minutes est le consensus médical recommandé pour le travail intellectuel.
                  </p>
                </div>

                {/* Test notification button */}
                <div className="pt-3 border-t border-gray-100 dark:border-darkBorder">
                  <button
                    onClick={handleTestNotification}
                    disabled={testSent}
                    className="w-full bg-background hover:bg-gray-100 dark:hover:bg-darkBorder text-textMain border border-gray-200 dark:border-darkBorder font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Bell size={14} className="text-primary" />
                    <span>{testSent ? '✓ Notification envoyée !' : 'Tester une alerte pop-up maintenant'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-darkBorder bg-background flex items-center justify-end">
          <button
            onClick={onClose}
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all"
          >
            {lang === 'en' ? 'Close & Save' : 'Fermer & Enregistrer'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default MustNotDoModal;
