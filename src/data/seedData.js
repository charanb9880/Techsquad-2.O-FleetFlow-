export const initialVehicles = [
  { id: 'v1', name: 'Volvo FH16', model: '2023', licensePlate: 'KA-01-AB-1234', type: 'Truck', region: 'South', maxCapacity: 25000, odometer: 45230, status: 'Available', acquisitionCost: 4500000, revenue: 1200000 },
  { id: 'v2', name: 'Tata Prima', model: '2022', licensePlate: 'MH-02-CD-5678', type: 'Truck', region: 'West', maxCapacity: 18000, odometer: 67890, status: 'On Trip', acquisitionCost: 2800000, revenue: 850000 },
  { id: 'v3', name: 'Ashok Leyland 4923', model: '2023', licensePlate: 'TN-03-EF-9012', type: 'Truck', region: 'South', maxCapacity: 30000, odometer: 32100, status: 'In Shop', acquisitionCost: 3200000, revenue: 950000 },
  { id: 'v4', name: 'BharatBenz 3723R', model: '2021', licensePlate: 'DL-04-GH-3456', type: 'Van', region: 'North', maxCapacity: 22000, odometer: 89450, status: 'Available', acquisitionCost: 3000000, revenue: 1100000 },
  { id: 'v5', name: 'Eicher Pro 6049', model: '2022', licensePlate: 'GJ-05-IJ-7890', type: 'Van', region: 'West', maxCapacity: 16000, odometer: 54320, status: 'Out of Service', acquisitionCost: 2200000, revenue: 620000 },
  { id: 'v6', name: 'MAN CLA EVO', model: '2024', licensePlate: 'RJ-06-KL-2345', type: 'Truck', region: 'North', maxCapacity: 28000, odometer: 12400, status: 'Available', acquisitionCost: 5200000, revenue: 400000 },
  { id: 'v7', name: 'Scania P410', model: '2023', licensePlate: 'UP-07-MN-6789', type: 'Truck', region: 'East', maxCapacity: 35000, odometer: 28900, status: 'On Trip', acquisitionCost: 6000000, revenue: 1500000 },
  { id: 'v8', name: 'Mercedes Actros', model: '2024', licensePlate: 'AP-08-OP-0123', type: 'Truck', region: 'South', maxCapacity: 32000, odometer: 8750, status: 'Available', acquisitionCost: 7500000, revenue: 300000 },
];

export const initialDrivers = [
  { id: 'd1', name: 'Rajesh Kumar', licenseNumber: 'DL-2023-001', licenseExpiry: '2027-06-15', licenseStatus: 'Valid', licenseCategory: ['Truck', 'Van'], safetyScore: 92, dutyStatus: 'On Duty', phone: '+91 98765 43210' },
  { id: 'd2', name: 'Amit Sharma', licenseNumber: 'DL-2022-045', licenseExpiry: '2026-03-20', licenseStatus: 'Valid', licenseCategory: ['Truck', 'Van', 'Bike'], safetyScore: 88, dutyStatus: 'On Duty', phone: '+91 87654 32109' },
  { id: 'd3', name: 'Suresh Patel', licenseNumber: 'DL-2021-089', licenseExpiry: '2025-01-10', licenseStatus: 'Expired', licenseCategory: ['Van'], safetyScore: 75, dutyStatus: 'Off Duty', phone: '+91 76543 21098' },
  { id: 'd4', name: 'Manoj Singh', licenseNumber: 'DL-2023-112', licenseExpiry: '2027-09-25', licenseStatus: 'Valid', licenseCategory: ['Truck', 'Van'], safetyScore: 95, dutyStatus: 'Off Duty', phone: '+91 65432 10987' },
  { id: 'd5', name: 'Vikram Reddy', licenseNumber: 'DL-2022-067', licenseExpiry: '2026-07-30', licenseStatus: 'Valid', licenseCategory: ['Truck'], safetyScore: 82, dutyStatus: 'On Duty', phone: '+91 54321 09876' },
  { id: 'd6', name: 'Deepak Verma', licenseNumber: 'DL-2020-034', licenseExpiry: '2025-11-05', licenseStatus: 'Expiring', licenseCategory: ['Van', 'Bike'], safetyScore: 68, dutyStatus: 'Suspended', phone: '+91 43210 98765' },
];

export const initialTrips = [
  { id: 't1', vehicleId: 'v2', driverId: 'd1', cargoWeight: 15000, cargoDesc: 'Steel Coils', origin: 'Mumbai', destination: 'Delhi', status: 'Dispatched', createdAt: '2026-02-18', dispatchedAt: '2026-02-18', completedAt: null },
  { id: 't2', vehicleId: 'v7', driverId: 'd5', cargoWeight: 28000, cargoDesc: 'Cement Bags', origin: 'Chennai', destination: 'Hyderabad', status: 'Dispatched', createdAt: '2026-02-19', dispatchedAt: '2026-02-19', completedAt: null },
  { id: 't3', vehicleId: 'v1', driverId: 'd2', cargoWeight: 20000, cargoDesc: 'Electronics', origin: 'Bangalore', destination: 'Pune', status: 'Completed', createdAt: '2026-02-15', dispatchedAt: '2026-02-15', completedAt: '2026-02-17' },
  { id: 't4', vehicleId: 'v4', driverId: 'd4', cargoWeight: 12000, cargoDesc: 'Textiles', origin: 'Ahmedabad', destination: 'Jaipur', status: 'Draft', createdAt: '2026-02-20', dispatchedAt: null, completedAt: null },
  { id: 't5', vehicleId: 'v6', driverId: 'd2', cargoWeight: 8000, cargoDesc: 'Pharmaceuticals', origin: 'Hyderabad', destination: 'Kolkata', status: 'Cancelled', createdAt: '2026-02-10', dispatchedAt: null, completedAt: null },
];

export const initialMaintenance = [
  { id: 'm1', vehicleId: 'v3', type: 'Engine Overhaul', description: 'Complete engine rebuild and tune-up', cost: 85000, date: '2026-02-19', status: 'In Progress', mileageAtService: 32100 },
  { id: 'm2', vehicleId: 'v1', type: 'Oil Change', description: 'Synthetic oil change and filter replacement', cost: 5500, date: '2026-02-14', status: 'Completed', mileageAtService: 44800 },
  { id: 'm3', vehicleId: 'v2', type: 'Brake Inspection', description: 'Front and rear brake pad inspection', cost: 12000, date: '2026-02-10', status: 'Completed', mileageAtService: 67200 },
  { id: 'm4', vehicleId: 'v4', type: 'Tire Rotation', description: 'Full tire rotation and alignment check', cost: 8000, date: '2026-02-05', status: 'Completed', mileageAtService: 89000 },
  { id: 'm5', vehicleId: 'v5', type: 'Transmission Repair', description: 'Gearbox rebuild – vehicle out of service', cost: 120000, date: '2026-01-28', status: 'Completed', mileageAtService: 54000 },
];

export const initialFuelLogs = [
  { id: 'f1', vehicleId: 'v1', liters: 180, cost: 18000, date: '2026-02-18', station: 'HP Petrol Pump, NH48' },
  { id: 'f2', vehicleId: 'v2', liters: 150, cost: 15000, date: '2026-02-17', station: 'IOC Fuel Station, Mumbai' },
  { id: 'f3', vehicleId: 'v4', liters: 120, cost: 12000, date: '2026-02-16', station: 'BP Fuel, Delhi' },
  { id: 'f4', vehicleId: 'v7', liters: 200, cost: 20000, date: '2026-02-19', station: 'Shell, Chennai' },
  { id: 'f5', vehicleId: 'v1', liters: 160, cost: 16000, date: '2026-02-12', station: 'Reliance Fuel, Pune' },
  { id: 'f6', vehicleId: 'v6', liters: 90, cost: 9000, date: '2026-02-15', station: 'HP Petrol, Jaipur' },
];

export const initialExpenses = [
  { id: 'e1', vehicleId: 'v1', type: 'Toll Charges', amount: 4500, date: '2026-02-18', notes: 'NH48 toll gates' },
  { id: 'e2', vehicleId: 'v2', type: 'Parking', amount: 800, date: '2026-02-17', notes: 'Overnight parking, Mumbai' },
  { id: 'e3', vehicleId: 'v4', type: 'Insurance Premium', amount: 45000, date: '2026-02-01', notes: 'Annual comprehensive' },
  { id: 'e4', vehicleId: 'v7', type: 'Toll Charges', amount: 6200, date: '2026-02-19', notes: 'Chennai-Hyderabad toll' },
  { id: 'e5', vehicleId: 'v1', type: 'Cleaning', amount: 1200, date: '2026-02-10', notes: 'Full vehicle wash' },
];

export const recentActivity = [
  { id: 'a1', type: 'trip', message: 'Trip #T002 dispatched – Scania P410 en route to Hyderabad', time: '2 hours ago', color: 'info' },
  { id: 'a2', type: 'maintenance', message: 'Ashok Leyland 4923 checked into maintenance – Engine Overhaul', time: '5 hours ago', color: 'warning' },
  { id: 'a3', type: 'fuel', message: 'Fuel logged for Volvo FH16 – 180L at ₹18,000', time: '8 hours ago', color: 'success' },
  { id: 'a4', type: 'trip', message: 'Trip #T003 completed – Volvo FH16 arrived in Pune', time: '1 day ago', color: 'success' },
  { id: 'a5', type: 'driver', message: 'Deepak Verma duty status changed to Suspended', time: '2 days ago', color: 'danger' },
  { id: 'a6', type: 'vehicle', message: 'Mercedes Actros added to fleet – License: AP-08-OP-0123', time: '3 days ago', color: 'primary' },
];
