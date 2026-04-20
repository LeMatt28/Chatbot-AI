import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { chat, clearHistory, getConversationLength } from "../services/chatService.js";
import { isITRelated, guardrailRefusal } from "../services/guardrailService.js";
import { canUseChat, incrementAsk, getRemainingQuota, getPlan } from "../services/subscriptionsServices.js";
import { buildErrorEmbed } from "../utils/discordFormatter.js";
import { truncateText } from "../utils/text.js";


// definition commande
export const data = new SlashCommandBuilder()
  .setName("chat")
  .setDescription("Discute avec l'IA sur l'actu IT (Freemium/Premium uniquement)")

  // option message
  .addStringOption((option) =>
    option
      .setName("message")
      .setDescription("Ton message ou question IT")
      .setRequired(true)
  )

  // option reset
  .addBooleanOption((option) =>
    option
      .setName("reset")
      .setDescription("Réinitialiser la conversation")
      .setRequired(false)
  );


// execution commande
export async function execute(interaction) {

  // recuperation donnees utilisateur
  const userId = interaction.user.id;
  const message = interaction.options.getString("message");
  const reset = interaction.options.getBoolean("reset") ?? false;
  const plan = getPlan(userId);

  // verification acces chat
  if (!plan.chat) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xfee75c)
          .setTitle("⭐ Fonctionnalité Freemium")
          .setDescription("Le chat IA est disponible à partir du plan **Freemium**.")
          .addFields({ name: "💡 Changer de plan", value: "Utilise `/plan` pour voir les options." })
      ],
      ephemeral: true,
    });
  }

  // verification quota
  if (!canUseChat(userId)) {
    const remaining = getRemainingQuota(userId);

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xed4245)
          .setTitle("❌ Quota atteint")
          .setDescription(`Tu as atteint ta limite de **${plan.asks} questions/jour** avec le plan **${plan.label}**.\nReviens demain ou passe au plan supérieur avec \`/plan\`.`)
      ],
      ephemeral: true,
    });
  }

  // reset conversation
  if (reset) {
    clearHistory(userId);

    await interaction.reply({
      content: "🔄 Conversation réinitialisée. Pose ta question !",
      ephemeral: true
    });

    return;
  }

  // verification sujet it
  if (!isITRelated(message)) {
    return interaction.reply({
      content: guardrailRefusal(),
      ephemeral: true
    });
  }

  // attente reponse
  await interaction.deferReply();

  // appel modele
  const reply = await chat(userId, message);

  // erreur modele
  if (!reply) {
    return interaction.editReply({
      embeds: [
        buildErrorEmbed("Le modèle IA ne répond pas. Vérifie qu'Ollama tourne avec `ollama serve`.")
      ],
    });
  }

  // increment quota
  incrementAsk(userId);

  // recuperation infos session
  const remaining = getRemainingQuota(userId);
  const turns = getConversationLength(userId);

  // creation embed
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setAuthor({
      name: `💬 ${interaction.user.displayName}`,
      iconURL: interaction.user.displayAvatarURL()
    })
    .addFields({
      name: "Question",
      value: truncateText(message, 200)
    })
    .setDescription(reply)
    .setFooter({
      text: `${plan.label} · ${remaining.asks} question(s) restante(s) · ${turns} échange(s) en cours · /chat reset:true pour effacer`,
    });

  // envoi reponse
  await interaction.editReply({ embeds: [embed] });
}