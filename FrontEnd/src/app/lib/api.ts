const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? 'http://localhost:5247';

// ─── Cloudinary Config ────────────────────────────────────────────────────────
const CLOUDINARY_CLOUD = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD ?? 'YOUR_CLOUD_NAME';
const CLOUDINARY_PRESET = (import.meta as any).env?.VITE_CLOUDINARY_PRESET ?? 'YOUR_UPLOAD_PRESET';

export async function uploadToCloudinary(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', CLOUDINARY_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error('Upload ảnh thất bại');
  const data = await res.json();
  return data.secure_url as string;
}

export async function addProductImageUrl(productId: string | number, imageUrl: string, isPrimary = false): Promise<string> {
  const res = await apiFetch(`/api/products/${productId}/image-url`, {
    method: 'POST',
    body: JSON.stringify({ imageUrl, isPrimary }),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).message || 'Lưu ảnh thất bại'); }
  const data = await res.json();
  return data.imageUrl as string;
}

// ─── Token Management ────────────────────────────────────────────────────────
const isAdminPath = () => window.location.pathname.startsWith('/admin');
export const getToken = (): string | null => localStorage.getItem(isAdminPath() ? 'leon_admin_token' : 'leon_token');
export const setToken = (token: string) => localStorage.setItem(isAdminPath() ? 'leon_admin_token' : 'leon_token', token);
export const clearToken = () => localStorage.removeItem(isAdminPath() ? 'leon_admin_token' : 'leon_token');

// ─── Authenticated Fetch ─────────────────────────────────────────────────────
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    ...((options.headers as Record<string, string>) ?? {}),
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    clearToken();
    localStorage.removeItem('leon_user');
    const isAdmin = window.location.pathname.startsWith('/admin');
    window.location.href = isAdmin ? '/admin/login' : '/login';
    throw new Error('Unauthorized');
  }
  return res;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginResponse {
  token: string;
  userId: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: string;
}

export async function loginApi(identifier: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message || 'Đăng nhập thất bại');
  }
  return res.json();
}

export async function registerApi(data: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}): Promise<LoginResponse> {
  const username = data.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(Math.random() * 1000);
  const res = await fetch(`${API_BASE}/user/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, username, confirmPassword: data.password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message || 'Đăng ký thất bại');
  }
  // Registration returns UserResponse (no token), so auto-login to get token
  return loginApi(data.email, data.password);
}

export async function getProfileApi(): Promise<LoginResponse> {
  const res = await apiFetch('/user/profile');
  if (!res.ok) throw new Error('Không thể tải thông tin');
  return res.json();
}

export async function updateProfileApi(userId: string | number, data: Record<string, unknown>): Promise<void> {
  const res = await apiFetch(`/user/profile/${userId}`, { method: 'PUT', body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).message || 'Cập nhật thất bại'); }
}

export async function deleteAccountApi(userId: string | number): Promise<void> {
  const res = await apiFetch(`/user/${userId}`, { method: 'DELETE' });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).message || 'Xóa tài khoản thất bại'); }
}

export async function changePasswordApi(data: { currentPassword: string; newPassword: string }): Promise<void> {
  const res = await apiFetch('/user/change-password', { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).message || 'Đổi mật khẩu thất bại'); }
}

// ─── Products ─────────────────────────────────────────────────────────────────
export interface ApiProduct {
  productId: string;
  productName: string;
  sku: string;
  categoryId: number;
  categoryName: string;
  basePrice: number;
  salePrice?: number;
  description: string;
  imageUrl?: string;
  thumbnail?: string;
  images?: string[];
  isActive: boolean;
  variants: ApiVariant[];
  totalStock?: number;
  createdAt?: string;
  material?: string;
}

export interface ApiVariant {
  variantId: string;
  sku: string;
  size?: string;
  sizeName?: string;
  color?: string;
  colorName?: string;
  price: number;
  stock: number;
}

export function mapApiProduct(p: ApiProduct) {
  const imgs = p.images?.length
    ? p.images
    : [p.imageUrl || p.thumbnail || 'https://placehold.co/400x400?text=No+Image'];
  const basePrice = p.basePrice || (p as any).price || 0;
  const variants = (p.variants && p.variants.length > 0)
    ? p.variants.map(v => ({
        id: String(v.variantId),
        productId: String(p.productId),
        size: v.size || v.sizeName || '',
        color: v.color || v.colorName || '',
        price: v.price ?? basePrice,
        stock: v.stock ?? 0,
        sku: v.sku || '',
      }))
    : [{
        id: 'default',
        productId: String(p.productId),
        size: '',
        color: '',
        price: basePrice,
        stock: p.totalStock ?? 0,
        sku: p.sku || '',
      }];
  return {
    id: String(p.productId),
    code: p.sku || '',
    name: p.productName,
    description: p.description || '',
    material: p.material || '',
    category: p.categoryName || '',
    basePrice,
    salePrice: p.salePrice || undefined,
    images: imgs,
    status: (p.isActive === false ? 'inactive' : 'active') as 'active' | 'inactive',
    variants,
    createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
  };
}

export async function getProducts(): Promise<ApiProduct[]> {
  const res = await apiFetch('/api/products');
  if (!res.ok) throw new Error('Không thể tải sản phẩm');
  return res.json();
}

export async function getProductById(id: string): Promise<ApiProduct> {
  const res = await apiFetch(`/api/products/${id}`);
  if (!res.ok) throw new Error('Không tìm thấy sản phẩm');
  return res.json();
}

export async function getFeaturedProducts(filter: 'bestseller' | 'new', take = 8): Promise<ApiProduct[]> {
  const res = await apiFetch(`/api/products/featured?filter=${filter}&take=${take}`);
  if (!res.ok) return [];
  return res.json();
}

export async function searchProductSuggestions(query: string, take = 6): Promise<ApiProduct[]> {
  const res = await apiFetch(`/api/products/search-suggestions?query=${encodeURIComponent(query)}&take=${take}`);
  if (!res.ok) return [];
  return res.json();
}

export async function createProduct(data: Record<string, unknown>): Promise<{ productId: number }> {
  const res = await apiFetch('/api/products', { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).message || 'Thêm sản phẩm thất bại'); }
  return res.json();
}

export async function toggleProductStatus(id: string): Promise<void> {
  const res = await apiFetch(`/api/products/${id}/toggle-status`, { method: 'PATCH' });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).message || 'Thao tác thất bại'); }
}

export async function updateProduct(id: string, data: Record<string, unknown>): Promise<ApiProduct> {
  const res = await apiFetch(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).message || 'Cập nhật thất bại'); }
  return res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Xóa thất bại');
}

// ─── Sizes & Colors ───────────────────────────────────────────────────────────
export async function getSizes(): Promise<{ sizeId: number; sizeName: string }[]> {
  const res = await apiFetch('/api/sizes');
  if (!res.ok) return [];
  return res.json();
}

export async function getColors(): Promise<{ colorId: number; colorName: string }[]> {
  const res = await apiFetch('/api/colors');
  if (!res.ok) return [];
  return res.json();
}

// ─── Categories ───────────────────────────────────────────────────────────────
export interface ApiCategory {
  categoryId: number;
  categoryName: string;
  slug?: string;
  parentId?: number;
  isVisible: boolean;
  description?: string;
}

export async function getCategories(): Promise<ApiCategory[]> {
  const res = await apiFetch('/api/category');
  if (!res.ok) return [];
  return res.json();
}

export async function createCategory(data: Record<string, unknown>): Promise<ApiCategory> {
  const res = await apiFetch('/api/category', { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).message || 'Thêm thất bại'); }
  return res.json();
}

export async function updateCategory(id: number, data: Record<string, unknown>): Promise<ApiCategory> {
  const res = await apiFetch(`/api/category/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).message || 'Cập nhật thất bại'); }
  return res.json();
}

export async function deleteCategory(id: number): Promise<void> {
  const res = await apiFetch(`/api/category/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Xóa thất bại');
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export interface ApiOrder {
  orderId: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  orderDate?: string;
  createdAt?: string;
  totalAmount?: number;
  total?: number;
  subtotal?: number;
  discount: number;
  shippingFee?: number;
  orderStatus?: string;
  status?: string;
  paymentStatus: string;
  paymentMethod?: string;
  shippingAddress?: string | Record<string, unknown>;
  recipientName?: string;
  recipientPhone?: string;
  note?: string;
  type?: 'online' | 'pos';
  items?: ApiOrderItem[];
}

export interface ApiOrderItem {
  orderItemId?: string;
  variantId: string;
  productName: string;
  variantLabel?: string;
  sizeName?: string;
  colorName?: string;
  quantity: number;
  price: number;
  image?: string;
  thumbnail?: string;
}

// ─── Addresses ────────────────────────────────────────────────────────────────
export interface ApiAddress {
  addressId: number;
  recipientName: string;
  phone: string;
  province?: string;
  district?: string;
  ward?: string;
  streetAddress?: string;
  addressType?: string;
  isDefault?: boolean;
}

export function formatAddress(addr: ApiAddress): string {
  return [addr.streetAddress, addr.ward, addr.district, addr.province]
    .filter(Boolean).join(', ');
}

export async function getAddresses(userId: string | number): Promise<ApiAddress[]> {
  const res = await apiFetch(`/user/${userId}/addresses`);
  if (!res.ok) return [];
  return res.json();
}

export async function createAddress(userId: string | number, data: Omit<ApiAddress, 'addressId'>): Promise<ApiAddress> {
  const res = await apiFetch(`/user/${userId}/addresses`, { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).message || 'Thêm địa chỉ thất bại'); }
  return res.json();
}

export async function deleteAddress(userId: string | number, addressId: number): Promise<void> {
  const res = await apiFetch(`/user/${userId}/addresses/${addressId}`, { method: 'DELETE' });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error((e as any).message || 'Xóa địa chỉ thất bại');
  }
}

export async function getOrders(params?: Record<string, string>): Promise<ApiOrder[]> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await apiFetch(`/api/order${qs}`);
  if (!res.ok) return [];
  return res.json();
}

export async function getAdminOrders(): Promise<ApiOrder[]> {
  const res = await apiFetch('/api/order/all');
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error((e as any).message || `Lỗi ${res.status}: Không thể tải đơn hàng`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : (data.items ?? []);
}

export async function getOrderById(id: string): Promise<ApiOrder> {
  const res = await apiFetch(`/api/order/${id}`);
  if (!res.ok) throw new Error('Không tìm thấy đơn hàng');
  return res.json();
}

export async function createOrder(data: Record<string, unknown>): Promise<ApiOrder> {
  const res = await apiFetch('/api/order', { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).message || 'Đặt hàng thất bại'); }
  return res.json();
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  const res = await apiFetch(`/api/order/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  if (!res.ok) throw new Error('Cập nhật trạng thái thất bại');
}

export async function cancelOrder(id: string): Promise<void> {
  const res = await apiFetch(`/api/order/${id}/cancel`, { method: 'PUT' });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error((e as any).message || 'Hủy đơn hàng thất bại');
  }
}

// ─── Customers ────────────────────────────────────────────────────────────────
export interface ApiCustomer {
  customerId?: string;
  userId?: string | number;
  email: string;
  phone: string;
  fullName: string;
  username?: string;
  status?: 'active' | 'locked';
  totalOrders?: number;
  totalSpent?: number;
  createdAt?: string;
  addresses?: unknown[];
}

export async function getCustomers(): Promise<ApiCustomer[]> {
  const res = await apiFetch('/api/customer/search');
  if (!res.ok) return [];
  return res.json();
}

export async function getCustomerById(id: string): Promise<ApiCustomer> {
  const res = await apiFetch(`/api/customer/${id}`);
  if (!res.ok) throw new Error('Không tìm thấy khách hàng');
  return res.json();
}

export async function toggleCustomerLock(id: string | number): Promise<ApiCustomer> {
  const res = await apiFetch(`/api/customer/${id}/toggle-lock`, { method: 'PATCH' });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).message || 'Thất bại'); }
  const data = await res.json();
  return data.customer ?? data;
}

export async function updateCustomer(data: { userId: number; fullName: string; email: string; phone: string }): Promise<ApiCustomer> {
  const res = await apiFetch('/api/customer', { method: 'PUT', body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).message || 'Cập nhật thất bại'); }
  return res.json();
}

export async function resetCustomerPassword(id: string | number, newPassword: string): Promise<void> {
  const res = await apiFetch(`/api/customer/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ newPassword })
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).message || 'Đặt lại mật khẩu thất bại'); }
}

// ─── Staff ────────────────────────────────────────────────────────────────────
export interface ApiStaff {
  staffId?: string;
  userId?: number;
  email: string;
  phone?: string;
  fullName: string;
  username: string;
  role: string;
  status: 'active' | 'locked';
  createdAt?: string;
}

export async function getStaff(): Promise<ApiStaff[]> {
  const res = await apiFetch('/api/admin/staff');
  if (!res.ok) return [];
  return res.json();
}

export async function createStaff(data: Record<string, unknown>): Promise<ApiStaff> {
  const res = await apiFetch('/api/admin/staff', { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).message || 'Thêm thất bại'); }
  return res.json();
}

export async function updateStaff(id: string, data: Record<string, unknown>): Promise<ApiStaff> {
  const res = await apiFetch(`/api/admin/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).message || 'Cập nhật thất bại'); }
  return res.json();
}

export async function toggleStaffLock(id: string | number): Promise<ApiStaff> {
  const res = await apiFetch(`/api/admin/staff/${id}/toggle-lock`, { method: 'PATCH' });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).message || 'Thất bại'); }
  const data = await res.json();
  return data.staff ?? data;
}

export async function deleteStaff(id: string): Promise<void> {
  const res = await apiFetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Xóa thất bại');
}

export async function resetStaffPassword(id: string | number, newPassword: string): Promise<void> {
  const res = await apiFetch(`/api/admin/staff/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ newPassword }) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).message || 'Đặt lại mật khẩu thất bại'); }
}

// ─── Discounts/Promotions ─────────────────────────────────────────────────────
export interface ApiDiscount {
  discountId: string;
  discountName: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  description?: string;
  usageLimit?: number;
  usedCount?: number;
  categoryNames?: string[];
}

function normalizeDiscount(d: any): ApiDiscount {
  return {
    discountId: String(d.discountId ?? d.promotionId ?? ''),
    discountName: d.name ?? d.discountName ?? d.code ?? '',
    code: d.code ?? '',
    type: (d.discountType === 'percent' || d.discountType === 'percentage') ? 'percentage' : 'fixed',
    value: d.discountValue ?? d.value ?? 0,
    startDate: d.startDate ?? '',
    endDate: d.endDate ?? '',
    isActive: d.isActive != null ? !!d.isActive : (d.status != null ? d.status === 'active' : true),
    description: d.description ?? '',
    minOrder: d.minOrder,
    maxDiscount: d.maxDiscount,
    categoryNames: d.categoryNames ?? [],
  };
}

export async function getDiscounts(): Promise<ApiDiscount[]> {
  const res = await apiFetch('/api/discounts');
  if (!res.ok) return [];
  const data = await res.json();
  return (data as any[]).map(normalizeDiscount);
}

export async function getAdminDiscounts(): Promise<ApiDiscount[]> {
  const res = await apiFetch('/api/discounts/all');
  if (!res.ok) return [];
  const data = await res.json();
  return (data as any[]).map(normalizeDiscount);
}

export async function createDiscount(data: Record<string, unknown>): Promise<ApiDiscount> {
  const res = await apiFetch('/api/discounts', { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).message || 'Thêm thất bại'); }
  return normalizeDiscount(await res.json());
}

export async function updateDiscount(id: string, data: Record<string, unknown>): Promise<ApiDiscount> {
  const res = await apiFetch(`/api/discounts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).message || 'Cập nhật thất bại'); }
  return normalizeDiscount(await res.json());
}

export async function deleteDiscount(id: string): Promise<void> {
  const res = await apiFetch(`/api/discounts/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Xóa thất bại');
}

export async function applyDiscount(code: string, subtotal: number): Promise<ApiDiscount> {
  const res = await apiFetch('/api/discounts/apply', {
    method: 'POST',
    body: JSON.stringify({ code, subtotal }),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).message || 'Mã không hợp lệ'); }
  return res.json();
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueGrowth?: number;
  orderGrowth?: number;
}

export async function getDashboardSummary(period?: string): Promise<DashboardSummary> {
  const query = period ? `?period=${period}` : '';
  const res = await apiFetch(`/api/dashboard/summary${query}`);
  if (!res.ok) throw new Error('Không thể tải dashboard');
  return res.json();
}

// ─── Inventory ────────────────────────────────────────────────────────────────
export interface ApiInventoryItem {
  variantId: string;
  productId?: string;  // Mã sản phẩm (Product ID)
  productName: string;
  sku: string;  // Mã biến thể
  size?: string;
  sizeName?: string;
  color?: string;
  colorName?: string;
  stock?: number;
  quantity?: number;
  minStock?: number;
  imageUrl?: string;
  thumbnail?: string;
}

export interface ApiInventoryLog {
  logId?: string;
  transactionId?: number;
  variantId: string | number;
  productName?: string;
  sku?: string;
  variantLabel?: string;
  type: string;
  quantity: number;
  previousStock?: number;
  newStock?: number;
  reason?: string;
  note?: string;
  notes?: string;
  staffName?: string;
  createdAt?: string;
}

export async function getInventory(): Promise<ApiInventoryItem[]> {
  const res = await apiFetch('/api/inventory');
  if (!res.ok) return [];
  return res.json();
}

export async function getInventoryLogs(): Promise<ApiInventoryLog[]> {
  const res = await apiFetch('/api/inventory/history');
  if (!res.ok) return [];
  return res.json();
}

export async function adjustInventory(data: { variantId: string; type: string; quantity: number; reason: string; notes?: string }): Promise<void> {
  const typeMap: Record<string, number> = { 'stock-in': 1, 'stock-out': 2, 'adjustment': 3 };
  const body = { variantId: Number(data.variantId), quantity: data.quantity, type: typeMap[data.type] ?? 3, note: data.reason || data.notes };
  const res = await apiFetch('/api/inventory/transaction', { method: 'POST', body: JSON.stringify(body) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).message || 'Điều chỉnh thất bại'); }
}
