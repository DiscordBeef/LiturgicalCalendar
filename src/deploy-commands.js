const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// Function to deploy commands, can be called directly or imported
async function deployCommands() {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const config = require('../config.json');
    const clientId = config.clientId;
    
    // For guild-specific commands
    if (config.guildId) {
      const guildId = config.guildId;
      const data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands },
      );
      console.log(`Successfully reloaded ${data.length} guild commands for guild ${guildId}.`);
    } else {
      // For global commands
      const data = await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands },
      );
      console.log(`Successfully reloaded ${data.length} global commands.`);
    }
  } catch (error) {
    console.error(error);
  }
}

// Execute directly if this file is run directly
if (require.main === module) {
  deployCommands();
}

module.exports = { deployCommands };
