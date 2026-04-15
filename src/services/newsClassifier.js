export function detectCategory(news) {
  const text = `${news.title} ${news.content}`.toLowerCase();

  if (
    text.includes("ai") ||
    text.includes("artificial intelligence") ||
    text.includes("llm") ||
    text.includes("model") ||
    text.includes("openai") ||
    text.includes("deepmind")
  ) {
    return "ia";
  }

  if (
    text.includes("cyber") ||
    text.includes("ransomware") ||
    text.includes("breach") ||
    text.includes("vulnerability") ||
    text.includes("cve") ||
    text.includes("malware")
  ) {
    return "cyber";
  }

  if (
    text.includes("bitcoin") ||
    text.includes("ethereum") ||
    text.includes("crypto") ||
    text.includes("blockchain") ||
    text.includes("web3")
  ) {
    return "crypto";
  }

  return news.category || "autre";
}