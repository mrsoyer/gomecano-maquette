# Gomecano - Maquette Prototype

> Maquette interactive complète Vue.js 3 + Vite + TypeScript

[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR_SITE_ID/deploy-status)](https://app.netlify.com/sites/YOUR_SITE_NAME/deploys)

## 🎯 Vue d'ensemble

Prototype fonctionnel complet de la plateforme Gomecano avec la stack technique réelle mais **sans connexion backend** (données mockées uniquement).

## 🚀 Déploiement Automatique

Ce projet est automatiquement déployé sur **Netlify** à chaque push sur la branche `main` du repository GitHub.

**Workflow :**
1. Modification dans `gomecanoWebsite/maquette/`
2. Push vers monorepo → GitHub Actions sync vers `gomecano-maquette`
3. Netlify détecte changement → Build + Deploy automatique

## 🛠️ Stack Technique

* **Framework** : Vue.js 3 (Composition API)
* **Build** : Vite
* **Language** : TypeScript 5
* **Styling** : TailwindCSS
* **Router** : Vue Router 4
* **State** : Pinia
* **Data** : Données mockées (JSON)
* **Deploy** : Netlify

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build pour production
npm run build

# Preview du build
npm run preview
```

## 🌐 URLs

**Production (Netlify)** : `https://gomecano-maquette.netlify.app` (à configurer)  
**Développement local** : `http://localhost:5173`

## 📂 Structure du Projet

```
maquette/
├── src/
│   ├── assets/          # Images, icons, styles
│   ├── components/
│   │   ├── ui/          # 15+ composants UI de base
│   │   ├── layout/      # Header, Footer, Navigation
│   │   ├── features/    # Composants métier
│   │   └── booking/     # Système réservation
│   ├── views/           # 30+ pages
│   │   ├── b2c/        # Funnel B2C + pages
│   │   ├── b2b/        # Pages B2B
│   │   ├── recruitment/ # Pages Recrutement
│   │   └── institutional/ # Pages institutionnelles
│   ├── composables/     # 39 composables Vue
│   ├── stores/          # 7 stores Pinia
│   ├── mocks/           # Données mockées
│   ├── router/          # Configuration routes
│   ├── types/           # Types TypeScript
│   └── utils/           # Utilitaires
├── public/              # Assets statiques
├── netlify.toml         # Config Netlify
├── package.json
└── vite.config.ts
```

## 🎨 Design System

Basé sur la charte graphique Gomecano 2.0 :

**Couleurs :**
* Bleu : `#2f6883` (Trust Blue)
* Orange : `#e98013` (Action Orange)
* Vert : `#29c99e` (Growth Green)

**Typographie :**
* Police principale : Inter
* Police secondaire : Lato

**Spacing :**
* 8pt Grid System (tous les espacements sont multiples de 8px)

## 📊 Données Mockées

Toutes les données sont mockées dans `/src/mocks/` :

* 50+ services
* 20+ témoignages
* 10+ mécaniciens
* Articles blog
* FAQ

## 🎭 Parcours Disponibles

### B2C (Particuliers)
* Homepage
* Liste services
* Détail service
* Funnel réservation (5 étapes)
* Compte client (15 pages)

### B2B (Entreprises)
* Homepage B2B
* Simulateur ROI
* Dashboard flotte
* Gestion véhicules

### Recrutement (Mécaniciens)
* Homepage recrutement
* Simulateur revenus
* Formulaire candidature

### Institutionnel
* À propos
* Contact
* Blog
* Pages légales (CGU, CGV, etc.)

## 📱 Responsive Design

Complètement responsive avec 3 breakpoints :

* **Mobile** : < 640px
* **Tablet** : 640px - 1024px
* **Desktop** : >= 1024px

## 🔧 Configuration Netlify

Le fichier `netlify.toml` configure :

* **Build** : `npm run build` → output `dist/`
* **SPA Routing** : Redirects pour Vue Router
* **Cache** : Headers optimisés pour assets statiques
* **Security** : Headers de sécurité (X-Frame-Options, CSP, etc.)
* **Performance** : Plugin Lighthouse pour monitoring

## ⚙️ Variables d'environnement

Créer un fichier `.env` local (copier depuis `.env.example`) :

```bash
# Google Maps (pour composants maps)
VITE_GOOGLE_MAPS_API_KEY=your_key_here

# Autres configs (si nécessaire)
VITE_API_URL=http://localhost:3000
```

**Sur Netlify**, configurer les variables dans :  
`Site settings > Environment variables`

## 🚀 Déploiement Manuel

Si besoin de déployer manuellement (hors GitHub Actions) :

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Déployer
netlify deploy --prod
```

## ⚠️ Important

* **Pas de backend** : Toutes les données sont mockées
* **Pas d'API calls** : Aucun appel réseau réel
* **Navigation simulée** : Transitions entre pages uniquement
* **Code réutilisable** : 80% du code sera réutilisé dans le MVP production

## 📝 Convention de Code

* **Components** : PascalCase (ex: `Button.vue`)
* **Files** : kebab-case pour utils (ex: `use-mock-data.ts`)
* **TypeScript** : Strict mode activé
* **Langue** : Code en anglais, UI en français

## 🔗 Liens Utiles

* **Monorepo** : https://github.com/mrsoyer/gomecano-general
* **Maquette (ce repo)** : https://github.com/mrsoyer/gomecano-maquette
* **Netlify Dashboard** : https://app.netlify.com/sites/gomecano-maquette
* **Documentation complète** : Voir cahier des charges

## 👥 Équipe

* 1 Développeur Frontend (Thomas)
* 1 Project Manager (Marion)

## 📅 Statut

**Version** : 0.2.0-prototype  
**Dernière mise à jour** : 12 Décembre 2025  
**Statut** : ✅ 30+ pages complètes, 102 fichiers, déploiement Netlify actif

---

**Note** : Cette maquette est un prototype fonctionnel. Pour la version production avec backend (Supabase, APIs, paiements), voir le dossier `/website/` dans le monorepo.
