# Image officielle Playwright — a toutes les dépendances Chromium pré-installées
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app

# Copier et installer les dépendances Node
COPY package.json ./
RUN npm install

# Playwright est déjà installé avec Chromium dans l'image de base
# Pas besoin de `playwright install` — le binaire est dans /ms-playwright/

# Copier le code du serveur
COPY server.js ./

EXPOSE 3001

CMD ["node", "server.js"]
