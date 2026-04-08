export function cleanText(text = "") {
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateText(text = "", maxLength = 300) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

export function containsEnoughInfo(text = "", minLength = 80) {
  return cleanText(text).length >= minLength;
}