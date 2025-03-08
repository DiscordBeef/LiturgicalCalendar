# Catholic Liturgical Calendar Discord Bot

A Discord bot that provides information about Catholic Church liturgical calendar events, including the Roman Martyrology, the General Roman Calendar (New Calendar), and the Tridentine Calendar.

## Features

- Daily posts of the feast day information from all three calendars
- Commands to retrieve calendar information for any date
- Distinction between Solemnities, Feasts, and Memorials with appropriate formatting
- Administrator debug commands to fix calendar entries or add new ones
- Support for both guild-specific and global commands

## Setup Instructions

### Prerequisites

- Node.js 16.x or higher
- npm (Node Package Manager)
- A Discord account and a registered application/bot
- Basic knowledge of running Node.js applications

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/liturgical-calendar-bot.git
   cd liturgical-calendar-bot
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Copy `.env.example` to `.env` and add your Discord bot token:
   ```
   cp .env.example .env
   ```
   Then edit the `.env` file and add your Discord bot token:
   ```
   DISCORD_TOKEN=your_discord_bot_token_here
   ```

4. Configure the bot by editing `config.json`:
   - `prefix`: Command prefix (for legacy non-slash commands)
   - `dailyPostTime`: Time to post daily updates in HH:MM format
   - `dailyPostChannel`: Name of the channel where daily updates should be posted
   - `timezone`: Timezone for scheduling (defaults to UTC)
   - `clientId`: Your Discord application client ID
   - `guildId`: Optional - specific guild ID if you want guild-only commands

### Setting Up the Database

1. Initialize the database templates:
   ```
   node src/utils/dataImport.js --templates
   ```
   This will create sample templates in the `data/templates` directory.

2. Import sample data:
   ```
   node src/utils/dataImport.js --import data/samples/new_calendar_sample.json new_calendar
   node src/utils/dataImport.js --import data/samples/tridentine_calendar_sample.json tridentine_calendar
   node src/utils/dataImport.js --import data/samples/roman_martyrology_sample.json roman_martyrology
   ```

3. Or create your own data files based on the templates and import them.

### Deploying Commands

1. Register slash commands with Discord:
   ```
   node src/deploy-commands.js
   ```
   This will deploy all commands to your guild or globally as configured.

### Starting the Bot

1. Start the bot:
   ```
   npm start
   ```

2. For development with auto-restart:
   ```
   npm run dev
   ```

## Usage

### User Commands

- `/calendar today [calendar]` - Show feast day information for today
- `/calendar date <month> <day> [calendar]` - Show feast day information for a specific date

The `calendar` parameter can be one of:
- `new` - General Roman Calendar (default)
- `tridentine` - Tridentine Calendar
- `martyrology` - Roman Martyrology

### Admin Commands

- `/debug fix_entry <calendar> <id> <field> <value>` - Fix an entry in the database
- `/debug view_errors [limit]` - View recent error logs
- `/debug add_entry <calendar> <month> <day> <data>` - Add a new calendar entry

## Contributing

If you'd like to contribute to this project, please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to the Catholic Church for maintaining these rich liturgical traditions
- Discord.js for making Discord bot development accessible
```
