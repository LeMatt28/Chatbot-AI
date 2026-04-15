export function scoreNews(news) {
  let score = 0;

  const text = `${news.title} ${news.content}`.toLowerCase();

  // récence
  score += 20;

  // source fiable
  score += 20;

  // impact / gravité
  const impactKeywords = [
    "major",
    "launch",
    "breach",
    "security",
    "critical",
    "funding",
    "acquisition",
    "release",
    "zero-day",
    "attack",
    "vulnerability",
    "ban",
    "regulation"
  ];

  for (const keyword of impactKeywords) {
    if (text.includes(keyword)) {
      score += 5;
    }
  }

  // importance stratégique
  const strategicKeywords = [
    "openai",
    "google",
    "microsoft",
    "apple",
    "meta",
    "nvidia",
    "bitcoin",
    "ethereum",
    "linux",
    "cloud"
  ];

  for (const keyword of strategicKeywords) {
    if (text.includes(keyword)) {
      score += 4;
    }
  }

  // clarté
  if (news.content.length > 120) {
    score += 10;
  }

  // bonus catégorie utile
  if (["ia", "cyber", "crypto", "tech"].includes(news.category)) {
    score += 10;
  }

  return Math.min(score, 100);
}