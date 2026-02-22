import { createContext, useContext, useReducer, useEffect } from 'react';
import { api } from '../utils/api';
import {
    initialVehicles, initialDrivers, initialTrips,
    initialMaintenance, initialFuelLogs, initialExpenses
} from '../data/seedData';

const AppContext = createContext();

function appReducer(state, action) {
    switch (action.type) {
        case 'INITIALIZE':
            return {
                ...state,
                ...action.payload,
                loading: false
            };

        // ==================== VEHICLES ====================
        case 'ADD_VEHICLE':
            return { ...state, vehicles: [...state.vehicles, action.payload] };

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
            return { ...state, drivers: [...state.drivers, action.payload] };

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
                trips: [...state.trips, action.payload]
            };

        case 'DISPATCH_TRIP': {
            const trip = state.trips.find(t => t.id === action.payload.id);
            if (!trip) return state;
            return {
                ...state,
                trips: state.trips.map(t =>
                    t.id === action.payload.id
                        ? { ...t, ...action.payload }
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
            const { id: tripId, finalOdometer } = action.payload;
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
            const { id: tripId } = action.payload;
            const trip = state.trips.find(t => t.id === tripId);
            if (!trip) return state;
            let newState = {
                ...state,
                trips: state.trips.map(t =>
                    t.id === tripId ? { ...t, status: 'Cancelled' } : t
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
                maintenance: [...state.maintenance, action.payload],
                vehicles: state.vehicles.map(v =>
                    v.id === action.payload.vehicleId ? { ...v, status: 'In Shop' } : v
                )
            };

        case 'COMPLETE_MAINTENANCE': {
            const record = state.maintenance.find(m => m.id === action.payload.id);
            if (!record) return state;
            return {
                ...state,
                maintenance: state.maintenance.map(m =>
                    m.id === action.payload.id ? { ...m, status: 'Completed' } : m
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
                fuelLogs: [...state.fuelLogs, action.payload]
            };

        // ==================== EXPENSES ====================
        case 'ADD_EXPENSE':
            return {
                ...state,
                expenses: [...state.expenses, action.payload]
            };

        // ==================== INCIDENTS ====================
        case 'ADD_INCIDENT': {
            const vehicleId = action.payload.vehicleId;
            // Find active trip involving this vehicle
            const activeTrip = state.trips.find(t => t.vehicleId === vehicleId && t.status === 'Dispatched');

            return {
                ...state,
                incidents: [...(state.incidents || []), { ...action.payload, id: action.payload.id, date: new Date().toISOString().split('T')[0], status: 'Open' }],
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
    activity: [],
    loading: true
};

export function AppProvider({ children }) {
    const [state, localDispatch] = useReducer(appReducer, initialState);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [vehicles, drivers, trips, maintenance, fuelLogs, expenses, activity] = await Promise.all([
                    api.getVehicles(),
                    api.getDrivers(),
                    api.getTrips(),
                    api.getMaintenance(),
                    api.getFuelLogs(),
                    api.getExpenses(),
                    api.getActivity()
                ]);

                localDispatch({
                    type: 'INITIALIZE',
                    payload: { vehicles, drivers, trips, maintenance, fuelLogs, expenses, activity }
                });
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };
        fetchAll();
    }, []);

    const dispatch = async (action) => {
        try {
            switch (action.type) {
                case 'ADD_VEHICLE': {
                    const res = await api.addVehicle(action.payload);
                    localDispatch({ type: 'ADD_VEHICLE', payload: res });
                    break;
                }
                case 'UPDATE_VEHICLE': {
                    const res = await api.updateVehicle(action.payload.id, action.payload);
                    localDispatch({ type: 'UPDATE_VEHICLE', payload: res });
                    break;
                }
                case 'DELETE_VEHICLE': {
                    await api.deleteVehicle(action.payload);
                    localDispatch({ type: 'DELETE_VEHICLE', payload: action.payload });
                    break;
                }
                case 'ADD_DRIVER': {
                    const res = await api.addDriver(action.payload);
                    localDispatch({ type: 'ADD_DRIVER', payload: res });
                    break;
                }
                case 'UPDATE_DRIVER': {
                    const res = await api.updateDriver(action.payload.id, action.payload);
                    localDispatch({ type: 'UPDATE_DRIVER', payload: res });
                    break;
                }
                case 'DELETE_DRIVER': {
                    await api.deleteDriver(action.payload);
                    localDispatch({ type: 'DELETE_DRIVER', payload: action.payload });
                    break;
                }
                case 'ADD_TRIP': {
                    const payload = { ...action.payload, createdAt: new Date().toISOString().split('T')[0], status: 'Draft' };
                    const res = await api.addTrip(payload);
                    localDispatch({ type: 'ADD_TRIP', payload: res });
                    break;
                }
                case 'DISPATCH_TRIP': {
                    const trip = state.trips.find(t => t.id === action.payload);
                    if (!trip) break;
                    const updatedTrip = { ...trip, status: 'Dispatched', dispatchedAt: new Date().toISOString().split('T')[0] };
                    const res = await api.updateTrip(trip.id, updatedTrip);
                    // Also update vehicle and driver status in DB
                    const vehicle = state.vehicles.find(v => v.id === trip.vehicleId);
                    const driver = state.drivers.find(d => d.id === trip.driverId);
                    if (vehicle) await api.updateVehicle(vehicle.id, { ...vehicle, status: 'On Trip' });
                    if (driver) await api.updateDriver(driver.id, { ...driver, dutyStatus: 'On Duty' });
                    localDispatch({ type: 'DISPATCH_TRIP', payload: res });
                    break;
                }
                case 'COMPLETE_TRIP': {
                    const tripId = typeof action.payload === 'object' ? action.payload.id : action.payload;
                    const finalOdometer = typeof action.payload === 'object' ? action.payload.finalOdometer : null;
                    const trip = state.trips.find(t => t.id === tripId);
                    if (!trip) break;
                    const updatedTrip = { ...trip, status: 'Completed', completedAt: new Date().toISOString().split('T')[0] };
                    const res = await api.updateTrip(trip.id, updatedTrip);
                    // Update vehicle and driver status in DB
                    const vehicle = state.vehicles.find(v => v.id === trip.vehicleId);
                    const driver = state.drivers.find(d => d.id === trip.driverId);
                    if (vehicle) await api.updateVehicle(vehicle.id, { ...vehicle, status: 'Available', ...(finalOdometer ? { odometer: Number(finalOdometer) } : {}) });
                    if (driver) await api.updateDriver(driver.id, { ...driver, dutyStatus: 'Off Duty' });
                    localDispatch({ type: 'COMPLETE_TRIP', payload: { id: tripId, finalOdometer } });
                    break;
                }
                case 'CANCEL_TRIP': {
                    const trip = state.trips.find(t => t.id === action.payload);
                    if (!trip) break;
                    const updatedTrip = { ...trip, status: 'Cancelled' };
                    const res = await api.updateTrip(trip.id, updatedTrip);
                    if (trip.status === 'Dispatched') {
                        const vehicle = state.vehicles.find(v => v.id === trip.vehicleId);
                        const driver = state.drivers.find(d => d.id === trip.driverId);
                        if (vehicle) await api.updateVehicle(vehicle.id, { ...vehicle, status: 'Available' });
                        if (driver) await api.updateDriver(driver.id, { ...driver, dutyStatus: 'Off Duty' });
                    }
                    localDispatch({ type: 'CANCEL_TRIP', payload: { id: action.payload } });
                    break;
                }
                case 'ADD_MAINTENANCE': {
                    const res = await api.addMaintenance(action.payload);
                    const vehicle = state.vehicles.find(v => v.id === action.payload.vehicleId);
                    if (vehicle) await api.updateVehicle(vehicle.id, { ...vehicle, status: 'In Shop' });
                    localDispatch({ type: 'ADD_MAINTENANCE', payload: res });
                    break;
                }
                case 'ADD_FUEL_LOG': {
                    const res = await api.addFuelLog(action.payload);
                    localDispatch({ type: 'ADD_FUEL_LOG', payload: res });
                    break;
                }
                case 'ADD_EXPENSE': {
                    const res = await api.addExpense(action.payload);
                    localDispatch({ type: 'ADD_EXPENSE', payload: res });
                    break;
                }
                // Fallback for actions not yet converted to API
                default:
                    localDispatch(action);
            }
        } catch (error) {
            console.error('API Error:', error);
        }
    };

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
