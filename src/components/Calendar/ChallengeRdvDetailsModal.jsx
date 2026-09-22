import React, { useState } from 'react';
import { 
  Building, User, Phone, MessageSquare, MapPin, 
  Calendar, Clock, CheckCircle2, 
  Trash2, Edit3, ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getAbidjanDateDisplay } from '../../pages/Challenge30Days';

const ChallengeRdvDetailsModal = ({
  isOpen,
  onClose,
  block,
  onUpdateRdvStatus,
  onUpdateRdvDetails,
  onDeleteRdv,
  onNavigateToChallenge
}) => {
  const { lang } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    date: '',
    start: '10:00',
    end: '11:30',
    companyName: '',
    contactPerson: '',
    phone: '',
    location: '',
    pricingModel: 'monthly',
    objective: ''
  });

  React.useEffect(() => {
    if (block) {
      const rdv = block.rdvDetails || {};
      const company = rdv.companyName || block.title?.replace('🤝 RDV : ', '') || 'Entreprise';
      const contact = rdv.contactPerson || 'Décideur';
      const ph = rdv.phone || '';
      const loc = rdv.location || '';
      const pModel = rdv.pricingModel || 'monthly';
      const obj = rdv.objective || block.subtitle || 'Présentation et démo du dashboard de gestion métier';

      setEditForm({
        date: block.date || '',
        start: block.start || '10:00',
        end: block.end || '11:30',
        companyName: company,
        contactPerson: contact,
        phone: ph,
        location: loc,
        pricingModel: pModel,
        objective: obj
      });
      setIsEditing(false);
    }
  }, [block]);

  if (!isOpen || !block || !block.isChallengeRdv) return null;

  const rdv = block.rdvDetails || {};
  const companyName = rdv.companyName || block.title.replace('🤝 RDV : ', '') || 'Entreprise';
  const contactPerson = rdv.contactPerson || 'Décideur';
  const phone = rdv.phone || '';
  const location = rdv.location || '';
  const pricingModel = rdv.pricingModel || 'monthly';
  const budget = rdv.budget || (pricingModel === 'yearly' ? '300 000 FCFA / an' : '30 000 FCFA / mois');
  const objective = rdv.objective || block.subtitle || 'Présentation et démo du dashboard de gestion métier';
  const status = rdv.status || (block.checked ? 'completed' : 'scheduled');

  // Clean phone number for tel: and wa.me links
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const waPhone = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone.startsWith('00') ? cleanPhone.slice(2) : `225${cleanPhone}`;
  const waGreeting = encodeURIComponent(`Bonjour ${contactPerson}, je vous contacte suite à notre échange concernant la solution logicielle de gestion pour ${companyName}.`);

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (onUpdateRdvDetails) {
      onUpdateRdvDetails(block.id, {
        ...editForm,
        budget: editForm.pricingModel === 'yearly' ? '300 000 FCFA / an' : '30 000 FCFA / mois'
      });
    }
    setIsEditing(false);
  };

  const handleMarkStatus = (newStatus) => {
    if (onUpdateRdvStatus) {
      onUpdateRdvStatus(block.id, newStatus);
    }
  };

  const handleDelete = () => {
    const confirmMsg = lang === 'en'
      ? `Cancel and remove the meeting with "${companyName}" from your schedule?`
      : `Annuler et retirer le rendez-vous avec "${companyName}" de votre agenda ?`;
    if (window.confirm(confirmMsg)) {
      if (onDeleteRdv) {
        onDeleteRdv(block.id, block.date);
      }
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-card rounded-3xl w-full max-w-lg shadow-2xl border-2 border-emerald-500/40 dark:border-emerald-500/30 flex flex-col max-h-[90vh] max-h-[90dvh] my-auto overflow-hidden animate-in zoom-in-95 duration-200 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Pinned Header with Distinctive Emerald Accent */}
        <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-primary/10 border-b border-gray-100 dark:border-darkBorder px-5 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-500/20 flex-shrink-0">
              🤝
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  {lang === 'en' ? 'Challenge 30 Days Meeting' : 'RDV Challenge 30 Jours B2B'}
                </span>
                {status === 'completed' && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-300 flex items-center gap-1">
                    <CheckCircle2 size={11} /> {lang === 'en' ? 'Completed' : 'Démo Réalisée'}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black text-textMain mt-0.5 truncate max-w-[260px] sm:max-w-[320px]">
                {companyName}
              </h3>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 rounded-xl flex items-center justify-center text-textMuted hover:text-textMain hover:bg-gray-100 dark:hover:bg-darkCard transition-colors font-bold text-base cursor-pointer"
            aria-label={lang === 'en' ? 'Close' : 'Fermer'}
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-4">
          
          {isEditing ? (
            /* Inline Edit Mode */
            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-textMuted block mb-1">
                    {lang === 'en' ? 'Company Name' : 'Nom de l\'entreprise'}
                  </label>
                  <input 
                    type="text" 
                    required
                    value={editForm.companyName}
                    onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                    className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-xs text-textMain focus:outline-none focus:border-primary font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-textMuted block mb-1">
                    {lang === 'en' ? 'Contact / Decision Maker' : 'Contact / Décideur'}
                  </label>
                  <input 
                    type="text" 
                    value={editForm.contactPerson}
                    onChange={(e) => setEditForm({ ...editForm, contactPerson: e.target.value })}
                    className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-xs text-textMain focus:outline-none focus:border-primary font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-textMuted block mb-1">
                    {lang === 'en' ? 'Phone Number' : 'Numéro de téléphone'}
                  </label>
                  <input 
                    type="tel" 
                    placeholder="ex: +225 07 00 00 00"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-xs text-textMain focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-textMuted block mb-1">
                    {lang === 'en' ? 'Meeting Location / Link' : 'Lieu ou Lien Visio'}
                  </label>
                  <input 
                    type="text" 
                    placeholder="ex: Cocody, Cabinet Dr. Kouamé"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-xs text-textMain focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-bold text-textMuted block mb-1">Date</label>
                  <input 
                    type="date" 
                    required
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-2.5 py-2 text-xs text-textMain focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-textMuted block mb-1">Début</label>
                  <input 
                    type="time" 
                    required
                    value={editForm.start}
                    onChange={(e) => setEditForm({ ...editForm, start: e.target.value })}
                    className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-2.5 py-2 text-xs text-textMain focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-textMuted block mb-1">Fin</label>
                  <input 
                    type="time" 
                    required
                    value={editForm.end}
                    onChange={(e) => setEditForm({ ...editForm, end: e.target.value })}
                    className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-2.5 py-2 text-xs text-textMain focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-textMuted block mb-1">
                  {lang === 'en' ? 'Proposed Pricing Offer' : 'Formule Tarifaire discutée'}
                </label>
                <select
                  value={editForm.pricingModel}
                  onChange={(e) => setEditForm({ ...editForm, pricingModel: e.target.value })}
                  className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-xs font-bold text-textMain focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="monthly">30 000 FCFA / mois (Mensuel)</option>
                  <option value="yearly">300 000 FCFA / an (Annuel 🔥)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-textMuted block mb-1">
                  {lang === 'en' ? 'Notes & Demo Goals' : 'Objectifs de la démo & Notes'}
                </label>
                <textarea 
                  rows={3}
                  value={editForm.objective}
                  onChange={(e) => setEditForm({ ...editForm, objective: e.target.value })}
                  className="w-full bg-background border border-gray-200 dark:border-darkBorder rounded-xl px-3 py-2 text-xs text-textMain focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-textMuted hover:bg-gray-100 dark:hover:bg-darkCard"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          ) : (
            /* View Details Mode */
            <>
              {/* Date & Time Highlight Card */}
              <div className="bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 capitalize">
                      {block.date ? getAbidjanDateDisplay(block.date) : 'Date à définir'}
                    </h4>
                    <p className="text-sm font-black text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5 mt-0.5">
                      <Clock size={14} />
                      <span>{block.start} - {block.end}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-xl bg-card border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15 transition-colors flex items-center gap-1.5 text-xs font-bold shadow-sm cursor-pointer"
                  title="Modifier l'horaire ou les informations"
                >
                  <Edit3 size={13} />
                  <span className="hidden sm:inline">Modifier</span>
                </button>
              </div>

              {/* Prospect & Contact Card */}
              <div className="bg-background rounded-2xl p-4 border border-gray-100 dark:border-darkBorder space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider">
                      {lang === 'en' ? 'Company & Decision Maker' : 'Entreprise & Contact'}
                    </span>
                    <h4 className="text-sm font-black text-textMain flex items-center gap-1.5">
                      <Building size={15} className="text-primary flex-shrink-0" />
                      <span>{companyName}</span>
                    </h4>
                    <p className="text-xs font-semibold text-textMuted flex items-center gap-1.5">
                      <User size={14} className="text-textMuted flex-shrink-0" />
                      <span>{contactPerson}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block">
                      {lang === 'en' ? 'Target Offer' : 'Offre cible'}
                    </span>
                    <span className="text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg inline-block mt-0.5">
                      {budget}
                    </span>
                  </div>
                </div>

                {/* Direct Action Phone / WhatsApp Buttons */}
                {phone ? (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={`tel:${cleanPhone}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                    >
                      <Phone size={13} />
                      <span>Appeler ({phone})</span>
                    </a>
                    <a
                      href={`https://wa.me/${waPhone}?text=${waGreeting}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                    >
                      <MessageSquare size={13} />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                ) : (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-[11px] text-amber-700 dark:text-amber-300 flex items-center justify-between">
                    <span>Aucun numéro renseigné pour ce prospect.</span>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="text-xs font-bold underline cursor-pointer"
                    >
                      Ajouter
                    </button>
                  </div>
                )}
              </div>

              {/* Location / Meeting Format */}
              {location && (
                <div className="bg-background rounded-2xl p-3.5 border border-gray-100 dark:border-darkBorder flex items-center gap-2.5 text-xs text-textMain">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center flex-shrink-0 font-bold">
                    <MapPin size={15} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block">
                      {lang === 'en' ? 'Meeting Place / Modality' : 'Lieu ou Lien Visio'}
                    </span>
                    <span className="font-semibold text-textMain">{location}</span>
                  </div>
                </div>
              )}

              {/* Objective & Notes */}
              <div className="bg-background rounded-2xl p-3.5 border border-gray-100 dark:border-darkBorder space-y-1">
                <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block">
                  {lang === 'en' ? 'Meeting Goals & Live Demo Plan' : 'Objectif & Déroulement de la Démo'}
                </span>
                <p className="text-xs text-textMain font-medium whitespace-pre-line">
                  {objective}
                </p>
              </div>

              {/* Status Actions */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block mb-2">
                  {lang === 'en' ? 'Update Meeting Outcome' : 'Résultat du Rendez-vous'}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleMarkStatus(status === 'completed' ? 'scheduled' : 'completed')}
                    className={`font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                      status === 'completed'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    <span>{status === 'completed' ? 'Marquer Non Réalisé' : '✅ Démo Réalisée'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-red-500/20 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Annuler le RDV</span>
                  </button>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Pinned Footer with Direct Link to Challenge */}
        <div className="bg-card border-t border-gray-100 dark:border-darkBorder px-5 sm:px-6 py-3.5 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              if (onNavigateToChallenge) {
                onNavigateToChallenge();
              }
              onClose();
            }}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Voir dans le Challenge 30 Jours</span>
            <ArrowRight size={13} />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="bg-gray-100 dark:bg-darkCard hover:bg-gray-200 dark:hover:bg-darkCardElevated text-textMain font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};

export default ChallengeRdvDetailsModal;
