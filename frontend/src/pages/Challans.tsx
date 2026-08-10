import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye } from 'lucide-react';

const Challans = () => {
  const { token, user } = useAuth();
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/challans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setChallans(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [token]);

  const canAdd = user?.role === 'ADMIN' || user?.role === 'SALES';

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Sales Challans</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Manage delivery challans and shipments.</p>
        </div>
        {canAdd && (
          <Link to="/challans/new" className="btn btn-primary gap-2" style={{ textDecoration: 'none' }}>
            <Plus size={16} /> Create Challan
          </Link>
        )}
      </div>

      <div className="card mb-6 flex items-center gap-2" style={{ padding: '1rem' }}>
        <Search size={20} color="var(--color-text-muted)" />
        <input 
          type="text" 
          placeholder="Search by challan number..." 
          className="form-input" 
          style={{ border: 'none', boxShadow: 'none' }}
        />
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Challan No</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total Qty</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : challans.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>No challans found.</td></tr>
            ) : (
              challans.map((c: any) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{c.challanNo}</td>
                  <td>{c.customer?.businessName || c.customer?.name}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>{c.totalQty}</td>
                  <td>
                    <span className={`badge ${c.status === 'CONFIRMED' ? 'badge-success' : c.status === 'DRAFT' ? 'badge-warning' : 'badge-danger'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Challans;
