import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'fleetflow.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Schema setup
const schema = `
CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT,
  licensePlate TEXT UNIQUE NOT NULL,
  type TEXT,
  region TEXT,
  maxCapacity INTEGER,
  odometer INTEGER,
  status TEXT,
  acquisitionCost INTEGER,
  revenue INTEGER
);

CREATE TABLE IF NOT EXISTS drivers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  licenseNumber TEXT UNIQUE,
  licenseExpiry TEXT,
  licenseStatus TEXT,
  licenseCategory TEXT, -- Stored as comma-separated values or JSON
  safetyScore INTEGER,
  dutyStatus TEXT,
  phone TEXT
);

CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  vehicleId TEXT,
  driverId TEXT,
  cargoWeight INTEGER,
  cargoDesc TEXT,
  origin TEXT,
  destination TEXT,
  status TEXT,
  createdAt TEXT,
  dispatchedAt TEXT,
  completedAt TEXT,
  FOREIGN KEY (vehicleId) REFERENCES vehicles (id),
  FOREIGN KEY (driverId) REFERENCES drivers (id)
);

CREATE TABLE IF NOT EXISTS maintenance (
  id TEXT PRIMARY KEY,
  vehicleId TEXT,
  type TEXT,
  description TEXT,
  cost INTEGER,
  date TEXT,
  status TEXT,
  mileageAtService INTEGER,
  FOREIGN KEY (vehicleId) REFERENCES vehicles (id)
);

CREATE TABLE IF NOT EXISTS fuel_logs (
  id TEXT PRIMARY KEY,
  vehicleId TEXT,
  liters INTEGER,
  cost INTEGER,
  date TEXT,
  station TEXT,
  FOREIGN KEY (vehicleId) REFERENCES vehicles (id)
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  vehicleId TEXT,
  type TEXT,
  amount INTEGER,
  date TEXT,
  notes TEXT,
  FOREIGN KEY (vehicleId) REFERENCES vehicles (id)
);

CREATE TABLE IF NOT EXISTS recent_activity (
  id TEXT PRIMARY KEY,
  type TEXT,
  message TEXT,
  time TEXT,
  color TEXT
);
`;

db.exec(schema);

export default db;
