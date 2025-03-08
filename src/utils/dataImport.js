const fs = require('fs');
const path = require('path');
const { db } = require('../database');

// Function to import data from a JSON file into a specific table
async function importFromJson(filePath, tableName) {
  try {
    console.log(`Importing data from ${filePath} into ${tableName}...`);
    
    // Read the JSON file
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Begin a transaction
    const transaction = db.transaction((entries) => {
      let insertStmt;
      
      if (tableName === 'roman_martyrology') {
        insertStmt = db.prepare(`
          INSERT OR REPLACE INTO roman_martyrology 
          (month, day, year, description, source_text) 
          VALUES (?, ?, ?, ?, ?)
        `);
        
        for (const entry of entries) {
          insertStmt.run(
            entry.month,
            entry.day,
            entry.year || null,
            entry.description,
            entry.source_text || null
          );
        }
      } else if (tableName === 'new_calendar') {
        insertStmt = db.prepare(`
          INSERT OR REPLACE INTO new_calendar 
          (month, day, celebration, rank, color, proper_text, year_introduced) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        for (const entry of entries) {
          insertStmt.run(
            entry.month,
            entry.day,
            entry.celebration,
            entry.rank,
            entry.color || null,
            entry.proper_text || null,
            entry.year_introduced || null
          );
        }
      } else if (tableName === 'tridentine_calendar') {
        insertStmt = db.prepare(`
          INSERT OR REPLACE INTO tridentine_calendar 
          (month, day, celebration, rank, color, proper_text) 
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        for (const entry of entries) {
          insertStmt.run(
            entry.month,
            entry.day,
            entry.celebration,
            entry.rank,
            entry.color || null,
            entry.proper_text || null
          );
        }
      }
    });
    
    // Execute the transaction
    transaction(data);
    
    console.log(`Successfully imported ${data.length} entries into ${tableName}.`);
    return { success: true, count: data.length };
  } catch (error) {
    console.error(`Error importing data to ${tableName}:`, error);
    return { success: false, error: error.message };
  }
}

// Function to create sample JSON template files
function createSampleTemplates() {
  const templatesDir = path.join(__dirname, '../../data/templates');
  
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }
  
  // Sample for Roman Martyrology
  const martyrologyTemplate = [
    {
      "month": 1,
      "day": 1,
      "year": null,
      "description": "Sample entry for Roman Martyrology",
      "source_text": "Source text reference"
    }
  ];
  
  // Sample for New Calendar
  const newCalendarTemplate = [
    {
      "month": 1,
      "day": 1,
      "celebration": "Solemnity of Mary, Mother of God",
      "rank": "Solemnity",
      "color": "White",
      "proper_text": "Sample proper text",
      "year_introduced": 1970
    }
  ];
  
  // Sample for Tridentine Calendar
  const tridentineCalendarTemplate = [
    {
      "month": 1,
      "day": 1,
      "celebration": "The Circumcision of Our Lord",
      "rank": "Double of the Second Class",
      "color": "White",
      "proper_text": "Sample proper text"
    }
  ];
  
  fs.writeFileSync(
    path.join(templatesDir, 'roman_martyrology_template.json'),
    JSON.stringify(martyrologyTemplate, null, 2)
  );
  
  fs.writeFileSync(
    path.join(templatesDir, 'new_calendar_template.json'),
    JSON.stringify(newCalendarTemplate, null, 2)
  );
  
  fs.writeFileSync(
    path.join(templatesDir, 'tridentine_calendar_template.json'),
    JSON.stringify(tridentineCalendarTemplate, null, 2)
  );
  
  console.log(`Sample templates created in ${templatesDir}`);
}

// Command-line interface for the script
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log('Usage:');
    console.log('  node dataImport.js --templates                    Create sample templates');
    console.log('  node dataImport.js --import <filename> <tableName>    Import data from JSON file');
    process.exit(0);
  }
  
  if (args[0] === '--templates') {
    createSampleTemplates();
  } else if (args[0] === '--import' && args.length === 3) {
    const filePath = args[1];
    const tableName = args[2];
    
    importFromJson(filePath, tableName)
      .then(result => {
        if (result.success) {
          console.log('Import completed successfully!');
        } else {
          console.error('Import failed:', result.error);
        }
      });
  } else {
    console.error('Invalid arguments. Use --help to see usage information.');
  }
}

module.exports = {
  importFromJson,
  createSampleTemplates
};
