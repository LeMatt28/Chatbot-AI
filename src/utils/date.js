// temps ecoule
export function timeAgo(date) {

  const now = Date.now();
  const diff = now - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) {
    return "a l'instant";
  }

  if (minutes < 60) {
    return "il y a " + minutes + " min";
  }

  if (hours < 24) {
    return "il y a " + hours + "h";
  }

  return "il y a " + days + "j";
}


// format date
export function formatDate(date) {
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}


// date recente
export function isRecent(date, hours = 24) {

  const diff = Date.now() - date.getTime();

  return diff < hours * 3600000;
}