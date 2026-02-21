import { useState } from 'react';
import { useApp } from '../store/AppContext';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import { Plus, Users, AlertCircle, Edit2, Trash2 } from 'lucide-react';

const VEHICLE_TYPES = ['Truck', 'Van', 'Bike'];

const emptyDriver = {
    name: '', licenseNumber: '', licenseExpiry: '', licenseStatus: 'Valid',
    licenseCategory: [], safetyScore: 100, dutyStatus: 'Off Duty', phone: ''
};

export default function Drivers() {
    const { drivers, dispatch, getDriverTripStats } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState(emptyDriver);
    const [filterDuty, setFilterDuty] = useState('All');

    const filteredDrivers = filterDuty === 'All' ? drivers : drivers.filter(d => d.dutyStatus === filterDuty);

    const openAdd = () => {
        setEditId(null);
        setFormData(emptyDriver);
        setShowModal(true);
    };

    const openEdit = (driver) => {
        setEditId(driver.id);
        setFormData({ ...driver, licenseCategory: driver.licenseCategory || [] });
        setShowModal(true);
    };

    const handleSave = () => {
        if (!formData.name || !formData.licenseNumber) return;
        const payload = { ...formData, safetyScore: Number(formData.safetyScore) };
        if (editId) {
            dispatch({ type: 'UPDATE_DRIVER', payload: { ...payload, id: editId } });
        } else {
            dispatch({ type: 'ADD_DRIVER', payload });
        }
        setShowModal(false);
    };

    const handleDelete = (id) => {
        dispatch({ type: 'DELETE_DRIVER', payload: id });
    };

    const toggleCategory = (cat) => {
        const current = formData.licenseCategory || [];
        if (current.includes(cat)) {
            setFormData({ ...formData, licenseCategory: current.filter(c => c !== cat) });
        } else {
            setFormData({ ...formData, licenseCategory: [...current, cat] });
        }
    };

    const getScoreClass = (score) => {
        if (score >= 80) return 'high';
        if (score >= 60) return 'medium';
        return 'low';
    };

    return (
        <div className="fixed-page-layout">
            <div className="flex flex-col gap-3">
                <div className="page-header !mb-0">
                    <div>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Users size={22} style={{ color: 'var(--color-primary-500)' }} />
                            Fleet Drivers
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '2px' }}>
                            {drivers.length} registered drivers · {drivers.filter(d => d.dutyStatus === 'On Duty').length} currently active
                        </p>
                    </div>
                    <button className="btn btn-primary" onClick={openAdd}>
                        <Plus size={16} /> Add Driver
                    </button>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="page-filters !pb-0" style={{ border: 'none', background: 'transparent', padding: 0 }}>
                        {['All', 'On Duty', 'Off Duty', 'Suspended'].map(status => (
                            <button
                                key={status}
                                className={`btn ${filterDuty === status ? 'btn-primary' : 'btn-secondary'} btn-sm !px-3 !py-1 !text-xs`}
                                onClick={() => setFilterDuty(status)}
                            >
                                {status} ({status === 'All' ? drivers.length : drivers.filter(d => d.dutyStatus === status).length})
                            </button>
                        ))}
                    </div>

                    {drivers.some(d => d.licenseStatus === 'Expired') && (
                        <div style={{
                            padding: '4px 12px', background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.2)',
                            fontSize: '11px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                            <AlertCircle size={12} />
                            <strong>{drivers.filter(d => d.licenseStatus === 'Expired').length} Licenses Expired</strong>
                        </div>
                    )}
                </div>
            </div>

            <div className="table-scroll-container">
                <div className="data-table-wrapper" style={{ border: 'none', background: 'transparent' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Driver Details</th>
                                <th style={{ width: '130px' }}>License Plate</th>
                                <th>License Status</th>
                                <th>Categories</th>
                                <th>Expiry</th>
                                <th style={{ width: '120px' }}>Safety</th>
                                <th>Completion</th>
                                <th>Duty</th>
                                <th style={{ textAlign: 'right', paddingRight: 'var(--space-6)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDrivers.map(d => {
                                const tripStats = getDriverTripStats(d.id);
                                return (
                                    <tr key={d.id}>
                                        <td>
                                            <div style={{ fontWeight: 600, fontSize: '13px' }}>{d.name}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{d.phone}</div>
                                        </td>
                                        <td>
                                            <div className="license-plate" style={{ scale: '0.85', originX: 'left' }}>
                                                <span>{d.licenseNumber}</span>
                                            </div>
                                        </td>
                                        <td><StatusBadge status={d.licenseStatus} /></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                                                {(d.licenseCategory || []).map(cat => (
                                                    <span key={cat} style={{
                                                        fontSize: '9px', padding: '0px 6px',
                                                        borderRadius: '2px', fontWeight: 700,
                                                        background: cat === 'Truck' ? 'var(--color-primary-50)' : cat === 'Van' ? 'var(--color-success-50)' : 'var(--color-warning-50)',
                                                        color: cat === 'Truck' ? 'var(--color-primary-700)' : cat === 'Van' ? 'var(--color-success-700)' : 'var(--color-warning-700)',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {cat}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td style={{ fontSize: '12px' }}>{d.licenseExpiry}</td>
                                        <td>
                                            <div className="score-bar" style={{ gap: '6px' }}>
                                                <div className="score-bar-track" style={{ height: '4px' }}>
                                                    <div
                                                        className={`score-bar-fill ${getScoreClass(d.safetyScore)}`}
                                                        style={{ width: `${d.safetyScore}%` }}
                                                    />
                                                </div>
                                                <span className="score-value" style={{ fontSize: '11px' }}>{d.safetyScore}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '12px' }}>
                                                <span style={{ fontWeight: 700 }}>{tripStats.completionRate}%</span>
                                                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginLeft: '4px' }}>
                                                    ({tripStats.completed}/{tripStats.total})
                                                </span>
                                            </div>
                                        </td>
                                        <td><StatusBadge status={d.dutyStatus} /></td>
                                        <td style={{ paddingRight: 'var(--space-4)' }}>
                                            <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                                                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(d)} title="Edit">
                                                    <Edit2 size={13} />
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-icon btn-sm"
                                                    onClick={() => handleDelete(d.id)}
                                                    title="Delete"
                                                    style={{ color: 'var(--color-danger-500)' }}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredDrivers.length === 0 && (
                                <tr>
                                    <td colSpan={9} style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--text-tertiary)' }}>
                                        No drivers found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editId ? 'Edit Driver' : 'Add Driver'}
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSave}>
                            {editId ? 'Save Changes' : 'Add Driver'}
                        </button>
                    </>
                }
            >
                <div className="form-group">
                    <label className="form-label">Driver Name *</label>
                    <input className="form-input" placeholder="Full name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="form-group">
                        <label className="form-label">License Number *</label>
                        <input className="form-input" placeholder="e.g. DL-2024-001" value={formData.licenseNumber} onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">License Expiry</label>
                        <input type="date" className="form-input" value={formData.licenseExpiry} onChange={e => setFormData({ ...formData, licenseExpiry: e.target.value })} />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">License Category</label>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-1)' }}>
                        {VEHICLE_TYPES.map(cat => {
                            const isChecked = (formData.licenseCategory || []).includes(cat);
                            return (
                                <label key={cat} style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    fontSize: 'var(--font-size-sm)', cursor: 'pointer',
                                    padding: 'var(--space-2) var(--space-3)',
                                    borderRadius: 'var(--radius-md)',
                                    border: `1px solid ${isChecked ? 'var(--color-primary-400)' : 'var(--border-primary)'}`,
                                    background: isChecked ? 'var(--color-primary-50)' : 'transparent',
                                    transition: 'all 180ms ease',
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggleCategory(cat)}
                                        style={{ accentColor: 'var(--color-primary-600)' }}
                                    />
                                    {cat}
                                </label>
                            );
                        })}
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="form-group">
                        <label className="form-label">License Status</label>
                        <select className="form-select" value={formData.licenseStatus} onChange={e => setFormData({ ...formData, licenseStatus: e.target.value })}>
                            <option value="Valid">Valid</option>
                            <option value="Expiring">Expiring</option>
                            <option value="Expired">Expired</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Duty Status</label>
                        <select className="form-select" value={formData.dutyStatus} onChange={e => setFormData({ ...formData, dutyStatus: e.target.value })}>
                            <option value="Off Duty">Off Duty</option>
                            <option value="On Duty">On Duty</option>
                            <option value="Suspended">Suspended</option>
                        </select>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="form-group">
                        <label className="form-label">Safety Score (0-100)</label>
                        <input type="number" min="0" max="100" className="form-input" value={formData.safetyScore} onChange={e => setFormData({ ...formData, safetyScore: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input className="form-input" placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                </div>
            </Modal>
        </div >
    );
}
