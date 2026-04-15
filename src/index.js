import dotenv from "dotenv";
dotenv.config();

import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import { data as actuData, execute as actuExecute } from "./commands/actu.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [actuData.toJSON()];

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands }
  );

  console.log("Commandes enregistrées.");
}

client.once("ready", () => {
  console.log(`Bot connecté : ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "actu") {
    await actuExecute(interaction);
  }
});

await registerCommands();
await client.login(process.env.DISCORD_TOKEN);