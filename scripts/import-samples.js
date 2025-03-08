const path = require('path');
const { importFromJson } = require('../src/utils/dataImport');

async function importSampleData() {
  const samplesDir = path.join(__dirname, '../data/samples');
  
  // Import new calendar sample data
  try {
    console.log('Importing New Calendar sample data...');
    const result1 = await importFromJson(
      path.join(samplesDir, 'new_calendar_sample.json'), 
      'new_calendar'
    );
    console.log(result1.success ? 
      `Successfully imported ${result1.count} New Calendar entries.` : 
      `Failed to import New Calendar data: ${result1.error}`);
  } catch (error) {
    console.error('Error importing New Calendar sample data:', error);
  }
  
  // Import Tridentine calendar sample data
  try {
    console.log('Importing Tridentine Calendar sample data...');
    const result2 = await importFromJson(
      path.join(samplesDir, 'tridentine_calendar_sample.json'), 
      'tridentine_calendar'
    );
    console.log(result2.success ? 
      `Successfully imported ${result2.count} Tridentine Calendar entries.` : 
      `Failed to import Tridentine Calendar data: ${result2.error}`);
  } catch (error) {
    console.error('Error importing Tridentine Calendar sample data:', error);
  }
  
  // Import Roman Martyrology sample data
  try {
    console.log('Importing Roman Martyrology sample data...');
    const result3 = await importFromJson(
      path.join(samplesDir, 'roman_martyrology_sample.json'), 
      'roman_martyrology'
    );
    console.log(result3.success ? 
      `Successfully imported ${result3.count} Roman Martyrology entries.` : 
      `Failed to import Roman Martyrology data: ${result3.error}`);
  } catch (error) {
    console.error('Error importing Roman Martyrology sample data:', error);
  }
}

// Run the import function
importSampleData()
  .then(() => console.log('Sample data import complete!'))
  .catch(err => console.error('Failed to import sample data:', err));
