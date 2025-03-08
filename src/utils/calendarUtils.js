const { getNewCalendarEntry, getTridentineCalendarEntry, getRomanMartyrology } = require('../database');

// Format rank with emoji based on significance
function formatRank(rank) {
  if (rank.includes('Solemnity')) {
    return '🌟 **Solemnity**';
  } else if (rank.includes('Feast')) {
    return '✨ **Feast**';
  } else if (rank.includes('Memorial')) {
    if (rank.includes('Optional')) {
      return '📖 Optional Memorial';
    }
    return '📔 **Memorial**';
  } else if (rank.includes('Commemoration')) {
    return '📝 Commemoration';
  } else {
    return rank;
  }
}

// Get calendar entry for the specified date
async function getCalendarEntryForDate(date, calendarType = 'new') {
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  const day = date.getDate();
  
  let entries;
  if (calendarType === 'tridentine') {
    entries = getTridentineCalendarEntry(month, day);
  } else if (calendarType === 'martyrology') {
    entries = getRomanMartyrology(month, day);
  } else {
    // Default to new calendar
    entries = getNewCalendarEntry(month, day);
  }
  
  return entries;
}

// Create a formatted message for a calendar entry
function formatCalendarMessage(entries, date, calendarType = 'new') {
  if (!entries || entries.length === 0) {
    return `No entries found for ${date.toLocaleDateString()} in the ${calendarType} calendar.`;
  }

  const dateStr = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  let message = `# ${dateStr}\n\n`;

  if (calendarType === 'martyrology') {
    message += "## Roman Martyrology\n\n";
    entries.forEach(entry => {
      message += `${entry.description}\n\n`;
    });
  } else {
    const calendarName = calendarType === 'tridentine' ? 'Tridentine Calendar' : 'General Roman Calendar';
    message += `## ${calendarName}\n\n`;
    
    entries.forEach(entry => {
      const rank = formatRank(entry.rank);
      message += `### ${entry.celebration}\n${rank}\n`;
      if (entry.color) message += `Liturgical Color: ${entry.color}\n`;
      if (entry.proper_text) message += `\n${entry.proper_text}\n`;
      message += '\n';
    });
  }

  return message;
}

module.exports = {
  getCalendarEntryForDate,
  formatCalendarMessage,
  formatRank
};
