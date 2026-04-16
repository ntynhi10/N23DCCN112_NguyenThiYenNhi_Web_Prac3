'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const fetchProducts = async () => {
    const res = await api.get('/api/products');
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      await api.post('/api/products', {
        name,
        price: Number(price) 
      });

      setName('');
      setPrice('');
      fetchProducts();

    } catch (err: any) {
      console.error(err.response?.data?.error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder='Tên SP'
        />
        <input
          value={price}
          onChange={e => setPrice(e.target.value)}
          placeholder='Giá'
          type='number'
        />
        <button type='submit'>Thêm sản phẩm</button>
      </form>

      {products.map((p: any) => (
        <div key={p.id}>
          {p.name} — {Number(p.price).toLocaleString()}đ
        </div>
      ))}
    </div>
  );
}