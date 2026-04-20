import { fetchAllFeeds, fetchFeedsByCategory } from "./rssService.js";
import { filterArticles } from "./newsFilter.js";
import { scoreArticle, rankArticles } from "./newsScorer.js";
import { summarizeArticle, isOllamaAvailable } from "./ollamaService.js";

const OLLAMA_MAX_ARTICLES = Number(process.env.OLLAMA_MAX_ARTICLES ?? 3);
const OLLAMA_TOTAL_BUDGET_MS = Number(process.env.OLLAMA_TOTAL_BUDGET_MS ?? 60000);

// Pipeline complet : recupere -> filtre -> note -> resume articles
// category : filtre par categorie ("ia", "cyber"...) ou "all" pour tout
// limit    : nombre max articles retournes
export async function runNewsPipeline({ category, limit = 5 } = {}) {

  // Etape 1 : recupere articles RSS selon categorie
  const raw = category && category !== "all"
    ? await fetchFeedsByCategory(category)
    : await fetchAllFeeds();

  // Etape 2 : filtre articles (recents, sans doublons, sources marquees)
  let articles = filterArticles(raw, 24);

  // Etape 3 : calcule score pour chaque article
  articles = articles.map((a) => ({ ...a, score: scoreArticle(a) }));

  // Etape 4 : trie par score et garde les meilleurs
  articles = rankArticles(articles).slice(0, limit);

  // Etape 5 : resume IA si Ollama disponible
  const ollamaOk = await isOllamaAvailable();
  console.log(`[Pipeline] Ollama : ${ollamaOk ? "disponible" : "indisponible"}`);

  if (ollamaOk) {
    // Traite les resumes un par un avec garde-fous anti-timeout
    const summarized = [];
    const startedAt = Date.now();
    let aiAttempts = 0;
    let aiDisabledAfterTimeout = false;
    let aiBudgetExceeded = false;

    for (const article of articles) {
      const budgetReached = Date.now() - startedAt >= OLLAMA_TOTAL_BUDGET_MS;
      const maxReached = aiAttempts >= OLLAMA_MAX_ARTICLES;

      if (aiDisabledAfterTimeout || budgetReached || maxReached) {
        if (budgetReached) aiBudgetExceeded = true;
        summarized.push(article);
        continue;
      }

      aiAttempts += 1;
      const result = await summarizeArticle(article);

      if (result.timedOut) {
        aiDisabledAfterTimeout = true;
      }

      summarized.push({
        ...article,
        aiSummary: result.summary,
        aiExplain: result.explain
      });
    }

    if (aiDisabledAfterTimeout) {
      console.log("[Pipeline] Ollama timeout detecte, IA desactivee pour les articles restants.");
    }

    if (aiBudgetExceeded) {
      console.log("[Pipeline] Budget IA atteint, resumes natifs utilises pour la fin de liste.");
    }

    articles = summarized;
  }

  return articles;
}