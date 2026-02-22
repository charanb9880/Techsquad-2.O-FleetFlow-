import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Helper to generate IDs if not provided (though frontend usually does it)
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Vehicles ---
app.get('/api/vehicles', (req, res) => {
    const vehicles = db.prepare('SELECT * FROM vehicles').all();
    res.json(vehicles);
});

app.post('/api/vehicles', (req, res) => {
    const { name, model, licensePlate, type, maxCapacity, odometer, acquisitionCost, revenue } = req.body;

    // Validation
    if (!name || !licensePlate) {
        return res.status(400).json({ error: 'Name and License Plate are required' });
    }
    if (name.length < 3) {
        return res.status(400).json({ error: 'Vehicle name must be at least 3 characters' });
    }
    const plateRegex = /^[A-Z0-9- ]+$/i;
    if (!plateRegex.test(licensePlate)) {
        return res.status(400).json({ error: 'Invalid license plate format' });
    }

    const nid = req.body.id || 'v' + generateId();
    try {
        db.prepare(`
      INSERT INTO vehicles (id, name, model, licensePlate, type, region, maxCapacity, odometer, status, acquisitionCost, revenue)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(nid, name, model || '', licensePlate.toUpperCase(), type || 'Truck', req.body.region || 'North', Number(maxCapacity) || 0, Number(odometer) || 0, req.body.status || 'Available', Number(acquisitionCost) || 0, Number(revenue) || 0);
        res.status(201).json({ id: nid, ...req.body });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'License plate already exists' });
        }
        res.status(400).json({ error: error.message });
    }
});

app.put('/api/vehicles/:id', (req, res) => {
    const { name, model, licensePlate, type, region, maxCapacity, odometer, status, acquisitionCost, revenue } = req.body;

    if (!name || !licensePlate) {
        return res.status(400).json({ error: 'Name and License Plate are required' });
    }

    try {
        db.prepare(`
      UPDATE vehicles SET name=?, model=?, licensePlate=?, type=?, region=?, maxCapacity=?, odometer=?, status=?, acquisitionCost=?, revenue=?
      WHERE id=?
    `).run(name, model, licensePlate.toUpperCase(), type, region, Number(maxCapacity), Number(odometer), status, Number(acquisitionCost), Number(revenue), req.params.id);
        res.json({ id: req.params.id, ...req.body });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/vehicles/:id', (req, res) => {
    db.prepare('DELETE FROM vehicles WHERE id=?').run(req.params.id);
    res.status(204).send();
});

// --- Drivers ---
app.get('/api/drivers', (req, res) => {
    const drivers = db.prepare('SELECT * FROM drivers').all();
    const formattedDrivers = drivers.map(d => ({
        ...d,
        licenseCategory: d.licenseCategory ? d.licenseCategory.split(',') : []
    }));
    res.json(formattedDrivers);
});

app.post('/api/drivers', (req, res) => {
    const { name, licenseNumber, licenseExpiry, licenseStatus, licenseCategory, safetyScore, dutyStatus, phone } = req.body;

    if (!name || !licenseNumber) {
        return res.status(400).json({ error: 'Name and License Number are required' });
    }

    const nid = req.body.id || 'd' + generateId();
    const cat = Array.isArray(licenseCategory) ? licenseCategory.join(',') : '';
    try {
        db.prepare(`
      INSERT INTO drivers (id, name, licenseNumber, licenseExpiry, licenseStatus, licenseCategory, safetyScore, dutyStatus, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(nid, name, licenseNumber.toUpperCase(), licenseExpiry, licenseStatus || 'Valid', cat, Number(safetyScore) || 100, dutyStatus || 'Off Duty', phone || '');
        res.status(201).json({ id: nid, ...req.body });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'License number already exists' });
        }
        res.status(400).json({ error: error.message });
    }
});

app.put('/api/drivers/:id', (req, res) => {
    const { name, licenseNumber, licenseExpiry, licenseStatus, licenseCategory, safetyScore, dutyStatus, phone } = req.body;
    const cat = Array.isArray(licenseCategory) ? licenseCategory.join(',') : '';
    db.prepare(`
    UPDATE drivers SET name=?, licenseNumber=?, licenseExpiry=?, licenseStatus=?, licenseCategory=?, safetyScore=?, dutyStatus=?, phone=?
    WHERE id=?
  `).run(name, licenseNumber.toUpperCase(), licenseExpiry, licenseStatus, cat, Number(safetyScore), dutyStatus, phone, req.params.id);
    res.json({ id: req.params.id, ...req.body });
});

app.delete('/api/drivers/:id', (req, res) => {
    db.prepare('DELETE FROM drivers WHERE id=?').run(req.params.id);
    res.status(204).send();
});

// --- Trips ---
app.get('/api/trips', (req, res) => {
    const trips = db.prepare('SELECT * FROM trips').all();
    res.json(trips);
});

app.post('/api/trips', (req, res) => {
    const { vehicleId, driverId, origin, destination } = req.body;
    if (!vehicleId || !driverId || !origin || !destination) {
        return res.status(400).json({ error: 'Vehicle, Driver, Origin, and Destination are required' });
    }

    const nid = req.body.id || 't' + generateId();
    db.prepare(`
    INSERT INTO trips (id, vehicleId, driverId, cargoWeight, cargoDesc, origin, destination, status, createdAt, dispatchedAt, completedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
        nid, vehicleId, driverId, Number(req.body.cargoWeight) || 0, req.body.cargoDesc || '',
        origin, destination, req.body.status || 'Draft', req.body.createdAt, req.body.dispatchedAt, req.body.completedAt
    );
    res.status(201).json({ id: nid, ...req.body });
});

app.put('/api/trips/:id', (req, res) => {
    const { vehicleId, driverId, cargoWeight, cargoDesc, origin, destination, status, createdAt, dispatchedAt, completedAt } = req.body;
    db.prepare(`
    UPDATE trips SET vehicleId=?, driverId=?, cargoWeight=?, cargoDesc=?, origin=?, destination=?, status=?, createdAt=?, dispatchedAt=?, completedAt=?
    WHERE id=?
  `).run(vehicleId, driverId, cargoWeight, cargoDesc, origin, destination, status, createdAt, dispatchedAt, completedAt, req.params.id);
    res.json({ id: req.params.id, ...req.body });
});

// --- Maintenance ---
app.get('/api/maintenance', (req, res) => {
    res.json(db.prepare('SELECT * FROM maintenance').all());
});

app.post('/api/maintenance', (req, res) => {
    const { id, vehicleId, type, description, cost, date, status, mileageAtService } = req.body;
    const nid = id || 'm' + generateId();
    db.prepare(`
    INSERT INTO maintenance (id, vehicleId, type, description, cost, date, status, mileageAtService)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(nid, vehicleId, type, description, cost, date, status, mileageAtService);
    res.status(201).json({ id: nid, ...req.body });
});

// --- Fuel Logs ---
app.get('/api/fuel_logs', (req, res) => {
    res.json(db.prepare('SELECT * FROM fuel_logs').all());
});

app.post('/api/fuel_logs', (req, res) => {
    const { id, vehicleId, liters, cost, date, station } = req.body;
    const nid = id || 'f' + generateId();
    db.prepare(`
    INSERT INTO fuel_logs (id, vehicleId, liters, cost, date, station)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(nid, vehicleId, liters, cost, date, station);
    res.status(201).json({ id: nid, ...req.body });
});

// --- Expenses ---
app.get('/api/expenses', (req, res) => {
    res.json(db.prepare('SELECT * FROM expenses').all());
});

app.post('/api/expenses', (req, res) => {
    const { id, vehicleId, type, amount, date, notes } = req.body;
    const nid = id || 'e' + generateId();
    db.prepare(`
    INSERT INTO expenses (id, vehicleId, type, amount, date, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(nid, vehicleId, type, amount, date, notes);
    res.status(201).json({ id: nid, ...req.body });
});

// --- Activity ---
app.get('/api/activity', (req, res) => {
    res.json(db.prepare('SELECT * FROM recent_activity ORDER BY id DESC').all());
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
