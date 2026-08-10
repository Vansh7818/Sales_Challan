import { useAuth } from '../contexts/AuthContext';
import { Users, Package, FileText, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    challans: 0
  });

  useEffect(() => {
    // Quick fetch for counts (for MVP)
    const fetchStats = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const [cRes, pRes, chRes] = await Promise.all([
          fetch('/api/customers', { headers }),
          fetch('/api/products', { headers }),
          fetch('/api/challans', { headers }),
        ]);

        const [customers, products, challans] = await Promise.all([
          cRes.json(), pRes.json(), chRes.json()
        ]);

        setStats({
          customers: customers.length || 0,
          products: products.length || 0,
          challans: challans.length || 0,
        });
      } catch (e) {
        console.error(e);
      }
    };

    fetchStats();
  }, [token]);

  return (
    <div className="container">
      <div className="mb-6">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Welcome back, {user?.name}!</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Here's an overview of your operations today.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: 'var(--radius-lg)' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Total Customers</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.customers}</h3>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-success-light)', color: '#065F46', borderRadius: 'var(--radius-lg)' }}>
            <Package size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Total Products</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.products}</h3>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-warning-light)', color: '#92400E', borderRadius: 'var(--radius-lg)' }}>
            <FileText size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Total Challans</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.challans}</h3>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-danger-light)', color: '#991B1B', borderRadius: 'var(--radius-lg)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Revenue</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>$ --</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
