# Guide de Déploiement Carriey

Ce guide vous accompagne dans la mise en ligne de votre application Carriey en utilisant des services gratuits.

## 1. Base de données : TiDB Cloud (MySQL)

1. Connectez-vous à [TiDB Cloud](https://tidbcloud.com/).
2. Créez un **Free Tier Cluster**.
3. Dans la console, cliquez sur **Connect**.
4. Choisissez **SQLAlchemy (Python)** comme méthode.
5. Copiez la chaîne de connexion. Elle ressemblera à ceci :
   `mysql+pymysql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DB_NAME>?ssl_ca=/etc/ssl/certs/ca-certificates.crt`
   > [!IMPORTANT]
   > Sur Render, le certificat SSL est déjà présent. Vous pouvez simplifier la chaîne en :
   > `mysql+pymysql://votre_user:votre_pass@votre_host:4000/votre_db`
   > Le code ajoutera automatiquement le support SSL nécessaire.

## 2. Backend : Render

1. Créez un compte sur [Render](https://render.com/).
2. Cliquez sur **New +** > **Blueprint**.
3. Connectez votre dépôt GitHub.
4. Render détectera automatiquement le fichier `render.yaml`.
5. Dans l'interface Render, configurez les variables d'environnement suivantes :
   - `DATABASE_URL` : Votre lien TiDB (voir étape 1).
   - `BACKEND_CORS_ORIGINS` : L'URL de votre futur frontend Vercel (ex: `https://votre-app.vercel.app`).
   - `FRONTEND_URL` : L'URL de votre frontend Vercel.
   - `JWT_SECRET_KEY` : (Généré automatiquement par le Blueprint).

## 3. Frontend : Vercel

1. Créez un compte sur [Vercel](https://vercel.com/).
2. Importez votre projet depuis GitHub.
3. Allez dans le dossier `frontend` pour les réglages du projet (Root Directory: `frontend`).
4. Configurez les variables d'environnement (Environment Variables) :
   - `NEXT_PUBLIC_API_URL` : L'URL que Render vous donnera pour le backend (ex: `https://carriey-backend.onrender.com/api`).
   - `NEXTAUTH_URL` : L'URL de votre frontend Vercel.
   - `NEXTAUTH_SECRET` : Une chaîne aléatoire longue pour la sécurité.

## 💡 Conseils Pro

- **Démarrage à froid** : Render (Free) met le backend en sommeil après 15 min d'inactivité. Le premier chargement du site peut prendre 30 secondes.
- **Port** : Le backend est configuré pour écouter sur le port `10000`, ce qui est le standard Render.
- **Playwright** : La génération de PDF est gourmande en RAM. Si Render échoue avec un code `OOM` (Out Of Memory), essayez de réduire le nombre de sections dans votre CV lors du test.
