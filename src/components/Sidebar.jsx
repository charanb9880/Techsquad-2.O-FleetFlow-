import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Truck, Route, Wrench, Fuel,
    Users, BarChart3, FileText, Settings, Zap,
    Search, Bell, LogOut, ChevronDown, User, Navigation
} from 'lucide-react';

const navItems = [
    { path: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
    { path: '/vehicles', label: 'Vehicles', icon: Truck },
    { path: '/trips', label: 'Trips', icon: Route },
    { path: '/maintenance', label: 'Maintenance', icon: Wrench },
    { path: '/expenses', label: 'Expenses', icon: Fuel },
    { path: '/drivers', label: 'Drivers', icon: Users },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/live-map', label: 'Live Map', icon: Navigation },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/settings', label: 'Settings', icon: Settings },
];

export default function TopNav() {
    const location = useLocation();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef(null);

    // Get logged-in user from session
    const stored = sessionStorage.getItem('fleetflow_user');
    const user = stored ? JSON.parse(stored) : { name: 'Fleet Manager', role: 'Fleet Manager', email: 'manager@fleetflow.com' };
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('fleetflow_user');
        navigate('/login');
    };

    return (
        <header className="topnav">
            {/* Logo */}
            <div className="topnav-logo">
                <span className="logo-text">FleetFlow</span>
            </div>

            {/* Navigation */}
            <nav className="topnav-links">
                {navItems.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`topnav-link ${isActive ? 'active' : ''}`}
                            title={item.label}
                        >
                            <Icon size={16} />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Right section */}
            <div className="topnav-actions">
                <div className="header-search">
                    <Search className="search-icon" size={15} />
                    <input type="text" placeholder="Search..." />
                </div>
                <button className="header-icon-btn">
                    <Bell size={18} />
                    <span className="notification-dot"></span>
                </button>

                {/* User avatar + dropdown */}
                <div className="user-menu-wrapper" ref={menuRef}>
                    <button
                        className="user-menu-trigger"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        title={user.name}
                    >
                        <div className="header-avatar">{initials}</div>
                        <ChevronDown size={14} style={{
                            color: 'var(--text-tertiary)',
                            transition: 'transform 180ms ease',
                            transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0)'
                        }} />
                    </button>

                    {showUserMenu && (
                        <div className="user-dropdown">
                            <div className="user-dropdown-header">
                                <div className="user-dropdown-avatar">{initials}</div>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)' }}>
                                        {user.name}
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                        {user.email}
                                    </div>
                                    <div style={{
                                        fontSize: '11px', color: 'var(--color-primary-600)',
                                        fontWeight: 600, marginTop: '2px'
                                    }}>
                                        {user.role}
                                    </div>
                                </div>
                            </div>
                            <div className="user-dropdown-divider" />
                            <button className="user-dropdown-item" onClick={() => { setShowUserMenu(false); navigate('/settings'); }}>
                                <User size={15} /> Profile & Settings
                            </button>
                            <div className="user-dropdown-divider" />
                            <button className="user-dropdown-item logout" onClick={handleLogout}>
                                <LogOut size={15} /> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
