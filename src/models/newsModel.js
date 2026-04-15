export function createNewsModel(data = {}) {
  return {
    title: data.title || "",
    category: data.category || "autre",
    date: data.date || null,
    source: data.source || "",
    link: data.link || "",
    summary: data.summary || "",
    importanceReason: data.importanceReason || "",
    content: data.content || "",
    score: data.score || 0
  };
}