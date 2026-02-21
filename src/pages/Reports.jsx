import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { FileText, Download, Filter, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';

export default function Reports() {
    const { vehicles, trips, drivers, maintenance, fuelLogs, expenses, getVehicleTotalCost } = useApp();
    const [reportType, setReportType] = useState('fleet-summary');
    const [dateRange, setDateRange] = useState({ from: '2026-01-01', to: '2026-02-28' });

    const reportTypes = [
        { id: 'fleet-summary', label: 'Fleet Summary', desc: 'Overview of all vehicles, statuses, and utilization' },
        { id: 'trip-history', label: 'Trip History', desc: 'All trips with status, routes, and cargo details' },
        { id: 'maintenance-log', label: 'Maintenance Log', desc: 'Service history and costs per vehicle' },
        { id: 'expense-report', label: 'Expense Report', desc: 'Fuel, maintenance, and operational costs' },
        { id: 'driver-performance', label: 'Driver Performance', desc: 'Safety scores, duty hours, and assignments' },
    ];

    const generateCSV = () => {
        let headers, rows;

        switch (reportType) {
            case 'fleet-summary':
                headers = ['Vehicle', 'License', 'Status', 'Odometer', 'Max Capacity'];
                rows = vehicles.map(v => [v.name, v.licensePlate, v.status, v.odometer, v.maxCapacity]);
                break;
            case 'trip-history':
                headers = ['Trip', 'Vehicle', 'Driver', 'Origin', 'Destination', 'Status', 'Cargo (kg)'];
                rows = trips.map((t, i) => [
                    `#${String(i + 1).padStart(3, '0')}`,
                    vehicles.find(v => v.id === t.vehicleId)?.name || '',
                    drivers.find(d => d.id === t.driverId)?.name || '',
                    t.origin, t.destination, t.status, t.cargoWeight
                ]);
                break;
            case 'maintenance-log':
                headers = ['Vehicle', 'Type', 'Cost', 'Date', 'Status'];
                rows = maintenance.map(m => [
                    vehicles.find(v => v.id === m.vehicleId)?.name || '', m.type, m.cost, m.date, m.status
                ]);
                break;
            case 'expense-report':
                headers = ['Vehicle', 'Fuel Cost', 'Maintenance Cost', 'Total'];
                rows = vehicles.map(v => {
                    const costs = getVehicleTotalCost(v.id);
                    return [v.name, costs.fuelCost, costs.maintenanceCost, costs.total];
                });
                break;
            case 'driver-performance':
                headers = ['Driver', 'License Status', 'Safety Score', 'Duty Status'];
                rows = drivers.map(d => [d.name, d.licenseStatus, d.safetyScore, d.dutyStatus]);
                break;
            default:
                headers = []; rows = [];
        }

        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fleetflow_${reportType}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        const selected = reportTypes.find(r => r.id === reportType);
        doc.setFontSize(16);
        doc.text(`FleetFlow — ${selected?.label || 'Report'}`, 20, 20);
        doc.setFontSize(9);
        doc.text(`Generated: ${new Date().toLocaleDateString()} | Range: ${dateRange.from} to ${dateRange.to}`, 20, 28);

        doc.setFontSize(10);
        let y = 40;

        if (reportType === 'fleet-summary') {
            vehicles.forEach(v => {
                doc.text(`${v.name} | ${v.licensePlate} | ${v.status} | ${v.odometer.toLocaleString()} km`, 20, y);
                y += 7;
            });
        } else if (reportType === 'trip-history') {
            trips.forEach((t, i) => {
                const vName = vehicles.find(v => v.id === t.vehicleId)?.name || '';
                doc.text(`#${String(i + 1).padStart(3, '0')} | ${vName} | ${t.origin} → ${t.destination} | ${t.status}`, 20, y);
                y += 7;
            });
        } else if (reportType === 'expense-report') {
            vehicles.forEach(v => {
                const costs = getVehicleTotalCost(v.id);
                doc.text(`${v.name} | Fuel: ₹${costs.fuelCost} | Maint: ₹${costs.maintenanceCost} | Total: ₹${costs.total}`, 20, y);
                y += 7;
            });
        }

        doc.save(`fleetflow_${reportType}.pdf`);
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <FileText size={22} style={{ color: 'var(--color-primary-500)' }} />
                        Reports
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '2px' }}>
                        Generate and export fleet reports
                    </p>
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
                {/* Report Type Selector */}
                <div className="card">
                    <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                        Select Report Type
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {reportTypes.map(rt => (
                            <div
                                key={rt.id}
                                onClick={() => setReportType(rt.id)}
                                style={{
                                    padding: 'var(--space-3) var(--space-4)',
                                    borderRadius: 'var(--radius-md)',
                                    border: `1px solid ${reportType === rt.id ? 'var(--color-primary-400)' : 'var(--border-primary)'}`,
                                    background: reportType === rt.id ? 'var(--color-primary-50)' : 'transparent',
                                    cursor: 'pointer',
                                    transition: 'all var(--transition-fast)',
                                }}
                            >
                                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: reportType === rt.id ? 'var(--color-primary-700)' : 'var(--text-primary)' }}>
                                    {rt.label}
                                </div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                                    {rt.desc}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filters & Export */}
                <div>
                    <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                        <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Filter size={16} /> Filters
                        </h3>
                        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'end' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">
                                    <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                    From
                                </label>
                                <input type="date" className="form-input" value={dateRange.from} onChange={e => setDateRange({ ...dateRange, from: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">
                                    <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                    To
                                </label>
                                <input type="date" className="form-input" value={dateRange.to} onChange={e => setDateRange({ ...dateRange, to: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                            Export Report
                        </h3>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                            Download the selected report in your preferred format.
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                            <button className="btn btn-secondary" onClick={generateCSV} style={{ flex: 1 }}>
                                <Download size={16} /> Export CSV
                            </button>
                            <button className="btn btn-primary" onClick={generatePDF} style={{ flex: 1 }}>
                                <FileText size={16} /> Export PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview */}
            <div className="card">
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                    Report Preview — {reportTypes.find(r => r.id === reportType)?.label}
                </h3>

                {reportType === 'fleet-summary' && (
                    <div className="data-table-wrapper" style={{ border: 'none' }}>
                        <table className="data-table">
                            <thead><tr><th>Vehicle</th><th>License</th><th>Status</th><th>Odometer</th></tr></thead>
                            <tbody>
                                {vehicles.map(v => (
                                    <tr key={v.id}>
                                        <td style={{ fontWeight: 500 }}>{v.name}</td>
                                        <td>{v.licensePlate}</td>
                                        <td><span className={`badge badge-${v.status.toLowerCase().replace(/ /g, '-')}`}>{v.status}</span></td>
                                        <td>{v.odometer.toLocaleString()} km</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {reportType === 'trip-history' && (
                    <div className="data-table-wrapper" style={{ border: 'none' }}>
                        <table className="data-table">
                            <thead><tr><th>ID</th><th>Route</th><th>Status</th><th>Cargo</th></tr></thead>
                            <tbody>
                                {trips.map((t, i) => (
                                    <tr key={t.id}>
                                        <td style={{ fontFamily: 'monospace' }}>#{String(i + 1).padStart(3, '0')}</td>
                                        <td>{t.origin} → {t.destination}</td>
                                        <td><span className={`badge badge-${t.status.toLowerCase()}`}>{t.status}</span></td>
                                        <td>{(t.cargoWeight / 1000).toFixed(1)}T</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {reportType === 'maintenance-log' && (
                    <div className="data-table-wrapper" style={{ border: 'none' }}>
                        <table className="data-table">
                            <thead><tr><th>Vehicle</th><th>Type</th><th>Cost</th><th>Date</th></tr></thead>
                            <tbody>
                                {maintenance.map(m => (
                                    <tr key={m.id}>
                                        <td>{vehicles.find(v => v.id === m.vehicleId)?.name}</td>
                                        <td>{m.type}</td>
                                        <td style={{ fontWeight: 600 }}>₹{m.cost.toLocaleString()}</td>
                                        <td>{m.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {reportType === 'expense-report' && (
                    <div className="data-table-wrapper" style={{ border: 'none' }}>
                        <table className="data-table">
                            <thead><tr><th>Vehicle</th><th>Fuel</th><th>Maintenance</th><th>Total</th></tr></thead>
                            <tbody>
                                {vehicles.map(v => {
                                    const costs = getVehicleTotalCost(v.id);
                                    return (
                                        <tr key={v.id}>
                                            <td style={{ fontWeight: 500 }}>{v.name}</td>
                                            <td>₹{costs.fuelCost.toLocaleString()}</td>
                                            <td>₹{costs.maintenanceCost.toLocaleString()}</td>
                                            <td style={{ fontWeight: 700 }}>₹{costs.total.toLocaleString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {reportType === 'driver-performance' && (
                    <div className="data-table-wrapper" style={{ border: 'none' }}>
                        <table className="data-table">
                            <thead><tr><th>Driver</th><th>License</th><th>Score</th><th>Status</th></tr></thead>
                            <tbody>
                                {drivers.map(d => (
                                    <tr key={d.id}>
                                        <td style={{ fontWeight: 500 }}>{d.name}</td>
                                        <td><span className={`badge badge-${d.licenseStatus.toLowerCase()}`}>{d.licenseStatus}</span></td>
                                        <td>{d.safetyScore}</td>
                                        <td><span className={`badge badge-${d.dutyStatus.toLowerCase().replace(/ /g, '-')}`}>{d.dutyStatus}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
