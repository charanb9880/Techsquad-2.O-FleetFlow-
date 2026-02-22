const API_URL = 'http://localhost:5001/api';

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
    }
    if (response.status === 204) return null;
    return response.json();
};

export const api = {
    // Vehicles
    getVehicles: () => fetch(`${API_URL}/vehicles`).then(handleResponse),
    addVehicle: (data) => fetch(`${API_URL}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse),
    updateVehicle: (id, data) => fetch(`${API_URL}/vehicles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse),
    deleteVehicle: (id) => fetch(`${API_URL}/vehicles/${id}`, {
        method: 'DELETE',
    }).then(handleResponse),

    // Drivers
    getDrivers: () => fetch(`${API_URL}/drivers`).then(handleResponse),
    addDriver: (data) => fetch(`${API_URL}/drivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse),
    updateDriver: (id, data) => fetch(`${API_URL}/drivers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse),
    deleteDriver: (id) => fetch(`${API_URL}/drivers/${id}`, {
        method: 'DELETE',
    }).then(handleResponse),

    // Trips
    getTrips: () => fetch(`${API_URL}/trips`).then(handleResponse),
    addTrip: (data) => fetch(`${API_URL}/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse),
    updateTrip: (id, data) => fetch(`${API_URL}/trips/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse),

    // Maintenance
    getMaintenance: () => fetch(`${API_URL}/maintenance`).then(handleResponse),
    addMaintenance: (data) => fetch(`${API_URL}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse),

    // Fuel Logs
    getFuelLogs: () => fetch(`${API_URL}/fuel_logs`).then(handleResponse),
    addFuelLog: (data) => fetch(`${API_URL}/fuel_logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse),

    // Expenses
    getExpenses: () => fetch(`${API_URL}/expenses`).then(handleResponse),
    addExpense: (data) => fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse),

    // Recent Activity
    getActivity: () => fetch(`${API_URL}/activity`).then(handleResponse),
};
