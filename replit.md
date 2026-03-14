
# Présentation du Projet CVtor

## 📌 Aperçu Général
CVtor est un constructeur de CV moderne et intelligent qui combine :
- Un éditeur visuel avec glisser-déposer
- Des modèles personnalisables
- Une prévisualisation en temps réel
- L'export en PDF et DOCX
- Une assistance IA pour la rédaction

## 🏗 Architecture Technique

### Frontend
- **Framework** : Next.js
- **Fonctionnalités** :
  - Interface utilisateur réactive (mobile, tablette, desktop)
  - Éditeur avec glisser-déposer
  - Prévisualisation instantanée
  - Thèmes clair/sombre

### Backend
- **Framework** : FastAPI
- **Fonctionnalités** :
  - Gestion des modèles de CV
  - Génération de documents
  - Intégration IA
  - API RESTful

### Base de Données
- Stockage des profils utilisateurs, de cv et d'a
- Sauvegarde des CV
- Gestion des modèles

## 🛠 Stack Technique

### Frontend
- React avec TypeScript
- Tailwind CSS pour le style
- Framer Motion pour les animations
- React Hook Form pour la gestion des formulaires

### Backend
- Python 3.11+
- FastAPI
- Jinja2 pour les modèles
- WeasyPrint pour la génération PDF
- python-docx pour l'export DOCX

### IA
- Intégration avec OpenAI (GPT)
- Modèles de langage pour la suggestion de contenu
- Personnalisation des suggestions selon le secteur

## 🚀 Fonctionnalités Clés

1. **Éditeur Visuel**
   - Glisser-déposer des sections
   - Prévisualisation en temps réel
   - Personnalisation avancée

2. **Modèles Professionnels**
   - Plusieurs designs modernes
   - Adaptés à différents secteurs
   - Personnalisation des couleurs et polices

3. **Assistance IA**
   - Suggestions de contenu
   - Optimisation des mots-clés
   - Corrections grammaticales

4. **Export Multi-format**
   - PDF haute qualité
   - DOCX modifiable
   - Partage en ligne

## 📂 Structure du Projet

```
cvtor/
├── frontend/          # Application Next.js
│   ├── components/    # Composants React
│   ├── pages/         # Pages de l'application
│   └── styles/        # Feuilles de style
│
├── backend/           # API FastAPI
│   ├── app/           # Logique métier
│   ├── models/        # Modèles de données
│   ├── routes/        # Points d'API
│   └── templates/     # Modèles de CV (Jinja2)
│
└── pyproject.toml     # Dépendances Python
```

## 🔧 Installation et Démarrage

### Prérequis
- Node.js 18+
- Python 3.11+
- npm ou yarn

### Installation
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
pip install -e .
```

### Démarrage
```bash
# Backend
uvicorn app.main:app --reload

# Frontend (dans un autre terminal)
cd frontend
npm run dev
```

## 🤝 Collaboration

### Rôles Recherchés
1. **Développeur Frontend**
   - Amélioration de l'interface utilisateur
   - Optimisation des performances
   - Développement de nouveaux composants

2. **Développeur Backend**
   - Optimisation des API
   - Intégration de nouvelles fonctionnalités IA
   - Gestion des modèles de CV

3. **Designer UI/UX**
   - Création de nouveaux modèles
   - Amélioration de l'expérience utilisateur
   - Design system

### Prochaines Étapes
1. Authentification utilisateur
2. Sauvegarde en ligne des CV
3. Intégration avec LinkedIn
4. Analyse ATS (système de suivi des candidats)

## 📊 État Actuel
- Version : 1.0.0 (Bêta)
- Dernière mise à jour : Octobre 2025
- Projet actif en développement

## 📞 Contact
Pour toute question ou collaboration, n'hésitez pas à me contacter.

Souhaitez-vous que je vous montre des parties spécifiques du code ou que je vous donne plus de détails sur un aspect particulier du projet ?