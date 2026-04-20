# Chat-Actu

Bot Discord de veille IT avec pipeline RSS, scoring de pertinence, et enrichissement IA via Ollama.

Ce README documente surtout les choix techniques, fichier par fichier, et explique pourquoi ils sont adaptés a ce cas d'usage.

## Objectif Produit

Le bot doit repondre a trois contraintes:

1. Reponse utiles dans Discord
2. Resultats pertinents (filtrage + priorisation)
3. Robustesse face aux flux RSS instables et aux latences IA

## Rapport Marketing (Exigence PDF)

### Cibles

1. Etudiants et profils juniors IT qui doivent suivre l'actualite tech sans y passer 1h par jour.
2. Equipes techniques (startup, PME, agence) qui veulent centraliser une veille de groupe.
3. Managers produit/tech qui cherchent des signaux rapides sur IA, cyber, data, startups et regulation.

### Besoins Identifies

1. Recevoir de l'information recente et pertinente, sans bruit ni doublons.
2. Gagner du temps de veille quotidienne.
3. Avoir une lecture simplifiee grace aux resumes IA.
4. Garder un canal conversationnel pour poser des questions d'IT via /chat.

### Objectifs Business

1. Acquisition: proposer un bot testable immediatement sur Discord.
2. Retention: usage recurrent via commandes /actu, /top et /chat.
3. Automation: reduire la veille manuelle avec pipeline RSS + scoring + resume.
4. Conversion: upsell via plans (free, freemium, premium) dans /plan.

### Chaine De Valeur

1. Collecte: aggregation multi-sources RSS.
2. Qualification: filtrage recence, dedoublonnage, score de pertinence, signal trusted.
3. Enrichissement: resume/explain IA (Ollama) avec fallback en cas de latence.
4. Distribution: restitution immediate dans Discord via embeds lisibles.
5. Impact metier: gain de temps, meilleure priorisation de lecture, meilleure prise de decision.

### KPI De Pilotage

1. MAU (Monthly Active Users): utilisateurs ayant execute au moins une commande dans le mois.
2. Engagement: commandes moyennes par utilisateur actif et par semaine.
3. Retention J30: part des utilisateurs actifs a J0 qui reviennent au jour 30.
4. Conversion Free vers plan superieur: ratio des utilisateurs changeant de plan via /plan.
5. Time Saved: minutes de veille economisees par utilisateur et par jour.
6. P95 latency pipeline: latence p95 de /actu et /top.
7. IA fallback rate: proportion d'articles renvoyes sans resume IA (timeout ou budget atteint).

### ROI (Modele)

Formule:

ROI = (Gain mensuel - Cout mensuel) / Cout mensuel

Exemple de calcul:

1. 40 utilisateurs actifs
2. 25 minutes economisees par jour et par utilisateur
3. 22 jours ouvres
4. Cout horaire moyen: 30 EUR

Gain mensuel estime = 40 * 25 * 22 / 60 * 30 = 11 000 EUR

Si cout mensuel total = 400 EUR,

ROI = (11 000 - 400) / 400 = 26.5 soit 2 650%

## Evaluation Ethique (Exigence PDF)

### Risques Identifies

1. Confidentialite: exposition possible de donnees sensibles dans les messages utilisateur si guardrail défaillant.
2. Misinformation: resume IA qui simplifie trop ou deforme un article.
3. Effet ELIZA/dependance: tendance a surestimer les capacites du chatbot.
4. Biais: couverture dependante des sources choisies et du modele local.
5. Hors sujet: detournement du chat sur des themes non IT.

### Mesures De Mitigation Deja En Place

1. Scope controle par guardrail lexical dans src/services/guardrailService.js.
2. Transparence implicite: le bot cite la source et le lien de chaque actu.
3. Fallback robuste: en cas d'echec IA, le bot renvoie le resume original de l'article.
4. Timeouts et garde-fous de budget IA pour eviter des comportements bloquants.
5. Pas d'appel a une API cloud ready-to-use type ChatGPT API; modele controle via Ollama local.

### Limites Actuelles

1. Historiques et quotas stockes en memoire (pas de persistence, pas d'audit complet).
2. Guardrail base sur mots-cles, donc possible faux positifs/faux negatifs.
3. Pas de module dedie a l'explicabilite des biais de selection de sources.

### Plan D'amelioration Ethique

1. Ajouter une charte d'usage visible dans la commande /plan ou /chat.
2. Ajouter un marquage explicite "resume IA" vs "resume source" dans les embeds.
3. Introduire une politique de retention de donnees et de purge configurable.
4. Mettre en place un journal d'incidents (timeouts, refus guardrail, erreurs IA).
5. Ajouter un bouton feedback utilisateur pour signaler reponse incorrecte ou biaisee.

## Pourquoi cette stack

1. Node.js: excellent pour I/O reseau (RSS + API Ollama + Discord)
2. discord.js: SDK officiel, fiable pour slash commands et embeds
3. rss-parser: rapide a mettre en place et suffisant pour un agrégateur RSS classique
4. Ollama local: cout controle, donnees maitrisees, independance vis-a-vis d'API cloud
5. Architecture en services: separation claire entre collecte, filtrage, scoring, IA, presentation

## Arborescence Actuelle

```text
.
├── index.js
├── package.json
├── readme.md
└── src
	├── commands
	│   ├── actu.js
	│   ├── ask.js
	│   ├── plan.js
	│   └── top.js
	├── config
	│   ├── feeds.js
	│   └── trustedSources.js
	├── models
	│   └── newsModel.js
	├── services
	│   ├── chatService.js
	│   ├── guardrailService.js
	│   ├── newsFilter.js
	│   ├── newsPipeline.js
	│   ├── newsScorer.js
	│   ├── ollamaService.js
	│   ├── rssService.js
	│   ├── serverService.js
	│   └── subscriptionsServices.js
	└── utils
		├── date.js
		├── discordFormatter.js
		└── text.js
```

## Flux Technique

1. Une commande Discord appelle le pipeline
2. Le pipeline recupere les flux RSS
3. Les articles sont normalises puis filtres
4. Les articles sont scores et tries
5. Une partie est enrichie via Ollama selon budget/timeout
6. Les embeds sont construits et renvoyes au user

## Choix Techniques Dans Le Code (Fichier Par Fichier)

Cette section detaille, pour chaque fichier, les technologies vraiment utilisees dedans et les decisions de code qui ont ete prises.

### Racine

#### index.js
Technologies utilisees dans ce fichier:
1. dotenv via import "dotenv/config" pour charger les variables d'environnement
2. discord.js Client, Collection, REST, Routes
3. ESM imports natifs de Node.js

Choix de code dans ce fichier:
1. Client initialise avec GatewayIntentBits.Guilds uniquement pour minimiser le bruit d'evenements
2. Collection pour stocker les commandes: lookup O(1) par nom de commande
3. registerCommands au demarrage: le code pousse automatiquement la definition actuelle des slash commands
4. Distinction guild/global via GUILD_ID pour accelerer les tests en dev (guild) tout en gardant un mode global
5. try/catch global dans interactionCreate pour eviter qu'une commande casse tout le bot

#### package.json
Technologies utilisees dans ce fichier:
1. Node.js en mode ESM (type: module)
2. scripts npm start et dev
3. dependances: discord.js, dotenv, rss-parser

Choix de code dans ce fichier:
1. main pointe sur index.js pour un point d'entree unique
2. dev en --watch pour raccourcir les cycles de test
3. dependances volontairement courtes pour limiter la surface de maintenance

### src/config

#### src/config/feeds.js
Technologies utilisees dans ce fichier:
1. Objets JS simples pour mapping categorie -> metadonnees
2. Tableau de configuration pour les flux RSS

Choix de code dans ce fichier:
1. CATEGORIES contient label + emoji pour decoupler le wording de l'algorithme
2. feeds associe chaque source a une categorie pour permettre un filtrage direct sans logique supplementaire
3. URLs centralisees pour pouvoir remplacer une source sans toucher le pipeline

#### src/config/trustedSources.js
Technologies utilisees dans ce fichier:
1. Tableau constant exporte

Choix de code dans ce fichier:
1. Liste blanche explicite de sources fiables pour produire un signal de confiance simple
2. Configuration isolee pour ajuster la confiance sans modifier le code de filtrage

### src/models

#### src/models/newsModel.js
Technologies utilisees dans ce fichier:
1. Factory function JS (createArticle)
2. Optional chaining et valeurs par defaut

Choix de code dans ce fichier:
1. Normaliser les champs RSS heterogenes (title/link/summary/date)
2. Fallback robustes (Sans titre, date courante, etc.) pour eviter les erreurs en cascade
3. Champs aiSummary/aiExplain/trusted poses des le debut pour stabiliser le schema article

### src/utils

#### src/utils/text.js
Technologies utilisees dans ce fichier:
1. Regex JS pour strip HTML
2. Fonctions utilitaires pures

Choix de code dans ce fichier:
1. stripHtml applique un nettoyage minimaliste mais rapide
2. truncateText est centralise pour garantir des longueurs compatibles Discord
3. containsEnoughInfo evite de sur-valoriser des contenus trop courts

#### src/utils/date.js
Technologies utilisees dans ce fichier:
1. API Date native
2. toLocaleDateString fr-FR

Choix de code dans ce fichier:
1. timeAgo fait des paliers lisibles (min/h/j) au lieu d'un timestamp brut
2. isRecent travaille en heures pour piloter facilement la fenetre de veille

#### src/utils/discordFormatter.js
Technologies utilisees dans ce fichier:
1. discord.js EmbedBuilder
2. Mapping categories vers couleurs

Choix de code dans ce fichier:
1. buildArticleEmbed unifie la presentation (Date/Source/Categorie/Resume/Lien)
2. truncateText protege l'UI des blocs de texte trop longs
3. Footer conditionnel sur trusted pour afficher un signal de confiance
4. buildErrorEmbed centralise les messages d'erreur homogènes

### src/services

#### src/services/rssService.js
Technologies utilisees dans ce fichier:
1. rss-parser (Parser + parseURL)
2. Promise.allSettled
3. Variables d'environnement pour timeout

Choix de code dans ce fichier:
1. parser timeout configurable (RSS_TIMEOUT_MS) pour adapter selon reseau/machine
2. fetchAllFeeds et fetchFeedsByCategory reutilisent la meme logique de collecte
3. allSettled permet de conserver les flux valides meme si certains echouent
4. parseFeedWithRetry relance uniquement les erreurs de type timeout
5. isTimeoutLikeError repose sur des signatures de message concretes (timeout/aborted)

#### src/services/newsFilter.js
Technologies utilisees dans ce fichier:
1. Set JS pour dedoublonnage
2. URL API native pour extraire hostname

Choix de code dans ce fichier:
1. Filtre temporal via isRecent avant tout pour garder des resultats frais
2. Cle de dedupe basee sur titre normalise pour une complexite faible
3. trusted calcule a partir du domaine, pas du nom affiche, pour etre plus robuste

#### src/services/newsScorer.js
Technologies utilisees dans ce fichier:
1. Heuristique de scoring maison
2. Tri natif JS

Choix de code dans ce fichier:
1. Point de depart score=5 puis bonus/malus interpretables
2. Fraicheur, fiabilite et densite de contenu ponderees separement
3. Clamp 0..10 pour garder un espace de score stable

#### src/services/ollamaService.js
Technologies utilisees dans ce fichier:
1. fetch HTTP vers API Ollama (/api/generate et /api/tags)
2. AbortSignal.timeout
3. JSON parsing tolerant

Choix de code dans ce fichier:
1. Timeouts distincts pour summary/explain/retry pour mieux controler la latence
2. Prompt summary raccourci + num_predict limite pour accelerer la generation
3. Retry rapide uniquement si timeout detecte
4. parseOllamaJson nettoie les reponses markdown (```json ... ```)
5. Fallback graceful: retour du resume original si IA indisponible/lente

#### src/services/newsPipeline.js
Technologies utilisees dans ce fichier:
1. Orchestration asynchrone de services
2. Garde-fous via env (OLLAMA_MAX_ARTICLES, OLLAMA_TOTAL_BUDGET_MS)

Choix de code dans ce fichier:
1. Etapes explicites (fetch -> filter -> score -> rank -> summarize)
2. Enrichissement IA sequence (pas parallele) pour reduire la pression sur Ollama
3. Coupure IA apres timeout pour eviter les cascades de timeouts
4. Budget global de temps pour ne pas bloquer la reponse utilisateur

#### src/services/chatService.js
Technologies utilisees dans ce fichier:
1. fetch vers /api/chat d'Ollama
2. Map en memoire pour historique par utilisateur

Choix de code dans ce fichier:
1. SYSTEM_PROMPT fixe pour borner le comportement du modele
2. Historique tronque aux 10 derniers messages pour limiter cout et latence
3. clearHistory expose une remise a zero explicite
4. Timeout long (90000) reserve au mode conversationnel

#### src/services/guardrailService.js
Technologies utilisees dans ce fichier:
1. Listes de mots-cles et checks includes

Choix de code dans ce fichier:
1. Pipeline de validation: greeting -> off-topic -> IT keywords -> fallback court
2. Le fallback "message tres court" evite de bloquer des prompts simples du user
3. guardrailRefusal permet une reponse claire et fonctionnelle

#### src/services/subscriptionsServices.js
Technologies utilisees dans ce fichier:
1. Map pour users et quotas
2. Date ISO pour la cle journaliere

Choix de code dans ce fichier:
1. Cle quota combine userId + date pour reset automatique quotidien
2. PLANS declaratif pour separer regles business et logique applicative
3. Fonctions canUse/increment/getRemaining decoupees pour rester testables

#### src/services/serverService.js
Technologies utilisees dans ce fichier:
1. Map en memoire

Choix de code dans ce fichier:
1. Structure minimale guildId -> channelId/active
2. getAllActiveServers renvoie une projection propre, pas la structure interne brute

### src/commands

#### src/commands/actu.js
Technologies utilisees dans ce fichier:
1. SlashCommandBuilder
2. runNewsPipeline
3. Embeds via formatter

Choix de code dans ce fichier:
1. Options slash typees (categorie, nombre) pour guider l'utilisateur
2. deferReply pour ne pas depasser la limite de reponse Discord
3. Gestion explicite du cas "aucun article" et des erreurs pipeline

#### src/commands/top.js
Technologies utilisees dans ce fichier:
1. SlashCommandBuilder
2. runNewsPipeline limite fixe

Choix de code dans ce fichier:
1. Limite fixe a 5 pour une commande courte et rapide (timeout pete un cable sinon)
2. Reutilisation du formatter article pour garder une UI coherente

#### src/commands/ask.js
Technologies utilisees dans ce fichier:
1. SlashCommandBuilder + EmbedBuilder
2. chatService + guardrailService + subscriptionsServices

Choix de code dans ce fichier:
1. Le nom de slash command est chat (fichier ask.js)
2. Controle de plan et quota avant appel IA pour maitriser cout/latence
3. Option reset pour donner le controle de contexte au user
4. Guardrail applique avant deferReply pour filtrer vite les hors sujets

#### src/commands/plan.js
Technologies utilisees dans ce fichier:
1. SlashCommandBuilder + EmbedBuilder
2. PLANS et quotas depuis subscriptionsServices

Choix de code dans ce fichier:
1. Option changer avec choix pour eviter des valeurs invalides
2. Calcul local de textes (illimite/restant) pour rendre le quota lisible
3. Reponse ephemere car la donnee plan/quota est personnelle


## Lancement

```bash
npm install
npm start
```

## Commandes Disponibles

1. /actu
2. /top
3. /chat
4. /plan

## Limites Connues (MVP)

1. Stockage en memoire pour conversations, quotas et configs serveur (pas persistant)
2. Le filtrage guardrail est lexical (pas un classifieur semantique)
3. Le score est heuristique, volontairement simple et explicable

## Pistes D'evolution

1. Persistance en base (SQLite/PostgreSQL) pour quotas et historique
2. Cache RSS pour reduire encore la latence
3. Envoi progressif article par article pour UX encore plus fluide
4. Telemetrie fine (latence RSS, latence Ollama, taux fallback)