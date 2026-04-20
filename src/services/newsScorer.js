// calcul score article
export function scoreArticle(article) {

  let score = 5;

  // bonus source fiable
  if (article.trusted) {
    score = score + 2;
  }

  // age article en heures
  const diff = Date.now() - article.publishedAt.getTime();
  const ageHours = diff / 3600000;

  if (ageHours < 1) {
    score = score + 2;
  } else if (ageHours < 6) {
    score = score + 1;
  } else if (ageHours > 20) {
    score = score - 1;
  }

  // bonus resume long
  if (article.summary && article.summary.length > 100) {
    score = score + 1;
  }

  // malus titre court
  if (article.title.length < 20) {
    score = score - 1;
  }

  // limite score entre 0 et 10
  if (score < 0) {
    score = 0;
  }

  if (score > 10) {
    score = 10;
  }

  return score;
}


// tri articles par score
export function rankArticles(articles) {

  const copy = [...articles];

  copy.sort((a, b) => {
    return b.score - a.score;
  });

  return copy;
}