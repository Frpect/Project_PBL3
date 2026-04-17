// ===== Main: Register Routes =====
(function() {
var A = window.App;
var R = A.router;

// Client routes
R.add('/', function() { A.pages.home(); });
R.add('/shop', function() { A.pages.shop(); });
R.add('/shop/:slug', function(p) { A.pages.shop(p.slug); });
R.add('/product/:id', function(p) { A.pages.productDetail(p.id); });
R.add('/cart', function() { A.pages.cart(); });
R.add('/checkout', function() { A.pages.checkout(); });
R.add('/login', function() { A.pages.login(); });
R.add('/register', function() { A.pages.register(); });
R.add('/forgot-password', function() { A.pages.forgotPassword(); });
R.add('/profile', function() { A.pages.profile(); });
R.add('/orders', function() { A.pages.orders(); });
R.add('/orders/:id', function(p) { A.pages.orderDetail(p.id); });
R.add('/payment/result', function(p) { A.pages.paymentResult(p.query); });
R.add('/categories', function() { A.pages.categories(); });
R.add('/promotions', function() { A.pages.promotions(); });
R.add('/about', function() { A.pages.about(); });

// Admin routes
R.add('/admin/login', function() { A.pages.adminLogin(); });
R.add('/admin', function() { A.pages.analytics(); });
R.add('/admin/products', function() { A.pages.productsList(); });
R.add('/admin/products/add', function() { A.pages.addProduct(); });
R.add('/admin/products/edit/:id', function(p) { A.pages.editProduct(p.id); });
R.add('/admin/orders', function() { A.pages.adminOrders(); });
R.add('/admin/orders/:id', function(p) { A.pages.adminOrderDetail(p.id); });
R.add('/admin/categories', function() { A.pages.adminCategories(); });
R.add('/admin/customers', function() { A.pages.adminCustomers(); });
R.add('/admin/inventory', function() { A.pages.inventory(); });
R.add('/admin/pos', function() { A.pages.pos(); });
R.add('/admin/promotions', function() { A.pages.adminPromotions(); });
R.add('/admin/staff', function() { A.pages.staff(); });

// 404
R.notFound(function() { A.pages.notFound(); });

// Boot
R.resolve();
})();
