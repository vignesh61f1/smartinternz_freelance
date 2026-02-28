import { useState, useEffect, useRef } from 'react';
import notificationService from '../../services/notificationService';
import { FiCheck } from 'react-icons/fi';

const NotificationDropdown = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await notificationService.getNotifications({ limit: 10 });
        setNotifications(res.data.data);
      } catch (err) {
        console.error('Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error('Failed to mark notifications as read');
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="notification-dropdown" ref={ref}>
      <div className="notification-header">
        <h4>Notifications</h4>
        <button className="mark-read-btn" onClick={handleMarkAllRead}>
          <FiCheck /> Mark all read
        </button>
      </div>
      <div className="notification-list">
        {loading ? (
          <p className="notification-empty">Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="notification-empty">No notifications</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`notification-item ${!n.isRead ? 'unread' : ''}`}
            >
              <p className="notification-title">{n.title}</p>
              <p className="notification-message">{n.message}</p>
              <span className="notification-time">{formatTime(n.createdAt)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
