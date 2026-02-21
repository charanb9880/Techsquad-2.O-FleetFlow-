import { useState } from 'react';
import { Settings as SettingsIcon, User, Shield, Bell, Globe, Palette } from 'lucide-react';

export default function Settings() {
    const [notifications, setNotifications] = useState({
        email: true, push: true, maintenance: true, trips: false
    });
    const [profile, setProfile] = useState({
        name: 'Admin User', email: 'admin@fleetflow.com', role: 'Fleet Manager', timezone: 'Asia/Kolkata'
    });

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <SettingsIcon size={22} style={{ color: 'var(--color-primary-500)' }} />
                        Settings
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '2px' }}>
                        Manage your account and application preferences
                    </p>
                </div>
            </div>

            {/* Profile Section */}
            <div className="settings-section">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <User size={18} /> Profile
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input className="form-input" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Role</label>
                        <select className="form-select" value={profile.role} onChange={e => setProfile({ ...profile, role: e.target.value })}>
                            <option>Fleet Manager</option>
                            <option>Dispatcher</option>
                            <option>Safety Officer</option>
                            <option>Financial Analyst</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Timezone</label>
                        <select className="form-select" value={profile.timezone} onChange={e => setProfile({ ...profile, timezone: e.target.value })}>
                            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                            <option value="America/New_York">America/New York (EST)</option>
                            <option value="Europe/London">Europe/London (GMT)</option>
                            <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                        </select>
                    </div>
                </div>
                <div style={{ marginTop: 'var(--space-5)' }}>
                    <button className="btn btn-primary">Save Profile</button>
                </div>
            </div>

            {/* RBAC Roles */}
            <div className="settings-section">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Shield size={18} /> Role-Based Access Control (RBAC)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {[
                        { role: 'Fleet Manager', permissions: 'Full access to all modules, vehicle management, trip management, analytics', color: 'var(--color-primary-500)' },
                        { role: 'Dispatcher', permissions: 'Trip creation & management, vehicle assignment, driver management', color: 'var(--color-info-500)' },
                        { role: 'Safety Officer', permissions: 'Driver safety scores, maintenance oversight, compliance reports', color: 'var(--color-warning-500)' },
                        { role: 'Financial Analyst', permissions: 'Expense tracking, fuel logs, analytics, ROI reports', color: 'var(--color-success-500)' },
                    ].map(item => (
                        <div key={item.role} style={{
                            padding: 'var(--space-4)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-primary)',
                            display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)',
                            background: profile.role === item.role ? 'var(--color-primary-50)' : 'transparent'
                        }}>
                            <div style={{
                                width: 8, height: 8, borderRadius: '50%', background: item.color,
                                marginTop: 6, flexShrink: 0
                            }} />
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                                    {item.role}
                                    {profile.role === item.role && (
                                        <span style={{
                                            marginLeft: 'var(--space-2)', fontSize: 'var(--font-size-xs)',
                                            color: 'var(--color-primary-600)', fontWeight: 500
                                        }}>
                                            (Current)
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
                                    {item.permissions}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Notifications */}
            <div className="settings-section">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Bell size={18} /> Notifications
                </h3>
                {[
                    { key: 'email', label: 'Email Notifications', desc: 'Receive email updates for important events' },
                    { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications for real-time alerts' },
                    { key: 'maintenance', label: 'Maintenance Reminders', desc: 'Get notified about scheduled maintenance' },
                    { key: 'trips', label: 'Trip Status Updates', desc: 'Notifications when trip status changes' },
                ].map(item => (
                    <div className="settings-row" key={item.key}>
                        <div className="settings-row-label">
                            <span>{item.label}</span>
                            <span>{item.desc}</span>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={notifications[item.key]}
                                onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                ))}
            </div>

            {/* Appearance placeholder */}
            <div className="settings-section">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Palette size={18} /> Appearance
                </h3>
                <div className="settings-row">
                    <div className="settings-row-label">
                        <span>Theme</span>
                        <span>Choose between light and dark mode</span>
                    </div>
                    <select className="form-select" style={{ width: '160px' }} defaultValue="light">
                        <option value="light">Light</option>
                        <option value="dark">Dark (Coming Soon)</option>
                    </select>
                </div>
                <div className="settings-row">
                    <div className="settings-row-label">
                        <span>Language</span>
                        <span>Select your preferred language</span>
                    </div>
                    <select className="form-select" style={{ width: '160px' }} defaultValue="en">
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="es">Spanish</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
