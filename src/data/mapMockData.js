/**
 * Realistic Map Data Service
 * - Simulates GET /vehicles/live-locations
 * - Uses OSRM public API for real road-following routes
 * - Simulates GET /fuel-stations?lat=XX&lng=XX
 *
 * To connect a real backend: replace fetchVehicleLiveLocations() and fetchFuelStations()
 * with real fetch() calls. The OSRM routing is already fetching from a live public API.
 */

// Real Indian city coordinates for vehicles
const BASE_VEHICLES = [
    {
        vehicle_id: 'v1', name: 'Volvo FH16', model: '2023', driver: 'Rajesh Kumar',
        latitude: 12.9716, longitude: 77.5946, status: 'on_trip',
        origin: { lat: 12.9716, lng: 77.5946, name: 'Bangalore' },
        destination: { lat: 13.0827, lng: 80.2707, name: 'Chennai' },
        speed: 72, cargo: 'Steel Coils', cargoWeight: '15T',
    },
    {
        vehicle_id: 'v2', name: 'Tata Prima', model: '2022', driver: 'Amit Sharma',
        latitude: 18.5204, longitude: 73.8567, status: 'on_trip',
        origin: { lat: 19.0760, lng: 72.8777, name: 'Mumbai' },
        destination: { lat: 28.6139, lng: 77.2090, name: 'Delhi' },
        speed: 65, cargo: 'Automotive Parts', cargoWeight: '18T',
    },
    {
        vehicle_id: 'v3', name: 'Ashok Leyland 4923', model: '2023', driver: 'Manoj Singh',
        latitude: 13.0827, longitude: 80.2707, status: 'available',
        origin: null, destination: null, speed: 0, cargo: null, cargoWeight: null,
    },
    {
        vehicle_id: 'v4', name: 'BharatBenz 3723R', model: '2021', driver: 'Suresh Patel',
        latitude: 28.7041, longitude: 77.1025, status: 'available',
        origin: null, destination: null, speed: 0, cargo: null, cargoWeight: null,
    },
    {
        vehicle_id: 'v5', name: 'Eicher Pro 6049', model: '2022', driver: 'Deepak Verma',
        latitude: 23.0225, longitude: 72.5714, status: 'accident',
        origin: { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad' },
        destination: { lat: 26.9124, lng: 75.7873, name: 'Jaipur' },
        speed: 0, cargo: 'Electronics', cargoWeight: '12T',
    },
    {
        vehicle_id: 'v6', name: 'MAN CLA EVO', model: '2024', driver: 'Vikram Reddy',
        latitude: 17.3850, longitude: 78.4867, status: 'on_trip',
        origin: { lat: 17.3850, lng: 78.4867, name: 'Hyderabad' },
        destination: { lat: 12.9716, lng: 77.5946, name: 'Bangalore' },
        speed: 80, cargo: 'Pharmaceuticals', cargoWeight: '8T',
    },
    {
        vehicle_id: 'v7', name: 'Scania P410', model: '2023', driver: 'Rajesh Kumar',
        latitude: 21.1458, longitude: 79.0882, status: 'on_trip',
        origin: { lat: 21.1458, lng: 79.0882, name: 'Nagpur' },
        destination: { lat: 19.0760, lng: 72.8777, name: 'Mumbai' },
        speed: 68, cargo: 'Textiles', cargoWeight: '22T',
    },
    {
        vehicle_id: 'v8', name: 'Mercedes Actros', model: '2024', driver: 'Manoj Singh',
        latitude: 15.3173, longitude: 75.7139, status: 'available',
        origin: null, destination: null, speed: 0, cargo: null, cargoWeight: null,
    },
];

// Real fuel station data near major Indian highways
const FUEL_STATIONS = [
    { id: 'fs1', name: 'HP Petrol, Hosur Rd', latitude: 12.8961, longitude: 77.6415, brand: 'HP', price24h: true },
    { id: 'fs2', name: 'IOC Outbound, NH48', latitude: 12.7800, longitude: 77.5200, brand: 'IOC', price24h: false },
    { id: 'fs3', name: 'BPCL, Electronic City', latitude: 12.8458, longitude: 77.6597, brand: 'BPCL', price24h: true },
    { id: 'fs4', name: 'Shell, Tumkur Rd', latitude: 13.0747, longitude: 77.4838, brand: 'Shell', price24h: true },
    { id: 'fs5', name: 'HP Petrol, Pune-Mumbai Hwy', latitude: 18.7167, longitude: 73.4017, brand: 'HP', price24h: false },
    { id: 'fs6', name: 'Reliance, NH44', latitude: 17.6868, longitude: 78.5563, brand: 'Reliance', price24h: true },
    { id: 'fs7', name: 'IOC, Navi Mumbai', latitude: 19.0330, longitude: 73.0297, brand: 'IOC', price24h: true },
    { id: 'fs8', name: 'BPCL, Delhi NH-8', latitude: 28.5245, longitude: 77.0969, brand: 'BPCL', price24h: false },
    { id: 'fs9', name: 'Shell, Ahmedabad NH-48', latitude: 22.5645, longitude: 72.9289, brand: 'Shell', price24h: true },
    { id: 'fs10', name: 'HP, Nagpur NH-7', latitude: 21.0952, longitude: 79.0526, brand: 'HP', price24h: false },
    { id: 'fs11', name: 'IOC, Chennai Bypass', latitude: 12.9675, longitude: 80.1000, brand: 'IOC', price24h: true },
    { id: 'fs12', name: 'IndianOil, Jaipur Hwy', latitude: 26.8467, longitude: 75.7200, brand: 'IOC', price24h: false },
];

// Cache routes so we don't refetch every 10s
const routeCache = {};

/**
 * Fetch real road route from OSRM public API
 */
async function fetchOSRMRoute(origin, destination) {
    const cacheKey = `${origin.lat},${origin.lng}->${destination.lat},${destination.lng}`;
    if (routeCache[cacheKey]) return routeCache[cacheKey];

    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=false`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`OSRM error: ${res.status}`);
        const data = await res.json();

        if (data.code === 'Ok' && data.routes?.length > 0) {
            const route = data.routes[0];
            // GeoJSON coords are [lng, lat] — flip to [lat, lng] for Leaflet
            const points = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
            const distanceKm = (route.distance / 1000).toFixed(1);
            const durationMin = Math.round(route.duration / 60);
            const result = { points, distanceKm, durationMin };
            routeCache[cacheKey] = result;
            return result;
        }
    } catch (err) {
        console.warn('OSRM routing failed, using straight line:', err.message);
    }
    // Fallback: straight line
    const result = {
        points: [[origin.lat, origin.lng], [destination.lat, destination.lng]],
        distanceKm: '—',
        durationMin: null,
    };
    routeCache[cacheKey] = result;
    return result;
}

let moveCounter = 0;

/**
 * Simulates GET /vehicles/live-locations
 * Active vehicles drift slightly along their route
 */
export async function fetchVehicleLiveLocations() {
    moveCounter++;
    // Fetch real OSRM routes for vehicles that have a destination
    const withRoutes = await Promise.all(
        BASE_VEHICLES.map(async (v) => {
            let routeInfo = null;
            if (v.origin && v.destination) {
                routeInfo = await fetchOSRMRoute(v.origin, v.destination);
            }

            // Simulate GPS drift for moving vehicles
            const isMoving = v.status === 'on_trip';
            const drift = isMoving ? (Math.random() - 0.5) * 0.008 : 0;
            const driftLng = isMoving ? (Math.random() - 0.5) * 0.008 : 0;

            return {
                vehicle_id: v.vehicle_id,
                name: v.name,
                model: v.model,
                driver: v.driver,
                latitude: v.latitude + drift,
                longitude: v.longitude + driftLng,
                status: v.status,
                speed: v.speed + (isMoving ? Math.floor(Math.random() * 10) - 5 : 0),
                cargo: v.cargo,
                cargoWeight: v.cargoWeight,
                origin: v.origin,
                destination: v.destination,
                routePoints: routeInfo?.points || [],
                distanceKm: routeInfo?.distanceKm || null,
                durationMin: routeInfo?.durationMin || null,
            };
        })
    );

    return withRoutes;
}

/**
 * Simulates GET /fuel-stations?lat=XX&lng=XX
 */
export async function fetchFuelStations(lat, lng) {
    return FUEL_STATIONS;
}
