import db from './db.js';
import { initialVehicles, initialDrivers, initialTrips, initialMaintenance, initialFuelLogs, initialExpenses, recentActivity } from '../src/data/seedData.js';

function seed() {
    const insertVehicle = db.prepare(`
    INSERT OR IGNORE INTO vehicles (id, name, model, licensePlate, type, region, maxCapacity, odometer, status, acquisitionCost, revenue)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    const insertDriver = db.prepare(`
    INSERT OR IGNORE INTO drivers (id, name, licenseNumber, licenseExpiry, licenseStatus, licenseCategory, safetyScore, dutyStatus, phone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    const insertTrip = db.prepare(`
    INSERT OR IGNORE INTO trips (id, vehicleId, driverId, cargoWeight, cargoDesc, origin, destination, status, createdAt, dispatchedAt, completedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    const insertMaintenance = db.prepare(`
    INSERT OR IGNORE INTO maintenance (id, vehicleId, type, description, cost, date, status, mileageAtService)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

    const insertFuelLog = db.prepare(`
    INSERT OR IGNORE INTO fuel_logs (id, vehicleId, liters, cost, date, station)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

    const insertExpense = db.prepare(`
    INSERT OR IGNORE INTO expenses (id, vehicleId, type, amount, date, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

    const insertActivity = db.prepare(`
    INSERT OR IGNORE INTO recent_activity (id, type, message, time, color)
    VALUES (?, ?, ?, ?, ?)
  `);

    const transaction = db.transaction(() => {
        initialVehicles.forEach(v => insertVehicle.run(v.id, v.name, v.model, v.licensePlate, v.type, v.region, v.maxCapacity, v.odometer, v.status, v.acquisitionCost, v.revenue));
        initialDrivers.forEach(d => insertDriver.run(d.id, d.name, d.licenseNumber, d.licenseExpiry, d.licenseStatus, d.licenseCategory.join(','), d.safetyScore, d.dutyStatus, d.phone));
        initialTrips.forEach(t => insertTrip.run(t.id, t.vehicleId, t.driverId, t.cargoWeight, t.cargoDesc, t.origin, t.destination, t.status, t.createdAt, t.dispatchedAt, t.completedAt));
        initialMaintenance.forEach(m => insertMaintenance.run(m.id, m.vehicleId, m.type, m.description, m.cost, m.date, m.status, m.mileageAtService));
        initialFuelLogs.forEach(f => insertFuelLog.run(f.id, f.vehicleId, f.liters, f.cost, f.date, f.station));
        initialExpenses.forEach(e => insertExpense.run(e.id, e.vehicleId, e.type, e.amount, e.date, e.notes));
        recentActivity.forEach(a => insertActivity.run(a.id, a.type, a.message, a.time, a.color));
    });

    transaction();
    console.log('Database seeded successfully!');
}

seed();
