const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { db, logError } = require('../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('debug')
    .setDescription('Debug commands for administrators')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('fix_entry')
        .setDescription('Fix a calendar entry')
        .addStringOption(option =>
          option.setName('calendar')
            .setDescription('Which calendar to modify')
            .setRequired(true)
            .addChoices(
              { name: 'New Calendar', value: 'new_calendar' },
              { name: 'Tridentine Calendar', value: 'tridentine_calendar' },
              { name: 'Roman Martyrology', value: 'roman_martyrology' }
            )
        )
        .addIntegerOption(option => 
          option.setName('id')
            .setDescription('ID of the entry to fix')
            .setRequired(true)
        )
        .addStringOption(option => 
          option.setName('field')
            .setDescription('Field to fix')
            .setRequired(true)
        )
        .addStringOption(option => 
          option.setName('value')
            .setDescription('New value')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('view_errors')
        .setDescription('View recent error logs')
        .addIntegerOption(option =>
          option.setName('limit')
            .setDescription('Number of errors to show')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('add_entry')
        .setDescription('Add a new calendar entry')
        .addStringOption(option =>
          option.setName('calendar')
            .setDescription('Which calendar to modify')
            .setRequired(true)
            .addChoices(
              { name: 'New Calendar', value: 'new_calendar' },
              { name: 'Tridentine Calendar', value: 'tridentine_calendar' },
              { name: 'Roman Martyrology', value: 'roman_martyrology' }
            )
        )
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
          option.setName('data')
            .setDescription('JSON data for the entry')
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true }); // Make debug responses ephemeral
    
    try {
      const subcommand = interaction.options.getSubcommand();
      
      if (subcommand === 'fix_entry') {
        const calendar = interaction.options.getString('calendar');
        const id = interaction.options.getInteger('id');
        const field = interaction.options.getString('field');
        const value = interaction.options.getString('value');
        
        // Check if field is valid for the calendar
        const tableInfo = db.prepare(`PRAGMA table_info(${calendar})`).all();
        const validFields = tableInfo.map(column => column.name);
        
        if (!validFields.includes(field)) {
          return await interaction.editReply({
            content: `Invalid field. Valid fields are: ${validFields.join(', ')}`,
            ephemeral: true
          });
        }
        
        // Update the entry
        const stmt = db.prepare(`UPDATE ${calendar} SET ${field} = ? WHERE id = ?`);
        const result = stmt.run(value, id);
        
        if (result.changes === 0) {
          return await interaction.editReply({
            content: `No entry found with ID ${id} in ${calendar}`,
            ephemeral: true
          });
        }
        
        await interaction.editReply({
          content: `Successfully updated ${field} for entry ${id} in ${calendar}`,
          ephemeral: true
        });
      } else if (subcommand === 'view_errors') {
        const limit = interaction.options.getInteger('limit') || 10;
        const errors = db.prepare(`SELECT * FROM error_logs ORDER BY timestamp DESC LIMIT ?`).all(limit);
        
        if (errors.length === 0) {
          return await interaction.editReply({
            content: 'No errors found in the log.',
            ephemeral: true
          });
        }
        
        let response = '## Recent Errors\n\n';
        errors.forEach(error => {
          const date = new Date(error.timestamp).toLocaleString();
          response += `**${error.error_type}** - ${date}\n${error.error_message}\n`;
          if (error.additional_info) {
            response += `Additional info: ${error.additional_info}\n`;
          }
          response += '\n';
        });
        
        await interaction.editReply({
          content: response,
          ephemeral: true
        });
      } else if (subcommand === 'add_entry') {
        const calendar = interaction.options.getString('calendar');
        const month = interaction.options.getInteger('month');
        const day = interaction.options.getInteger('day');
        const jsonData = interaction.options.getString('data');
        
        let data;
        try {
          data = JSON.parse(jsonData);
        } catch (error) {
          return await interaction.editReply({
            content: 'Invalid JSON data provided.',
            ephemeral: true
          });
        }
        
        // Create query based on calendar type
        let query;
        let params = [];
        
        if (calendar === 'new_calendar') {
          query = `INSERT INTO new_calendar (month, day, celebration, rank, color, proper_text, year_introduced) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
          params = [month, day, data.celebration, data.rank, data.color, data.proper_text, data.year_introduced];
        } else if (calendar === 'tridentine_calendar') {
          query = `INSERT INTO tridentine_calendar (month, day, celebration, rank, color, proper_text) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
          params = [month, day, data.celebration, data.rank, data.color, data.proper_text];
        } else if (calendar === 'roman_martyrology') {
          query = `INSERT INTO roman_martyrology (month, day, year, description, source_text) 
                   VALUES (?, ?, ?, ?, ?)`;
          params = [month, day, data.year, data.description, data.source_text];
        }
        
        // Insert the entry
        const stmt = db.prepare(query);
        const result = stmt.run(...params);
        
        await interaction.editReply({
          content: `Successfully added new entry to ${calendar} with ID ${result.lastInsertRowid}`,
          ephemeral: true
        });
      }
    } catch (error) {
      console.error("Error executing debug command:", error);
      logError('DebugCommand', error.message, interaction.options.getSubcommand());
      await interaction.editReply({
        content: 'An error occurred while executing the debug command.',
        ephemeral: true
      });
    }
  },
};
