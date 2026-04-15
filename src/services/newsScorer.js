// Calcule un score de pertinence entre 0 et 10 pour un article
// Plus le score est eleve, plus l'article sera mis en avant
export function scoreArticle(article) {
  let score = 5; 

  if (article.trusted) score += 2;

  const ageHours = (Date.now() - article.publishedAt.getTime()) / 3_600_000;

  if (ageHours < 1)       score += 2; 
  else if (ageHours < 6)  score += 1; 
  else if (ageHours > 20) score -= 1;

  if (article.summary?.length > 100) score += 1;

  if (article.title.length < 20) score -= 1;

  return Math.max(0, Math.min(10, score));
}
export function rankArticles(articles) {
  return [...articles].sort((a, b) => b.score - a.score);
}