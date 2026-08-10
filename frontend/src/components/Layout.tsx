import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, Package, FileText, LogOut } from 'lucide-react';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/customers', label: 'Customers', icon: Users },
    { path: '/products', label: 'Products', icon: Package },
    { path: '/challans', label: 'Sales Challans', icon: FileText },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Mini ERP</h2>
          <span className="badge badge-primary">{user?.role}</span>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                             (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">{user?.name?.charAt(0)}</div>
            <div>
              <p className="user-name">{user?.name}</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
          <button className="btn btn-secondary w-full flex items-center justify-center gap-2 mt-4" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
      
      <main className="main-content">
        <header className="topbar">
          <div className="container flex justify-between items-center">
            <h1>{navItems.find(i => location.pathname === i.path || (i.path !== '/' && location.pathname.startsWith(i.path)))?.label || 'Dashboard'}</h1>
            <div className="topbar-actions">
              {/* Add global actions here if needed */}
            </div>
          </div>
        </header>
        <div className="content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
