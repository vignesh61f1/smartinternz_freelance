import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div
      className="error-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '4rem', fontWeight: 700, color: '#6b7280', margin: 0 }}>404</h1>
      <p style={{ fontSize: '1.25rem', color: '#6b7280', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
        Page not found
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.25rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 500,
        }}
      >
        <FiHome size={18} />
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
