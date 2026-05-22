// Mock data for the e-commerce application

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  material: string;
  category: string;
  basePrice: number;
  salePrice?: number;
  images: string[];
  status: 'active' | 'inactive';
  variants: ProductVariant[];
  createdAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  price?: number; // Override base price if set
  stock: number;
  sku: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  isVisible: boolean;
  description?: string;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: 'customer' | 'staff' | 'manager' | 'admin';
  addresses: Address[];
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid';
  paymentMethod: 'cod' | 'online' | 'cash' | 'transfer';
  shippingAddress: Address;
  type: 'online' | 'pos';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  quantity: number;
  price: number;
  image: string;
}

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  variantLabel: string;
  quantity: number;
  price: number;
  image: string;
  stock: number;
}

export interface Promotion {
  id: string;
  name: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder?: number;
  maxDiscount?: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'inactive';
  description: string;
  targets: PromotionTarget[];
}

export interface PromotionTarget {
  type: 'product' | 'category';
  id: string;
}

export interface InventoryLog {
  id: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  type: 'stock-in' | 'stock-out' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  notes?: string;
  staffId: string;
  staffName: string;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  createdAt: Date;
}

export interface StaffAccount {
  id: string;
  email: string;
  phone: string;
  name: string;
  username: string;
  status: 'active' | 'locked';
  createdAt: Date;
  createdBy?: string;
}

export interface Customer {
  id: string;
  email: string;
  phone: string;
  name: string;
  addresses: Address[];
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface Permission {
  module: string;
  actions: string[];
}

// Mock Categories
export const mockCategories: Category[] = [
  { id: '1', name: 'Áo thun', slug: 'ao-thun', isVisible: true },
  { id: '2', name: 'Áo sơ mi', slug: 'ao-so-mi', isVisible: true },
  { id: '3', name: 'Áo khoác', slug: 'ao-khoac', isVisible: true },
  { id: '4', name: 'Quần jean', slug: 'quan-jean', isVisible: true },
  { id: '5', name: 'Quần tây', slug: 'quan-tay', isVisible: true },
  { id: '6', name: 'Váy', slug: 'vay', isVisible: true },
  { id: '7', name: 'Phụ kiện', slug: 'phu-kien', isVisible: true },
  { id: '8', name: 'Áo thun nam', slug: 'ao-thun-nam', parentId: '1', isVisible: true },
  { id: '9', name: 'Áo thun nữ', slug: 'ao-thun-nu', parentId: '1', isVisible: true },
  { id: '10', name: 'Túi xách', slug: 'tui-xach', parentId: '7', isVisible: true },
  { id: '11', name: 'Nón', slug: 'non', parentId: '7', isVisible: true },
];

// Mock Products
export const mockProducts: Product[] = [
  {
    id: 'p1',
    code: 'TS001',
    name: 'Áo thun cotton basic trắng',
    description: 'Áo thun cotton 100% cao cấp, form regular fit thoải mái. Chất liệu mềm mại, thấm hút mồ hôi tốt.',
    material: 'Cotton 100%',
    category: 'Áo thun',
    basePrice: 299000,
    salePrice: 249000,
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
    ],
    status: 'active',
    variants: [
      { id: 'v1', productId: 'p1', size: 'S', color: 'Trắng', stock: 50, sku: 'TS001-S-W' },
      { id: 'v2', productId: 'p1', size: 'M', color: 'Trắng', stock: 80, sku: 'TS001-M-W' },
      { id: 'v3', productId: 'p1', size: 'L', color: 'Trắng', stock: 60, sku: 'TS001-L-W' },
      { id: 'v4', productId: 'p1', size: 'XL', color: 'Trắng', stock: 40, sku: 'TS001-XL-W' },
    ],
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'p2',
    code: 'TS002',
    name: 'Áo thun cotton basic đen',
    description: 'Áo thun cotton 100% cao cấp, form regular fit. Màu đen trơn dễ phối đồ.',
    material: 'Cotton 100%',
    category: 'Áo thun',
    basePrice: 299000,
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
    ],
    status: 'active',
    variants: [
      { id: 'v5', productId: 'p2', size: 'S', color: 'Đen', stock: 45, sku: 'TS002-S-B' },
      { id: 'v6', productId: 'p2', size: 'M', color: 'Đen', stock: 75, sku: 'TS002-M-B' },
      { id: 'v7', productId: 'p2', size: 'L', color: 'Đen', stock: 55, sku: 'TS002-L-B' },
      { id: 'v8', productId: 'p2', size: 'XL', color: 'Đen', stock: 30, sku: 'TS002-XL-B' },
    ],
    createdAt: new Date('2024-01-16'),
  },
  {
    id: 'p3',
    code: 'SM001',
    name: 'Áo sơ mi trắng công sở',
    description: 'Áo sơ mi cotton cao cấp, thiết kế thanh lịch phù hợp môi trường công sở.',
    material: 'Cotton pha 80/20',
    category: 'Áo sơ mi',
    basePrice: 449000,
    images: [
      'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800&q=80',
    ],
    status: 'active',
    variants: [
      { id: 'v9', productId: 'p3', size: 'M', color: 'Trắng', stock: 35, sku: 'SM001-M-W' },
      { id: 'v10', productId: 'p3', size: 'L', color: 'Trắng', stock: 40, sku: 'SM001-L-W' },
      { id: 'v11', productId: 'p3', size: 'XL', color: 'Trắng', stock: 25, sku: 'SM001-XL-W' },
    ],
    createdAt: new Date('2024-01-17'),
  },
  {
    id: 'p4',
    code: 'JK001',
    name: 'Áo khoác denim xanh',
    description: 'Áo khoác jean denim wash nhẹ, phong cách casual trẻ trung.',
    material: 'Denim cotton',
    category: 'Áo khoác',
    basePrice: 699000,
    salePrice: 599000,
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
    ],
    status: 'active',
    variants: [
      { id: 'v12', productId: 'p4', size: 'M', color: 'Xanh denim', stock: 20, sku: 'JK001-M-D' },
      { id: 'v13', productId: 'p4', size: 'L', color: 'Xanh denim', stock: 15, sku: 'JK001-L-D' },
      { id: 'v14', productId: 'p4', size: 'XL', color: 'Xanh denim', stock: 10, sku: 'JK001-XL-D' },
    ],
    createdAt: new Date('2024-01-18'),
  },
  {
    id: 'p5',
    code: 'QJ001',
    name: 'Quần jean slim fit xanh đen',
    description: 'Quần jean dáng slim fit ôm vừa vặn, tôn dáng. Chất jean dày dặn co giãn nhẹ.',
    material: 'Denim co giãn',
    category: 'Quần jean',
    basePrice: 549000,
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
    ],
    status: 'active',
    variants: [
      { id: 'v15', productId: 'p5', size: '29', color: 'Xanh đen', stock: 30, sku: 'QJ001-29-DB' },
      { id: 'v16', productId: 'p5', size: '30', color: 'Xanh đen', stock: 45, sku: 'QJ001-30-DB' },
      { id: 'v17', productId: 'p5', size: '31', color: 'Xanh đen', stock: 40, sku: 'QJ001-31-DB' },
      { id: 'v18', productId: 'p5', size: '32', color: 'Xanh đen', stock: 35, sku: 'QJ001-32-DB' },
    ],
    createdAt: new Date('2024-01-19'),
  },
  {
    id: 'p6',
    code: 'DRS001',
    name: 'Váy midi hoa nhí',
    description: 'Váy midi họa tiết hoa nhí nhẹ nhàng, dáng xòe thanh lịch.',
    material: 'Linen pha',
    category: 'Váy',
    basePrice: 399000,
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
    ],
    status: 'active',
    variants: [
      { id: 'v19', productId: 'p6', size: 'S', color: 'Hoa trắng', stock: 25, sku: 'DRS001-S-FW' },
      { id: 'v20', productId: 'p6', size: 'M', color: 'Hoa trắng', stock: 30, sku: 'DRS001-M-FW' },
      { id: 'v21', productId: 'p6', size: 'L', color: 'Hoa trắng', stock: 20, sku: 'DRS001-L-FW' },
    ],
    createdAt: new Date('2024-01-20'),
  },
  {
    id: 'p7',
    code: 'TS003',
    name: 'Áo thun polo nam',
    description: 'Áo thun polo cổ bẻ lịch sự, phù hợp đi làm và dạo phố.',
    material: 'Cotton pique',
    category: 'Áo thun',
    basePrice: 349000,
    images: [
      'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800&q=80',
    ],
    status: 'active',
    variants: [
      { id: 'v22', productId: 'p7', size: 'M', color: 'Xanh navy', stock: 40, sku: 'TS003-M-N' },
      { id: 'v23', productId: 'p7', size: 'L', color: 'Xanh navy', stock: 50, sku: 'TS003-L-N' },
      { id: 'v24', productId: 'p7', size: 'XL', color: 'Xanh navy', stock: 35, sku: 'TS003-XL-N' },
    ],
    createdAt: new Date('2024-01-21'),
  },
  {
    id: 'p8',
    code: 'AC001',
    name: 'Túi tote canvas đen',
    description: 'Túi tote canvas chắc chắn, thiết kế tối giản. Dung tích lớn tiện dụng.',
    material: 'Canvas cotton',
    category: 'Phụ kiện',
    basePrice: 199000,
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80',
    ],
    status: 'active',
    variants: [
      { id: 'v25', productId: 'p8', size: 'OneSize', color: 'Đen', stock: 60, sku: 'AC001-OS-B' },
    ],
    createdAt: new Date('2024-01-22'),
  },
];

// Mock Promotions
export const mockPromotions: Promotion[] = [
  {
    id: 'promo1',
    name: 'Giảm 20% cho đơn hàng từ 500k',
    code: 'WELCOME20',
    type: 'percentage',
    value: 20,
    minOrder: 500000,
    description: 'Giảm 20% cho đơn hàng từ 500k',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    status: 'active',
    targets: [
      { type: 'category', id: '1' },
      { type: 'category', id: '2' },
    ],
  },
  {
    id: 'promo2',
    name: 'Miễn phí vận chuyển cho đơn từ 300k',
    code: 'FREESHIP',
    type: 'fixed',
    value: 30000,
    minOrder: 300000,
    description: 'Miễn phí vận chuyển cho đơn từ 300k',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    status: 'active',
    targets: [
      { type: 'category', id: '1' },
      { type: 'category', id: '2' },
    ],
  },
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: 'ord1',
    orderNumber: 'ORD-2024-001',
    customerId: 'cust1',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    items: [
      {
        id: 'oi1',
        variantId: 'v2',
        productName: 'Áo thun cotton basic trắng',
        variantLabel: 'M / Trắng',
        quantity: 2,
        price: 249000,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80',
      },
    ],
    subtotal: 498000,
    discount: 0,
    total: 498000,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'online',
    shippingAddress: {
      id: 'addr1',
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      address: '123 Nguyễn Huệ, Q1, TP.HCM',
      isDefault: true,
    },
    type: 'online',
    createdAt: new Date('2024-01-23'),
    updatedAt: new Date('2024-01-23'),
  },
  {
    id: 'ord2',
    orderNumber: 'POS-2024-001',
    customerId: 'cust2',
    customerName: 'Lê Thị B',
    customerPhone: '0912345678',
    items: [
      {
        id: 'oi2',
        variantId: 'v6',
        productName: 'Áo thun cotton basic đen',
        variantLabel: 'M / Đen',
        quantity: 1,
        price: 299000,
        image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200&q=80',
      },
    ],
    subtotal: 299000,
    discount: 0,
    total: 299000,
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'cash',
    shippingAddress: {
      id: 'addr2',
      name: 'Lê Thị B',
      phone: '0912345678',
      address: 'Tại quầy',
      isDefault: true,
    },
    type: 'pos',
    createdAt: new Date('2024-01-24'),
    updatedAt: new Date('2024-01-24'),
  },
  {
    id: 'ord3',
    orderNumber: 'ORD-2024-002',
    customerId: 'cust3',
    customerName: 'Trần Văn C',
    customerPhone: '0923456789',
    items: [
      {
        id: 'oi3',
        variantId: 'v12',
        productName: 'Áo khoác denim xanh',
        variantLabel: 'M / Xanh denim',
        quantity: 1,
        price: 599000,
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&q=80',
      },
      {
        id: 'oi4',
        variantId: 'v16',
        productName: 'Quần jean slim fit xanh đen',
        variantLabel: '30 / Xanh đen',
        quantity: 1,
        price: 549000,
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&q=80',
      },
    ],
    subtotal: 1148000,
    discount: 0,
    total: 1148000,
    status: 'shipping',
    paymentStatus: 'paid',
    paymentMethod: 'online',
    shippingAddress: {
      id: 'addr3',
      name: 'Trần Văn C',
      phone: '0923456789',
      address: '789 Hai Bà Trưng, Q1, TP.HCM',
      isDefault: true,
    },
    type: 'online',
    createdAt: new Date('2024-01-24'),
    updatedAt: new Date('2024-01-24'),
  },
  {
    id: 'ord4',
    orderNumber: 'POS-2024-002',
    customerId: 'cust1',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    items: [
      {
        id: 'oi5',
        variantId: 'v25',
        productName: 'Túi tote canvas đen',
        variantLabel: 'OneSize / Đen',
        quantity: 2,
        price: 199000,
        image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=200&q=80',
      },
    ],
    subtotal: 398000,
    discount: 0,
    total: 398000,
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'cash',
    shippingAddress: {
      id: 'addr1',
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      address: 'Tại quầy',
      isDefault: true,
    },
    type: 'pos',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
];

// Mock Roles
export const mockRoles: Role[] = [
  {
    id: 'role1',
    name: 'Admin',
    description: 'Quản trị viên có toàn quyền',
    permissions: [
      { module: 'products', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'orders', actions: ['view', 'create', 'edit', 'delete', 'approve'] },
      { module: 'inventory', actions: ['view', 'create', 'edit'] },
      { module: 'customers', actions: ['view', 'edit'] },
      { module: 'promotions', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'users', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'reports', actions: ['view', 'export'] },
      { module: 'pos', actions: ['create', 'print'] },
    ],
  },
  {
    id: 'role2',
    name: 'Manager',
    description: 'Quản lý cửa hàng',
    permissions: [
      { module: 'products', actions: ['view', 'create', 'edit'] },
      { module: 'orders', actions: ['view', 'edit', 'approve'] },
      { module: 'inventory', actions: ['view', 'create', 'edit'] },
      { module: 'customers', actions: ['view'] },
      { module: 'promotions', actions: ['view', 'create', 'edit'] },
      { module: 'reports', actions: ['view', 'export'] },
      { module: 'pos', actions: ['create', 'print'] },
    ],
  },
  {
    id: 'role3',
    name: 'Staff',
    description: 'Nhân viên bán hàng',
    permissions: [
      { module: 'products', actions: ['view'] },
      { module: 'orders', actions: ['view', 'edit'] },
      { module: 'inventory', actions: ['view'] },
      { module: 'customers', actions: ['view'] },
      { module: 'pos', actions: ['create', 'print'] },
    ],
  },
];

// Auth state - use useAuth() hook instead. Kept as null for compatibility.
export const currentUser: User | null = null;

// Cart functions - backed by localStorage via cart.ts
export { getCart, addToCart, updateCartQuantity, removeFromCart, clearCart } from './cart';

// Mock Customers
export const mockCustomers: Customer[] = [
  {
    id: 'cust1',
    email: 'nguyenvana@email.com',
    phone: '0901234567',
    name: 'Nguyễn Văn A',
    addresses: [
      {
        id: 'addr1',
        name: 'Nguyễn Văn A',
        phone: '0901234567',
        address: '123 Nguyễn Huệ, Q1, TP.HCM',
        isDefault: true,
      },
    ],
    totalOrders: 5,
    totalSpent: 2450000,
    createdAt: new Date('2023-12-01'),
  },
  {
    id: 'cust2',
    email: 'lethib@email.com',
    phone: '0912345678',
    name: 'Lê Thị B',
    addresses: [
      {
        id: 'addr2',
        name: 'Lê Thị B',
        phone: '0912345678',
        address: '456 Lê Lợi, Q3, TP.HCM',
        isDefault: true,
      },
    ],
    totalOrders: 3,
    totalSpent: 1350000,
    createdAt: new Date('2024-01-05'),
  },
  {
    id: 'cust3',
    email: 'tranvanc@email.com',
    phone: '0923456789',
    name: 'Trần Văn C',
    addresses: [
      {
        id: 'addr3',
        name: 'Trần Văn C',
        phone: '0923456789',
        address: '789 Hai Bà Trưng, Q1, TP.HCM',
        isDefault: true,
      },
    ],
    totalOrders: 8,
    totalSpent: 4200000,
    createdAt: new Date('2023-11-15'),
  },
];

// Mock Staff Accounts
export const mockStaffAccounts: StaffAccount[] = [
  {
    id: 'staff1',
    email: 'admin@store.com',
    phone: '0900000001',
    name: 'Nguyễn Quản Trị',
    username: 'admin',
    status: 'active',
    createdAt: new Date('2023-01-01'),
  },
  {
    id: 'staff2',
    email: 'staff1@store.com',
    phone: '0900000002',
    name: 'Trần Thị Nhân Viên',
    username: 'staff1',
    status: 'active',
    createdAt: new Date('2023-06-15'),
    createdBy: 'admin',
  },
  {
    id: 'staff3',
    email: 'staff2@store.com',
    phone: '0900000003',
    name: 'Lê Văn Thu Ngân',
    username: 'cashier1',
    status: 'active',
    createdAt: new Date('2023-08-20'),
    createdBy: 'admin',
  },
  {
    id: 'staff4',
    email: 'oldstaff@store.com',
    phone: '0900000004',
    name: 'Phạm Thị Cũ',
    username: 'oldstaff',
    status: 'locked',
    createdAt: new Date('2022-03-10'),
    createdBy: 'admin',
  },
];

// Mock Inventory Logs
export const mockInventoryLogs: InventoryLog[] = [
  {
    id: 'log1',
    variantId: 'v2',
    productName: 'Áo thun cotton basic trắng',
    variantLabel: 'M / Trắng',
    type: 'stock-in',
    quantity: 50,
    previousStock: 30,
    newStock: 80,
    reason: 'Nhập hàng từ nhà cung cấp',
    notes: 'Lô hàng mới tháng 1',
    staffId: 'staff1',
    staffName: 'Nguyễn Quản Trị',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'log2',
    variantId: 'v6',
    productName: 'Áo thun cotton basic đen',
    variantLabel: 'M / Đen',
    type: 'stock-out',
    quantity: 10,
    previousStock: 85,
    newStock: 75,
    reason: 'Bán tại quầy',
    notes: 'POS-001',
    staffId: 'staff2',
    staffName: 'Trần Thị Nhân Viên',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: 'log3',
    variantId: 'v12',
    productName: 'Áo khoác denim xanh',
    variantLabel: 'M / Xanh denim',
    type: 'adjustment',
    quantity: -5,
    previousStock: 25,
    newStock: 20,
    reason: 'Kiểm kê phát hiện hao hụt',
    notes: 'Điều chỉnh sau kiểm kê định kỳ',
    staffId: 'staff1',
    staffName: 'Nguyễn Quản Trị',
    createdAt: new Date('2024-01-18'),
  },
  {
    id: 'log4',
    variantId: 'v16',
    productName: 'Quần jean slim fit xanh đen',
    variantLabel: '30 / Xanh đen',
    type: 'stock-in',
    quantity: 30,
    previousStock: 15,
    newStock: 45,
    reason: 'Nhập hàng từ nhà cung cấp',
    staffId: 'staff1',
    staffName: 'Nguyễn Quản Trị',
    createdAt: new Date('2024-01-19'),
  },
];

// Mock Invoices
export const mockInvoices: Invoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'INV-2024-001',
    orderId: 'ord1',
    orderNumber: 'ORD-2024-001',
    customerName: 'Nguyễn Văn A',
    items: [
      {
        id: 'oi1',
        variantId: 'v2',
        productName: 'Áo thun cotton basic trắng',
        variantLabel: 'M / Trắng',
        quantity: 2,
        price: 249000,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80',
      },
    ],
    subtotal: 498000,
    discount: 0,
    shippingFee: 30000,
    total: 528000,
    paymentMethod: 'Thanh toán online',
    paymentStatus: 'paid',
    createdAt: new Date('2024-01-23'),
  },
];

// Export mutable arrays for management
export let customers = [...mockCustomers];
export let staffAccounts = [...mockStaffAccounts];
export let inventoryLogs = [...mockInventoryLogs];
export let invoices = [...mockInvoices];
export let categories = [...mockCategories];
export let products = [...mockProducts];
export let promotions = [...mockPromotions];
export let orders = [...mockOrders];