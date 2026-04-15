import Parser from "rss-parser";
import { FEEDS } from "../config/feeds.js";
import { cleanText } from "../utils/text.js";
import { createNewsModel } from "../models/newsModel.js";

const parser = new Parser();

export async function fetchAllFeeds() {
  const allItems = [];

  for (const feed of FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);

      const items = (parsed.items || []).map((item) =>
        createNewsModel({
          title: item.title || "",
          category: feed.category,
          date: item.isoDate || item.pubDate || null,
          source: feed.name,
          link: item.link || "",
          content: cleanText(item.contentSnippet || item.content || item.summary || "")
        })
      );

      allItems.push(...items);
    } catch (error) {
      console.error(`Erreur flux ${feed.name}:`, error.message);
    }
  }

  return allItems;
}