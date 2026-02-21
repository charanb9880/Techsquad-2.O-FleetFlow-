import { useState } from 'react';
import { useApp } from '../store/AppContext';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import { Plus, Wrench, CheckCircle, TriangleAlert, Clock, Gauge } from 'lucide-react';

export default function Maintenance() {
    const { maintenance, vehicles, dispatch, getPredictiveAlerts } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        vehicleId: '', type: '', description: '', cost: '', date: '', mileageAtService: '', status: 'In Progress'
    });

    // Predictive alerts
    const predictiveAlerts = getPredictiveAlerts();

    const openModalForVehicle = (vehicleId) => {
        setFormData(prev => ({ ...prev, vehicleId }));
        setShowModal(true);
    };

    const serviceTypes = ['Oil Change', 'Brake Inspection', 'Engine Overhaul', 'Tire Rotation',
        'Transmission Repair', 'Battery Replacement', 'Electrical Repair', 'General Inspection'];

    // Only show vehicles that are not currently On Trip for maintenance
    const availableForMaintenance = vehicles.filter(v => v.status !== 'On Trip');

    const getVehicleName = (id) => {
        const v = vehicles.find(x => x.id === id);
        return v ? `${v.name} (${v.licensePlate})` : 'Unknown';
    };

    const handleAdd = () => {
        if (!formData.vehicleId || !formData.type || !formData.cost) return;
        dispatch({
            type: 'ADD_MAINTENANCE',
            payload: {
                ...formData,
                cost: Number(formData.cost),
                mileageAtService: Number(formData.mileageAtService) || 0,
                date: formData.date || new Date().toISOString().split('T')[0],
            }
        });
        setShowModal(false);
        setFormData({ vehicleId: '', type: '', description: '', cost: '', date: '', mileageAtService: '', status: 'In Progress' });
    };

    const handleComplete = (id) => {
        dispatch({ type: 'COMPLETE_MAINTENANCE', payload: id });
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Wrench size={22} style={{ color: 'var(--color-primary-500)' }} />
                        Maintenance
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '2px' }}>
                        {maintenance.filter(m => m.status === 'In Progress').length} active service logs
                        {predictiveAlerts.length > 0 && (
                            <span style={{ marginLeft: 8, color: '#dc2626', fontWeight: 600 }}>
                                · {predictiveAlerts.length} vehicles need attention
                            </span>
                        )}
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={16} /> Add Service Log
                </button>
            </div>

            {/* Predictive Maintenance Alert Panel */}
            {predictiveAlerts.length > 0 && (
                <div style={{
                    background: 'rgba(255,148,8,0.08)', border: '1px solid rgba(255,148,8,0.2)',
                    borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)',
                    marginBottom: 'var(--space-2)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', fontWeight: 700, fontSize: 'var(--font-size-sm)', color: '#c2410c' }}>
                        <TriangleAlert size={16} />
                        Predictive Maintenance Alerts — {predictiveAlerts.length} vehicle{predictiveAlerts.length !== 1 ? 's' : ''} require attention
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
                        {predictiveAlerts.map(({ vehicle, alerts }) => {
                            const topAlert = alerts.sort((a, b) => (b.severity === 'critical' ? 1 : -1))[0];
                            const isCritical = topAlert.severity === 'critical';
                            const AlertIcon = topAlert.type === 'mileage' ? Gauge : topAlert.type === 'time' ? Clock : TriangleAlert;
                            return (
                                <div key={vehicle.id} style={{
                                    background: 'var(--bg-elevated)',
                                    border: `1px solid ${isCritical ? '#fca5a5' : '#fdba74'}`,
                                    borderLeft: `4px solid ${isCritical ? '#dc2626' : '#f97316'}`,
                                    borderRadius: 'var(--radius-md)',
                                    padding: 'var(--space-3) var(--space-4)',
                                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)'
                                }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                            <AlertIcon size={13} style={{ color: isCritical ? '#dc2626' : '#ea580c', flexShrink: 0 }} />
                                            <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {vehicle.name}
                                            </span>
                                            <span style={{
                                                fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: 999,
                                                background: isCritical ? '#fee2e2' : '#ffedd5',
                                                color: isCritical ? '#dc2626' : '#ea580c',
                                                flexShrink: 0
                                            }}>
                                                {isCritical ? '⚠ CRITICAL' : 'WARNING'}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>{topAlert.reason}</div>
                                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: 2 }}>{vehicle.licensePlate}</div>
                                    </div>
                                    <button
                                        className="btn btn-sm"
                                        onClick={() => openModalForVehicle(vehicle.id)}
                                        style={{ fontSize: '11px', background: isCritical ? '#dc2626' : '#f97316', color: '#fff', border: 'none', flexShrink: 0 }}
                                    >
                                        Schedule
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Vehicle</th>
                            <th>Service Type</th>
                            <th>Description</th>
                            <th>Cost</th>
                            <th>Date</th>
                            <th>Mileage</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {maintenance.map(m => (
                            <tr key={m.id}>
                                <td style={{ fontWeight: 500 }}>{getVehicleName(m.vehicleId)}</td>
                                <td>{m.type}</td>
                                <td style={{ maxWidth: '200px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                                    {m.description}
                                </td>
                                <td style={{ fontWeight: 600 }}>₹{m.cost.toLocaleString()}</td>
                                <td>{m.date}</td>
                                <td>{m.mileageAtService.toLocaleString()} km</td>
                                <td><StatusBadge status={m.status} /></td>
                                <td>
                                    {m.status === 'In Progress' && (
                                        <button className="btn btn-sm btn-success" onClick={() => handleComplete(m.id)}>
                                            <CheckCircle size={13} /> Complete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {maintenance.length === 0 && (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--text-tertiary)' }}>
                                    No maintenance records
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Note about auto status */}
            <div style={{
                marginTop: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)',
                background: 'var(--color-warning-50)', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-warning-100)', fontSize: 'var(--font-size-sm)',
                color: 'var(--color-warning-600)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)'
            }}>
                <Wrench size={14} />
                Adding a service log automatically sets the vehicle status to <strong>&nbsp;"In Shop"</strong>. The vehicle becomes unavailable for trip assignment until maintenance is completed.
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Add Service Log"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleAdd}>Add Service Log</button>
                    </>
                }
            >
                <div className="form-group">
                    <label className="form-label">Vehicle *</label>
                    <select
                        className="form-select"
                        value={formData.vehicleId}
                        onChange={e => setFormData({ ...formData, vehicleId: e.target.value })}
                    >
                        <option value="">Select a vehicle...</option>
                        {availableForMaintenance.map(v => (
                            <option key={v.id} value={v.id}>
                                {v.name} — {v.licensePlate} — {v.status}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Service Type *</label>
                    <select
                        className="form-select"
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                    >
                        <option value="">Select type...</option>
                        {serviceTypes.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Description</label>
                    <input
                        className="form-input"
                        placeholder="Brief description of service..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="form-group">
                        <label className="form-label">Cost (₹) *</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="e.g. 12000"
                            value={formData.cost}
                            onChange={e => setFormData({ ...formData, cost: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Mileage at Service (km)</label>
                    <input
                        type="number"
                        className="form-input"
                        placeholder="e.g. 45000"
                        value={formData.mileageAtService}
                        onChange={e => setFormData({ ...formData, mileageAtService: e.target.value })}
                    />
                </div>
            </Modal>
        </div>
    );
}
