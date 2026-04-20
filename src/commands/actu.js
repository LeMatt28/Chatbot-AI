import { SlashCommandBuilder } from "discord.js";
import { runNewsPipeline } from "../services/newsPipeline.js";
import {
  buildArticleEmbed,
  buildErrorEmbed
} from "../utils/discordFormatter.js";


// definition commande
export const data = new SlashCommandBuilder()
  .setName("actu")
  .setDescription("Dernières actualités tech filtrées et résumées")

  // option categorie
  .addStringOption((option) =>
    option
      .setName("categorie")
      .setDescription("Filtrer par domaine")
      .setRequired(false)
      .addChoices(
        { name: "🌐 Toutes",           value: "all" },
        { name: "🤖 IA",               value: "ia" },
        { name: "🔐 Cybersécurité",    value: "cyber" },
        { name: "🪙 Crypto / Web3",    value: "crypto" },
        { name: "🏢 Entreprises tech", value: "entreprises" },
        { name: "💻 Dev",              value: "dev" },
        { name: "⚙️ Hardware",         value: "hardware" },
        { name: "📊 Data / ML",        value: "data" },
        { name: "🚀 Startups",         value: "startups" },
        { name: "⚖️ Régulation",       value: "regulation" }
      )
  )

  // option nombre articles
  .addIntegerOption((option) =>
    option
      .setName("nombre")
      .setDescription("Nombre d'articles (1 à 8, défaut = 3)")
      .setMinValue(1)
      .setMaxValue(8)
  );


// execution commande
export async function execute(interaction) {

  // attente reponse discord
  await interaction.deferReply();

  // recuperation options utilisateur
  const category = interaction.options.getString("categorie") ?? "all";
  const limit    = interaction.options.getInteger("nombre") ?? 3;

  try {
    // appel pipeline
    const articles = await runNewsPipeline({ category, limit });

    // aucun resultat
    if (!articles.length) {
      return interaction.editReply({
        embeds: [
          buildErrorEmbed(
            "Aucune actualité trouvée pour cette catégorie.\nRéessaie dans quelques instants."
          )
        ]
      });
    }

    // transformation embeds
    const embeds = articles.map((article) =>
      buildArticleEmbed(article)
    );

    // envoi reponse
    await interaction.editReply({ embeds });

  } catch (error) {
    // log erreur
    console.error("[/actu]", error);

    // message erreur utilisateur
    await interaction.editReply({
      embeds: [
        buildErrorEmbed(
          "Une erreur est survenue lors de la récupération des actualités.\nRéessaie plus tard."
        )
      ]
    });
  }
}