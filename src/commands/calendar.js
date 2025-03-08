const { SlashCommandBuilder } = require('discord.js');
const { getCalendarEntryForDate, formatCalendarMessage } = require('../utils/calendarUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('calendar')
    .setDescription('Get liturgical calendar information')
    .addSubcommand(subcommand =>
      subcommand
        .setName('today')
        .setDescription('Show feast day for today')
        .addStringOption(option =>
          option.setName('calendar')
            .setDescription('Which calendar to use')
            .setRequired(false)
            .addChoices(
              { name: 'New Calendar (General Roman Calendar)', value: 'new' },
              { name: 'Tridentine Calendar', value: 'tridentine' },
              { name: 'Roman Martyrology', value: 'martyrology' }
            )
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('date')
        .setDescription('Show feast day for a specific date')
        .addIntegerOption(option => 
          option.setName('month')
            .setDescription('Month (1-12)')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(12)
        )
        .addIntegerOption(option => 
          option.setName('day')
            .setDescription('Day (1-31)')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(31)
        )
        .addStringOption(option =>
          option.setName('calendar')
            .setDescription('Which calendar to use')
            .setRequired(false)
            .addChoices(
              { name: 'New Calendar (General Roman Calendar)', value: 'new' },
              { name: 'Tridentine Calendar', value: 'tridentine' },
              { name: 'Roman Martyrology', value: 'martyrology' }
            )
        )
    ),
  async execute(interaction) {
    await interaction.deferReply();
    
    try {
      let date;
      const calendarType = interaction.options.getString('calendar') || 'new';
      
      if (interaction.options.getSubcommand() === 'today') {
        date = new Date();
      } else {
        const month = interaction.options.getInteger('month');
        const day = interaction.options.getInteger('day');
        date = new Date(new Date().getFullYear(), month - 1, day);
        
        // Check if date is valid
        if (date.getMonth() !== month - 1 || date.getDate() !== day) {
          return await interaction.editReply(`Invalid date: ${month}/${day}`);
        }
      }
      
      const entries = await getCalendarEntryForDate(date, calendarType);
      const message = formatCalendarMessage(entries, date, calendarType);
      
      await interaction.editReply(message);
    } catch (error) {
      console.error("Error executing calendar command:", error);
      await interaction.editReply('An error occurred while fetching the calendar information.');
    }
  },
};
