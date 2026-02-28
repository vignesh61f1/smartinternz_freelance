const StatusBadge = ({ status }) => {
  const colorMap = {
    open: '#22c55e',
    'in-progress': '#3b82f6',
    completed: '#8b5cf6',
    cancelled: '#ef4444',
    disputed: '#f59e0b',
    pending: '#6b7280',
    accepted: '#22c55e',
    rejected: '#ef4444',
    withdrawn: '#9ca3af',
    submitted: '#3b82f6',
    'under-review': '#f59e0b',
    'revision-requested': '#f97316',
  };

  return (
    <span
      className="status-badge"
      style={{ backgroundColor: colorMap[status] || '#6b7280' }}
    >
      {status?.replace(/-/g, ' ')}
    </span>
  );
};

export default StatusBadge;
