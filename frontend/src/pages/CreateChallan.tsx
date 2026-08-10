import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, CheckCircle } from 'lucide-react';

const CreateChallan = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1 }]);
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const [cRes, pRes] = await Promise.all([
          fetch('http://localhost:5000/api/customers?status=ACTIVE', { headers }),
          fetch('http://localhost:5000/api/products', { headers })
        ]);
        setCustomers(await cRes.json());
        setProducts(await pRes.json());
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [token]);

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const validItems = items.filter(i => i.productId && i.quantity > 0);
      if (validItems.length === 0) {
        throw new Error('Please add at least one product');
      }

      const res = await fetch('http://localhost:5000/api/challans', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customerId: selectedCustomer,
          items: validItems.map(i => ({ productId: i.productId, quantity: Number(i.quantity) }))
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create challan');
      }

      navigate('/challans');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="mb-6">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Create Sales Challan</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Generate a new draft challan.</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-6">
            <label className="form-label">Select Customer</label>
            <select 
              className="form-select"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              required
            >
              <option value="">-- Select a Customer --</option>
              {customers.map((c: any) => (
                <option key={c.id} value={c.id}>{c.businessName || c.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-4 flex justify-between items-center">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Products</h3>
            <button type="button" className="btn btn-secondary gap-2" onClick={handleAddItem}>
              <Plus size={16} /> Add Row
            </button>
          </div>

          <div className="table-wrapper mb-6">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ width: '150px' }}>Current Stock</th>
                  <th style={{ width: '150px' }}>Quantity</th>
                  <th style={{ width: '80px' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const selectedProduct = products.find((p: any) => p.id === item.productId) as any;
                  return (
                    <tr key={index}>
                      <td>
                        <select 
                          className="form-select"
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                          required
                        >
                          <option value="">-- Select Product --</option>
                          {products.map((p: any) => (
                            <option key={p.id} value={p.id}>
                              {p.sku} - {p.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        {selectedProduct ? (
                          <span className={selectedProduct.currentStock < item.quantity ? 'badge badge-danger' : 'badge badge-success'}>
                            {selectedProduct.currentStock} in stock
                          </span>
                        ) : '-'}
                      </td>
                      <td>
                        <input 
                          type="number" 
                          className="form-input"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        {items.length > 1 && (
                          <button 
                            type="button"
                            className="btn btn-danger" 
                            style={{ padding: '0.25rem 0.5rem' }}
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-4 border-t pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/challans')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary gap-2" disabled={isSubmitting}>
              <Save size={16} /> {isSubmitting ? 'Saving...' : 'Save Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChallan;
