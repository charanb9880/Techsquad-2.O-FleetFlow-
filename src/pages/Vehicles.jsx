import { useState } from 'react';
import { useApp } from '../store/AppContext';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import { Plus, Edit2, Trash2, Power, Truck, AlertTriangle } from 'lucide-react';

const emptyVehicle = {
    name: '', model: '', licensePlate: '', type: 'Truck', region: 'North', maxCapacity: '',
    odometer: '', status: 'Available', acquisitionCost: '', revenue: ''
};

export default function Vehicles() {
    const { vehicles, dispatch } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState(emptyVehicle);
    const [filterStatus, setFilterStatus] = useState('All');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [incidentVehicleId, setIncidentVehicleId] = useState(null);
    const [incidentForm, setIncidentForm] = useState({ severity: 'Minor', description: '', estimatedCost: '', insuranceStatus: 'Pending' });

    const filteredVehicles = filterStatus === 'All'
        ? vehicles
        : vehicles.filter(v => v.status === filterStatus);

    const openAdd = () => {
        setEditId(null);
        setFormData(emptyVehicle);
        setShowModal(true);
    };

    const openEdit = (vehicle) => {
        setEditId(vehicle.id);
        setFormData({ ...vehicle });
        setShowModal(true);
    };

    const handleSave = () => {
        if (!formData.name || !formData.licensePlate) return;
        const payload = {
            ...formData,
            maxCapacity: Number(formData.maxCapacity) || 0,
            odometer: Number(formData.odometer) || 0,
            acquisitionCost: Number(formData.acquisitionCost) || 0,
            revenue: Number(formData.revenue) || 0,
        };
        if (editId) {
            dispatch({ type: 'UPDATE_VEHICLE', payload: { ...payload, id: editId } });
        } else {
            dispatch({ type: 'ADD_VEHICLE', payload });
        }
        setShowModal(false);
    };

    const handleDelete = (id) => {
        dispatch({ type: 'DELETE_VEHICLE', payload: id });
        setDeleteConfirm(null);
    };

    const handleToggleOOS = (id) => {
        dispatch({ type: 'TOGGLE_VEHICLE_OOS', payload: id });
    };

    const handleReportIncident = () => {
        if (!incidentForm.description) return;
        dispatch({
            type: 'ADD_INCIDENT',
            payload: {
                vehicleId: incidentVehicleId,
                severity: incidentForm.severity,
                description: incidentForm.description,
                estimatedCost: Number(incidentForm.estimatedCost) || 0,
                insuranceStatus: incidentForm.insuranceStatus,
            }
        });
        setIncidentVehicleId(null);
        setIncidentForm({ severity: 'Minor', description: '', estimatedCost: '', insuranceStatus: 'Pending' });
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Truck size={22} style={{ color: 'var(--color-primary-500)' }} />
                        Vehicles
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '2px' }}>
                        Manage your fleet of {vehicles.length} vehicles
                    </p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>
                    <Plus size={16} /> Add Vehicle
                </button>
            </div>

            <div className="page-filters">
                <select
                    className="form-select"
                    style={{ width: 'auto', minWidth: '160px' }}
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                >
                    <option value="All">All Statuses ({vehicles.length})</option>
                    <option value="Available">Available ({vehicles.filter(v => v.status === 'Available').length})</option>
                    <option value="On Trip">On Trip ({vehicles.filter(v => v.status === 'On Trip').length})</option>
                    <option value="In Shop">In Shop ({vehicles.filter(v => v.status === 'In Shop').length})</option>
                    <option value="Out of Service">Out of Service ({vehicles.filter(v => v.status === 'Out of Service').length})</option>
                </select>
            </div>

            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Vehicle</th>
                            <th>Type</th>
                            <th>License Plate</th>
                            <th>Max Capacity</th>
                            <th>Odometer</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVehicles.map(v => (
                            <tr key={v.id}>
                                <td>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{v.name}</div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{v.model}</div>
                                    </div>
                                </td>
                                <td>
                                    <span style={{
                                        fontSize: 'var(--font-size-xs)', padding: '2px 8px',
                                        borderRadius: 'var(--radius-sm)', fontWeight: 500,
                                        background: v.type === 'Truck' ? 'var(--color-primary-50)' : v.type === 'Van' ? 'var(--color-success-50)' : 'var(--color-warning-50)',
                                        color: v.type === 'Truck' ? 'var(--color-primary-700)' : v.type === 'Van' ? 'var(--color-success-700)' : 'var(--color-warning-700)',
                                    }}>
                                        {v.type || 'N/A'}
                                    </span>
                                </td>
                                <td>
                                    <div className="license-plate">
                                        <span>{v.licensePlate}</span>
                                    </div>
                                </td>
                                <td>{(v.maxCapacity / 1000).toFixed(0)}T</td>
                                <td>{v.odometer.toLocaleString()} km</td>
                                <td><StatusBadge status={v.status} /></td>
                                <td>
                                    <div className="table-actions">
                                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(v)} title="Edit">
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-icon btn-sm"
                                            onClick={() => setIncidentVehicleId(v.id)}
                                            title="Report Incident"
                                            style={{ color: 'var(--color-warning-600)' }}
                                        >
                                            <AlertTriangle size={14} />
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-icon btn-sm"
                                            onClick={() => handleToggleOOS(v.id)}
                                            title={v.status === 'Out of Service' ? 'Bring back to service' : 'Mark out of service'}
                                            style={{ color: v.status === 'Out of Service' ? 'var(--color-success-500)' : 'var(--color-warning-500)' }}
                                        >
                                            <Power size={14} />
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-icon btn-sm"
                                            onClick={() => setDeleteConfirm(v.id)}
                                            title="Delete"
                                            style={{ color: 'var(--color-danger-500)' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredVehicles.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--text-tertiary)' }}>
                                    No vehicles found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editId ? 'Edit Vehicle' : 'Add Vehicle'}
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSave}>
                            {editId ? 'Save Changes' : 'Add Vehicle'}
                        </button>
                    </>
                }
            >
                <div className="form-group">
                    <label className="form-label">Vehicle Name *</label>
                    <input
                        className="form-input"
                        placeholder="e.g. Volvo FH16"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Model Year</label>
                    <input
                        className="form-input"
                        placeholder="e.g. 2024"
                        value={formData.model}
                        onChange={e => setFormData({ ...formData, model: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">License Plate *</label>
                    <input
                        className="form-input"
                        placeholder="e.g. KA-01-AB-1234"
                        value={formData.licensePlate}
                        onChange={e => setFormData({ ...formData, licensePlate: e.target.value })}
                    />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="form-group">
                        <label className="form-label">Vehicle Type</label>
                        <select
                            className="form-select"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="Truck">Truck</option>
                            <option value="Van">Van</option>
                            <option value="Bike">Bike</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Region</label>
                        <select
                            className="form-select"
                            value={formData.region}
                            onChange={e => setFormData({ ...formData, region: e.target.value })}
                        >
                            <option value="North">North</option>
                            <option value="South">South</option>
                            <option value="East">East</option>
                            <option value="West">West</option>
                        </select>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="form-group">
                        <label className="form-label">Max Capacity (kg)</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="e.g. 25000"
                            value={formData.maxCapacity}
                            onChange={e => setFormData({ ...formData, maxCapacity: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Odometer (km)</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="e.g. 45000"
                            value={formData.odometer}
                            onChange={e => setFormData({ ...formData, odometer: e.target.value })}
                        />
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="form-group">
                        <label className="form-label">Acquisition Cost (₹)</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="e.g. 4500000"
                            value={formData.acquisitionCost}
                            onChange={e => setFormData({ ...formData, acquisitionCost: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Revenue (₹)</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="e.g. 1200000"
                            value={formData.revenue}
                            onChange={e => setFormData({ ...formData, revenue: e.target.value })}
                        />
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <Modal
                isOpen={deleteConfirm !== null}
                onClose={() => setDeleteConfirm(null)}
                title="Delete Vehicle"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                        <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
                    </>
                }
            >
                <p style={{ color: 'var(--text-secondary)' }}>
                    Are you sure you want to delete this vehicle? This action cannot be undone.
                </p>
            </Modal>

            {/* Report Incident Modal */}
            <Modal
                isOpen={incidentVehicleId !== null}
                onClose={() => setIncidentVehicleId(null)}
                title="Report Incident / Accident"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setIncidentVehicleId(null)}>Cancel</button>
                        <button className="btn btn-danger" onClick={handleReportIncident} disabled={!incidentForm.description}>
                            Log Incident & Freeze Vehicle
                        </button>
                    </>
                }
            >
                <div style={{ padding: '12px', background: 'var(--color-danger-50)', color: 'var(--color-danger-700)', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ margin: 0 }}>Reporting this incident will automatically mark the vehicle as <strong>Out of Service</strong>, cancel any active trip, and suspend the assigned driver.</p>
                </div>

                <div className="form-group">
                    <label className="form-label">Severity *</label>
                    <select
                        className="form-select"
                        value={incidentForm.severity}
                        onChange={e => setIncidentForm({ ...incidentForm, severity: e.target.value })}
                    >
                        <option value="Minor">Minor (Scratches, Dents)</option>
                        <option value="Major">Major (Engine, Collision)</option>
                        <option value="Critical">Critical (Totaled, Severe Accident)</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Incident Description *</label>
                    <textarea
                        className="form-input"
                        placeholder="Describe what happened..."
                        rows={3}
                        value={incidentForm.description}
                        onChange={e => setIncidentForm({ ...incidentForm, description: e.target.value })}
                    />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="form-group">
                        <label className="form-label">Est. Damage Cost (₹)</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="e.g. 50000"
                            value={incidentForm.estimatedCost}
                            onChange={e => setIncidentForm({ ...incidentForm, estimatedCost: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Insurance Claim</label>
                        <select
                            className="form-select"
                            value={incidentForm.insuranceStatus}
                            onChange={e => setIncidentForm({ ...incidentForm, insuranceStatus: e.target.value })}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Filed">Filed</option>
                            <option value="Approved">Approved</option>
                            <option value="Denied">Denied</option>
                            <option value="Not Applicable">Not Applicable</option>
                        </select>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
