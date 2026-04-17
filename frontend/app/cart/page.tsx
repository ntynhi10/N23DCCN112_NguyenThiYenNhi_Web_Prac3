'use client';

import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function CartPage() {
  const queryClient = useQueryClient();

  //Lấy cart + merge product
  const { data: cart = [], isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const cartRes = await api.get('/api/cart');
      const productRes = await api.get('/api/products');

      return cartRes.data.map((item: any) => {
        const p = productRes.data.find(
          (x: any) => x.id === item.productId
        );

        return {
          ...item,
          name: p?.name || 'Không rõ',
          price: p?.price || 0
        };
      });
    }
  });

  //Xoá item
  const deleteMutation = useMutation({
    mutationFn: (productId: number) =>
      api.delete(`/api/cart/${productId}`),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Đã xoá khỏi giỏ');
    },

    onError: () => {
      toast.error('Xoá thất bại');
    }
  });

  if (isLoading) return <div>Đang tải...</div>;

  //Tính tổng tiền
  const total = cart.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

  return (
    <div style={{ padding: '20px' }}>
      <h2>🛒 Giỏ hàng</h2>

      {cart.length === 0 && <p>Giỏ hàng trống</p>}

      {cart.map((item: any) => (
        <div
          key={item._id || item.productId}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            border: '1px solid #ccc',
            padding: '10px',
            marginBottom: '10px'
          }}
        >
          <div>
            <p><b>{item.name}</b></p>
            <p>SL: {item.quantity}</p>
            <p>Giá: {item.price.toLocaleString()}đ</p>
          </div>

          <button
            onClick={() => deleteMutation.mutate(item.productId)}
            style={{
              color: 'white',
              background: 'red',
              border: 'none',
              padding: '5px 10px',
              cursor: 'pointer'
            }}
          >
            Xoá
          </button>
        </div>
      ))}

      {/*Tổng tiền */}
      {cart.length > 0 && (
        <h3>
          Tổng: {total.toLocaleString()}đ
        </h3>
      )}
    </div>
  );
}