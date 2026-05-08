import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  signup:   (data) => api.post('/auth/signup', data),
  login:    (data) => api.post('/auth/login', data),
  getMe:    ()     => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', data),
};

export const productApi = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct:  (id)     => api.get(`/products/${id}`),
};

export const categoryApi = {
  getCategories: () => api.get('/categories'),
};

export const cartApi = {
  getCart:      ()           => api.get('/cart'),
  getCartCount: ()           => api.get('/cart/count'),
  addCart:      (data)       => api.post('/cart', data),
  updateCart:   (id, data)   => api.patch(`/cart/${id}`, data),
  deleteCart:   (id)         => api.delete(`/cart/${id}`),
  clearCart:    ()           => api.delete('/cart'),
};

export const orderApi = {
  createOrder:    (data)    => api.post('/orders', data),
  confirmPayment: (id, data)=> api.post(`/orders/${id}/confirm-payment`, data),
  getOrders:      (params)  => api.get('/orders', { params }),
  getOrder:       (id)      => api.get(`/orders/${id}`),
  cancelOrder:    (id)      => api.post(`/orders/${id}/cancel`),
};

export const reviewApi = {
  getReviews:   (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  createReview: (data)              => api.post('/reviews', data),
  updateReview: (id, data)          => api.patch(`/reviews/${id}`, data),
  deleteReview: (id)                => api.delete(`/reviews/${id}`),
};

export const inquiryApi = {
  getInquiries:   (productId, params) => api.get(`/inquiries/product/${productId}`, { params }),
  createInquiry:  (data)              => api.post('/inquiries', data),
  addReply:       (id, data)          => api.post(`/inquiries/${id}/reply`, data),
};

export const wishApi = {
  toggleWish: (productId) => api.post(`/wishes/${productId}`),
  getWishes:  (params)    => api.get('/wishes', { params }),
};

export const couponApi = {
  registerCoupon: (code)  => api.post('/coupons/register', { code }),
  getMyCoupons:   ()      => api.get('/coupons/my'),
};

export const adminApi = {
  createProduct: (form)         => api.post('/admin/products', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateProduct: (id, form)     => api.patch(`/admin/products/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteProduct: (id)           => api.delete(`/admin/products/${id}`),
  createCategory:(data)         => api.post('/admin/categories', data),
  updateCategory:(id, data)     => api.patch(`/admin/categories/${id}`, data),
  deleteCategory:(id)           => api.delete(`/admin/categories/${id}`),
  getOrders:     (params)       => api.get('/admin/orders', { params }),
  updateOrderStatus:(id, status)=> api.patch(`/admin/orders/${id}/status`, { status }),
  createCoupon:  (data)         => api.post('/admin/coupons', data),
};

export default api;
