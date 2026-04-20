import { SlashCommandBuilder } from "discord.js";
import { runNewsPipeline } from "../services/newsPipeline.js";
import { buildArticleEmbed, buildErrorEmbed } from "../utils/discordFormatter.js";


// definition commande
export const data = new SlashCommandBuilder()
  .setName("top")
  .setDescription("Actus les plus importantes du moment");


// execution commande
export async function execute(interaction) {

  // attente reponse
  await interaction.deferReply();

  try {
    // appel pipeline
    const articles = await runNewsPipeline({ limit: 5 });

    // aucun resultat
    if (!articles.length) {
      return interaction.editReply({
        embeds: [
          buildErrorEmbed("Pas actus disponibles.")
        ],
      });
    }

    // envoi reponse
    await interaction.editReply({
      embeds: articles.map((article) =>
        buildArticleEmbed(article)
      )
    });

  } catch (err) {
    // log erreur
    console.error("[/top]", err);

    // message erreur
    await interaction.editReply({
      embeds: [
        buildErrorEmbed("Erreur recuperation.")
      ],
    });
  }
}