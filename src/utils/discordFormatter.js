import { EmbedBuilder } from "discord.js";
import { formatFrenchDate } from "./date.js";

export function formatNewsEmbed(news) {
  return new EmbedBuilder()
    .setTitle(news.title || "News sans titre")
    .setURL(news.link || null)
    .addFields(
      { name: "Catégorie", value: news.category || "autre", inline: true },
      { name: "Date", value: formatFrenchDate(news.date), inline: true },
      { name: "Source", value: news.source || "Inconnue", inline: true },
      {
        name: "Résumé",
        value: news.summary || "Aucun résumé disponible"
      },
      {
        name: "Pourquoi c'est important",
        value: news.importanceReason || "Importance non précisée"
      },
      {
        name: "Lien",
        value: news.link || "Lien indisponible"
      }
    )
    .setFooter({ text: `Score importance : ${news.score}/100` });
}