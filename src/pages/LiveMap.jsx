import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchVehicleLiveLocations, fetchFuelStations } from '../data/mapMockData';
import { MapPin, Fuel, AlertTriangle, Truck, RefreshCw, Navigation, Route, Flag, User, Gauge, Package } from 'lucide-react';

// ─── Custom SVG Marker Icons ──────────────────────────────────────────
function createVehicleIcon(color, pulse = false) {
    const size = 40;
    const pulseRing = pulse
        ? `<circle cx="20" cy="20" r="17" fill="none" stroke="${color}" stroke-width="2" opacity="0.35">
             <animate attributeName="r" from="17" to="30" dur="1.8s" repeatCount="indefinite"/>
             <animate attributeName="opacity" from="0.4" to="0" dur="1.8s" repeatCount="indefinite"/>
           </circle>`
        : '';
    const shadow = `<ellipse cx="20" cy="38" rx="8" ry="3" fill="rgba(0,0,0,0.15)"/>`;
    const pin = `
        <path d="M20 4 C11.16 4 4 11.16 4 20 C4 31.5 20 44 20 44 S36 31.5 36 20 C36 11.16 28.84 4 20 4Z"
              fill="${color}" stroke="#fff" stroke-width="2"/>
        <circle cx="20" cy="19" r="7" fill="#fff" opacity="0.9"/>
        <circle cx="20" cy="19" r="3.5" fill="${color}"/>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 8}" viewBox="0 0 40 48">
        ${shadow}${pulseRing}${pin}
    </svg>`;
    return L.divIcon({
        html: svg, className: 'custom-marker-icon',
        iconSize: [size, size + 8], iconAnchor: [size / 2, size + 8], popupAnchor: [0, -(size + 8)],
    });
}

function createFuelIcon(brand) {
    const colors = { Shell: '#f59e0b', HP: '#CA3F16', IOC: '#16a34a', BPCL: '#dc2626', Reliance: '#7c3aed', BP: '#16a34a', default: '#FF9408' };
    const bg = colors[brand] || colors.default;
    const initial = (brand || 'F')[0];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
        <rect x="2" y="2" width="26" height="26" rx="6" fill="${bg}" stroke="#fff" stroke-width="2"/>
        <text x="15" y="20" text-anchor="middle" fill="#fff" font-size="11" font-weight="800" font-family="Inter,sans-serif">${initial}</text>
    </svg>`;
    return L.divIcon({
        html: svg, className: 'custom-marker-icon',
        iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -15],
    });
}

function createDestIcon() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
        <path d="M16 0C7.16 0 0 7.16 0 16C0 28 16 42 16 42S32 28 32 16C32 7.16 24.84 0 16 0Z"
              fill="#FF9408" stroke="#fff" stroke-width="2"/>
        <path d="M10 13h7v-3l5 5-5 5v-3h-7z" fill="#fff"/>
    </svg>`;
    return L.divIcon({
        html: svg, className: 'custom-marker-icon',
        iconSize: [32, 42], iconAnchor: [16, 42], popupAnchor: [0, -42],
    });
}

const VEHICLE_ICONS = {
    available: createVehicleIcon('#ef4444'),
    on_trip: createVehicleIcon('#16a34a', true),
    accident: createVehicleIcon('#d97706', true),
};
const DEST_ICON = createDestIcon();

const STATUS_META = {
    available: { label: 'At Delivery Station', color: '#ef4444', bg: '#fef2f2' },
    on_trip: { label: 'Moving', color: '#16a34a', bg: '#f0fdf4' },
    accident: { label: 'Accident Reported', color: '#d97706', bg: '#fffbeb' },
};

const ROUTE_STYLE = {
    on_trip: { color: '#FF9408', weight: 4, opacity: 0.75, dashArray: null },
    accident: { color: '#d97706', weight: 3, opacity: 0.7, dashArray: '10 6' },
};

// ─── Fit bounds on first load ─────────────────────────────────────────
function MapBoundsFitter({ vehicles, triggered }) {
    const map = useMap();
    useEffect(() => {
        if (triggered && vehicles.length) {
            const bounds = L.latLngBounds(vehicles.map(v => [v.latitude, v.longitude]));
            map.fitBounds(bounds, { padding: [60, 60], maxZoom: 7 });
        }
    }, [triggered]); // eslint-disable-line
    return null;
}

function formatETA(min) {
    if (!min) return '—';
    if (min < 60) return `${min} min`;
    return `${Math.floor(min / 60)}h ${min % 60}m`;
}

// ─── Main Component ───────────────────────────────────────────────────
export default function LiveMap() {
    const [vehicles, setVehicles] = useState([]);
    const [fuelStations, setFuelStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [routesLoading, setRoutesLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [showFuelStations, setShowFuelStations] = useState(true);
    const [showRoutes, setShowRoutes] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [didFit, setDidFit] = useState(false);
    const intervalRef = useRef(null);

    const loadVehicles = useCallback(async () => {
        try {
            const data = await fetchVehicleLiveLocations();
            setVehicles(data);
            setLastUpdated(new Date());
            setLoading(false);
            setRoutesLoading(false);
            if (!didFit) setDidFit(true);
        } catch (err) {
            console.error('Failed to fetch vehicle locations:', err);
            setLoading(false);
        }
    }, [didFit]);

    const loadFuelStations = useCallback(async () => {
        try {
            const data = await fetchFuelStations();
            setFuelStations(data);
        } catch (err) { console.error(err); }
    }, []);

    useEffect(() => {
        loadVehicles();
        loadFuelStations();
        intervalRef.current = setInterval(loadVehicles, 10000);
        return () => clearInterval(intervalRef.current);
    }, []); // eslint-disable-line

    const filteredVehicles = statusFilter === 'all'
        ? vehicles : vehicles.filter(v => v.status === statusFilter);

    const activeRoutes = filteredVehicles.filter(
        v => v.routePoints?.length >= 2 && v.destination
    );

    const stats = {
        total: vehicles.length,
        on_trip: vehicles.filter(v => v.status === 'on_trip').length,
        available: vehicles.filter(v => v.status === 'available').length,
        accident: vehicles.filter(v => v.status === 'accident').length,
    };

    return (
        <div className="livemap-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Navigation size={22} style={{ color: 'var(--color-primary-500)' }} />
                        Live Fleet Map
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '2px' }}>
                        {stats.total} vehicles · {activeRoutes.length} live routes · real road data via OSRM
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                    {lastUpdated && (
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                            Updated {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                    <button className="btn btn-secondary btn-sm" onClick={loadVehicles}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
            </div>

            {/* Filter stat cards */}
            <div className="livemap-stats">
                {[
                    { key: 'all', label: 'All Vehicles', count: stats.total, icon: <Truck size={18} />, iconBg: 'var(--color-primary-50)', iconColor: 'var(--color-primary-600)' },
                    { key: 'on_trip', label: 'Moving', count: stats.on_trip, icon: <Navigation size={18} />, iconBg: '#dcfce7', iconColor: '#16a34a' },
                    { key: 'available', label: 'At Station', count: stats.available, icon: <MapPin size={18} />, iconBg: '#fef2f2', iconColor: '#dc2626' },
                    { key: 'accident', label: 'Accident', count: stats.accident, icon: <AlertTriangle size={18} />, iconBg: '#fefce8', iconColor: '#ca8a04' },
                ].map(({ key, label, count, icon, iconBg, iconColor }) => (
                    <button
                        key={key}
                        className={`livemap-stat-card ${statusFilter === key ? 'active' : ''}`}
                        onClick={() => setStatusFilter(key)}
                    >
                        <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>{icon}</div>
                        <div>
                            <div className="stat-value">{count}</div>
                            <div className="stat-label">{label}</div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Toggles + Legend */}
            <div className="livemap-controls">
                <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'center' }}>
                    <label className="livemap-toggle">
                        <input type="checkbox" checked={showRoutes} onChange={() => setShowRoutes(p => !p)} />
                        <Route size={14} />
                        <span>Real Road Routes{routesLoading ? ' (loading…)' : ` (${activeRoutes.length})`}</span>
                    </label>
                    <label className="livemap-toggle">
                        <input type="checkbox" checked={showFuelStations} onChange={() => setShowFuelStations(p => !p)} />
                        <Fuel size={14} />
                        <span>Fuel Stations ({fuelStations.length})</span>
                    </label>
                </div>
                <div className="livemap-legend">
                    <span className="legend-item"><span className="legend-dot" style={{ background: '#16a34a' }} /> Moving</span>
                    <span className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }} /> At Station</span>
                    <span className="legend-item"><span className="legend-dot" style={{ background: '#d97706' }} /> Accident</span>
                    <span className="legend-item"><span className="legend-dot" style={{ background: '#FF9408', borderRadius: '3px' }} /> Route</span>
                </div>
            </div>

            {/* Map */}
            <div className="livemap-container">
                {loading ? (
                    <div className="livemap-loading">
                        <div className="livemap-spinner" />
                        <span>Loading real-time fleet data…</span>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>
                            Fetching road routes via OSRM
                        </span>
                    </div>
                ) : (
                    <MapContainer
                        center={[20.5937, 78.9629]}
                        zoom={5}
                        className="livemap-leaflet"
                        scrollWheelZoom
                        zoomControl
                    >
                        {/* OpenStreetMap Standard — most realistic/detailed free tiles */}
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                            maxZoom={19}
                        />
                        <MapBoundsFitter vehicles={vehicles} triggered={didFit && vehicles.length > 0} />

                        {/* Real road routes + destinations */}
                        {showRoutes && activeRoutes.map(v => {
                            const style = ROUTE_STYLE[v.status] || ROUTE_STYLE.on_trip;
                            return (
                                <span key={`route-${v.vehicle_id}`}>
                                    <Polyline positions={v.routePoints} pathOptions={style} />
                                    {v.destination && (
                                        <Marker position={[v.destination.lat, v.destination.lng]} icon={DEST_ICON}>
                                            <Popup className="livemap-popup">
                                                <div className="popup-content">
                                                    <div className="popup-header">
                                                        <Flag size={14} style={{ color: '#FF9408', flexShrink: 0 }} />
                                                        <strong>{v.destination.name}</strong>
                                                    </div>
                                                    <div className="popup-details">
                                                        <div className="popup-row">
                                                            <span className="popup-label">Vehicle</span>
                                                            <span className="popup-value" style={{ fontWeight: 600 }}>{v.name}</span>
                                                        </div>
                                                        <div className="popup-row">
                                                            <span className="popup-label">Driver</span>
                                                            <span className="popup-value">{v.driver}</span>
                                                        </div>
                                                        {v.distanceKm && (
                                                            <div className="popup-row">
                                                                <span className="popup-label">Distance</span>
                                                                <span className="popup-value" style={{ fontWeight: 600 }}>{v.distanceKm} km</span>
                                                            </div>
                                                        )}
                                                        {v.durationMin && (
                                                            <div className="popup-row">
                                                                <span className="popup-label">ETA</span>
                                                                <span className="popup-value" style={{ color: '#FF9408', fontWeight: 600 }}>{formatETA(v.durationMin)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    )}
                                </span>
                            );
                        })}

                        {/* Vehicle markers */}
                        {filteredVehicles.map(v => {
                            const meta = STATUS_META[v.status] || STATUS_META.available;
                            return (
                                <Marker
                                    key={v.vehicle_id}
                                    position={[v.latitude, v.longitude]}
                                    icon={VEHICLE_ICONS[v.status] || VEHICLE_ICONS.available}
                                >
                                    <Popup className="livemap-popup">
                                        <div className="popup-content">
                                            {/* Vehicle header */}
                                            <div className="popup-header">
                                                <span className="popup-status-dot" style={{ background: meta.color }} />
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{v.name}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{v.model}</div>
                                                </div>
                                            </div>
                                            {/* Status badge */}
                                            <div style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                                padding: '2px 10px', borderRadius: 999, background: meta.bg,
                                                color: meta.color, fontSize: '11px', fontWeight: 600,
                                                marginBottom: 'var(--space-2)'
                                            }}>
                                                {meta.label}
                                            </div>
                                            <div className="popup-details">
                                                {v.driver && (
                                                    <div className="popup-row">
                                                        <span className="popup-label"><User size={10} style={{ display: 'inline', marginRight: 2 }} />Driver</span>
                                                        <span className="popup-value" style={{ fontWeight: 500 }}>{v.driver}</span>
                                                    </div>
                                                )}
                                                {v.status === 'on_trip' && v.speed != null && (
                                                    <div className="popup-row">
                                                        <span className="popup-label"><Gauge size={10} style={{ display: 'inline', marginRight: 2 }} />Speed</span>
                                                        <span className="popup-value" style={{ fontWeight: 600, color: '#FF9408' }}>{v.speed} km/h</span>
                                                    </div>
                                                )}
                                                {v.cargo && (
                                                    <div className="popup-row">
                                                        <span className="popup-label"><Package size={10} style={{ display: 'inline', marginRight: 2 }} />Cargo</span>
                                                        <span className="popup-value">{v.cargo} · {v.cargoWeight}</span>
                                                    </div>
                                                )}
                                                <div className="popup-row">
                                                    <span className="popup-label">GPS</span>
                                                    <span className="popup-value" style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                                                        {v.latitude.toFixed(4)}, {v.longitude.toFixed(4)}
                                                    </span>
                                                </div>
                                                {v.destination && (
                                                    <div className="popup-divider" />
                                                )}
                                                {v.destination && (
                                                    <div className="popup-row">
                                                        <span className="popup-label">Destination</span>
                                                        <span className="popup-value" style={{ color: '#FF9408', fontWeight: 600 }}>
                                                            📍 {v.destination.name}
                                                        </span>
                                                    </div>
                                                )}
                                                {v.distanceKm && (
                                                    <div className="popup-row">
                                                        <span className="popup-label">Road Distance</span>
                                                        <span className="popup-value" style={{ fontWeight: 600 }}>{v.distanceKm} km</span>
                                                    </div>
                                                )}
                                                {v.durationMin && (
                                                    <div className="popup-row">
                                                        <span className="popup-label">ETA</span>
                                                        <span className="popup-value" style={{ color: '#FF9408', fontWeight: 600 }}>{formatETA(v.durationMin)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}

                        {/* Fuel station markers */}
                        {showFuelStations && fuelStations.map(fs => (
                            <Marker key={fs.id} position={[fs.latitude, fs.longitude]} icon={createFuelIcon(fs.brand)}>
                                <Popup className="livemap-popup">
                                    <div className="popup-content">
                                        <div className="popup-header">
                                            <Fuel size={13} style={{ color: '#FF9408', flexShrink: 0 }} />
                                            <strong style={{ fontSize: 'var(--font-size-xs)' }}>{fs.name}</strong>
                                        </div>
                                        <div className="popup-details">
                                            <div className="popup-row">
                                                <span className="popup-label">Brand</span>
                                                <span className="popup-value" style={{ fontWeight: 600 }}>{fs.brand}</span>
                                            </div>
                                            <div className="popup-row">
                                                <span className="popup-label">24h</span>
                                                <span className="popup-value" style={{ color: fs.price24h ? '#16a34a' : '#ef4444', fontWeight: 600 }}>
                                                    {fs.price24h ? '✓ Open' : '✗ Closed'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}

                {/* Live indicator */}
                <div className="livemap-live-badge">
                    <span className="live-dot" />
                    LIVE
                </div>
            </div>
        </div>
    );
}
