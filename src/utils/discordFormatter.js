import { EmbedBuilder } from "discord.js";
import { CATEGORIES } from "../config/feeds.js";
import { formatDate, timeAgo } from "./date.js";
import { truncateText } from "./text.js";


// creation embed article
export function buildArticleEmbed(article, options = {}) {

  const withExplain = options.withExplain ?? false;

  // infos categorie
  const cat = CATEGORIES[article.category];

  // couleur categorie
  const color = categoryColor(article.category);

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`${cat?.emoji ?? "📰"} ${truncateText(article.title, 250)}`)
    .setURL(article.link)
    .addFields(
      {
        name: "Date",
        value: formatDate(article.publishedAt),
        inline: true
      },
      {
        name: "Source",
        value: article.source,
        inline: true
      },
      {
        name: "Categorie",
        value: cat?.label ?? article.category,
        inline: true
      },
      {
        name: "Resume",
        value: truncateText(article.aiSummary ?? article.summary, 400)
      }
    );

  // ajout explication si active
  if (withExplain && article.aiExplain) {
    embed.addFields({
      name: "Explication",
      value: truncateText(article.aiExplain, 400)
    });
  }

  // ajout lien
  embed.addFields({
    name: "Lien",
    value: article.link
  });

  // footer
  if (article.trusted) {
    embed.setFooter({
      text: "Source verifiee · " + timeAgo(article.publishedAt)
    });
  } else {
    embed.setFooter({
      text: timeAgo(article.publishedAt)
    });
  }

  return embed;
}


// embed erreur
export function buildErrorEmbed(message) {
  return new EmbedBuilder()
    .setColor(0xed4245)
    .setTitle("Erreur")
    .setDescription(message);
}


// embed resume journalier
export function buildDailySummaryEmbed(articles) {

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("Resume du jour - Chat-Actu")
    .setDescription(articles.length + " actus selectionnees");

  // ajout articles
  for (const article of articles.slice(0, 8)) {

    const cat = CATEGORIES[article.category];

    embed.addFields({
      name: `${cat?.emoji ?? "📰"} ${truncateText(article.title, 80)}`,
      value:
        truncateText(article.aiSummary ?? article.summary, 120) +
        "\n[Lire](" + article.link + ") · " + article.source
    });
  }

  return embed;
}


// couleur categorie
function categoryColor(category) {

  const colors = {
    ia: 0x5865f2,
    cyber: 0xed4245,
    crypto: 0xfee75c,
    entreprises: 0x57f287,
    dev: 0x00b0f4,
    hardware: 0x99aab5,
    data: 0xeb459e,
    startups: 0xff7043,
    regulation: 0x795548
  };

  return colors[category] ?? 0x5865f2;
}