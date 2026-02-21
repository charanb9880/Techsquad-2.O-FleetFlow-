export default function KPICard({ label, value, icon: Icon, variant = 'primary', change, changeType }) {
    return (
        <div className={`kpi-card ${variant}`}>
            <div className="kpi-header">
                <span className="kpi-label">{label}</span>
                {Icon && (
                    <div className="kpi-icon">
                        <Icon size={20} />
                    </div>
                )}
            </div>
            <div className="kpi-value">{value}</div>
            {change && (
                <div className={`kpi-change ${changeType || 'positive'}`}>
                    {changeType === 'negative' ? '↓' : '↑'} {change}
                </div>
            )}
        </div>
    );
}
