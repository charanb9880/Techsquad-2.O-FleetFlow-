import { createContext, useContext, useReducer } from 'react';
import {
    initialVehicles, initialDrivers, initialTrips,
    initialMaintenance, initialFuelLogs, initialExpenses
} from '../data/seedData';

const AppContext = createContext();

function generateId(prefix) {
    return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
}

function appReducer(state, action) {
    switch (action.type) {
        // ==================== VEHICLES ====================
        case 'ADD_VEHICLE':
            return { ...state, vehicles: [...state.vehicles, { ...action.payload, id: generateId('v') }] };

        case 'UPDATE_VEHICLE':
            return {
                ...state,
                vehicles: state.vehicles.map(v =>
                    v.id === action.payload.id ? { ...v, ...action.payload } : v
                )
            };

        case 'DELETE_VEHICLE':
            return { ...state, vehicles: state.vehicles.filter(v => v.id !== action.payload) };

        case 'TOGGLE_VEHICLE_OOS': {
            return {
                ...state,
                vehicles: state.vehicles.map(v =>
                    v.id === action.payload
                        ? { ...v, status: v.status === 'Out of Service' ? 'Available' : 'Out of Service' }
                        : v
                )
            };
        }

        case 'SET_VEHICLE_STATUS':
            return {
                ...state,
                vehicles: state.vehicles.map(v =>
                    v.id === action.payload.id ? { ...v, status: action.payload.status } : v
                )
            };

        // ==================== DRIVERS ====================
        case 'ADD_DRIVER':
            return { ...state, drivers: [...state.drivers, { ...action.payload, id: generateId('d') }] };

        case 'UPDATE_DRIVER':
            return {
                ...state,
                drivers: state.drivers.map(d =>
                    d.id === action.payload.id ? { ...d, ...action.payload } : d
                )
            };

        case 'DELETE_DRIVER':
            return { ...state, drivers: state.drivers.filter(d => d.id !== action.payload) };

        case 'SET_DRIVER_STATUS':
            return {
                ...state,
                drivers: state.drivers.map(d =>
                    d.id === action.payload.id ? { ...d, dutyStatus: action.payload.dutyStatus } : d
                )
            };

        // ==================== TRIPS ====================
        case 'ADD_TRIP':
            return {
                ...state,
                trips: [...state.trips, { ...action.payload, id: generateId('t'), createdAt: new Date().toISOString().split('T')[0] }]
            };

        case 'DISPATCH_TRIP': {
            const trip = state.trips.find(t => t.id === action.payload);
            if (!trip) return state;
            return {
                ...state,
                trips: state.trips.map(t =>
                    t.id === action.payload
                        ? { ...t, status: 'Dispatched', dispatchedAt: new Date().toISOString().split('T')[0] }
                        : t
                ),
                vehicles: state.vehicles.map(v =>
                    v.id === trip.vehicleId ? { ...v, status: 'On Trip' } : v
                ),
                drivers: state.drivers.map(d =>
                    d.id === trip.driverId ? { ...d, dutyStatus: 'On Duty' } : d
                )
            };
        }

        case 'COMPLETE_TRIP': {
            const tripId = typeof action.payload === 'object' ? action.payload.id : action.payload;
            const finalOdometer = typeof action.payload === 'object' ? action.payload.finalOdometer : null;
            const trip = state.trips.find(t => t.id === tripId);
            if (!trip) return state;
            return {
                ...state,
                trips: state.trips.map(t =>
                    t.id === tripId
                        ? { ...t, status: 'Completed', completedAt: new Date().toISOString().split('T')[0] }
                        : t
                ),
                vehicles: state.vehicles.map(v =>
                    v.id === trip.vehicleId
                        ? { ...v, status: 'Available', ...(finalOdometer ? { odometer: Number(finalOdometer) } : {}) }
                        : v
                ),
                drivers: state.drivers.map(d =>
                    d.id === trip.driverId ? { ...d, dutyStatus: 'Off Duty' } : d
                )
            };
        }

        case 'CANCEL_TRIP': {
            const trip = state.trips.find(t => t.id === action.payload);
            if (!trip) return state;
            let newState = {
                ...state,
                trips: state.trips.map(t =>
                    t.id === action.payload ? { ...t, status: 'Cancelled' } : t
                ),
            };
            if (trip.status === 'Dispatched') {
                newState.vehicles = newState.vehicles.map(v =>
                    v.id === trip.vehicleId ? { ...v, status: 'Available' } : v
                );
                newState.drivers = newState.drivers.map(d =>
                    d.id === trip.driverId ? { ...d, dutyStatus: 'Off Duty' } : d
                );
            }
            return newState;
        }

        // ==================== MAINTENANCE ====================
        case 'ADD_MAINTENANCE':
            return {
                ...state,
                maintenance: [...state.maintenance, { ...action.payload, id: generateId('m') }],
                vehicles: state.vehicles.map(v =>
                    v.id === action.payload.vehicleId ? { ...v, status: 'In Shop' } : v
                )
            };

        case 'COMPLETE_MAINTENANCE': {
            const record = state.maintenance.find(m => m.id === action.payload);
            if (!record) return state;
            return {
                ...state,
                maintenance: state.maintenance.map(m =>
                    m.id === action.payload ? { ...m, status: 'Completed' } : m
                ),
                vehicles: state.vehicles.map(v =>
                    v.id === record.vehicleId ? { ...v, status: 'Available' } : v
                )
            };
        }

        // ==================== FUEL ====================
        case 'ADD_FUEL_LOG':
            return {
                ...state,
                fuelLogs: [...state.fuelLogs, { ...action.payload, id: generateId('f') }]
            };

        // ==================== EXPENSES ====================
        case 'ADD_EXPENSE':
            return {
                ...state,
                expenses: [...state.expenses, { ...action.payload, id: generateId('e') }]
            };

        // ==================== INCIDENTS ====================
        case 'ADD_INCIDENT': {
            const vehicleId = action.payload.vehicleId;
            // Find active trip involving this vehicle
            const activeTrip = state.trips.find(t => t.vehicleId === vehicleId && t.status === 'Dispatched');

            return {
                ...state,
                incidents: [...(state.incidents || []), { ...action.payload, id: generateId('inc'), date: new Date().toISOString().split('T')[0], status: 'Open' }],
                // Auto-freeze vehicle
                vehicles: state.vehicles.map(v =>
                    v.id === vehicleId ? { ...v, status: 'Out of Service' } : v
                ),
                // Auto-cancel active trip if any
                trips: state.trips.map(t =>
                    (activeTrip && t.id === activeTrip.id) ? { ...t, status: 'Cancelled' } : t
                ),
                // Auto-suspend driver if any
                drivers: state.drivers.map(d =>
                    (activeTrip && d.id === activeTrip.driverId) ? { ...d, dutyStatus: 'Suspended' } : d
                )
            };
        }

        default:
            return state;
    }
}

const initialState = {
    vehicles: initialVehicles,
    drivers: initialDrivers,
    trips: initialTrips,
    maintenance: initialMaintenance,
    fuelLogs: initialFuelLogs,
    expenses: initialExpenses,
    incidents: [],
};

export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    // Helper: get vehicle total cost
    const getVehicleTotalCost = (vehicleId) => {
        const fuelCost = state.fuelLogs
            .filter(f => f.vehicleId === vehicleId)
            .reduce((sum, f) => sum + f.cost, 0);
        const maintenanceCost = state.maintenance
            .filter(m => m.vehicleId === vehicleId)
            .reduce((sum, m) => sum + m.cost, 0);
        return { fuelCost, maintenanceCost, total: fuelCost + maintenanceCost };
    };

    // Helper: get vehicle ROI
    const getVehicleROI = (vehicleId) => {
        const vehicle = state.vehicles.find(v => v.id === vehicleId);
        if (!vehicle || !vehicle.acquisitionCost) return 0;
        const { total } = getVehicleTotalCost(vehicleId);
        return ((vehicle.revenue - total) / vehicle.acquisitionCost * 100).toFixed(1);
    };

    // Helper: get available vehicles
    const getAvailableVehicles = () => state.vehicles.filter(v => v.status === 'Available');

    // Helper: get available drivers (optionally filtered by vehicle type license category)
    const getAvailableDrivers = (vehicleType) => state.drivers.filter(d => {
        if (d.dutyStatus === 'On Duty' || d.dutyStatus === 'Suspended' || d.licenseStatus === 'Expired') return false;
        if (vehicleType && d.licenseCategory && !d.licenseCategory.includes(vehicleType)) return false;
        return true;
    });

    // Helper: get driver trip stats
    const getDriverTripStats = (driverId) => {
        const driverTrips = state.trips.filter(t => t.driverId === driverId);
        const completed = driverTrips.filter(t => t.status === 'Completed').length;
        const total = driverTrips.length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, completionRate };
    };

    // Helper: get cost per km for a vehicle
    const getCostPerKm = (vehicleId) => {
        const vehicle = state.vehicles.find(v => v.id === vehicleId);
        if (!vehicle || !vehicle.odometer || vehicle.odometer === 0) return '0.00';
        const { total } = getVehicleTotalCost(vehicleId);
        return (total / vehicle.odometer).toFixed(2);
    };

    // ── FEATURE: Cost Leak Detector (Financial Intelligence) ───────────
    const getFinancialRisks = () => {
        return state.vehicles.map(v => {
            const { fuelCost, maintenanceCost, total: totalCost } = getVehicleTotalCost(v.id);
            const revenue = v.revenue || 0;
            const acquisitionCost = v.acquisitionCost;
            const roi = acquisitionCost ? ((revenue - totalCost) / acquisitionCost * 100) : 0;

            const risks = [];

            if (totalCost > revenue && revenue > 0) {
                risks.push(`Operating at a loss: Cost (₹${totalCost.toLocaleString()}) exceeds Revenue (₹${revenue.toLocaleString()})`);
            }
            if (roi < 5 && acquisitionCost > 0) {
                risks.push(`Poor ROI: ${roi.toFixed(1)}% on ₹${acquisitionCost.toLocaleString()} acquisition cost`);
            }
            if (revenue > 0 && (maintenanceCost / revenue) > 0.20) {
                risks.push(`High Maintenance: Service costs consume ${Math.round((maintenanceCost / revenue) * 100)}% of generated revenue`);
            }

            if (risks.length === 0) return null;
            return { vehicle: v, totalCost, revenue, roi, maintenanceCost, risks };
        }).filter(Boolean);
    };

    // ── FEATURE: Smart Dispatch Recommendation ─────────────────────────
    // Returns the best vehicle (closest capacity match ≥ cargoWeight)
    // and best driver (highest safetyScore, license valid, right category).
    const getSmartDispatch = (cargoWeight, vehicleType = null) => {
        const weight = Number(cargoWeight) || 0;
        const availVehicles = getAvailableVehicles();

        // Best vehicle: minimum surplus capacity that still fits the cargo
        const eligibleVehicles = availVehicles.filter(v => v.maxCapacity >= weight);
        const bestVehicle = eligibleVehicles.sort(
            (a, b) => (a.maxCapacity - weight) - (b.maxCapacity - weight)
        )[0] || null;

        // Best driver: highest safety score among available drivers that match type
        const vType = vehicleType || bestVehicle?.type || null;
        const availDrivers = getAvailableDrivers(vType);
        const bestDriver = [...availDrivers].sort((a, b) => b.safetyScore - a.safetyScore)[0] || null;

        if (!bestVehicle && !bestDriver) return null;
        return { bestVehicle, bestDriver };
    };

    // ── FEATURE: Predictive Maintenance Alerts ─────────────────────────
    // Flags vehicles where: (a) odometer > lastService mileage + 10,000 km
    //                   OR  (b) last service was > 90 days ago
    const getPredictiveAlerts = () => {
        const today = new Date();
        const MS_PER_DAY = 86400000;
        const MILEAGE_THRESHOLD = 10000; // km
        const DAY_THRESHOLD = 90;        // days

        return state.vehicles
            .filter(v => v.status !== 'Out of Service')
            .map(v => {
                const vehicleLogs = state.maintenance
                    .filter(m => m.vehicleId === v.id && m.status === 'Completed')
                    .sort((a, b) => new Date(b.date) - new Date(a.date));

                const lastLog = vehicleLogs[0] || null;
                const alerts = [];

                if (lastLog) {
                    const kmSince = v.odometer - lastLog.mileageAtService;
                    const daysSince = Math.floor((today - new Date(lastLog.date)) / MS_PER_DAY);

                    if (kmSince >= MILEAGE_THRESHOLD) {
                        alerts.push({
                            type: 'mileage',
                            severity: kmSince >= MILEAGE_THRESHOLD * 1.5 ? 'critical' : 'warning',
                            reason: `${kmSince.toLocaleString()} km since last service (threshold: ${MILEAGE_THRESHOLD.toLocaleString()} km)`,
                            kmSince,
                        });
                    }
                    if (daysSince >= DAY_THRESHOLD) {
                        alerts.push({
                            type: 'time',
                            severity: daysSince >= DAY_THRESHOLD * 1.5 ? 'critical' : 'warning',
                            reason: `${daysSince} days since last service (threshold: ${DAY_THRESHOLD} days)`,
                            daysSince,
                        });
                    }
                } else {
                    // No service history at all
                    alerts.push({
                        type: 'no_history',
                        severity: 'warning',
                        reason: 'No service history found — schedule initial inspection',
                        kmSince: null,
                    });
                }

                if (alerts.length === 0) return null;
                return { vehicle: v, alerts };
            })
            .filter(Boolean);
    };

    // ── FEATURE: System Alerts (Dashboard Feed) ────────────────────────
    // Returns a unified list of alerts: incidents, overdue maintenance, 
    // expiring driver licenses, and stale draft trips.
    const getSystemAlerts = () => {
        const today = new Date();
        const MS_PER_DAY = 86400000;
        const alerts = [];

        // 0. Active Incidents (CRITICAL)
        const incidents = state.incidents || [];
        incidents.forEach(inc => {
            if (inc.status === 'Open') {
                const vehicle = state.vehicles.find(v => v.id === inc.vehicleId);
                alerts.push({
                    id: `inc-${inc.id}`,
                    category: 'incident',
                    severity: inc.severity === 'Critical' ? 'critical' : (inc.severity === 'Major' ? 'critical' : 'warning'),
                    icon: 'alert', // Assuming AlertTriangle will be mapped
                    title: `🚨 INCIDENT: ${vehicle?.name || 'Vehicle'}`,
                    detail: `${inc.severity} Severity · ${inc.description} · Est. Cost: ₹${(inc.estimatedCost || 0).toLocaleString()}`,
                    vehicleId: inc.vehicleId,
                });
            }
        });

        // 1. Predictive maintenance overdue
        getPredictiveAlerts().forEach(({ vehicle, alerts: vAlerts }) => {
            const topAlert = vAlerts.sort((a, b) => (b.severity === 'critical' ? 1 : -1))[0];
            alerts.push({
                id: `maint-${vehicle.id}`,
                category: 'maintenance',
                severity: topAlert.severity,
                icon: 'wrench',
                title: `${vehicle.name} — Service Overdue`,
                detail: topAlert.reason,
                vehicleId: vehicle.id,
            });
        });

        // 2. Driver licenses expiring within 60 days
        state.drivers.forEach(d => {
            if (!d.licenseExpiry || d.licenseStatus === 'Expired') return;
            const daysLeft = Math.floor((new Date(d.licenseExpiry) - today) / MS_PER_DAY);
            if (daysLeft <= 60) {
                alerts.push({
                    id: `license-${d.id}`,
                    category: 'driver',
                    severity: daysLeft <= 14 ? 'critical' : 'warning',
                    icon: 'user',
                    title: `${d.name} — License Expiring`,
                    detail: daysLeft <= 0
                        ? 'License has already expired!'
                        : `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} (${d.licenseExpiry})`,
                    driverId: d.id,
                });
            }
        });

        // 3. Draft trips pending dispatch > 2 days
        state.trips.forEach(t => {
            if (t.status !== 'Draft') return;
            const age = Math.floor((today - new Date(t.createdAt)) / MS_PER_DAY);
            if (age >= 2) {
                const vehicle = state.vehicles.find(v => v.id === t.vehicleId);
                alerts.push({
                    id: `trip-${t.id}`,
                    category: 'trip',
                    severity: age >= 5 ? 'critical' : 'info',
                    icon: 'route',
                    title: `Trip #${t.id.toUpperCase()} — Pending Dispatch`,
                    detail: `${t.cargoDesc || 'Cargo'} · ${t.origin} → ${t.destination} · waiting ${age} day${age !== 1 ? 's' : ''}`,
                    tripId: t.id,
                });
            }
        });

        // Sort: critical first, then by category
        return alerts.sort((a, b) => {
            const rank = { critical: 0, warning: 1, info: 2 };
            return (rank[a.severity] ?? 2) - (rank[b.severity] ?? 2);
        });
    };

    const value = {
        ...state,
        dispatch,
        getVehicleTotalCost,
        getVehicleROI,
        getAvailableVehicles,
        getAvailableDrivers,
        getDriverTripStats,
        getCostPerKm,
        getSmartDispatch,
        getPredictiveAlerts,
        getSystemAlerts,
        getFinancialRisks,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}
