import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, Edit2 } from 'lucide-react';

const Customers = () => {
  const { token, user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const query = search ? `?search=${search}` : '';
      const res = await fetch(`http://localhost:5000/api/customers${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCustomers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, token]);

  const canAdd = user?.role === 'ADMIN' || user?.role === 'SALES';

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Customers</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Manage your CRM contacts.</p>
        </div>
        {canAdd && (
          <button className="btn btn-primary gap-2">
            <Plus size={16} /> Add Customer
          </button>
        )}
      </div>

      <div className="card mb-6 flex items-center gap-2" style={{ padding: '1rem' }}>
        <Search size={20} color="var(--color-text-muted)" />
        <input 
          type="text" 
          placeholder="Search by name, business or mobile..." 
          className="form-input" 
          style={{ border: 'none', boxShadow: 'none' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Business Name</th>
              <th>Mobile</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>No customers found.</td></tr>
            ) : (
              customers.map((c: any) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td>{c.businessName}</td>
                  <td>{c.mobile}</td>
                  <td>
                    <span className="badge badge-primary">{c.type}</span>
                  </td>
                  <td>
                    <span className={`badge ${c.status === 'ACTIVE' ? 'badge-success' : c.status === 'LEAD' ? 'badge-warning' : 'badge-danger'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>
                      <Edit2 size={14} />
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

export default Customers;
