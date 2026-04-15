import trustedSources from "../config/trustedSources.js";
import { isRecent }   from "../utils/date.js";

export function filterArticles(articles, maxHours = 24) {
  const seen = new Set();
  return articles
    .filter((a) => isRecent(a.publishedAt, maxHours))
    .filter((a) => {
      const key = a.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((a) => ({ ...a, trusted: isTrusted(a.link) }));
}

function isTrusted(url) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return trustedSources.some((s) => hostname.endsWith(s));
  } catch { return false; }
}