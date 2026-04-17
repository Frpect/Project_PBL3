// ===== Client Pages =====
(function() {
var A = window.App;
var ic = A.icon, fp = A.formatPrice, fd = A.formatDate, PC = A.ProductCard, SB = A.StatusBadge;

// ===== Home Page =====
A.pages = A.pages || {};

A.pages.home = function() {
  var bestSellers = A.mockProducts.filter(function(p){return p.isBestSeller;}).slice(0,4);
  var newArrivals = A.mockProducts.filter(function(p){return p.isNew;}).slice(0,4);
  var banners = A.heroBanners;
  var content = '<div>' +
    '<div class="relative overflow-hidden" id="hero-carousel"><div class="flex transition-transform duration-500" id="carousel-track">' +
    banners.map(function(b){
      return '<div class="w-full flex-shrink-0 relative"><img src="'+b.image+'" alt="'+b.title+'" class="w-full h-[400px] md:h-[500px] object-cover" /><div class="absolute inset-0 bg-black/40 flex items-center justify-center"><div class="text-center text-white px-4"><h2 class="text-3xl md:text-5xl font-bold mb-4">'+b.title+'</h2><p class="text-lg md:text-xl mb-6">'+b.subtitle+'</p><a href="#'+b.link+'" class="btn btn-default bg-white text-primary hover:bg-gray-100 btn-lg">'+b.cta+'</a></div></div></div>';
    }).join('') +
    '</div><button id="carousel-prev" class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg">'+ic('chevron-left','w-6 h-6')+'</button><button id="carousel-next" class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg">'+ic('chevron-right','w-6 h-6')+'</button>' +
    '<div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2" id="carousel-dots">' + banners.map(function(_,i){ return '<button class="w-3 h-3 rounded-full '+(i===0?'bg-white':'bg-white/50')+'" data-slide="'+i+'"></button>'; }).join('') + '</div></div>' +
    '<section class="py-12 bg-white"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><h2 class="text-2xl font-bold text-center mb-8">Danh mục sản phẩm</h2><div class="grid grid-cols-2 md:grid-cols-4 gap-4">' +
    A.mockCategories.filter(function(c){return !c.parentId;}).slice(0,8).map(function(cat){
      return '<a href="#/shop/'+cat.slug+'" class="group bg-surface rounded-xl p-6 text-center hover:shadow-md transition-all"><h3 class="font-semibold group-hover:text-accent transition-colors">'+cat.name+'</h3></a>';
    }).join('') + '</div></div></section>' +
    '<section class="py-12 bg-surface"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex items-center justify-between mb-8"><h2 class="text-2xl font-bold">Sản phẩm bán chạy</h2><a href="#/shop" class="text-sm text-primary hover:underline font-medium">Xem tất cả →</a></div><div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">' +
    bestSellers.map(function(p){return PC(p);}).join('') + '</div></div></section>' +
    '<section class="py-12 bg-accent text-white"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"><h2 class="text-3xl font-bold mb-4">Miễn phí vận chuyển</h2><p class="text-lg mb-6">Cho đơn hàng từ 500.000đ</p><a href="#/shop" class="btn bg-white text-accent hover:bg-gray-100 btn-lg">Mua sắm ngay</a></div></section>' +
    '<section class="py-12 bg-white"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex items-center justify-between mb-8"><h2 class="text-2xl font-bold">Hàng mới về</h2><a href="#/shop" class="text-sm text-primary hover:underline font-medium">Xem tất cả →</a></div><div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">' +
    newArrivals.map(function(p){return PC(p);}).join('') + '</div></div></section></div>';

  A.renderClient(content, function() {
    var currentSlide = 0, total = banners.length;
    var track = document.getElementById('carousel-track');
    var dots = document.querySelectorAll('#carousel-dots button');
    function goTo(i) {
      currentSlide = (i % total + total) % total;
      if (track) track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
      dots.forEach(function(d, idx) { d.className = 'w-3 h-3 rounded-full ' + (idx === currentSlide ? 'bg-white' : 'bg-white/50'); });
    }
    var prev = document.getElementById('carousel-prev');
    var next = document.getElementById('carousel-next');
    if (prev) prev.addEventListener('click', function() { goTo(currentSlide - 1); });
    if (next) next.addEventListener('click', function() { goTo(currentSlide + 1); });
    dots.forEach(function(d) { d.addEventListener('click', function() { goTo(parseInt(d.dataset.slide)); }); });
    setInterval(function() { goTo(currentSlide + 1); }, 5000);
  });
};

// ===== Shop Page =====
A.pages.shop = function(categorySlug) {
  var parentCategories = A.mockCategories.filter(function(c){return !c.parentId;});
  var allSizes = []; var allColors = [];
  A.mockProducts.forEach(function(p){ p.variants.forEach(function(v){ if(allSizes.indexOf(v.size)===-1) allSizes.push(v.size); if(allColors.indexOf(v.color)===-1) allColors.push(v.color); }); });

  var content = '<div class="py-8 bg-surface min-h-screen"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">' +
    '<h1 class="text-3xl font-bold mb-6">Sản phẩm</h1><div class="flex gap-8">' +
    '<aside class="hidden md:block w-64 flex-shrink-0"><div class="bg-white rounded-xl border border-border p-6 sticky top-24">' +
    '<h3 class="font-semibold mb-4">Bộ lọc</h3>' +
    '<div class="mb-6"><h4 class="text-sm font-medium mb-3">Danh mục</h4><div class="space-y-2"><label class="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="category" value="" '+(categorySlug?'':'checked')+' class="accent-primary" data-filter="category" />Tất cả</label>' +
    parentCategories.map(function(cat){ return '<label class="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="category" value="'+cat.slug+'" '+(categorySlug===cat.slug?'checked':'')+' class="accent-primary" data-filter="category" />'+cat.name+'</label>'; }).join('') + '</div></div>' +
    '<div class="mb-6"><h4 class="text-sm font-medium mb-3">Khoảng giá</h4><div class="space-y-2"><label class="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="price" value="" checked class="accent-primary" data-filter="price" />Tất cả</label><label class="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="price" value="0-300000" class="accent-primary" data-filter="price" />Dưới 300.000đ</label><label class="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="price" value="300000-500000" class="accent-primary" data-filter="price" />300.000đ - 500.000đ</label><label class="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="price" value="500000-99999999" class="accent-primary" data-filter="price" />Trên 500.000đ</label></div></div>' +
    '<div class="mb-6"><h4 class="text-sm font-medium mb-3">Size</h4><div class="flex flex-wrap gap-2">' + allSizes.map(function(s){return '<button class="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-surface transition-colors" data-filter-size="'+s+'">'+s+'</button>';}).join('') + '</div></div>' +
    '<button class="btn btn-outline w-full text-sm" id="clear-filters">Xóa bộ lọc</button></div></aside>' +
    '<div class="flex-1"><div class="flex items-center justify-between mb-6"><p class="text-sm text-text-secondary" id="product-count"></p>' +
    '<select class="custom-select w-48" id="sort-select"><option value="default">Mặc định</option><option value="price-asc">Giá thấp đến cao</option><option value="price-desc">Giá cao đến thấp</option><option value="name-asc">Tên A-Z</option><option value="newest">Mới nhất</option></select></div>' +
    '<div class="grid grid-cols-2 md:grid-cols-3 gap-6" id="products-grid"></div></div></div></div></div>';

  A.renderClient(content, function() {
    var selCat = categorySlug || '', selPrice = '', selSize = '', sortBy = 'default';
    function filterRender() {
      var filtered = A.mockProducts.slice();
      if (selCat) { var cat = A.mockCategories.find(function(c){return c.slug===selCat;}); if(cat) filtered = filtered.filter(function(p){return p.category===cat.name;}); }
      if (selPrice) { var parts = selPrice.split('-').map(Number); filtered = filtered.filter(function(p){ var pr = p.salePrice||p.basePrice; return pr>=parts[0]&&pr<=parts[1]; }); }
      if (selSize) filtered = filtered.filter(function(p){return p.variants.some(function(v){return v.size===selSize;});});
      switch(sortBy) {
        case 'price-asc': filtered.sort(function(a,b){return (a.salePrice||a.basePrice)-(b.salePrice||b.basePrice);}); break;
        case 'price-desc': filtered.sort(function(a,b){return (b.salePrice||b.basePrice)-(a.salePrice||a.basePrice);}); break;
        case 'name-asc': filtered.sort(function(a,b){return a.name.localeCompare(b.name);}); break;
        case 'newest': filtered.sort(function(a,b){return new Date(b.createdAt)-new Date(a.createdAt);}); break;
      }
      var grid = document.getElementById('products-grid');
      var count = document.getElementById('product-count');
      if(grid){ grid.innerHTML = filtered.length>0 ? filtered.map(function(p){return PC(p);}).join('') : '<p class="col-span-full text-center text-text-secondary py-12">Không tìm thấy sản phẩm phù hợp</p>'; A.initIcons(); }
      if(count) count.textContent = filtered.length + ' sản phẩm';
    }
    document.querySelectorAll('[data-filter="category"]').forEach(function(el){el.addEventListener('change',function(){selCat=el.value;filterRender();});});
    document.querySelectorAll('[data-filter="price"]').forEach(function(el){el.addEventListener('change',function(){selPrice=el.value;filterRender();});});
    document.querySelectorAll('[data-filter-size]').forEach(function(btn){btn.addEventListener('click',function(){
      selSize=selSize===btn.dataset.filterSize?'':btn.dataset.filterSize;
      document.querySelectorAll('[data-filter-size]').forEach(function(b){b.className='px-3 py-1.5 border rounded-lg text-sm transition-colors '+(b.dataset.filterSize===selSize?'bg-primary text-white border-primary':'border-border hover:bg-surface');});
      filterRender();
    });});
    var sortSel = document.getElementById('sort-select');
    if(sortSel) sortSel.addEventListener('change',function(e){sortBy=e.target.value;filterRender();});
    var clearBtn = document.getElementById('clear-filters');
    if(clearBtn) clearBtn.addEventListener('click',function(){selCat='';selPrice='';selSize='';
      document.querySelectorAll('[data-filter="category"]')[0].checked=true;
      document.querySelectorAll('[data-filter="price"]')[0].checked=true;
      document.querySelectorAll('[data-filter-size]').forEach(function(b){b.className='px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-surface transition-colors';});
      filterRender();
    });
    filterRender();
  });
};

// ===== Product Detail =====
A.pages.productDetail = function(productId) {
  var product = A.mockProducts.find(function(p){return p.id===productId;});
  if(!product){ A.renderClient('<div class="min-h-screen flex items-center justify-center"><div class="text-center"><h2 class="text-2xl font-semibold mb-4">Sản phẩm không tồn tại</h2><a href="#/shop" class="btn btn-default">Về trang sản phẩm</a></div></div>'); return; }
  var dp = product.salePrice||product.basePrice, hd = !!product.salePrice;
  var sizes = [], colors = [];
  product.variants.forEach(function(v){if(sizes.indexOf(v.size)===-1)sizes.push(v.size);if(colors.indexOf(v.color)===-1)colors.push(v.color);});
  var related = A.mockProducts.filter(function(p){return p.id!==product.id&&p.category===product.category;}).slice(0,4);

  var content = '<div class="py-8 bg-white min-h-screen"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">' +
    '<nav class="mb-8 flex items-center gap-2 text-sm"><a href="#/" class="text-text-secondary hover:text-primary">Trang chủ</a><span class="text-text-secondary">/</span><a href="#/shop" class="text-text-secondary hover:text-primary">Sản phẩm</a><span class="text-text-secondary">/</span><span class="text-primary">'+product.name+'</span></nav>' +
    '<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">' +
    '<div><div class="aspect-square rounded-xl overflow-hidden bg-surface mb-4"><img id="main-image" src="'+product.images[0]+'" alt="'+product.name+'" class="w-full h-full object-cover" /></div>' +
    (product.images.length>1?'<div class="grid grid-cols-4 gap-4">'+product.images.map(function(img,i){return '<button class="aspect-square rounded-lg overflow-hidden border-2 transition-colors '+(i===0?'border-primary':'border-transparent')+'" data-thumb="'+i+'"><img src="'+img+'" alt="" class="w-full h-full object-cover" /></button>';}).join('')+'</div>':'') + '</div>' +
    '<div><div class="mb-4"><span class="badge badge-outline mb-2">'+product.category+'</span><h1 class="text-3xl font-bold mb-2">'+product.name+'</h1><p class="text-text-secondary text-sm">Mã: '+product.code+'</p></div>' +
    '<div class="flex items-baseline gap-4 mb-6"><span class="'+(hd?'price-sale text-3xl':'text-3xl font-bold')+'">'+fp(dp)+'</span>'+(hd?'<span class="price-old text-xl">'+fp(product.basePrice)+'</span>':'')+'</div>' +
    '<div class="border-t border-b border-border py-6 mb-6"><p class="text-text-secondary">'+product.description+'</p></div>' +
    '<div class="mb-6"><div class="flex items-center justify-between mb-3"><label class="font-medium">Chọn size:</label><span class="text-sm text-text-secondary" id="stock-info"></span></div><div class="flex flex-wrap gap-2" id="size-options">'+sizes.map(function(s){return '<button class="btn btn-outline" data-size="'+s+'">'+s+'</button>';}).join('')+'</div></div>' +
    '<div class="mb-6"><label class="font-medium block mb-3">Chọn màu:</label><div class="flex flex-wrap gap-2" id="color-options">'+colors.map(function(c){return '<button class="btn btn-outline" data-color="'+c+'">'+c+'</button>';}).join('')+'</div></div>' +
    '<div class="mb-8"><label class="font-medium block mb-3">Số lượng:</label><div class="flex items-center gap-4"><div class="flex items-center border border-border rounded-lg"><button class="btn btn-ghost btn-icon" id="qty-minus">'+ic('minus','w-4 h-4')+'</button><span class="w-12 text-center font-medium" id="qty-display">1</span><button class="btn btn-ghost btn-icon" id="qty-plus">'+ic('plus','w-4 h-4')+'</button></div></div></div>' +
    '<div class="flex gap-4 mb-6"><button class="btn btn-default btn-lg flex-1" id="add-to-cart-btn" disabled>'+ic('shopping-cart','w-5 h-5')+' Thêm vào giỏ</button><button class="btn btn-outline btn-lg flex-1" id="buy-now-btn" disabled>Mua ngay</button></div></div></div>' +
    (related.length>0?'<div><h2 class="text-2xl font-bold mb-6">Sản phẩm liên quan</h2><div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">'+related.map(function(p){return PC(p);}).join('')+'</div></div>':'') +
    '</div></div>';

  A.renderClient(content, function() {
    var selSize='', selColor='', qty=1;
    function getVariant(){return product.variants.find(function(v){return(!selSize||v.size===selSize)&&(!selColor||v.color===selColor);});}
    function updateUI(){
      var variant=getVariant();var maxQty=variant?variant.stock:0;
      var si=document.getElementById('stock-info');if(si&&selSize&&variant)si.textContent='Còn '+variant.stock+' sản phẩm';
      if(qty>maxQty&&maxQty>0)qty=maxQty;
      document.getElementById('qty-display').textContent=qty;
      var canAdd=selSize&&selColor&&maxQty>0;
      document.getElementById('add-to-cart-btn').disabled=!canAdd;
      document.getElementById('buy-now-btn').disabled=!canAdd;
      document.querySelectorAll('[data-size]').forEach(function(b){b.className='btn '+(selSize===b.dataset.size?'btn-default':'btn-outline');});
      document.querySelectorAll('[data-color]').forEach(function(b){b.className='btn '+(selColor===b.dataset.color?'btn-default':'btn-outline');});
    }
    document.querySelectorAll('[data-size]').forEach(function(b){b.addEventListener('click',function(){selSize=b.dataset.size;updateUI();});});
    document.querySelectorAll('[data-color]').forEach(function(b){b.addEventListener('click',function(){selColor=b.dataset.color;updateUI();});});
    var qm=document.getElementById('qty-minus'),qp=document.getElementById('qty-plus');
    if(qm)qm.addEventListener('click',function(){if(qty>1){qty--;updateUI();}});
    if(qp)qp.addEventListener('click',function(){var v=getVariant();if(v&&qty<v.stock){qty++;updateUI();}});
    document.querySelectorAll('[data-thumb]').forEach(function(b){b.addEventListener('click',function(){
      document.getElementById('main-image').src=product.images[parseInt(b.dataset.thumb)];
      document.querySelectorAll('[data-thumb]').forEach(function(t){t.className='aspect-square rounded-lg overflow-hidden border-2 transition-colors '+(t.dataset.thumb===b.dataset.thumb?'border-primary':'border-transparent');});
    });});
    var acb=document.getElementById('add-to-cart-btn');
    if(acb)acb.addEventListener('click',function(){
      if(!selSize){A.toast.error('Vui lòng chọn size');return;} if(!selColor){A.toast.error('Vui lòng chọn màu');return;}
      var v=getVariant();if(!v)return;
      A.addToCart({variantId:v.id,productId:product.id,productName:product.name,variantLabel:v.size+' / '+v.color,quantity:qty,price:v.price||dp,image:product.images[0],stock:v.stock});
      A.toast.success('Đã thêm vào giỏ hàng');
    });
    var bnb=document.getElementById('buy-now-btn');
    if(bnb)bnb.addEventListener('click',function(){if(acb)acb.click();A.navigateTo('/cart');});
    updateUI();
  });
};

// ===== Cart =====
A.pages.cart = function() {
  var cart=A.getCart();
  if(cart.length===0){ A.renderClient('<div class="py-16 bg-surface min-h-screen"><div class="max-w-7xl mx-auto px-4 text-center"><div class="w-24 h-24 mx-auto mb-6 text-text-secondary">'+ic('shopping-cart','w-24 h-24')+'</div><h2 class="text-2xl font-semibold mb-4">Giỏ hàng trống</h2><p class="text-text-secondary mb-8">Hãy thêm sản phẩm vào giỏ hàng</p><a href="#/shop" class="btn btn-default btn-lg">Tiếp tục mua sắm</a></div></div>'); return; }
  var sub=cart.reduce(function(s,i){return s+i.price*i.quantity;},0);
  var ship=sub>=500000?0:30000, total=sub+ship;
  var content='<div class="py-8 bg-surface min-h-screen"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><h1 class="text-3xl font-bold mb-8">Giỏ hàng ('+cart.length+')</h1><div class="grid grid-cols-1 lg:grid-cols-3 gap-8"><div class="lg:col-span-2 space-y-4">'+
    cart.map(function(item){return '<div class="bg-white rounded-xl border border-border p-4 flex gap-4"><img src="'+item.image+'" alt="'+item.productName+'" class="w-24 h-24 object-cover rounded-lg" /><div class="flex-1 min-w-0"><h3 class="font-medium mb-1">'+item.productName+'</h3><p class="text-sm text-text-secondary mb-2">'+item.variantLabel+'</p><p class="font-semibold text-accent">'+fp(item.price)+'</p></div><div class="flex flex-col items-end justify-between"><button class="text-text-secondary hover:text-error" data-remove="'+item.variantId+'">'+ic('trash-2','w-5 h-5')+'</button><div class="flex items-center border border-border rounded-lg"><button class="btn btn-ghost btn-icon btn-sm" data-qty-minus="'+item.variantId+'">'+ic('minus','w-3 h-3')+'</button><span class="w-8 text-center text-sm font-medium">'+item.quantity+'</span><button class="btn btn-ghost btn-icon btn-sm" data-qty-plus="'+item.variantId+'">'+ic('plus','w-3 h-3')+'</button></div></div></div>';}).join('')+
    '</div><div class="lg:col-span-1"><div class="bg-white rounded-xl border border-border p-6 sticky top-24"><h2 class="text-xl font-semibold mb-6">Tóm tắt đơn hàng</h2><div class="space-y-3 pb-6 border-b border-border"><div class="flex justify-between text-sm"><span class="text-text-secondary">Tạm tính</span><span>'+fp(sub)+'</span></div><div class="flex justify-between text-sm"><span class="text-text-secondary">Phí vận chuyển</span><span>'+(ship===0?'<span class="text-success">Miễn phí</span>':fp(ship))+'</span></div></div><div class="flex justify-between items-baseline mt-6 mb-6"><span class="text-lg font-semibold">Tổng cộng</span><span class="text-2xl font-bold text-accent">'+fp(total)+'</span></div><button class="btn btn-default btn-lg w-full" id="checkout-btn">Tiến hành đặt hàng</button><a href="#/shop" class="block text-center text-sm text-primary hover:underline mt-4">Tiếp tục mua sắm</a></div></div></div></div></div>';

  A.renderClient(content, function(){
    document.querySelectorAll('[data-remove]').forEach(function(b){b.addEventListener('click',function(){A.removeFromCart(b.dataset.remove);A.toast.success('Đã xóa');A.pages.cart();});});
    document.querySelectorAll('[data-qty-minus]').forEach(function(b){b.addEventListener('click',function(){var c=A.getCart(),item=c.find(function(x){return x.variantId===b.dataset.qtyMinus;});if(item&&item.quantity>1){A.updateCartItem(b.dataset.qtyMinus,item.quantity-1);A.pages.cart();}});});
    document.querySelectorAll('[data-qty-plus]').forEach(function(b){b.addEventListener('click',function(){var c=A.getCart(),item=c.find(function(x){return x.variantId===b.dataset.qtyPlus;});if(item&&item.quantity<item.stock){A.updateCartItem(b.dataset.qtyPlus,item.quantity+1);A.pages.cart();}});});
    var cb=document.getElementById('checkout-btn');
    if(cb)cb.addEventListener('click',function(){if(!A.getCurrentUser()){A.toast.error('Vui lòng đăng nhập');A.navigateTo('/login?redirect=/checkout');return;}A.navigateTo('/checkout');});
  });
};

// ===== Checkout =====
A.pages.checkout = function() {
  var cart=A.getCart(),user=A.getCurrentUser();
  if(!user){A.navigateTo('/login?redirect=/checkout');return;} if(cart.length===0){A.navigateTo('/cart');return;}
  var sub=cart.reduce(function(s,i){return s+i.price*i.quantity;},0), ship=sub>=500000?0:30000;
  var content='<div class="py-8 bg-surface min-h-screen"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><h1 class="text-3xl font-bold mb-8">Thanh toán</h1><form id="checkout-form"><div class="grid grid-cols-1 lg:grid-cols-3 gap-8"><div class="lg:col-span-2 space-y-6"><div class="bg-white p-6 rounded-xl border border-border"><h2 class="text-xl font-semibold mb-6">Thông tin nhận hàng</h2><div class="space-y-4"><div><label class="label">Họ và tên *</label><input class="input" id="co-name" value="'+(user.name||'')+'" required /></div><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label class="label">Số điện thoại *</label><input class="input" id="co-phone" type="tel" value="'+(user.phone||'')+'" required /></div><div><label class="label">Email</label><input class="input" id="co-email" type="email" value="'+(user.email||'')+'" /></div></div><div><label class="label">Địa chỉ *</label><textarea class="input" id="co-address" rows="3" required>'+(user.addresses&&user.addresses[0]?user.addresses[0].address:'')+'</textarea></div></div></div><div class="bg-white p-6 rounded-xl border border-border"><h2 class="text-xl font-semibold mb-6">Phương thức thanh toán</h2><div class="space-y-3"><label class="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-surface cursor-pointer"><input type="radio" name="payment" value="cod" checked class="accent-primary" /><div class="flex items-center gap-3 flex-1">'+ic('dollar-sign','w-5 h-5 text-success')+'<div><div class="font-medium">Thanh toán khi nhận hàng (COD)</div></div></div></label><label class="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-surface cursor-pointer"><input type="radio" name="payment" value="online" class="accent-primary" /><div class="flex items-center gap-3 flex-1">'+ic('credit-card','w-5 h-5 text-info')+'<div><div class="font-medium">Thanh toán online</div></div></div></label></div></div></div>' +
    '<div class="lg:col-span-1"><div class="bg-white p-6 rounded-xl border border-border sticky top-24"><h2 class="text-xl font-semibold mb-6">Đơn hàng của bạn</h2><div class="space-y-4 mb-6 max-h-64 overflow-y-auto">'+cart.map(function(i){return '<div class="flex gap-3"><img src="'+i.image+'" alt="" class="w-16 h-16 object-cover rounded-lg" /><div class="flex-1 min-w-0"><p class="font-medium text-sm">'+i.productName+'</p><p class="text-xs text-text-secondary">'+i.variantLabel+' x '+i.quantity+'</p><p class="text-sm font-semibold">'+fp(i.price*i.quantity)+'</p></div></div>';}).join('')+'</div><div class="space-y-3 pb-6 border-b"><div class="flex justify-between text-sm"><span class="text-text-secondary">Tạm tính</span><span>'+fp(sub)+'</span></div><div class="flex justify-between text-sm"><span class="text-text-secondary">Vận chuyển</span><span>'+(ship===0?'<span class="text-success">Miễn phí</span>':fp(ship))+'</span></div></div><div class="flex justify-between items-baseline mt-6 mb-6"><span class="text-lg font-semibold">Tổng cộng</span><span class="text-2xl font-bold text-accent" id="checkout-total">'+fp(sub+ship)+'</span></div><button type="submit" class="btn btn-default btn-lg w-full" id="place-order-btn">Đặt hàng</button></div></div></div></form></div></div>';

  A.renderClient(content, function(){
    document.getElementById('checkout-form').addEventListener('submit',function(e){
      e.preventDefault();
      var btn=document.getElementById('place-order-btn');btn.disabled=true;btn.textContent='Đang xử lý...';
      setTimeout(function(){A.clearCart();var oid='ORD-2024-'+Date.now();A.navigateTo('/payment/result?status=success&orderId='+oid);A.toast.success('Đặt hàng thành công');},1500);
    });
  });
};

// ===== Auth Pages =====
A.pages.login = function() {
  var content='<div class="min-h-screen bg-surface flex items-center justify-center p-4"><div class="bg-white rounded-xl border border-border p-8 w-full max-w-md"><div class="text-center mb-8"><h1 class="text-3xl font-bold mb-2">Đăng nhập</h1><p class="text-text-secondary">Chào mừng bạn đến với Fashion Store</p></div><form id="login-form" class="space-y-4"><div><label class="label">Email hoặc số điện thoại</label><input class="input" id="login-email" required placeholder="example@email.com" /></div><div><label class="label">Mật khẩu</label><input class="input" id="login-password" type="password" required placeholder="••••••••" /></div><div class="flex items-center justify-between text-sm"><label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" class="accent-primary" /> Ghi nhớ</label><a href="#/forgot-password" class="text-primary hover:underline">Quên mật khẩu?</a></div><button type="submit" class="btn btn-default w-full btn-lg" id="login-btn">Đăng nhập</button><div class="text-center text-sm"><span class="text-text-secondary">Chưa có tài khoản? </span><a href="#/register" class="text-primary hover:underline font-medium">Đăng ký ngay</a></div></form></div></div>';
  A.renderFullPage(content, function(){
    document.getElementById('login-form').addEventListener('submit',function(e){
      e.preventDefault();var btn=document.getElementById('login-btn');btn.disabled=true;btn.textContent='Đang đăng nhập...';
      var body={
        identifier: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value
      };
      fetch('http://localhost:5247/user/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
        .then(function(res){
          if(!res.ok) return res.json().then(function(err){throw new Error(err.message||'Đăng nhập thất bại');});
          return res.json();
        })
        .then(function(data){
          A.setCurrentUser({id:data.userId,email:data.email,phone:data.phone,name:data.fullName,username:data.username,role:'customer',addresses:[]});
          A.toast.success('Đăng nhập thành công');
          var q=new URLSearchParams(window.location.hash.split('?')[1]||'');
          A.navigateTo(q.get('redirect')||'/');
        })
        .catch(function(err){
          A.toast.error(err.message||'Đăng nhập thất bại');
          btn.disabled=false;btn.textContent='Đăng nhập';
        });
    });
  });
};

A.pages.register = function() {
  var content='<div class="min-h-screen bg-surface flex items-center justify-center p-4"><div class="bg-white rounded-xl border border-border p-8 w-full max-w-md"><div class="text-center mb-8"><h1 class="text-3xl font-bold mb-2">Đăng ký</h1><p class="text-text-secondary">Tạo tài khoản mới</p></div><form id="register-form" class="space-y-4"><div><label class="label">Tên đăng nhập</label><input class="input" id="reg-username" required minlength="4" placeholder="username" /></div><div><label class="label">Họ và tên</label><input class="input" id="reg-fullname" required placeholder="Nguyễn Văn A" /></div><div><label class="label">Email</label><input class="input" id="reg-email" type="email" required placeholder="example@email.com" /></div><div><label class="label">Số điện thoại</label><input class="input" id="reg-phone" type="tel" placeholder="0901234567" /></div><div><label class="label">Mật khẩu</label><input class="input" type="password" id="reg-pw" required minlength="6" placeholder="••••••••" /></div><div><label class="label">Xác nhận mật khẩu</label><input class="input" type="password" id="reg-confirm" required minlength="6" placeholder="••••••••" /></div><button type="submit" class="btn btn-default w-full btn-lg" id="reg-btn">Đăng ký</button><div class="text-center text-sm"><span class="text-text-secondary">Đã có tài khoản? </span><a href="#/login" class="text-primary hover:underline font-medium">Đăng nhập</a></div></form></div></div>';
  A.renderFullPage(content, function(){
    document.getElementById('register-form').addEventListener('submit',function(e){
      e.preventDefault();if(document.getElementById('reg-pw').value!==document.getElementById('reg-confirm').value){A.toast.error('Mật khẩu xác nhận không khớp');return;}
      var btn=document.getElementById('reg-btn');btn.disabled=true;btn.textContent='Đang đăng ký...';
      var body={
        username: document.getElementById('reg-username').value,
        password: document.getElementById('reg-pw').value,
        confirmPassword: document.getElementById('reg-confirm').value,
        email: document.getElementById('reg-email').value,
        phone: document.getElementById('reg-phone').value || null,
        fullName: document.getElementById('reg-fullname').value
      };
      fetch('http://localhost:5247/user/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
        .then(function(res){
          if(!res.ok) return res.json().then(function(err){throw new Error(err.message||'Đăng ký thất bại');});
          return res.json();
        })
        .then(function(data){
          A.toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
          A.navigateTo('/login');
        })
        .catch(function(err){
          A.toast.error(err.message||'Đăng ký thất bại');
          btn.disabled=false;btn.textContent='Đăng ký';
        });
    });
  });
};

A.pages.forgotPassword = function(){
  var content='<div class="min-h-screen bg-surface flex items-center justify-center p-4"><div class="bg-white rounded-xl border border-border p-8 w-full max-w-md"><div class="text-center mb-8"><h1 class="text-3xl font-bold mb-2">Quên mật khẩu</h1><p class="text-text-secondary">Nhập email để nhận hướng dẫn khôi phục</p></div><form id="forgot-form" class="space-y-4"><div><label class="label">Email</label><input class="input" id="forgot-email" type="email" required /></div><button type="submit" class="btn btn-default w-full btn-lg" id="forgot-btn">Gửi hướng dẫn</button><div class="text-center text-sm"><a href="#/login" class="text-primary hover:underline">Quay lại đăng nhập</a></div></form></div></div>';
  A.renderFullPage(content,function(){document.getElementById('forgot-form').addEventListener('submit',function(e){e.preventDefault();var btn=document.getElementById('forgot-btn');btn.disabled=true;btn.textContent='Đang gửi...';setTimeout(function(){A.toast.success('Đã gửi email khôi phục');A.navigateTo('/login');},1000);});});
};

// ===== Profile =====
A.pages.profile = function(){
  var user=A.getCurrentUser();
  if(!user){A.renderClient('<div class="min-h-screen bg-surface flex items-center justify-center"><div class="text-center"><h2 class="text-2xl font-semibold mb-4">Vui lòng đăng nhập</h2><a href="#/login" class="btn btn-default">Đăng nhập</a></div></div>');return;}
  var content='<div class="py-8 bg-surface min-h-screen"><div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"><h1 class="text-3xl font-bold mb-8">Tài khoản của tôi</h1><div class="tabs-list mb-6"><button class="tab-trigger active" data-tab="profile">Thông tin cá nhân</button><button class="tab-trigger" data-tab="addresses">Địa chỉ</button></div><div class="tab-content active" id="tab-profile"><div class="bg-white rounded-xl border border-border p-6"><h2 class="text-xl font-semibold mb-6">Thông tin cá nhân</h2><form id="profile-form" class="space-y-4 max-w-2xl"><div><label class="label">Họ và tên</label><input class="input" value="'+user.name+'" /></div><div><label class="label">Email</label><input class="input" type="email" value="'+user.email+'" /></div><div><label class="label">Số điện thoại</label><input class="input" type="tel" value="'+user.phone+'" /></div><div class="flex gap-4"><button type="submit" class="btn btn-default">Lưu thay đổi</button><button type="button" class="btn btn-outline" onclick="App.setCurrentUser(null);App.toast.success(\'Đã đăng xuất\');App.navigateTo(\'/\')">Đăng xuất</button></div></form></div></div><div class="tab-content" id="tab-addresses"><div class="bg-white rounded-xl border border-border p-6"><h2 class="text-xl font-semibold mb-6">Địa chỉ của tôi</h2><div class="space-y-4">'+(user.addresses||[]).map(function(a){return '<div class="border border-border rounded-lg p-4"><p class="font-medium">'+a.name+'</p><p class="text-sm text-text-secondary">'+a.phone+'</p><p class="text-sm text-text-secondary mt-2">'+a.address+'</p>'+(a.isDefault?'<span class="inline-block mt-2 text-xs bg-primary text-white px-2 py-1 rounded">Mặc định</span>':'')+'</div>';}).join('')+'</div></div></div></div></div>';
  A.renderClient(content,function(){
    document.querySelectorAll('.tab-trigger').forEach(function(t){t.addEventListener('click',function(){document.querySelectorAll('.tab-trigger').forEach(function(x){x.classList.remove('active');});document.querySelectorAll('.tab-content').forEach(function(x){x.classList.remove('active');});t.classList.add('active');document.getElementById('tab-'+t.dataset.tab).classList.add('active');});});
    var pf=document.getElementById('profile-form');if(pf)pf.addEventListener('submit',function(e){e.preventDefault();A.toast.success('Cập nhật thành công');});
  });
};

// ===== Orders =====
A.pages.orders = function(){
  var orders=A.mockOrders;
  var content='<div class="py-8 bg-surface min-h-screen"><div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"><h1 class="text-3xl font-bold mb-8">Đơn hàng của tôi</h1><div class="space-y-4">'+orders.map(function(o){return '<div class="bg-white rounded-xl border border-border p-6"><div class="flex items-start justify-between mb-4"><div><p class="font-semibold text-lg">'+o.orderNumber+'</p><p class="text-sm text-text-secondary">'+fd(o.createdAt)+'</p></div><div class="text-right">'+SB(o.status)+' '+SB(o.paymentStatus,'payment')+'</div></div><div class="space-y-3 mb-4">'+o.items.map(function(i){return '<div class="flex gap-4"><img src="'+i.image+'" alt="" class="w-16 h-16 object-cover rounded-lg" /><div class="flex-1"><p class="font-medium">'+i.productName+'</p><p class="text-sm text-text-secondary">'+i.variantLabel+' x '+i.quantity+'</p></div><p class="font-semibold">'+fp(i.price*i.quantity)+'</p></div>';}).join('')+'</div><div class="flex items-center justify-between pt-4 border-t border-border"><p class="text-lg font-semibold">Tổng: '+fp(o.total)+'</p><a href="#/orders/'+o.id+'" class="btn btn-outline">Xem chi tiết</a></div></div>';}).join('')+'</div></div></div>';
  A.renderClient(content);
};

A.pages.orderDetail = function(orderId){
  var order=A.mockOrders.find(function(o){return o.id===orderId;});
  if(!order){A.renderClient('<div class="text-center py-12"><h2 class="text-2xl font-semibold mb-4">Không tìm thấy đơn hàng</h2><a href="#/orders" class="btn btn-default">Quay lại</a></div>');return;}
  var content='<div class="py-8 bg-surface min-h-screen"><div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"><a href="#/orders" class="text-primary hover:underline mb-4 inline-block">← Quay lại</a><h1 class="text-3xl font-bold mb-6">'+order.orderNumber+'</h1><div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"><div class="bg-white rounded-xl border border-border p-6"><h2 class="font-semibold mb-4">Thông tin đơn hàng</h2><div class="space-y-2 text-sm"><div class="flex justify-between"><span class="text-text-secondary">Ngày đặt:</span><span>'+fd(order.createdAt)+'</span></div><div class="flex justify-between"><span class="text-text-secondary">Trạng thái:</span>'+SB(order.status)+'</div><div class="flex justify-between"><span class="text-text-secondary">Thanh toán:</span>'+SB(order.paymentStatus,'payment')+'</div></div></div><div class="bg-white rounded-xl border border-border p-6"><h2 class="font-semibold mb-4">Địa chỉ nhận hàng</h2><div class="text-sm space-y-1"><p class="font-medium">'+order.shippingAddress.name+'</p><p class="text-text-secondary">'+order.shippingAddress.phone+'</p><p class="text-text-secondary">'+order.shippingAddress.address+'</p></div></div></div><div class="bg-white rounded-xl border border-border p-6"><h2 class="font-semibold mb-4">Sản phẩm</h2><div class="space-y-4">'+order.items.map(function(i){return '<div class="flex gap-4 pb-4 border-b last:border-0"><img src="'+i.image+'" alt="" class="w-20 h-20 object-cover rounded-lg" /><div class="flex-1"><p class="font-medium">'+i.productName+'</p><p class="text-sm text-text-secondary">'+i.variantLabel+' x '+i.quantity+'</p></div><p class="font-semibold">'+fp(i.price*i.quantity)+'</p></div>';}).join('')+'</div><div class="text-right mt-6 pt-4 border-t"><p class="text-2xl font-bold text-accent">Tổng: '+fp(order.total)+'</p></div></div></div></div>';
  A.renderClient(content);
};

// ===== Payment Result =====
A.pages.paymentResult = function(query){
  var status=query.get('status'),orderId=query.get('orderId'),ok=status==='success';
  var content='<div class="min-h-screen bg-surface flex items-center justify-center p-4"><div class="bg-white rounded-xl border border-border p-8 max-w-md w-full text-center">'+ic(ok?'check-circle-2':'x-circle','w-20 h-20 '+(ok?'text-success':'text-error')+' mx-auto mb-4')+'<h1 class="text-2xl font-bold mb-2">'+(ok?'Đặt hàng thành công!':'Thanh toán thất bại')+'</h1><p class="text-text-secondary mb-6">'+(ok?'Cảm ơn bạn đã đặt hàng.':'Đã có lỗi xảy ra.')+'</p>'+(orderId?'<div class="bg-surface p-4 rounded-lg mb-6"><p class="text-sm text-text-secondary mb-1">Mã đơn hàng</p><p class="font-semibold">'+orderId+'</p></div>':'')+'<div class="flex gap-4"><a href="#/orders" class="btn '+(ok?'btn-default':'btn-outline')+' flex-1">Xem đơn hàng</a><a href="#/" class="btn btn-outline flex-1">Về trang chủ</a></div></div></div>';
  A.renderClient(content);
};

// ===== Simple pages =====
A.pages.categories = function(){
  var cats=A.mockCategories.filter(function(c){return !c.parentId;});
  var content='<div class="py-12 bg-surface min-h-screen"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><h1 class="text-3xl font-bold mb-8">Danh mục sản phẩm</h1><div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">'+cats.map(function(c){return '<a href="#/shop/'+c.slug+'" class="group bg-white rounded-xl border border-border p-8 hover:shadow-lg transition-all text-center"><h3 class="text-xl font-semibold group-hover:text-primary transition-colors">'+c.name+'</h3></a>';}).join('')+'</div></div></div>';
  A.renderClient(content);
};

A.pages.promotions = function(){
  var content='<div class="py-12 bg-surface min-h-screen"><div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"><h1 class="text-3xl font-bold mb-2">Khuyến mãi</h1><p class="text-text-secondary mb-8">Sử dụng mã giảm giá khi thanh toán</p><div class="space-y-4">'+A.mockPromotions.map(function(p){return '<div class="bg-white rounded-xl border border-border p-6 flex items-center gap-6"><div class="flex-shrink-0 w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">'+ic('tag','w-8 h-8 text-accent')+'</div><div class="flex-1"><div class="flex items-center gap-2 mb-2"><span class="badge bg-accent text-white">'+p.code+'</span><span class="badge badge-outline">'+(p.type==='percentage'?'-'+p.value+'%':'-'+fp(p.value))+'</span></div><p class="font-medium mb-1">'+p.description+'</p>'+(p.minOrder?'<p class="text-sm text-text-secondary">Đơn tối thiểu: '+fp(p.minOrder)+'</p>':'')+'</div><button class="btn btn-default" data-copy="'+p.code+'">'+ic('copy','w-4 h-4')+' Sao chép</button></div>';}).join('')+'</div></div></div>';
  A.renderClient(content,function(){document.querySelectorAll('[data-copy]').forEach(function(b){b.addEventListener('click',function(){navigator.clipboard.writeText(b.dataset.copy);A.toast.success('Đã sao chép mã');});});});
};

A.pages.about = function(){
  var content='<div class="py-12 bg-white min-h-screen"><div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"><h1 class="text-4xl font-bold mb-6">Về Fashion Store</h1><div class="prose max-w-none"><p class="text-lg text-text-secondary mb-6">Fashion Store là điểm đến lý tưởng cho những ai yêu thích thời trang hiện đại và chất lượng.</p><h2>Sứ mệnh của chúng tôi</h2><p>Chúng tôi cam kết mang đến những sản phẩm thời trang chất lượng cao với giá cả hợp lý.</p><h2>Liên hệ</h2><ul><li><strong>Địa chỉ:</strong> 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</li><li><strong>Điện thoại:</strong> 1900 xxxx</li><li><strong>Email:</strong> support@fashionstore.com</li></ul></div></div></div>';
  A.renderClient(content);
};

A.pages.notFound = function(){
  var content='<div class="min-h-screen flex items-center justify-center bg-surface"><div class="text-center"><h1 class="text-6xl font-bold text-primary mb-4">404</h1><h2 class="text-2xl font-semibold mb-4">Không tìm thấy trang</h2><p class="text-text-secondary mb-8">Trang bạn đang tìm kiếm không tồn tại.</p><a href="#/" class="btn btn-default">'+ic('home','w-4 h-4')+' Về trang chủ</a></div></div>';
  A.renderClient(content);
};

})();
