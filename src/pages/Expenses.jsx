import { useState } from 'react';
import { useApp } from '../store/AppContext';
import Modal from '../components/ui/Modal';
import { Plus, Fuel, Receipt, Calculator } from 'lucide-react';

export default function Expenses() {
    const { vehicles, fuelLogs, expenses, maintenance, dispatch, getVehicleTotalCost, getCostPerKm } = useApp();
    const [showFuelModal, setShowFuelModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [activeTab, setActiveTab] = useState('fuel');
    const [fuelForm, setFuelForm] = useState({ vehicleId: '', liters: '', cost: '', date: '', station: '' });
    const [expenseForm, setExpenseForm] = useState({ vehicleId: '', type: '', amount: '', date: '', notes: '' });

    const expenseTypes = ['Toll Charges', 'Parking', 'Insurance Premium', 'Cleaning', 'Tires', 'Registration', 'Fines', 'Other'];

    const getVehicleName = (id) => {
        const v = vehicles.find(x => x.id === id);
        return v ? `${v.name}` : 'Unknown';
    };

    const handleAddFuel = () => {
        if (!fuelForm.vehicleId || !fuelForm.liters || !fuelForm.cost) return;
        dispatch({
            type: 'ADD_FUEL_LOG',
            payload: {
                ...fuelForm,
                liters: Number(fuelForm.liters),
                cost: Number(fuelForm.cost),
                date: fuelForm.date || new Date().toISOString().split('T')[0],
            }
        });
        setShowFuelModal(false);
        setFuelForm({ vehicleId: '', liters: '', cost: '', date: '', station: '' });
    };

    const handleAddExpense = () => {
        if (!expenseForm.vehicleId || !expenseForm.type || !expenseForm.amount) return;
        dispatch({
            type: 'ADD_EXPENSE',
            payload: {
                ...expenseForm,
                amount: Number(expenseForm.amount),
                date: expenseForm.date || new Date().toISOString().split('T')[0],
            }
        });
        setShowExpenseModal(false);
        setExpenseForm({ vehicleId: '', type: '', amount: '', date: '', notes: '' });
    };

    // Calculate vehicle-wise operational costs
    const vehicleCosts = vehicles.map(v => {
        const costs = getVehicleTotalCost(v.id);
        const otherExpenses = expenses.filter(e => e.vehicleId === v.id).reduce((sum, e) => sum + e.amount, 0);
        return {
            ...v,
            ...costs,
            otherExpenses,
            grandTotal: costs.total + otherExpenses,
        };
    });

    const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
    const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + m.cost, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Fuel size={22} style={{ color: 'var(--color-primary-500)' }} />
                        Expenses & Fuel
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '2px' }}>
                        Track fuel consumption and operational expenses
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button className="btn btn-primary" onClick={() => setShowFuelModal(true)}>
                        <Fuel size={16} /> Log Fuel
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowExpenseModal(true)}>
                        <Receipt size={16} /> Add Expense
                    </button>
                </div>
            </div>

            {/* Cost Summary Cards */}
            <div className="kpi-grid" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="kpi-card info">
                    <div className="kpi-header">
                        <span className="kpi-label">Total Fuel Cost</span>
                        <div className="kpi-icon"><Fuel size={20} /></div>
                    </div>
                    <div className="kpi-value">₹{(totalFuelCost / 1000).toFixed(0)}K</div>
                </div>
                <div className="kpi-card warning">
                    <div className="kpi-header">
                        <span className="kpi-label">Total Maintenance</span>
                        <div className="kpi-icon"><Calculator size={20} /></div>
                    </div>
                    <div className="kpi-value">₹{(totalMaintenanceCost / 1000).toFixed(0)}K</div>
                </div>
                <div className="kpi-card danger">
                    <div className="kpi-header">
                        <span className="kpi-label">Other Expenses</span>
                        <div className="kpi-icon"><Receipt size={20} /></div>
                    </div>
                    <div className="kpi-value">₹{(totalExpenses / 1000).toFixed(0)}K</div>
                </div>
                <div className="kpi-card primary">
                    <div className="kpi-header">
                        <span className="kpi-label">Total Operational Cost</span>
                        <div className="kpi-icon"><Calculator size={20} /></div>
                    </div>
                    <div className="kpi-value">₹{((totalFuelCost + totalMaintenanceCost + totalExpenses) / 1000).toFixed(0)}K</div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                {['fuel', 'expenses', 'per-vehicle'].map(tab => (
                    <button
                        key={tab}
                        className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'fuel' ? 'Fuel Logs' : tab === 'expenses' ? 'Expenses' : 'Per Vehicle Cost'}
                    </button>
                ))}
            </div>

            {/* Fuel Logs Table */}
            {activeTab === 'fuel' && (
                <div className="data-table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr><th>Vehicle</th><th>Liters</th><th>Cost</th><th>Date</th><th>Station</th></tr>
                        </thead>
                        <tbody>
                            {fuelLogs.map(f => (
                                <tr key={f.id}>
                                    <td style={{ fontWeight: 500 }}>{getVehicleName(f.vehicleId)}</td>
                                    <td>{f.liters}L</td>
                                    <td style={{ fontWeight: 600 }}>₹{f.cost.toLocaleString()}</td>
                                    <td>{f.date}</td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)' }}>{f.station}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Expenses Table */}
            {activeTab === 'expenses' && (
                <div className="data-table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr><th>Vehicle</th><th>Expense Type</th><th>Amount</th><th>Date</th><th>Notes</th></tr>
                        </thead>
                        <tbody>
                            {expenses.map(e => (
                                <tr key={e.id}>
                                    <td style={{ fontWeight: 500 }}>{getVehicleName(e.vehicleId)}</td>
                                    <td>{e.type}</td>
                                    <td style={{ fontWeight: 600 }}>₹{e.amount.toLocaleString()}</td>
                                    <td>{e.date}</td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)' }}>{e.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Per Vehicle Cost Breakdown */}
            {activeTab === 'per-vehicle' && (
                <div className="data-table-wrapper">
                    <div className="data-table-header">
                        <h3>Operational Cost per Vehicle</h3>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                            Formula: Fuel Cost + Maintenance Cost
                        </span>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr><th>Vehicle</th><th>Fuel Cost</th><th>Maintenance Cost</th><th>Other</th><th>Cost/km</th><th>Total Cost</th></tr>
                        </thead>
                        <tbody>
                            {vehicleCosts.map(vc => (
                                <tr key={vc.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{vc.name}</div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{vc.licensePlate}</div>
                                    </td>
                                    <td>₹{vc.fuelCost.toLocaleString()}</td>
                                    <td>₹{vc.maintenanceCost.toLocaleString()}</td>
                                    <td>₹{vc.otherExpenses.toLocaleString()}</td>
                                    <td style={{ color: 'var(--color-info-600)', fontWeight: 500 }}>
                                        ₹{getCostPerKm(vc.id)}/km
                                    </td>
                                    <td style={{ fontWeight: 700, color: 'var(--color-primary-700)' }}>
                                        ₹{vc.grandTotal.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Fuel Modal */}
            <Modal
                isOpen={showFuelModal}
                onClose={() => setShowFuelModal(false)}
                title="Log Fuel Entry"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setShowFuelModal(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleAddFuel}>Log Fuel</button>
                    </>
                }
            >
                <div className="form-group">
                    <label className="form-label">Vehicle *</label>
                    <select className="form-select" value={fuelForm.vehicleId} onChange={e => setFuelForm({ ...fuelForm, vehicleId: e.target.value })}>
                        <option value="">Select vehicle...</option>
                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} — {v.licensePlate}</option>)}
                    </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="form-group">
                        <label className="form-label">Liters *</label>
                        <input type="number" className="form-input" placeholder="e.g. 150" value={fuelForm.liters} onChange={e => setFuelForm({ ...fuelForm, liters: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Cost (₹) *</label>
                        <input type="number" className="form-input" placeholder="e.g. 15000" value={fuelForm.cost} onChange={e => setFuelForm({ ...fuelForm, cost: e.target.value })} />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-input" value={fuelForm.date} onChange={e => setFuelForm({ ...fuelForm, date: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">Station</label>
                    <input className="form-input" placeholder="e.g. HP Petrol Pump, NH48" value={fuelForm.station} onChange={e => setFuelForm({ ...fuelForm, station: e.target.value })} />
                </div>
            </Modal>

            {/* Expense Modal */}
            <Modal
                isOpen={showExpenseModal}
                onClose={() => setShowExpenseModal(false)}
                title="Add Expense"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setShowExpenseModal(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleAddExpense}>Add Expense</button>
                    </>
                }
            >
                <div className="form-group">
                    <label className="form-label">Vehicle *</label>
                    <select className="form-select" value={expenseForm.vehicleId} onChange={e => setExpenseForm({ ...expenseForm, vehicleId: e.target.value })}>
                        <option value="">Select vehicle...</option>
                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} — {v.licensePlate}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Expense Type *</label>
                    <select className="form-select" value={expenseForm.type} onChange={e => setExpenseForm({ ...expenseForm, type: e.target.value })}>
                        <option value="">Select type...</option>
                        {expenseTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="form-group">
                        <label className="form-label">Amount (₹) *</label>
                        <input type="number" className="form-input" placeholder="e.g. 5000" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Date</label>
                        <input type="date" className="form-input" value={expenseForm.date} onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })} />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Notes</label>
                    <input className="form-input" placeholder="Optional notes..." value={expenseForm.notes} onChange={e => setExpenseForm({ ...expenseForm, notes: e.target.value })} />
                </div>
            </Modal>
        </div>
    );
}
