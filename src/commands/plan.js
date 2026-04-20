import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import {
  PLANS,
  getPlan,
  getUserPlan,
  setUserPlan,
  getRemainingQuota
} from "../services/subscriptionsServices.js";


// definition commande
export const data = new SlashCommandBuilder()
  .setName("plan")
  .setDescription("Voir ou changer ton abonnement")

  // option changer
  .addStringOption((option) =>
    option
      .setName("changer")
      .setDescription("Changer de plan")
      .setRequired(false)
      .addChoices(
        { name: "Gratuit", value: "free" },
        { name: "Freemium", value: "freemium" },
        { name: "Premium", value: "premium" }
      )
  );


// execution commande
export async function execute(interaction) {

  const userId = interaction.user.id;

  // nouveau plan
  const newPlan = interaction.options.getString("changer");

  if (newPlan) {
    setUserPlan(userId, newPlan);
  }

  // infos utilisateur
  const planName = getUserPlan(userId);
  const plan = getPlan(userId);
  const remaining = getRemainingQuota(userId);

  // couleurs
  const colors = {
    free: 0x99aab5,
    freemium: 0xfee75c,
    premium: 0x5865f2
  };

  // creation embed
  const embed = new EmbedBuilder()
    .setColor(colors[planName] || 0x5865f2)
    .setTitle("Plan : " + plan.label);

  // resume
  let summaryText = "";

  if (plan.summaries === 999) {
    summaryText = "illimite";
  } else {
    summaryText =
      remaining.summaries +
      " restant / " +
      plan.summaries +
      " max";
  }

  // chat
  let askText = "";

  if (!plan.chat) {
    askText = "non disponible";
  } else if (plan.asks === 999) {
    askText = "illimite";
  } else {
    askText =
      remaining.asks +
      " restant / " +
      plan.asks +
      " max";
  }

  // analyse
  let analysisText = "non";
  if (plan.analysis) {
    analysisText = "oui";
  }

  // ajout champs
  embed.addFields(
    {
      name: "Resumes",
      value: summaryText,
      inline: true
    },
    {
      name: "Questions",
      value: askText,
      inline: true
    },
    {
      name: "Analyse",
      value: analysisText,
      inline: true
    }
  );

  // comparaison plans
  let comparison = "";

  for (const key in PLANS) {

    const p = PLANS[key];

    let line = p.label;

    if (key === planName) {
      line = line + " (actuel)";
    }

    let sum = p.summaries === 999 ? "illimite" : p.summaries;

    let ask = "";
    if (!p.chat) {
      ask = "-";
    } else if (p.asks === 999) {
      ask = "illimite";
    } else {
      ask = p.asks;
    }

    let analysis = p.analysis ? "oui" : "non";

    line =
      line +
      " - " +
      sum +
      " resumes - " +
      ask +
      " questions - analyse " +
      analysis;

    comparison = comparison + line + "\n";
  }

  embed.addFields({
    name: "Comparaison",
    value: comparison
  });

  // message changement plan
  if (newPlan) {
    embed.setDescription("plan mis a jour vers " + plan.label);
  }

  // envoi reponse
  await interaction.reply({
    embeds: [embed],
    ephemeral: true
  });
}