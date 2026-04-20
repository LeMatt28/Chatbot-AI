import Parser from "rss-parser";
import { feeds } from "../config/feeds.js";
import { createArticle } from "../models/newsModel.js";
import { stripHtml } from "../utils/text.js";


// timeout rss
const RSS_TIMEOUT_MS = Number(process.env.RSS_TIMEOUT_MS ?? 20000);

// parser rss
const parser = new Parser({
  timeout: RSS_TIMEOUT_MS,
  headers: { "User-Agent": "ChatActu/1.0" }
});


// tous flux
export async function fetchAllFeeds() {

  const results = await Promise.allSettled(
    feeds.map((feed) => fetchFeed(feed))
  );

  const articles = [];

  // garde resultats ok
  for (const result of results) {
    if (result.status === "fulfilled") {
      articles.push(...result.value);
    }
  }

  return articles;
}


// flux categorie
export async function fetchFeedsByCategory(category) {

  const filtered = feeds.filter((feed) => feed.category === category);

  const results = await Promise.allSettled(
    filtered.map((feed) => fetchFeed(feed))
  );

  const articles = [];

  // garde resultats ok
  for (const result of results) {
    if (result.status === "fulfilled") {
      articles.push(...result.value);
    }
  }

  return articles;
}


// fetch flux
async function fetchFeed(feed) {

  const name = feed.name;
  const url = feed.url;
  const category = feed.category;

  try {
    const parsed = await parseFeedWithRetry(url, name);

    const articles = [];

    for (const item of parsed.items) {

      const article = createArticle(item, name, category);

      // nettoyage html
      article.summary = stripHtml(article.summary);

      articles.push(article);
    }

    return articles;

  } catch (err) {
    console.log("rss error", name, err.message);
    return [];
  }
}


// retry fetch rss
async function parseFeedWithRetry(url, name, retries = 1) {
  let attempt = 0;

  while (true) {
    try {
      return await parser.parseURL(url);
    } catch (err) {
      const timedOut = isTimeoutLikeError(err);

      // retry si timeout
      if (!timedOut || attempt >= retries) {
        throw err;
      }

      attempt += 1;
      console.log("rss retry", name, `attempt ${attempt + 1}`);
    }
  }
}


// detect timeout
function isTimeoutLikeError(err) {
  const message = String(err?.message ?? "").toLowerCase();

  return (
    message.includes("timed out") ||
    message.includes("timeout") ||
    message.includes("etimedout") ||
    message.includes("aborted")
  );
}