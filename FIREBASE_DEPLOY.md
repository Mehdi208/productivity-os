# Guide de Déploiement Firebase Hosting — Petits Pas par Flexi-Money

Cette application web **mobile-first** est entièrement optimisée pour un déploiement instantané sur **Firebase Hosting**.

---

## 🛠 Pré-requis & Structure

L'application a été construite avec **Vite + React + Tailwind CSS**, en respectant fidèlement la charte graphique officielle de **Flexi-Money** :
- **Or Satiné** (`#D4AF37`, `#C89B3C`, dégradés dorés)
- **Bleu Pétrole Profond** (`#0D3B4C`, `#08232F`)
- **Blanc pur & contraste premium** avec typographie `Montserrat` et `Raleway` (rappelant les courbes fluides du logo `FM`).

Les fichiers de configuration Firebase sont déjà créés à la racine :
1. `firebase.json` : Configure le dossier source `dist` et la redirection SPA vers `/index.html`.
2. `.firebaserc` : Contient l'identifiant du projet Firebase par défaut.

---

## 🚀 Étapes de Déploiement en 3 min

### 1. Connecter votre propre projet Firebase (si ce n'est pas déjà fait)
Si vous souhaitez déployer sur votre projet Firebase Flexi-Money officiel, exécutez dans votre terminal :

```bash
# Se connecter à votre compte Google/Firebase
npx firebase-tools login

# Associer le projet (sélectionnez ou créez le projet dans la liste)
npx firebase-tools use --add
```

*(Si vous souhaitez conserver l'identifiant actuel du `.firebaserc`, passez directement à l'étape 2).*

---

### 2. Générer le build de production
Avant de déployer, compilez l'application en mode production afin d'obtenir le dossier `dist` optimisé :

```bash
npm run build
```

---

### 3. Déployer sur Firebase Hosting
Lancez le déploiement sur les serveurs de Firebase :

```bash
npx firebase-tools deploy --only hosting
```

Une fois terminé, Firebase vous retournera l'URL en direct :
`https://<votre-projet-firebase>.web.app` 🎉

---

## 📱 Architecture Mobile-First & Fonctionnalités

L'application a été conçue comme une véritable application mobile tactile (`cadre smartphone` ou `plein écran`) :
- **Calculateur 'Croissance'** : Simulation de conversion d'habitudes hebdomadaires en capital annuel + **10% d'intérêts**, avec graphique Recharts doré et flèche ascendante d'inspiration logo FM.
- **Objectifs Projets** : Sélecteur d'icônes premium (MacBook Pro, Permis B, Voyage Bali, Master...) avec jauges d'avancement dorées.
- **Podium Campus** : Classement inter-universités (INP-HB, HEC, FHB...) avec **Badge Or Éclatant** pour le leader et affiliation interactive.
- **Modale VIP 'Ouvrir mon compte'** : Bouton d'action doré avec ombre portée `shadow-gold-glow` et parcours d'onboarding fluide en 3 étapes.
