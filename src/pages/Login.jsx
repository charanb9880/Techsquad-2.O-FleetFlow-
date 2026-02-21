import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';

/* ── Hardcoded User Accounts ── */
const USER_ACCOUNTS = [
    { email: 'manager@fleetflow.com', password: 'fleet123', role: 'Fleet Manager', name: 'Arjun Mehta' },
    { email: 'dispatch@fleetflow.com', password: 'fleet123', role: 'Dispatcher', name: 'Priya Sharma' },
    { email: 'safety@fleetflow.com', password: 'fleet123', role: 'Safety Officer', name: 'Vikram Singh' },
    { email: 'finance@fleetflow.com', password: 'fleet123', role: 'Financial Analyst', name: 'Neha Gupta' },
];

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Validate fields
        if (!email.trim()) {
            setError('Please enter your email address.');
            return;
        }
        if (!password.trim()) {
            setError('Please enter your password.');
            return;
        }

        // Email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        // Match credentials
        const user = USER_ACCOUNTS.find(
            u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
        );

        if (!user) {
            setError('Invalid email or password. Please check your credentials.');
            return;
        }

        // Simulate login delay
        setIsLoading(true);
        setTimeout(() => {
            // Store user profile in sessionStorage
            sessionStorage.setItem('fleetflow_user', JSON.stringify({
                email: user.email,
                role: user.role,
                name: user.name,
                loginAt: new Date().toISOString(),
            }));
            navigate('/dashboard');
        }, 600);
    };

    const fillCredentials = (account) => {
        setEmail(account.email);
        setPassword(account.password);
        setError('');
    };

    const roles = USER_ACCOUNTS.map(u => ({
        role: u.role,
        email: u.email,
        name: u.name,
    }));

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <div className="logo-icon">
                        <Zap size={24} />
                    </div>
                    <h1>FleetFlow</h1>
                </div>

                <p style={{
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--font-size-sm)',
                    marginBottom: 'var(--space-6)',
                }}>
                    Sign in to manage your fleet operations
                </p>

                {/* Error message */}
                {error && (
                    <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)',
                        padding: 'var(--space-3) var(--space-4)',
                        background: 'var(--color-danger-50)', borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-danger-100)', color: 'var(--color-danger-600)',
                        fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)',
                        animation: 'fadeIn 0.2s ease'
                    }}>
                        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                        {error}
                    </div>
                )}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{
                                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                                color: 'var(--text-tertiary)'
                            }} />
                            <input
                                type="email"
                                className={`form-input ${error && !email ? 'error' : ''}`}
                                placeholder="Enter your email"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setError(''); }}
                                style={{ paddingLeft: '36px' }}
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{
                                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                                color: 'var(--text-tertiary)'
                            }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className={`form-input ${error && !password ? 'error' : ''}`}
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError(''); }}
                                style={{ paddingLeft: '36px', paddingRight: '40px' }}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--text-tertiary)', padding: '2px',
                                    display: 'flex', alignItems: 'center'
                                }}
                                title={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%', position: 'relative' }}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span style={{
                                    width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)',
                                    borderTopColor: '#fff', borderRadius: '50%',
                                    animation: 'spin 0.6s linear infinite', display: 'inline-block'
                                }} />
                                Signing In...
                            </>
                        ) : (
                            <>
                                <LogIn size={18} />
                                Sign In
                            </>
                        )}
                    </button>

                    <div className="login-extras">
                        <label style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)',
                            cursor: 'pointer'
                        }}>
                            <input type="checkbox" style={{ accentColor: 'var(--color-primary-600)' }} />
                            Remember me
                        </label>
                        <a href="#" onClick={e => e.preventDefault()}>Forgot Password?</a>
                    </div>
                </form>

                {/* Quick Login Credentials */}
                <div className="login-roles">
                    <p style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                        <Shield size={13} />
                        Demo Credentials (click to autofill)
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                        {roles.map(r => (
                            <button
                                key={r.role}
                                type="button"
                                onClick={() => fillCredentials(USER_ACCOUNTS.find(u => u.role === r.role))}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: 'var(--space-2) var(--space-3)',
                                    background: email === r.email ? 'var(--color-primary-50)' : 'var(--bg-elevated)',
                                    border: `1px solid ${email === r.email ? 'var(--color-primary-200)' : 'var(--border-primary)'}`,
                                    borderRadius: 'var(--radius-md)', cursor: 'pointer',
                                    transition: 'all 180ms ease', fontSize: 'var(--font-size-xs)',
                                    width: '100%', textAlign: 'left',
                                }}
                            >
                                <span style={{
                                    fontWeight: 600,
                                    color: email === r.email ? 'var(--color-primary-600)' : 'var(--text-primary)'
                                }}>
                                    {r.role}
                                </span>
                                <span style={{ color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                                    {r.email}
                                </span>
                            </button>
                        ))}
                    </div>
                    <p style={{
                        fontSize: '11px', color: 'var(--text-tertiary)',
                        textAlign: 'center', marginTop: 'var(--space-2)'
                    }}>
                        Password for all accounts: <code style={{
                            background: 'var(--bg-elevated)', padding: '1px 6px',
                            borderRadius: '4px', fontWeight: 600, color: 'var(--text-secondary)'
                        }}>fleet123</code>
                    </p>
                </div>
            </div>
        </div>
    );
}
