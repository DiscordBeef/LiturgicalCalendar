const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Initialize the database
const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'liturgical.db');
const db = new Database(dbPath);

// Create tables if they don't exist
function initializeDatabase() {
  // Create table for Roman Martyrology
  db.exec(`CREATE TABLE IF NOT EXISTS roman_martyrology (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month INTEGER NOT NULL,
    day INTEGER NOT NULL,
    year INTEGER,
    description TEXT NOT NULL,
    source_text TEXT
  )`);

  // Create table for New Calendar (General Roman Calendar)
  db.exec(`CREATE TABLE IF NOT EXISTS new_calendar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month INTEGER NOT NULL,
    day INTEGER NOT NULL,
    celebration TEXT NOT NULL,
    rank TEXT NOT NULL,
    color TEXT,
    proper_text TEXT,
    year_introduced INTEGER
  )`);

  // Create table for Tridentine Calendar
  db.exec(`CREATE TABLE IF NOT EXISTS tridentine_calendar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month INTEGER NOT NULL,
    day INTEGER NOT NULL,
    celebration TEXT NOT NULL,
    rank TEXT NOT NULL,
    color TEXT,
    proper_text TEXT
  )`);

  // Create table for error logs
  db.exec(`CREATE TABLE IF NOT EXISTS error_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    additional_info TEXT
  )`);
}

// Query helpers
function getNewCalendarEntry(month, day) {
  const stmt = db.prepare('SELECT * FROM new_calendar WHERE month = ? AND day = ?');
  return stmt.all(month, day);
}

function getTridentineCalendarEntry(month, day) {
  const stmt = db.prepare('SELECT * FROM tridentine_calendar WHERE month = ? AND day = ?');
  return stmt.all(month, day);
}

function getRomanMartyrology(month, day) {
  const stmt = db.prepare('SELECT * FROM roman_martyrology WHERE month = ? AND day = ?');
  return stmt.all(month, day);
}

function logError(errorType, errorMessage, additionalInfo = null) {
  const stmt = db.prepare(
    'INSERT INTO error_logs (timestamp, error_type, error_message, additional_info) VALUES (?, ?, ?, ?)'
  );
  stmt.run(Date.now(), errorType, errorMessage, additionalInfo);
}

// Initialize database
initializeDatabase();

module.exports = {
  db,
  getNewCalendarEntry,
  getTridentineCalendarEntry,
  getRomanMartyrology,
  logError
};
