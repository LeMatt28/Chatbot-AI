export function isRecent(dateString, maxHours = 72) {
  if (!dateString) return false;

  const now = new Date();
  const published = new Date(dateString);

  if (Number.isNaN(published.getTime())) return false;

  const diffMs = now - published;
  const diffHours = diffMs / (1000 * 60 * 60);

  return diffHours <= maxHours;
}

export function formatFrenchDate(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Date inconnue";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}