import { useApp } from '../store/AppContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { BarChart3, Download, FileText, TrendingUp } from 'lucide-react';
import jsPDF from 'jspdf';

export default function Analytics() {
    const { vehicles, fuelLogs, maintenance, expenses, getVehicleTotalCost, getVehicleROI, getCostPerKm } = useApp();

    // Fuel efficiency data (km per liter estimate)
    const fuelEfficiencyData = vehicles
        .filter(v => fuelLogs.some(f => f.vehicleId === v.id))
        .map(v => {
            const totalLiters = fuelLogs.filter(f => f.vehicleId === v.id).reduce((sum, f) => sum + f.liters, 0);
            const kmPerLiter = totalLiters > 0 ? (v.odometer / totalLiters).toFixed(1) : 0;
            return { name: v.name.split(' ')[0] + ' ' + v.name.split(' ').slice(1).join(' ').substring(0, 6), kmPerLiter: Number(kmPerLiter), fullName: v.name };
        });

    // Operational costs data
    const costData = vehicles.map(v => {
        const costs = getVehicleTotalCost(v.id);
        const otherExp = expenses.filter(e => e.vehicleId === v.id).reduce((sum, e) => sum + e.amount, 0);
        return {
            name: v.name.split(' ')[0],
            fuel: costs.fuelCost / 1000,
            maintenance: costs.maintenanceCost / 1000,
            other: otherExp / 1000,
        };
    });

    // ROI data
    const roiData = vehicles.map(v => ({
        name: v.name.split(' ')[0],
        roi: Number(getVehicleROI(v.id)),
        fullName: v.name,
    }));

    // Monthly trend (synthetic)
    const monthlyTrend = [
        { month: 'Sep', fuel: 65, maintenance: 30, revenue: 120 },
        { month: 'Oct', fuel: 72, maintenance: 45, revenue: 135 },
        { month: 'Nov', fuel: 68, maintenance: 25, revenue: 128 },
        { month: 'Dec', fuel: 80, maintenance: 55, revenue: 150 },
        { month: 'Jan', fuel: 75, maintenance: 35, revenue: 142 },
        { month: 'Feb', fuel: 70, maintenance: 85, revenue: 138 },
    ];

    // Cost per km data
    const costPerKmData = vehicles
        .filter(v => v.odometer > 0)
        .map(v => ({
            name: v.name.split(' ')[0],
            costPerKm: Number(getCostPerKm(v.id)),
            fullName: v.name,
        }));

    const exportCSV = () => {
        const headers = ['Vehicle', 'Fuel Cost', 'Maintenance Cost', 'Revenue', 'ROI (%)'];
        const rows = vehicles.map(v => {
            const costs = getVehicleTotalCost(v.id);
            return [v.name, costs.fuelCost, costs.maintenanceCost, v.revenue, getVehicleROI(v.id)];
        });

        const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fleetflow_analytics.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('FleetFlow Analytics Report', 20, 20);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);

        doc.setFontSize(12);
        doc.text('Vehicle Performance Summary', 20, 45);

        let y = 55;
        doc.setFontSize(9);
        vehicles.forEach(v => {
            const costs = getVehicleTotalCost(v.id);
            const roi = getVehicleROI(v.id);
            doc.text(`${v.name} | Fuel: ₹${costs.fuelCost.toLocaleString()} | Maint: ₹${costs.maintenanceCost.toLocaleString()} | ROI: ${roi}%`, 20, y);
            y += 8;
        });

        doc.save('fleetflow_analytics.pdf');
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <BarChart3 size={22} style={{ color: 'var(--color-primary-500)' }} />
                        Analytics
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '2px' }}>
                        Fleet performance metrics and insights
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button className="btn btn-secondary" onClick={exportCSV}>
                        <Download size={16} /> Export CSV
                    </button>
                    <button className="btn btn-primary" onClick={exportPDF}>
                        <FileText size={16} /> Export PDF
                    </button>
                </div>
            </div>

            {/* Fuel Efficiency Chart */}
            <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="chart-container">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <TrendingUp size={16} style={{ color: 'var(--color-success-500)' }} />
                        Fuel Efficiency (km/L)
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={fuelEfficiencyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                            <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                            <Tooltip formatter={(val) => [`${val} km/L`, 'Efficiency']} />
                            <Bar dataKey="kmPerLiter" fill="#4ade80" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Operational Costs */}
                <div className="chart-container">
                    <h3>Operational Costs by Vehicle (₹K)</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={costData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                            <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                            <Tooltip formatter={(val) => [`₹${val}K`]} />
                            <Legend />
                            <Bar dataKey="fuel" fill="#FF9408" name="Fuel" stackId="a" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="maintenance" fill="#CA3F16" name="Maintenance" stackId="a" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="other" fill="#64748b" name="Other" stackId="a" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ROI + Trend */}
            <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="chart-container">
                    <h3>Vehicle ROI (%)</h3>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: '-12px', marginBottom: 'var(--space-4)' }}>
                        (Revenue – (Maintenance + Fuel)) / Acquisition Cost × 100
                    </p>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={roiData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
                            <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} unit="%" />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} width={80} />
                            <Tooltip formatter={(val) => [`${val}%`, 'ROI']} />
                            <Bar dataKey="roi" radius={[0, 6, 6, 0]}>
                                {roiData.map((entry, index) => (
                                    <rect key={index} fill={entry.roi >= 0 ? '#4ade80' : '#ef4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-container">
                    <h3>Monthly Cost Trend (₹K)</h3>
                    <ResponsiveContainer width="100%" height={310}>
                        <AreaChart data={monthlyTrend}>
                            <defs>
                                <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#FF9408" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#FF9408" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                            <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                            <Tooltip formatter={(val) => [`₹${val}K`]} />
                            <Legend />
                            <Area type="monotone" dataKey="revenue" stroke="#4ade80" fill="url(#colorRevenue)" name="Revenue" />
                            <Area type="monotone" dataKey="fuel" stroke="#FF9408" fill="url(#colorFuel)" name="Fuel" />
                            <Line type="monotone" dataKey="maintenance" stroke="#CA3F16" name="Maintenance" strokeWidth={2} dot={{ r: 3 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Cost per km chart */}
            <div className="chart-container" style={{ marginBottom: 'var(--space-6)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <TrendingUp size={16} style={{ color: 'var(--color-info-500)' }} />
                    Cost per Kilometer (₹/km)
                </h3>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: '-12px', marginBottom: 'var(--space-4)' }}>
                    (Fuel + Maintenance) / Odometer Reading
                </p>
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={costPerKmData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} unit="₹" />
                        <Tooltip formatter={(val) => [`₹${val}/km`, 'Cost per km']} />
                        <Bar dataKey="costPerKm" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* ROI Table */}
            <div className="data-table-wrapper">
                <div className="data-table-header">
                    <h3>Vehicle ROI Breakdown</h3>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Vehicle</th>
                            <th>Acquisition Cost</th>
                            <th>Revenue</th>
                            <th>Total Costs</th>
                            <th>Net Profit</th>
                            <th>ROI</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehicles.map(v => {
                            const costs = getVehicleTotalCost(v.id);
                            const roi = getVehicleROI(v.id);
                            const netProfit = v.revenue - costs.total;
                            return (
                                <tr key={v.id}>
                                    <td style={{ fontWeight: 600 }}>{v.name}</td>
                                    <td>₹{(v.acquisitionCost || 0).toLocaleString()}</td>
                                    <td style={{ color: 'var(--color-success-600)' }}>₹{(v.revenue || 0).toLocaleString()}</td>
                                    <td>₹{costs.total.toLocaleString()}</td>
                                    <td style={{ color: netProfit >= 0 ? 'var(--color-success-600)' : 'var(--color-danger-600)', fontWeight: 600 }}>
                                        {netProfit >= 0 ? '+' : ''}₹{netProfit.toLocaleString()}
                                    </td>
                                    <td>
                                        <span style={{
                                            fontWeight: 700,
                                            color: Number(roi) >= 0 ? 'var(--color-success-600)' : 'var(--color-danger-600)'
                                        }}>
                                            {roi}%
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
