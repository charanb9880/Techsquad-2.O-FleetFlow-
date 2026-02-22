import { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import { Plus, Play, CheckCircle, XCircle, Route, AlertCircle, Sparkles, ShieldCheck, Truck } from 'lucide-react';

export default function Trips() {
    const { trips, vehicles, drivers, dispatch, getAvailableVehicles, getAvailableDrivers, getSmartDispatch } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');
    const [formData, setFormData] = useState({
        vehicleId: '', driverId: '', cargoWeight: '', cargoDesc: '', origin: '', destination: '', status: 'Draft'
    });
    const [errors, setErrors] = useState({});

    // Complete trip modal state
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [completingTripId, setCompletingTripId] = useState(null);
    const [finalOdometer, setFinalOdometer] = useState('');

    const filteredTrips = filterStatus === 'All' ? trips : trips.filter(t => t.status === filterStatus);

    // Get vehicle type for selected vehicle to filter drivers by license category
    const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
    const selectedVehicleType = selectedVehicle?.type || null;

    const availableVehicles = getAvailableVehicles();
    const availableDrivers = getAvailableDrivers(selectedVehicleType);

    // ── Smart Dispatch Recommendation ───────────────────────────────────
    // Recompute whenever cargoWeight changes
    const recommendation = useMemo(() => {
        if (!formData.cargoWeight || Number(formData.cargoWeight) <= 0) return null;
        return getSmartDispatch(formData.cargoWeight);
    }, [formData.cargoWeight]); // eslint-disable-line

    const applyRecommendation = () => {
        if (!recommendation) return;
        setFormData(prev => ({
            ...prev,
            vehicleId: recommendation.bestVehicle?.id || prev.vehicleId,
            driverId: recommendation.bestDriver?.id || prev.driverId,
        }));
    };

    const getVehicleDetails = (id) => {
        const v = vehicles.find(x => x.id === id);
        return v || { name: 'Unknown', licensePlate: 'N/A' };
    };

    const getDriverName = (id) => {
        const d = drivers.find(x => x.id === id);
        return d ? d.name : 'Unknown';
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.vehicleId) newErrors.vehicleId = 'Vehicle is required';
        if (!formData.driverId) newErrors.driverId = 'Driver is required';
        if (!formData.cargoWeight) newErrors.cargoWeight = 'Cargo weight is required';
        if (!formData.origin) newErrors.origin = 'Origin is required';
        if (!formData.destination) newErrors.destination = 'Destination is required';

        if (formData.vehicleId && formData.cargoWeight) {
            const vehicle = vehicles.find(v => v.id === formData.vehicleId);
            if (vehicle && Number(formData.cargoWeight) > vehicle.maxCapacity) {
                newErrors.cargoWeight = `Exceeds max capacity (${(vehicle.maxCapacity / 1000).toFixed(0)}T)`;
            }
        }

        if (formData.driverId) {
            const selectedDriver = drivers.find(d => d.id === formData.driverId);
            if (selectedDriver && selectedDriver.licenseStatus === 'Expired') {
                newErrors.driverId = 'Driver license is expired';
            }
            if (selectedVehicle && selectedDriver && selectedDriver.licenseCategory && !selectedDriver.licenseCategory.includes(selectedVehicle.type)) {
                newErrors.driverId = `Driver lacks ${selectedVehicle.type} license`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreate = async () => {
        if (!validate()) return;

        try {
            await dispatch({
                type: 'ADD_TRIP',
                payload: {
                    ...formData,
                    cargoWeight: Number(formData.cargoWeight),
                    dispatchedAt: null,
                    completedAt: null,
                }
            });
            setShowModal(false);
            setFormData({ vehicleId: '', driverId: '', cargoWeight: '', cargoDesc: '', origin: '', destination: '', status: 'Draft' });
            setErrors({});
        } catch (error) {
            alert(error.message || 'Failed to create trip');
        }
    };

    const handleDispatch = (id) => dispatch({ type: 'DISPATCH_TRIP', payload: id });

    const openCompleteModal = (id) => {
        const trip = trips.find(t => t.id === id);
        if (trip) {
            const vehicle = vehicles.find(v => v.id === trip.vehicleId);
            setFinalOdometer(vehicle ? vehicle.odometer : '');
        }
        setCompletingTripId(id);
        setShowCompleteModal(true);
    };

    const handleComplete = () => {
        if (!completingTripId) return;
        dispatch({
            type: 'COMPLETE_TRIP',
            payload: {
                id: completingTripId,
                finalOdometer: finalOdometer ? Number(finalOdometer) : null,
            }
        });
        setShowCompleteModal(false);
        setCompletingTripId(null);
        setFinalOdometer('');
    };

    const handleCancel = (id) => dispatch({ type: 'CANCEL_TRIP', payload: id });

    return (
        <div className="fixed-page-layout">
            <div className="flex flex-col gap-3">
                <div className="page-header !mb-0">
                    <div>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Route size={22} style={{ color: 'var(--color-primary-500)' }} />
                            Fleet Trips
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '2px' }}>
                            {trips.length} total shipments · {trips.filter(t => t.status === 'Dispatched').length} currently in transit
                        </p>
                    </div>
                    <button className="btn btn-primary" onClick={() => { setValidationError(''); setShowModal(true); }}>
                        <Plus size={16} /> Create Trip
                    </button>
                </div>

                <div className="page-filters !pb-1" style={{ border: 'none', background: 'transparent', padding: 0 }}>
                    {['All', 'Draft', 'Dispatched', 'Completed', 'Cancelled'].map(status => (
                        <button
                            key={status}
                            className={`btn ${filterStatus === status ? 'btn-primary' : 'btn-secondary'} btn-sm !px-3 !py-1 !text-xs`}
                            onClick={() => setFilterStatus(status)}
                        >
                            {status} ({status === 'All' ? trips.length : trips.filter(t => t.status === status).length})
                        </button>
                    ))}
                </div>
            </div>

            <div className="table-scroll-container">
                <div className="data-table-wrapper" style={{ border: 'none', background: 'transparent' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>ID</th>
                                <th>Vehicle</th>
                                <th>Driver</th>
                                <th>Cargo Details</th>
                                <th>Route</th>
                                <th style={{ width: '120px' }}>Status</th>
                                <th style={{ textAlign: 'right', paddingRight: 'var(--space-6)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTrips.map((t, idx) => {
                                const vehicle = getVehicleDetails(t.vehicleId);
                                return (
                                    <tr key={t.id}>
                                        <td>
                                            <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-primary-600)' }}>
                                                #{String(idx + 1).padStart(3, '0')}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, fontSize: '13px' }}>{vehicle.name}</div>
                                            <div className="license-plate" style={{ scale: '0.8', originX: 'left', marginTop: '1px' }}>
                                                <span>{vehicle.licensePlate}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 500, fontSize: '13px' }}>{getDriverName(t.driverId)}</div>
                                        </td>
                                        <td>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '13px' }}>{(t.cargoWeight / 1000).toFixed(1)}T</div>
                                                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{t.cargoDesc}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '12px', fontWeight: 500 }}>
                                                {t.origin} <span style={{ color: 'var(--text-tertiary)' }}>→</span> {t.destination}
                                            </div>
                                        </td>
                                        <td><StatusBadge status={t.status} /></td>
                                        <td style={{ paddingRight: 'var(--space-4)' }}>
                                            <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                                                {t.status === 'Draft' && (
                                                    <button className="btn btn-xs btn-primary !px-2" onClick={() => handleDispatch(t.id)} title="Dispatch">
                                                        <Play size={11} /> Dispatch
                                                    </button>
                                                )}
                                                {t.status === 'Dispatched' && (
                                                    <button className="btn btn-xs btn-success !px-2" onClick={() => openCompleteModal(t.id)} title="Complete">
                                                        <CheckCircle size={11} /> Complete
                                                    </button>
                                                )}
                                                {(t.status === 'Draft' || t.status === 'Dispatched') && (
                                                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleCancel(t.id)}
                                                        style={{ color: 'var(--color-danger-500)' }} title="Cancel">
                                                        <XCircle size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredTrips.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--text-tertiary)' }}>
                                        No active trips found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Trip Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setValidationError(''); }}
                title="Create New Trip"
                size="large"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => { setShowModal(false); setValidationError(''); }}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleCreate}>Create Trip</button>
                    </>
                }
            >
                {Object.keys(errors).length > 0 && (
                    <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)',
                        padding: 'var(--space-3) var(--space-4)',
                        background: 'var(--color-danger-50)', borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-danger-100)', color: 'var(--color-danger-700)',
                        fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)'
                    }}>
                        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        Please correct the errors highlighted below.
                    </div>
                )}

                {/* ── Smart Dispatch Recommendation Banner ─────────────── */}
                {recommendation && (
                    <div style={{
                        background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
                        border: '1px solid #bfdbfe',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--space-4)',
                        marginBottom: 'var(--space-2)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 700, fontSize: 'var(--font-size-sm)', color: '#CA3F16' }}>
                                <Sparkles size={15} />
                                Smart Dispatch Recommendation
                            </div>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={applyRecommendation}
                                style={{ fontSize: '12px', padding: '4px 12px' }}
                            >
                                Apply Recommendation
                            </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                            {/* Best Vehicle */}
                            <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', border: '1px solid rgba(255,148,8,0.2)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <Truck size={11} /> Best Vehicle
                                </div>
                                {recommendation.bestVehicle ? (
                                    <>
                                        <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{recommendation.bestVehicle.name}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: 2 }}>
                                            {(recommendation.bestVehicle.maxCapacity / 1000).toFixed(0)}T capacity
                                            · {Math.round((Number(formData.cargoWeight) / recommendation.bestVehicle.maxCapacity) * 100)}% utilised
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#FF9408', marginTop: 2, fontWeight: 500 }}>Closest capacity match ↑</div>
                                    </>
                                ) : (
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: '#dc2626' }}>No vehicle available for this cargo weight</div>
                                )}
                            </div>
                            {/* Best Driver */}
                            <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', border: '1px solid rgba(34,197,94,0.2)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <ShieldCheck size={11} /> Best Driver
                                </div>
                                {recommendation.bestDriver ? (
                                    <>
                                        <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{recommendation.bestDriver.name}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                            <span style={{
                                                background: recommendation.bestDriver.safetyScore >= 90 ? '#dcfce7' : '#fef9c3',
                                                color: recommendation.bestDriver.safetyScore >= 90 ? '#16a34a' : '#a16207',
                                                fontWeight: 700, fontSize: '11px', padding: '1px 8px', borderRadius: 999
                                            }}>
                                                {recommendation.bestDriver.safetyScore} / 100
                                            </span>
                                            <span style={{ fontSize: '11px', color: '#FF9408', fontWeight: 500 }}>Highest safety score ↑</span>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: '#dc2626' }}>No qualifying driver available</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">Select Vehicle *</label>
                    <select
                        className="form-select"
                        value={formData.vehicleId}
                        onChange={e => {
                            setFormData({ ...formData, vehicleId: e.target.value, driverId: '' });
                            setErrors(prev => ({ ...prev, vehicleId: '' }));
                        }}
                    >
                        <option value="">Choose an available vehicle...</option>
                        {availableVehicles.map(v => (
                            <option key={v.id} value={v.id}>
                                {v.name} — {v.licensePlate} — {v.type} — Max: {(v.maxCapacity / 1000).toFixed(0)}T
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Select Driver *</label>
                    <select
                        className="form-select"
                        value={formData.driverId}
                        onChange={e => {
                            setFormData({ ...formData, driverId: e.target.value });
                            setErrors(prev => ({ ...prev, driverId: '' }));
                        }}
                    >
                        <option value="">Choose an available driver...</option>
                        {availableDrivers.map(d => (
                            <option key={d.id} value={d.id}>
                                {d.name} — Score: {d.safetyScore} — {d.licenseStatus}
                                {d.licenseCategory ? ` — [${d.licenseCategory.join(', ')}]` : ''}
                            </option>
                        ))}
                    </select>
                    {selectedVehicleType && (
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                            Showing drivers with "{selectedVehicleType}" license category
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Cargo Weight (kg) *</label>
                    <input
                        type="number"
                        className={`form-input ${errors.cargoWeight ? 'error' : ''}`}
                        placeholder="e.g. 15000"
                        value={formData.cargoWeight}
                        onChange={e => { setFormData({ ...formData, cargoWeight: e.target.value }); setErrors(prev => ({ ...prev, cargoWeight: '' })); }}
                    />
                    {errors.cargoWeight && <div className="error-message">{errors.cargoWeight}</div>}
                    {formData.vehicleId && (
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                            Vehicle max capacity: {(vehicles.find(v => v.id === formData.vehicleId)?.maxCapacity / 1000 || 0).toFixed(0)}T
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Cargo Description</label>
                    <input
                        className="form-input"
                        placeholder="e.g. Steel Coils, Electronics"
                        value={formData.cargoDesc}
                        onChange={e => setFormData({ ...formData, cargoDesc: e.target.value })}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="form-group">
                        <label className="form-label">Origin</label>
                        <input
                            className={`form-input ${errors.origin ? 'error' : ''}`}
                            placeholder="e.g. Mumbai"
                            value={formData.origin}
                            onChange={e => { setFormData({ ...formData, origin: e.target.value }); setErrors(prev => ({ ...prev, origin: '' })); }}
                        />
                        {errors.origin && <div className="error-message">{errors.origin}</div>}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Destination</label>
                        <input
                            className={`form-input ${errors.destination ? 'error' : ''}`}
                            placeholder="e.g. Delhi"
                            value={formData.destination}
                            onChange={e => { setFormData({ ...formData, destination: e.target.value }); setErrors(prev => ({ ...prev, destination: '' })); }}
                        />
                        {errors.destination && <div className="error-message">{errors.destination}</div>}
                    </div>
                </div>
            </Modal>

            {/* Complete Trip Modal — Final Odometer */}
            <Modal
                isOpen={showCompleteModal}
                onClose={() => { setShowCompleteModal(false); setCompletingTripId(null); setFinalOdometer(''); }}
                title="Complete Trip — Enter Final Odometer"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => { setShowCompleteModal(false); setCompletingTripId(null); setFinalOdometer(''); }}>Cancel</button>
                        <button className="btn btn-success" onClick={handleComplete}>
                            <CheckCircle size={15} /> Mark as Completed
                        </button>
                    </>
                }
            >
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
                    Enter the vehicle's current odometer reading to update the mileage record.
                </p>
                <div className="form-group">
                    <label className="form-label">Final Odometer (km)</label>
                    <input
                        type="number"
                        className="form-input"
                        placeholder="e.g. 50000"
                        value={finalOdometer}
                        onChange={e => setFinalOdometer(e.target.value)}
                    />
                </div>
                {completingTripId && (() => {
                    const trip = trips.find(t => t.id === completingTripId);
                    const vehicle = trip ? vehicles.find(v => v.id === trip.vehicleId) : null;
                    return vehicle ? (
                        <div style={{
                            fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)',
                            padding: 'var(--space-3)', background: 'var(--bg-elevated)',
                            borderRadius: 'var(--radius-md)', marginTop: 'var(--space-2)'
                        }}>
                            <strong>{vehicle.name}</strong> — Previous odometer: <strong>{vehicle.odometer.toLocaleString()} km</strong>
                        </div>
                    ) : null;
                })()}
            </Modal>
        </div>
    );
}
