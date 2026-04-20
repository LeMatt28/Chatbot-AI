// item       = donnee brute renvoyee par rss-parser
// sourceName = nom du flux (ex: "TechCrunch")
// category   = categorie du flux (ex: "ia", "cyber")
export function createArticle(item, sourceName, category) {
  return {
    title:       item.title?.trim() ?? "Sans titre", 
    link:        item.link ?? item.guid ?? "",         
    summary:     item.contentSnippet?.trim() ?? item.content?.trim() ?? "",
    source:      sourceName,
    category,
    publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
    aiSummary:   null, 
    aiExplain:   null, 
    trusted:     false,
  };
}