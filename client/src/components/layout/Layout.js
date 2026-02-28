import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="app-layout">
      {user && <Navbar />}
      <main className={user ? 'main-content' : 'main-content-full'}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
