import { SlashCommandBuilder } from "discord.js";
import { getImportantNews } from "../services/newsPipeline.js";
import { formatNewsEmbed } from "../utils/discordFormatter.js";

export const data = new SlashCommandBuilder()
  .setName("actu")
  .setDescription("Affiche les news IT importantes")
  .addStringOption((option) =>
    option
      .setName("categorie")
      .setDescription("Choisir une catégorie")
      .addChoices(
        { name: "IA", value: "ia" },
        { name: "Cyber", value: "cyber" },
        { name: "Crypto", value: "crypto" },
        { name: "Tech", value: "tech" }
      )
      .setRequired(false)
  );

export async function execute(interaction) {
  await interaction.deferReply();

  const category = interaction.options.getString("categorie");

  try {
    const newsList = await getImportantNews(category, 3);

    if (!newsList.length) {
      await interaction.editReply("Aucune news importante trouvée pour le moment.");
      return;
    }

    const embeds = newsList.map(formatNewsEmbed);
    await interaction.editReply({ embeds });
  } catch (error) {
    console.error(error);
    await interaction.editReply("Erreur pendant la récupération des actualités.");
  }
}