export default function StatusBadge({ status }) {
    const classMap = {
        'Available': 'badge-available',
        'On Trip': 'badge-on-trip',
        'In Shop': 'badge-in-shop',
        'Out of Service': 'badge-out-of-service',
        'Draft': 'badge-draft',
        'Dispatched': 'badge-dispatched',
        'Completed': 'badge-completed',
        'Cancelled': 'badge-cancelled',
        'On Duty': 'badge-on-duty',
        'Off Duty': 'badge-off-duty',
        'Suspended': 'badge-suspended',
        'Valid': 'badge-valid',
        'Expired': 'badge-expired',
        'Expiring': 'badge-expiring',
        'In Progress': 'badge-on-trip',
    };

    const className = classMap[status] || 'badge-draft';

    return (
        <span className={`badge ${className}`}>
            {status}
        </span>
    );
}
