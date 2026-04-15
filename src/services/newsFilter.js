import { TRUSTED_SOURCES } from "../config/trustedSources.js";
import { isRecent } from "../utils/date.js";
import { containsEnoughInfo } from "../utils/text.js";

export function validateNews(news) {
  const reasons = [];

  if (!news.title || news.title.trim().length < 12) {
    reasons.push("Titre trop faible");
  }

  if (!news.link) {
    reasons.push("Lien manquant");
  }

  if (!news.source || !TRUSTED_SOURCES.includes(news.source)) {
    reasons.push("Source non fiable ou inconnue");
  }

  if (!news.date || !isRecent(news.date, 72)) {
    reasons.push("News trop ancienne ou date absente");
  }

  if (!containsEnoughInfo(news.content, 80)) {
    reasons.push("Contenu trop pauvre");
  }

  return {
    valid: reasons.length === 0,
    reasons
  };
}