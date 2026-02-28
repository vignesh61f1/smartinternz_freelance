import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiBell, FiMenu, FiX, FiLogOut, FiUser } from 'react-icons/fi';
import NotificationDropdown from '../notification/NotificationDropdown';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) return [];
    switch (user.role) {
      case 'client':
        return [
          { to: '/client/dashboard', label: 'Dashboard' },
          { to: '/client/post-project', label: 'Post Project' },
        ];
      case 'freelancer':
        return [
          { to: '/freelancer/dashboard', label: 'Dashboard' },
          { to: '/freelancer/browse', label: 'Browse Projects' },
          { to: '/freelancer/my-bids', label: 'My Bids' },
        ];
      case 'admin':
        return [
          { to: '/admin/dashboard', label: 'Dashboard' },
          { to: '/admin/users', label: 'Users' },
          { to: '/admin/projects', label: 'Projects' },
        ];
      default:
        return [];
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-sb">SB</span> Works
        </Link>

        {user && (
          <>
            <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
              {getNavLinks().map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="nav-link"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="navbar-actions">
              <div className="notification-wrapper">
                <button
                  className="icon-btn"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <FiBell />
                </button>
                {showNotifications && (
                  <NotificationDropdown
                    onClose={() => setShowNotifications(false)}
                  />
                )}
              </div>

              <Link to="/profile" className="icon-btn">
                <FiUser />
              </Link>

              <button className="icon-btn" onClick={handleLogout} title="Logout">
                <FiLogOut />
              </button>

              <span className="user-role-badge">{user.role}</span>

              <button
                className="mobile-menu-btn"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <FiX /> : <FiMenu />}
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
