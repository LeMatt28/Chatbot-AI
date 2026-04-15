import "dotenv/config";
import { Client, GatewayIntentBits, Collection, REST, Routes } from "discord.js";

import * as actu from "./commands/actu.js";
import * as resume from "./commands/resume.js";
import * as top from "./commands/top.js";
import * as detail from "./commands/detail.js";
import * as explique from "./commands/explique.js";


// client discord
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});


// stockage commandes
client.commands = new Collection();


// liste commandes
const commands = [actu, resume, top, detail, explique];


// ajout commandes
for (const cmd of commands) {
  client.commands.set(cmd.data.name, cmd);
}


// enregistrement commandes discord
async function registerCommands() {
  const rest = new REST().setToken(process.env.DISCORD_TOKEN);

  const body = commands.map((cmd) => cmd.data.toJSON());

  try {
    if (process.env.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID,
          process.env.GUILD_ID
        ),
        { body }
      );
      console.log("commands enregistrees serveur");
    } else {
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body }
      );
      console.log("commands enregistrees global");
    }
  } catch (err) {
    console.log("erreur register commands", err.message);
  }
}


// bot pret
client.once("ready", async (clientReady) => {
  console.log("bot connecte :", clientReady.user.tag);
  await registerCommands();
  console.log("bot pret");
});


// interactions
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.log("command error", interaction.commandName, err.message);

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply("une erreur est survenue").catch(() => {});
    } else {
      await interaction.reply({
        content: "une erreur est survenue",
        ephemeral: true
      }).catch(() => {});
    }
  }
});


// login bot
client.login(process.env.DISCORD_TOKEN);