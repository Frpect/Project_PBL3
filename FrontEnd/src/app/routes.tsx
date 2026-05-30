import { createBrowserRouter } from 'react-router';

// Client pages
import { HomePage } from './pages/client/HomePage';
import { ShopPage } from './pages/client/ShopPage';
import { ProductDetailPage } from './pages/client/ProductDetailPage';
import { CategoriesPage } from './pages/client/CategoriesPage';
import { PromotionsPage } from './pages/client/PromotionsPage';
import { CartPage } from './pages/client/CartPage';
import { CheckoutPage } from './pages/client/CheckoutPage';
import { PaymentResultPage } from './pages/client/PaymentResultPage';
import { LoginPage } from './pages/client/LoginPage';
import { RegisterPage } from './pages/client/RegisterPage';
import { ForgotPasswordPage } from './pages/client/ForgotPasswordPage';
import { ProfilePage } from './pages/client/ProfilePage';
import { OrdersListPage } from './pages/client/OrdersListPage';
import { OrderDetailPage } from './pages/client/OrderDetailPage';
import { AboutPage } from './pages/client/AboutPage';
import { WishlistPage } from './pages/client/WishlistPage';

// Admin pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { ProductsListPage } from './pages/admin/ProductsListPage';
import { AddProductPage } from './pages/admin/AddProductPage';
import { EditProductPage } from './pages/admin/EditProductPage';
import { OrdersPage } from './pages/admin/OrdersPage';
import { AdminOrderDetailPage } from './pages/admin/AdminOrderDetailPage';
import { POSHomePage } from './pages/admin/POSHomePage';
import { CategoriesPage as CategoriesAdminPage } from './pages/admin/CategoriesPage';
import { InventoryPage } from './pages/admin/InventoryPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { CustomersPage } from './pages/admin/CustomersPage';
import { PromotionsPage as PromotionsAdminPage } from './pages/admin/PromotionsPage';
import { StaffManagementPage } from './pages/admin/StaffManagementPage';

// Layouts
import { ClientLayout } from './components/layouts/ClientLayout';
import { AdminLayout } from './components/layouts/AdminLayout';
import { NotFoundPage } from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: ClientLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'shop', Component: ShopPage },
      { path: 'shop/:categorySlug', Component: ShopPage },
      { path: 'product/:productId', Component: ProductDetailPage },
      { path: 'categories', Component: CategoriesPage },
      { path: 'promotions', Component: PromotionsPage },
      { path: 'cart', Component: CartPage },
      { path: 'checkout', Component: CheckoutPage },
      { path: 'payment/result', Component: PaymentResultPage },
      { path: 'about', Component: AboutPage },
      { path: 'login', Component: LoginPage },
      { path: 'register', Component: RegisterPage },
      { path: 'forgot-password', Component: ForgotPasswordPage },
      { path: 'profile', Component: ProfilePage },
      { path: 'orders', Component: OrdersListPage },
      { path: 'orders/:orderId', Component: OrderDetailPage },
      { path: 'wishlist', Component: WishlistPage },
    ],
  },
  {
    path: '/admin/login',
    Component: AdminLoginPage,
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, Component: AnalyticsPage },
      { path: 'products', Component: ProductsListPage },
      { path: 'products/add', Component: AddProductPage },
      { path: 'products/edit/:productId', Component: EditProductPage },
      { path: 'orders', Component: OrdersPage },
      { path: 'orders/:orderId', Component: AdminOrderDetailPage },
      { path: 'customers', Component: CustomersPage },
      { path: 'promotions', Component: PromotionsAdminPage },
      { path: 'inventory', Component: InventoryPage },
      { path: 'pos', Component: POSHomePage },
      { path: 'staff', Component: StaffManagementPage },
      { path: 'categories', Component: CategoriesAdminPage },
    ],
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
]);