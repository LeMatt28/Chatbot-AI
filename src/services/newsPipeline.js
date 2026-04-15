import { fetchAllFeeds } from "./rssService.js";
import { detectCategory } from "./newsClassifier.js";
import { validateNews } from "./newsFilter.js";
import { scoreNews } from "./newsScorer.js";
import { generateNewsSummary } from "./ollamaService.js";

export async function getImportantNews(category = null, limit = 5) {
  const rawNews = await fetchAllFeeds();
  const accepted = [];

  for (const item of rawNews) {
    item.category = detectCategory(item);

    if (category && item.category !== category) {
      continue;
    }

    const validation = validateNews(item);
    if (!validation.valid) {
      continue;
    }

    item.score = scoreNews(item);

    if (item.score < 45) {
      continue;
    }

    const aiResult = await generateNewsSummary(item);

    item.summary = aiResult.summary;
    item.importanceReason = aiResult.importanceReason;

    accepted.push(item);
  }

  accepted.sort((a, b) => b.score - a.score);

  return accepted.slice(0, limit);
}