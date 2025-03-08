const fs = require('fs');
const path = require('path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const schedule = require('node-schedule');
const { logError } = require('./database');
const { getCalendarEntryForDate, formatCalendarMessage } = require('./utils/calendarUtils');
require('dotenv').config();

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

// Load commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

// Load config
const config = require('../config.json');

// Event: When client is ready
client.once(Events.ClientReady, async readyClient => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  
  // Schedule the daily post
  scheduleDailyPosts();
});

// Schedule daily posts
function scheduleDailyPosts() {
  const [hour, minute] = config.dailyPostTime.split(':').map(Number);
  
  console.log(`Scheduling daily posts at ${hour}:${minute}`);
  
  // Schedule job using node-schedule (runs every day at the specified time)
  schedule.scheduleJob(`${minute} ${hour} * * *`, async function() {
    try {
      await postDailyFeast();
    } catch (error) {
      console.error('Error in scheduled daily post:', error);
      logError('ScheduledPost', error.message);
    }
  });
}

// Post the daily feast information
async function postDailyFeast() {
  try {
    const today = new Date();
    console.log(`Posting daily feast for ${today.toDateString()}`);
    
    // Get calendar entries for today from both calendars
    const newCalendarEntries = await getCalendarEntryForDate(today, 'new');
    const tridentineCalendarEntries = await getCalendarEntryForDate(today, 'tridentine');
    const martyrologyEntries = await getCalendarEntryForDate(today, 'martyrology');
    
    // Format messages
    const newCalendarMessage = formatCalendarMessage(newCalendarEntries, today, 'new');
    const tridentineCalendarMessage = formatCalendarMessage(tridentineCalendarEntries, today, 'tridentine');
    const martyrologyMessage = formatCalendarMessage(martyrologyEntries, today, 'martyrology');
    
    // Find all channels where we should post
    const targetChannels = [];
    client.guilds.cache.forEach(guild => {
      const channel = guild.channels.cache.find(ch => 
        ch.name === config.dailyPostChannel && ch.isTextBased()
      );
      if (channel) {
        targetChannels.push(channel);
      }
    });
    
    // Post messages to all target channels
    for (const channel of targetChannels) {
      await channel.send(newCalendarMessage);
      await channel.send(tridentineCalendarMessage);
      await channel.send(martyrologyMessage);
    }
    
    console.log(`Posted daily feast to ${targetChannels.length} channels.`);
  } catch (error) {
    console.error('Failed to post daily feast:', error);
    logError('DailyPost', error.message);
    throw error; // Re-throw to be caught by the scheduler
  }
}

// Event: Handle interactions (commands)
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  
  const command = interaction.client.commands.get(interaction.commandName);
  
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }
  
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing ${interaction.commandName}:`, error);
    logError('CommandExecution', error.message, interaction.commandName);
    
    const errorMessage = 'There was an error while executing this command!';
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, ephemeral: true });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
});

// Log in to Discord with your token
client.login(process.env.DISCORD_TOKEN);
