import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, Layers } from 'lucide-react';

const Products = () => {
  const { token, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const query = search ? `?search=${search}` : '';
      const res = await fetch(`http://localhost:5000/api/products${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, token]);

  const canAdd = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Inventory & Products</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Manage stock levels and product catalog.</p>
        </div>
        {canAdd && (
          <button className="btn btn-primary gap-2">
            <Plus size={16} /> Add Product
          </button>
        )}
      </div>

      <div className="card mb-6 flex items-center gap-2" style={{ padding: '1rem' }}>
        <Search size={20} color="var(--color-text-muted)" />
        <input 
          type="text" 
          placeholder="Search by product name or SKU..." 
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
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Unit Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>No products found.</td></tr>
            ) : (
              products.map((p: any) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'monospace' }}>{p.sku}</td>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td>{p.category}</td>
                  <td>${p.unitPrice.toFixed(2)}</td>
                  <td style={{ fontWeight: 600 }}>{p.currentStock}</td>
                  <td>
                    {p.currentStock <= p.minStockAlert ? (
                      <span className="badge badge-danger">Low Stock</span>
                    ) : (
                      <span className="badge badge-success">In Stock</span>
                    )}
                  </td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>
                      <Layers size={14} />
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

export default Products;
