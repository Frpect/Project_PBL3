// ===== Mock Data (converted from TypeScript) =====

export const mockCategories = [
  { id: 'cat1', name: 'Áo thun', slug: 'ao-thun', isVisible: true },
  { id: 'cat2', name: 'Áo sơ mi', slug: 'ao-so-mi', isVisible: true },
  { id: 'cat3', name: 'Quần jeans', slug: 'quan-jeans', isVisible: true },
  { id: 'cat4', name: 'Quần kaki', slug: 'quan-kaki', isVisible: true },
  { id: 'cat5', name: 'Váy đầm', slug: 'vay-dam', isVisible: true },
  { id: 'cat6', name: 'Áo khoác', slug: 'ao-khoac', isVisible: true },
  { id: 'cat7', name: 'Phụ kiện', slug: 'phu-kien', isVisible: true },
  { id: 'cat8', name: 'Đồ thể thao', slug: 'do-the-thao', isVisible: true },
  { id: 'cat1-1', name: 'Áo thun nam', slug: 'ao-thun-nam', parentId: 'cat1', isVisible: true },
  { id: 'cat1-2', name: 'Áo thun nữ', slug: 'ao-thun-nu', parentId: 'cat1', isVisible: true },
];

export const categories = mockCategories;

export const mockProducts = [
  {
    id: 'prod1',
    code: 'TS001',
    name: 'Áo thun cotton basic',
    category: 'Áo thun',
    description: 'Áo thun cotton 100% mềm mại, thoáng mát. Phù hợp mặc hàng ngày.',
    material: 'Cotton 100%',
    basePrice: 299000,
    salePrice: 249000,
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500',
    ],
    variants: [
      { id: 'v1', productId: 'prod1', size: 'S', color: 'Trắng', stock: 25, sku: 'TS001-S-W' },
      { id: 'v2', productId: 'prod1', size: 'M', color: 'Trắng', stock: 30, sku: 'TS001-M-W' },
      { id: 'v3', productId: 'prod1', size: 'L', color: 'Trắng', stock: 20, sku: 'TS001-L-W' },
      { id: 'v4', productId: 'prod1', size: 'XL', color: 'Trắng', stock: 15, sku: 'TS001-XL-W' },
      { id: 'v5', productId: 'prod1', size: 'S', color: 'Đen', stock: 20, sku: 'TS001-S-B' },
      { id: 'v6', productId: 'prod1', size: 'M', color: 'Đen', stock: 25, sku: 'TS001-M-B' },
      { id: 'v7', productId: 'prod1', size: 'L', color: 'Đen', stock: 18, sku: 'TS001-L-B' },
      { id: 'v8', productId: 'prod1', size: 'XL', color: 'Đen', stock: 12, sku: 'TS001-XL-B' },
    ],
    status: 'active',
    createdAt: new Date('2024-01-15'),
    isNew: false,
    isBestSeller: true,
  },
  {
    id: 'prod2',
    code: 'SM001',
    name: 'Áo sơ mi Oxford classic',
    category: 'Áo sơ mi',
    description: 'Áo sơ mi Oxford phom regular fit, chất liệu dày dặn, lịch sự.',
    material: 'Cotton Oxford',
    basePrice: 450000,
    salePrice: undefined,
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500',
    ],
    variants: [
      { id: 'v9', productId: 'prod2', size: 'S', color: 'Trắng', stock: 15, sku: 'SM001-S-W' },
      { id: 'v10', productId: 'prod2', size: 'M', color: 'Trắng', stock: 20, sku: 'SM001-M-W' },
      { id: 'v11', productId: 'prod2', size: 'L', color: 'Trắng', stock: 12, sku: 'SM001-L-W' },
      { id: 'v12', productId: 'prod2', size: 'S', color: 'Xanh nhạt', stock: 10, sku: 'SM001-S-LB' },
      { id: 'v13', productId: 'prod2', size: 'M', color: 'Xanh nhạt', stock: 15, sku: 'SM001-M-LB' },
      { id: 'v14', productId: 'prod2', size: 'L', color: 'Xanh nhạt', stock: 8, sku: 'SM001-L-LB' },
    ],
    status: 'active',
    createdAt: new Date('2024-02-01'),
    isNew: true,
    isBestSeller: false,
  },
  {
    id: 'prod3',
    code: 'QJ001',
    name: 'Quần jeans slim fit',
    category: 'Quần jeans',
    description: 'Quần jeans co giãn thoải mái, form slim fit trẻ trung.',
    material: 'Denim co giãn',
    basePrice: 550000,
    salePrice: 450000,
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=500',
    ],
    variants: [
      { id: 'v15', productId: 'prod3', size: '29', color: 'Xanh đậm', stock: 12, sku: 'QJ001-29-DB' },
      { id: 'v16', productId: 'prod3', size: '30', color: 'Xanh đậm', stock: 18, sku: 'QJ001-30-DB' },
      { id: 'v17', productId: 'prod3', size: '31', color: 'Xanh đậm', stock: 15, sku: 'QJ001-31-DB' },
      { id: 'v18', productId: 'prod3', size: '32', color: 'Xanh đậm', stock: 10, sku: 'QJ001-32-DB' },
      { id: 'v19', productId: 'prod3', size: '29', color: 'Đen', stock: 8, sku: 'QJ001-29-BK' },
      { id: 'v20', productId: 'prod3', size: '30', color: 'Đen', stock: 14, sku: 'QJ001-30-BK' },
      { id: 'v21', productId: 'prod3', size: '31', color: 'Đen', stock: 11, sku: 'QJ001-31-BK' },
      { id: 'v22', productId: 'prod3', size: '32', color: 'Đen', stock: 7, sku: 'QJ001-32-BK' },
    ],
    status: 'active',
    createdAt: new Date('2024-01-20'),
    isNew: false,
    isBestSeller: true,
  },
  {
    id: 'prod4',
    code: 'VD001',
    name: 'Váy đầm hoa nhí',
    category: 'Váy đầm',
    description: 'Váy đầm hoa nhí vintage, chất liệu voan mềm nhẹ nhàng.',
    material: 'Voan hoa',
    basePrice: 380000,
    salePrice: undefined,
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500',
    ],
    variants: [
      { id: 'v23', productId: 'prod4', size: 'S', color: 'Hồng', stock: 10, sku: 'VD001-S-P' },
      { id: 'v24', productId: 'prod4', size: 'M', color: 'Hồng', stock: 15, sku: 'VD001-M-P' },
      { id: 'v25', productId: 'prod4', size: 'L', color: 'Hồng', stock: 8, sku: 'VD001-L-P' },
      { id: 'v26', productId: 'prod4', size: 'S', color: 'Xanh', stock: 12, sku: 'VD001-S-G' },
      { id: 'v27', productId: 'prod4', size: 'M', color: 'Xanh', stock: 10, sku: 'VD001-M-G' },
      { id: 'v28', productId: 'prod4', size: 'L', color: 'Xanh', stock: 6, sku: 'VD001-L-G' },
    ],
    status: 'active',
    createdAt: new Date('2024-03-01'),
    isNew: true,
    isBestSeller: false,
  },
  {
    id: 'prod5',
    code: 'AK001',
    name: 'Áo khoác bomber unisex',
    category: 'Áo khoác',
    description: 'Áo khoác bomber phong cách streetwear, lót lưới thoáng mát.',
    material: 'Polyester',
    basePrice: 650000,
    salePrice: 520000,
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500',
    ],
    variants: [
      { id: 'v29', productId: 'prod5', size: 'M', color: 'Đen', stock: 8, sku: 'AK001-M-BK' },
      { id: 'v30', productId: 'prod5', size: 'L', color: 'Đen', stock: 12, sku: 'AK001-L-BK' },
      { id: 'v31', productId: 'prod5', size: 'XL', color: 'Đen', stock: 6, sku: 'AK001-XL-BK' },
      { id: 'v32', productId: 'prod5', size: 'M', color: 'Xanh rêu', stock: 5, sku: 'AK001-M-OG' },
      { id: 'v33', productId: 'prod5', size: 'L', color: 'Xanh rêu', stock: 9, sku: 'AK001-L-OG' },
      { id: 'v34', productId: 'prod5', size: 'XL', color: 'Xanh rêu', stock: 4, sku: 'AK001-XL-OG' },
    ],
    status: 'active',
    createdAt: new Date('2024-02-15'),
    isNew: false,
    isBestSeller: true,
  },
  {
    id: 'prod6',
    code: 'QK001',
    name: 'Quần kaki regular fit',
    category: 'Quần kaki',
    description: 'Quần kaki chất liệu cotton mềm, form regular fit thoải mái.',
    material: 'Cotton twill',
    basePrice: 420000,
    salePrice: undefined,
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500',
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500',
    ],
    variants: [
      { id: 'v35', productId: 'prod6', size: '29', color: 'Be', stock: 15, sku: 'QK001-29-BG' },
      { id: 'v36', productId: 'prod6', size: '30', color: 'Be', stock: 20, sku: 'QK001-30-BG' },
      { id: 'v37', productId: 'prod6', size: '31', color: 'Be', stock: 12, sku: 'QK001-31-BG' },
      { id: 'v38', productId: 'prod6', size: '32', color: 'Be', stock: 8, sku: 'QK001-32-BG' },
      { id: 'v39', productId: 'prod6', size: '29', color: 'Đen', stock: 10, sku: 'QK001-29-BK' },
      { id: 'v40', productId: 'prod6', size: '30', color: 'Đen', stock: 16, sku: 'QK001-30-BK' },
      { id: 'v41', productId: 'prod6', size: '31', color: 'Đen', stock: 9, sku: 'QK001-31-BK' },
      { id: 'v42', productId: 'prod6', size: '32', color: 'Đen', stock: 5, sku: 'QK001-32-BK' },
    ],
    status: 'active',
    createdAt: new Date('2024-01-25'),
    isNew: false,
    isBestSeller: false,
  },
  {
    id: 'prod7',
    code: 'TT001',
    name: 'Áo thun thể thao',
    category: 'Đồ thể thao',
    description: 'Áo thun thể thao thấm hút mồ hôi, khô nhanh.',
    material: 'Polyester Dry-fit',
    basePrice: 350000,
    salePrice: 280000,
    images: [
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500',
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=500',
    ],
    variants: [
      { id: 'v43', productId: 'prod7', size: 'S', color: 'Đen', stock: 20, sku: 'TT001-S-BK' },
      { id: 'v44', productId: 'prod7', size: 'M', color: 'Đen', stock: 25, sku: 'TT001-M-BK' },
      { id: 'v45', productId: 'prod7', size: 'L', color: 'Đen', stock: 18, sku: 'TT001-L-BK' },
      { id: 'v46', productId: 'prod7', size: 'S', color: 'Xanh dương', stock: 15, sku: 'TT001-S-BL' },
      { id: 'v47', productId: 'prod7', size: 'M', color: 'Xanh dương', stock: 20, sku: 'TT001-M-BL' },
      { id: 'v48', productId: 'prod7', size: 'L', color: 'Xanh dương', stock: 12, sku: 'TT001-L-BL' },
    ],
    status: 'active',
    createdAt: new Date('2024-03-10'),
    isNew: true,
    isBestSeller: false,
  },
  {
    id: 'prod8',
    code: 'PK001',
    name: 'Mũ lưỡi trai thêu logo',
    category: 'Phụ kiện',
    description: 'Mũ lưỡi trai thêu logo thời trang, chất liệu cotton.',
    material: 'Cotton canvas',
    basePrice: 180000,
    salePrice: undefined,
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=500',
    ],
    variants: [
      { id: 'v49', productId: 'prod8', size: 'Free size', color: 'Đen', stock: 30, sku: 'PK001-F-BK' },
      { id: 'v50', productId: 'prod8', size: 'Free size', color: 'Trắng', stock: 25, sku: 'PK001-F-W' },
      { id: 'v51', productId: 'prod8', size: 'Free size', color: 'Be', stock: 20, sku: 'PK001-F-BG' },
    ],
    status: 'active',
    createdAt: new Date('2024-02-20'),
    isNew: false,
    isBestSeller: false,
  },
];

export const products = mockProducts;

// ===== Users =====
export const mockUsers = [
  {
    id: 'user1',
    email: 'nguyenvana@email.com',
    phone: '0901234567',
    name: 'Nguyễn Văn A',
    role: 'customer',
    addresses: [
      {
        id: 'addr1',
        name: 'Nguyễn Văn A',
        phone: '0901234567',
        address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
        isDefault: true,
      },
      {
        id: 'addr2',
        name: 'Nguyễn Văn A',
        phone: '0901234567',
        address: '456 Lê Lợi, Quận 3, TP. Hồ Chí Minh',
        isDefault: false,
      },
    ],
  },
  {
    id: 'user2',
    email: 'tranthib@email.com',
    phone: '0907654321',
    name: 'Trần Thị B',
    role: 'customer',
    addresses: [
      {
        id: 'addr3',
        name: 'Trần Thị B',
        phone: '0907654321',
        address: '789 Hai Bà Trưng, Quận 1, TP. Hồ Chí Minh',
        isDefault: true,
      },
    ],
  },
];

// ===== Orders =====
export const mockOrders = [
  {
    id: 'order1',
    orderNumber: 'ORD-2024-001',
    customerId: 'user1',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    type: 'online',
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'online',
    shippingAddress: {
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    },
    items: [
      {
        id: 'oi1',
        productId: 'prod1',
        productName: 'Áo thun cotton basic',
        variantLabel: 'M / Trắng',
        quantity: 2,
        price: 249000,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
      },
      {
        id: 'oi2',
        productId: 'prod3',
        productName: 'Quần jeans slim fit',
        variantLabel: '30 / Xanh đậm',
        quantity: 1,
        price: 450000,
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
      },
    ],
    subtotal: 948000,
    discount: 0,
    total: 948000,
    createdAt: new Date('2024-03-15'),
  },
  {
    id: 'order2',
    orderNumber: 'ORD-2024-002',
    customerId: 'user2',
    customerName: 'Trần Thị B',
    customerPhone: '0907654321',
    type: 'online',
    status: 'shipping',
    paymentStatus: 'paid',
    paymentMethod: 'cod',
    shippingAddress: {
      name: 'Trần Thị B',
      phone: '0907654321',
      address: '789 Hai Bà Trưng, Quận 1, TP. Hồ Chí Minh',
    },
    items: [
      {
        id: 'oi3',
        productId: 'prod4',
        productName: 'Váy đầm hoa nhí',
        variantLabel: 'M / Hồng',
        quantity: 1,
        price: 380000,
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500',
      },
    ],
    subtotal: 380000,
    discount: 0,
    total: 410000,
    createdAt: new Date('2024-03-16'),
  },
  {
    id: 'order3',
    orderNumber: 'POS-2024-001',
    customerId: 'user1',
    customerName: 'Khách lẻ',
    customerPhone: '0909999999',
    type: 'pos',
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'cash',
    shippingAddress: {
      name: 'Khách lẻ',
      phone: '0909999999',
      address: 'Mua tại quầy',
    },
    items: [
      {
        id: 'oi4',
        productId: 'prod5',
        productName: 'Áo khoác bomber unisex',
        variantLabel: 'L / Đen',
        quantity: 1,
        price: 520000,
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
      },
    ],
    subtotal: 520000,
    discount: 0,
    total: 520000,
    createdAt: new Date('2024-03-14'),
  },
];

export const orders = mockOrders;

// ===== Cart =====
let cart = [];

export function getCart() {
  return cart;
}

export function addToCart(item) {
  const existingIndex = cart.findIndex(c => c.variantId === item.variantId);
  if (existingIndex >= 0) {
    const newQty = cart[existingIndex].quantity + item.quantity;
    if (newQty <= item.stock) {
      cart[existingIndex].quantity = newQty;
    }
  } else {
    cart.push({ ...item });
  }
}

export function updateCartItem(variantId, quantity) {
  const index = cart.findIndex(c => c.variantId === variantId);
  if (index >= 0) {
    if (quantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = quantity;
    }
  }
}

export function removeFromCart(variantId) {
  cart = cart.filter(c => c.variantId !== variantId);
}

export function clearCart() {
  cart = [];
}

// ===== Current User =====
export let currentUser = null;

export function setCurrentUser(user) {
  currentUser = user;
}

export function getCurrentUser() {
  return currentUser;
}

// ===== Promotions =====
export const mockPromotions = [
  {
    id: 'promo1',
    name: 'Giảm giá mùa hè',
    code: 'SUMMER20',
    type: 'percentage',
    value: 20,
    minOrder: 300000,
    maxDiscount: 100000,
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-08-31'),
    description: 'Giảm 20% cho đơn hàng từ 300.000đ (tối đa 100.000đ)',
    status: 'active',
    targets: [{ type: 'category', id: 'cat1' }],
  },
  {
    id: 'promo2',
    name: 'Ưu đãi thành viên',
    code: 'MEMBER50K',
    type: 'fixed',
    value: 50000,
    minOrder: 500000,
    maxDiscount: undefined,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    description: 'Giảm 50.000đ cho đơn hàng từ 500.000đ',
    status: 'active',
    targets: [],
  },
  {
    id: 'promo3',
    name: 'Flash Sale cuối tuần',
    code: 'FLASH30',
    type: 'percentage',
    value: 30,
    minOrder: 200000,
    maxDiscount: 150000,
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-03-31'),
    description: 'Giảm 30% cho đơn hàng từ 200.000đ (tối đa 150.000đ)',
    status: 'active',
    targets: [{ type: 'category', id: 'cat3' }],
  },
];

export const promotions = mockPromotions;

// ===== Customers =====
export const customers = [
  {
    id: 'user1',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0901234567',
    totalOrders: 5,
    totalSpent: 2500000,
    createdAt: new Date('2024-01-01'),
    addresses: [
      { id: 'addr1', name: 'Nguyễn Văn A', phone: '0901234567', address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh', isDefault: true },
      { id: 'addr2', name: 'Nguyễn Văn A', phone: '0901234567', address: '456 Lê Lợi, Quận 3, TP. Hồ Chí Minh', isDefault: false },
    ],
  },
  {
    id: 'user2',
    name: 'Trần Thị B',
    email: 'tranthib@email.com',
    phone: '0907654321',
    totalOrders: 3,
    totalSpent: 1800000,
    createdAt: new Date('2024-01-15'),
    addresses: [
      { id: 'addr3', name: 'Trần Thị B', phone: '0907654321', address: '789 Hai Bà Trưng, Quận 1, TP. Hồ Chí Minh', isDefault: true },
    ],
  },
  {
    id: 'user3',
    name: 'Lê Văn C',
    email: 'levanc@email.com',
    phone: '0912345678',
    totalOrders: 8,
    totalSpent: 4200000,
    createdAt: new Date('2023-12-01'),
    addresses: [
      { id: 'addr4', name: 'Lê Văn C', phone: '0912345678', address: '321 Điện Biên Phủ, Quận Bình Thạnh, TP. Hồ Chí Minh', isDefault: true },
    ],
  },
];

// ===== Inventory Logs =====
export const inventoryLogs = [
  {
    id: 'log1',
    variantId: 'v1',
    productName: 'Áo thun cotton basic',
    variantLabel: 'S / Trắng',
    type: 'stock-in',
    quantity: 50,
    previousStock: 0,
    newStock: 50,
    reason: 'Nhập hàng từ nhà cung cấp',
    staffId: 'staff1',
    staffName: 'Nguyễn Quản Trị',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'log2',
    variantId: 'v1',
    productName: 'Áo thun cotton basic',
    variantLabel: 'S / Trắng',
    type: 'stock-out',
    quantity: 25,
    previousStock: 50,
    newStock: 25,
    reason: 'Xuất hàng online',
    staffId: 'staff1',
    staffName: 'Nguyễn Quản Trị',
    createdAt: new Date('2024-02-01'),
  },
];

// ===== Staff Accounts =====
export const staffAccounts = [
  {
    id: 'staff1',
    name: 'Nguyễn Quản Trị',
    username: 'admin',
    email: 'admin@fashionstore.com',
    phone: '0901111111',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    createdBy: 'system',
  },
  {
    id: 'staff2',
    name: 'Trần Nhân Viên',
    username: 'staff1',
    email: 'staff1@fashionstore.com',
    phone: '0902222222',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    createdBy: 'admin',
  },
];

// ===== Hero Banners =====
export const heroBanners = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
    title: 'Bộ sưu tập mùa hè 2024',
    subtitle: 'Phong cách trẻ trung, năng động',
    cta: 'Mua ngay',
    link: '/shop',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200',
    title: 'Sale cuối mùa lên đến 50%',
    subtitle: 'Nhanh tay kẻo lỡ',
    cta: 'Xem ưu đãi',
    link: '/promotions',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200',
    title: 'Thời trang công sở',
    subtitle: 'Lịch lãm và chuyên nghiệp',
    cta: 'Khám phá',
    link: '/shop',
  },
];
