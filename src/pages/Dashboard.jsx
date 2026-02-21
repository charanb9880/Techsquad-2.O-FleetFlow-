import { useState } from 'react';
import { useApp } from '../store/AppContext';
import KPICard from '../components/ui/KPICard';
import StatusBadge from '../components/ui/StatusBadge';
import {
    Truck, AlertTriangle, TrendingUp, Package,
    Route, Activity, ShieldAlert, Plus, FileText, User, Users, Wrench, TrendingDown, Fuel
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const CHART_COLORS = ['#FF9408', '#CA3F16', '#95122C', '#7A726E'];

export default function Dashboard() {
    const {
        vehicles, trips, expenses, maintenance, fuelLogs, drivers,
        getPredictiveAlerts, getSystemAlerts, getCostPerKm, getFinancialRisks
    } = useApp();
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [regionFilter, setRegionFilter] = useState('All');

    // KPI calculations
    const activeFleet = vehicles.filter(v => v.status === 'On Trip').length;
    const maintenanceAlerts = vehicles.filter(v => v.status === 'In Shop').length;
    const totalVehicles = vehicles.length;
    const assignedVehicles = vehicles.filter(v => v.status === 'On Trip' || v.status === 'In Shop').length;
    const utilizationRate = totalVehicles > 0 ? Math.round((assignedVehicles / totalVehicles) * 100) : 0;
    const pendingCargo = trips.filter(t => t.status === 'Draft').reduce((sum, t) => sum + t.cargoWeight, 0);

    // Chart data: vehicles by status
    const statusCounts = vehicles.reduce((acc, v) => {
        acc[v.status] = (acc[v.status] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    const statusColorMap = {
        'Available': '#4ade80',
        'On Trip': '#FF9408',
        'In Shop': '#95122C',
        'Out of Service': '#ef4444',
    };

    // Chart data: trips by status
    const tripStatusData = ['Draft', 'Dispatched', 'Completed', 'Cancelled'].map(status => ({
        status,
        count: trips.filter(t => t.status === status).length,
    }));

    // Activity icon map
    const activityIconMap = {
        trip: Route,
        maintenance: Wrench,
        fuel: Fuel,
        driver: Users,
        vehicle: Truck,
    };

    const alertIconMap = {
        wrench: Wrench,
        user: Users,
        route: Route,
    };
    const alertColorMap = {
        critical: { bg: 'rgba(149,18,44,0.15)', color: '#f87171', border: 'rgba(149,18,44,0.3)', badge: 'CRITICAL' },
        warning: { bg: 'rgba(255,148,8,0.1)', color: '#FF9408', border: 'rgba(255,148,8,0.25)', badge: 'WARNING' },
        info: { bg: 'rgba(255,148,8,0.06)', color: '#ffaa3b', border: 'rgba(255,148,8,0.15)', badge: 'PENDING' },
    };

    return (
        <div className="fixed-page-layout">
            <div className="flex flex-col gap-4">
                {/* Header & Filters Combo */}
                <div className="flex items-center justify-between gap-4">
                    <div className="kpi-grid condensed flex-1 !grid-cols-4 !mb-0">
                        <KPICard
                            label="Active Fleet"
                            value={activeFleet}
                            icon={Truck}
                            variant="primary"
                            change={`${activeFleet}/${totalVehicles}`}
                            changeType="positive"
                        />
                        <KPICard
                            label="Alerts"
                            value={maintenanceAlerts}
                            icon={AlertTriangle}
                            variant="warning"
                            change={`${maintenanceAlerts} shop`}
                            changeType={maintenanceAlerts > 0 ? 'negative' : 'positive'}
                        />
                        <KPICard
                            label="Util."
                            value={`${utilizationRate}%`}
                            icon={TrendingUp}
                            variant="success"
                            change="Active ratio"
                        />
                        <KPICard
                            label="Cargo"
                            value={`${(pendingCargo / 1000).toFixed(1)}T`}
                            icon={Package}
                            variant="info"
                            change={`${trips.filter(t => t.status === 'Draft').length} draft`}
                        />
                    </div>

                    <div className="page-filters !p-0 !bg-transparent !border-0 flex gap-2">
                        <select
                            className="form-select text-xs !py-1"
                            style={{ width: 'auto' }}
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Available">Available</option>
                            <option value="On Trip">On Trip</option>
                            <option value="In Shop">In Shop</option>
                        </select>
                        <select
                            className="form-select text-xs !py-1"
                            style={{ width: 'auto' }}
                            value={regionFilter}
                            onChange={e => setRegionFilter(e.target.value)}
                        >
                            <option value="All">All Regions</option>
                            <option value="North">North</option>
                            <option value="South">South</option>
                            <option value="East">East</option>
                            <option value="West">West</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="dashboard-scrollable-content">

                <div className="compact-chart-grid">
                    <div className="chart-container !mb-0">
                        <h3 className="!mb-1 text-[10px] font-bold uppercase tracking-wider text-tertiary">Fleet Overview</h3>
                        <ResponsiveContainer width="100%" height={165}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={35}
                                    outerRadius={60}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={entry.name} fill={statusColorMap[entry.name] || CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value, name) => [`${value} vehicles`, name]} />
                                <Legend wrapperStyle={{ fontSize: '8px', marginTop: '-10px' }} iconSize={5} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-container !mb-0">
                        <h3 className="!mb-1 text-[10px] font-bold uppercase tracking-wider text-tertiary">Trip Status</h3>
                        <ResponsiveContainer width="100%" height={165}>
                            <BarChart data={tripStatusData}>
                                <CartesianGrid strokeDasharray="3 2" stroke="var(--border-secondary)" opacity={0.5} />
                                <XAxis dataKey="status" tick={{ fontSize: 7, fill: 'var(--text-secondary)' }} />
                                <YAxis tick={{ fontSize: 7, fill: 'var(--text-secondary)' }} allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="var(--color-primary-500)" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* System Alerts + Vehicle Quick View */}
                <div className="grid-2">
                    <div className="card !p-5">
                        <h3 className="!mb-3 !pb-2" style={{
                            fontSize: 'var(--font-size-sm)', fontWeight: 600,
                            borderBottom: '1px solid var(--border-secondary)',
                            display: 'flex', alignItems: 'center', gap: 'var(--space-2)'
                        }}>
                            <ShieldAlert size={16} style={{ color: '#f87171' }} />
                            System Alerts
                            {(() => {
                                const alerts = getSystemAlerts(); return alerts.length > 0 ? (
                                    <span style={{ marginLeft: 'auto', background: 'rgba(149,18,44,0.2)', color: '#f87171', fontSize: '10px', fontWeight: 700, padding: '1px 8px', borderRadius: 999 }}>
                                        {alerts.length}
                                    </span>
                                ) : null;
                            })()}
                        </h3>
                        <div className="scrollable-card-list">
                            {(() => {
                                const alerts = getSystemAlerts();
                                if (alerts.length === 0) return (
                                    <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>
                                        ✅ Healthy
                                    </div>
                                );
                                return (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                        {alerts.map(alert => {
                                            const Icon = alertIconMap[alert.icon] || Truck;
                                            const colors = alertColorMap[alert.severity] || alertColorMap.info;
                                            return (
                                                <div key={alert.id} style={{
                                                    display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)',
                                                    padding: 'var(--space-2)', borderRadius: 'var(--radius-md)',
                                                    background: colors.bg, border: `1px solid ${colors.border} `,
                                                    borderLeft: `3px solid ${colors.color} `
                                                }}>
                                                    <div style={{
                                                        width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                                                        background: colors.color, color: '#fff',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                                    }}>
                                                        <Icon size={12} />
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontWeight: 600, fontSize: '11px', color: 'var(--text-primary)', marginBottom: 1 }}>
                                                            {alert.title}
                                                        </div>
                                                        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', lineHeight: 1.3 }}>
                                                            {alert.detail}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    <div className="card !p-5">
                        <h3 className="!mb-3 !pb-2" style={{
                            fontSize: 'var(--font-size-sm)', fontWeight: 600,
                            borderBottom: '1px solid var(--border-secondary)'
                        }}>
                            Vehicle Status
                        </h3>
                        <div className="scrollable-card-list">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                {vehicles
                                    .filter(v => statusFilter === 'All' || v.status === statusFilter)
                                    .filter(v => regionFilter === 'All' || v.region === regionFilter)
                                    .map(v => (
                                        <div key={v.id} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)',
                                            border: '1px solid var(--border-secondary)',
                                            background: 'var(--bg-surface)'
                                        }}>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontWeight: 600, fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.name}</div>
                                                <div className="license-plate" style={{ scale: '0.8', originX: 'left', marginTop: '-2px' }}>
                                                    <span>{v.licensePlate}</span>
                                                </div>
                                            </div>
                                            <StatusBadge status={v.status} />
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Risks */}
                {(() => {
                    const financialRisks = getFinancialRisks();
                    if (financialRisks.length === 0) return null;

                    return (
                        <div className="card !p-5 !mt-0">
                            <h3 className="!mb-3 !pb-2" style={{
                                fontSize: 'var(--font-size-sm)', fontWeight: 700,
                                borderBottom: '1px solid var(--border-secondary)',
                                display: 'flex', alignItems: 'center', gap: 'var(--space-2)'
                            }}>
                                <TrendingDown size={16} style={{ color: 'var(--color-danger-500)' }} />
                                Financial Leakage Flags
                                <span style={{ marginLeft: 'auto', background: 'var(--color-danger-50)', color: 'var(--color-danger-700)', fontSize: '10px', padding: '1px 8px', borderRadius: 999 }}>
                                    {financialRisks.length} flagged
                                </span>
                            </h3>
                            <div className="scrollable-card-list" style={{ maxHeight: '200px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
                                    {financialRisks.map(({ vehicle, roi, risks }) => (
                                        <div key={vehicle.id} style={{
                                            border: '1px solid var(--color-danger-200)',
                                            borderLeft: '3px solid var(--color-danger-500)',
                                            borderRadius: 'var(--radius-md)',
                                            background: 'var(--color-danger-50)',
                                            padding: 'var(--space-3)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                <span style={{ fontWeight: 600, fontSize: '11px' }}>{vehicle.name}</span>
                                                <span style={{ fontSize: '10px', fontWeight: 800 }}>ROI: {roi.toFixed(1)}%</span>
                                            </div>
                                            <div style={{ fontSize: '10px', color: 'var(--color-danger-800)' }}>
                                                {risks[0]}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
}
