'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function ProductsPage() {
  /* const [products, setProducts] = useState<any[]>([]); */
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  /* const fetchProducts = async () => {
    const res = await api.get('/api/products');
    setProducts(res.data);
  }; */

  /* useEffect(() => {
    fetchProducts();
  }, []); */
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/api/products').then(r => r.data)
  });

  const handleSubmit = async (e: any) => {
  e.preventDefault();

  if (!name || !price) {
    toast.error('Vui lòng nhập đầy đủ thông tin!');
    return;
  }

  try {
    await toast.promise(
      api.post('/api/products', {
        name,
        price: Number(price)
      }),
      {
        loading: 'Đang lưu...',
        success: 'Thêm sản phẩm thành công!',
        error: 'Có lỗi xảy ra!'
      }
    );

    setName('');
    setPrice('');
    /* fetchProducts(); */
    queryClient.invalidateQueries({ queryKey: ['products'] });

  } catch (err: any) {
    console.error(err.response?.data?.error);
  }
};

const queryClient = useQueryClient();

const deleteMutation = useMutation({
  mutationFn: (id: number) => api.delete(`/api/products/${id}`),

  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    toast.success('Đã xoá sản phẩm');
  },

  onError: () => toast.error('Xoá thất bại!'),
});

const handleDelete = (id: number) => {
  if (!confirm('Bạn chắc chắn muốn xoá?')) return;
  deleteMutation.mutate(id);
};

const handleEdit = (p: any) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditPrice(String(p.price));
  };

  const handleUpdate = async (id: number) => {
    try {
      await api.put(`/api/products/${id}`, {
        name: editName,
        price: Number(editPrice),
      });

      toast.success('Cập nhật thành công');
      setEditingId(null);
      /* fetchProducts(); */
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch {
      toast.error('Cập nhật thất bại');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Tên SP"
        />
        <input
          value={price}
          onChange={e => setPrice(e.target.value)}
          placeholder="Giá"
          type="number"
        />
        <button type="submit">Thêm sản phẩm</button>
      </form>

      {products.map((p: any) => (
        <div
          key={p.id}
          className="flex justify-between items-center p-3 border rounded mb-2"
        >
          {editingId === p.id ? (
            <div className="flex gap-2 items-center">
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="border px-2"
              />
              <input
                value={editPrice}
                onChange={e => setEditPrice(e.target.value)}
                type="number"
                className="border px-2 w-24"
              />

              <button
                onClick={() => handleUpdate(p.id)}
                className="bg-green-500 text-white px-2"
              >
                Lưu
              </button>

              <button
                onClick={() => setEditingId(null)}
                className="text-gray-500"
              >
                Huỷ
              </button>
            </div>
          ) : (
            <>
              <span>
                {p.name} — {Number(p.price).toLocaleString()}đ
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Xoá
                </button>

                <button
                  onClick={() => handleEdit(p)}
                  className="text-blue-500 text-sm"
                >
                  Sửa
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}