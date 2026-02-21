import { Search, Bell } from 'lucide-react';

export default function Header({ title, collapsed }) {
    return (
        <header className={`header ${collapsed ? 'sidebar-collapsed' : ''}`}>
            <div className="header-left">
                <h1 className="header-title">{title}</h1>
            </div>

            <div className="header-right">
                <div className="header-search">
                    <Search className="search-icon" size={16} />
                    <input type="text" placeholder="Search vehicles, trips, drivers..." />
                </div>

                <button className="header-icon-btn">
                    <Bell size={20} />
                    <span className="notification-dot"></span>
                </button>

                <div className="header-avatar" title="Fleet Manager">
                    FM
                </div>
            </div>
        </header>
    );
}
