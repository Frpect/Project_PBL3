// ===== Admin Pages =====
(function() {
var A = window.App;
var ic = A.icon, fp = A.formatPrice, fd = A.formatDate, SB = A.StatusBadge;

// ===== Admin Login =====
A.pages.adminLogin = function() {
  var content='<div class="min-h-screen bg-surface flex items-center justify-center p-4"><div class="bg-white rounded-xl border border-border p-8 w-full max-w-md"><div class="text-center mb-8"><h1 class="text-3xl font-bold mb-2">Admin Login</h1><p class="text-text-secondary">Đăng nhập vào trang quản trị</p></div><form id="admin-login-form" class="space-y-4"><div><label class="label">Tên đăng nhập</label><input class="input" id="admin-username" required placeholder="admin" /></div><div><label class="label">Mật khẩu</label><input class="input" id="admin-password" type="password" required placeholder="••••••••" /></div><button type="submit" class="btn btn-default w-full btn-lg" id="admin-login-btn">Đăng nhập</button></form></div></div>';
  A.renderFullPage(content, function(){
    document.getElementById('admin-login-form').addEventListener('submit',function(e){e.preventDefault();
      var btn=document.getElementById('admin-login-btn');btn.disabled=true;btn.textContent='Đang đăng nhập...';
      var body={identifier:document.getElementById('admin-username').value,password:document.getElementById('admin-password').value};
      fetch(A.API_BASE+'/user/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
        .then(function(res){if(!res.ok)return res.json().then(function(e){throw new Error(e.message||'Đăng nhập thất bại');});return res.json();})
        .then(function(data){
          var role=(data.role||'').toLowerCase();
          if(role!=='admin'&&role!=='staff'){throw new Error('Tài khoản không có quyền quản trị');}
          if(data.token) A.setToken(data.token);
          A.setCurrentUser({id:data.userId,name:data.fullName,username:data.username,email:data.email,phone:data.phone,role:role});
          A.toast.success('Đăng nhập thành công');A.navigateTo('/admin');
        })
        .catch(function(err){A.toast.error(err.message);btn.disabled=false;btn.textContent='Đăng nhập';});
    });
  });
};

// ===== Analytics =====
A.pages.analytics = function() {
  var content='<div><div class="mb-6"><h1 class="text-3xl font-bold">Tổng quan</h1></div>'+
    '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">'+
    '<div class="card"><div class="card-content pt-6"><div class="flex items-center justify-between"><div><p class="text-sm text-text-secondary">Tổng doanh thu</p><p class="text-2xl font-bold" id="d-rev">Đang tải...</p></div><div class="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">'+ic('dollar-sign','w-6 h-6 text-success')+'</div></div></div></div>'+
    '<div class="card"><div class="card-content pt-6"><div class="flex items-center justify-between"><div><p class="text-sm text-text-secondary">Tổng đơn hàng</p><p class="text-2xl font-bold" id="d-ord">Đang tải...</p></div><div class="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">'+ic('shopping-cart','w-6 h-6 text-info')+'</div></div></div></div>'+
    '<div class="card"><div class="card-content pt-6"><div class="flex items-center justify-between"><div><p class="text-sm text-text-secondary">Tổng sản phẩm</p><p class="text-2xl font-bold" id="d-prod">Đang tải...</p></div><div class="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">'+ic('package','w-6 h-6 text-purple-600')+'</div></div></div></div>'+
    '<div class="card"><div class="card-content pt-6"><div class="flex items-center justify-between"><div><p class="text-sm text-text-secondary">Tổng KH</p><p class="text-2xl font-bold" id="d-cust">Đang tải...</p></div><div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">'+ic('users','w-6 h-6 text-error')+'</div></div></div></div></div>'+
    '<div class="card"><div class="card-header"><h3 class="card-title">Đơn hàng gần đây</h3></div><div class="card-content"><div class="table-wrapper"><table class="data-table"><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Ngày</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead><tbody id="d-orders-tbody"><tr><td colspan="5" class="text-center">Đang tải...</td></tr></tbody></table></div></div></div></div>';
  A.renderAdmin(content, function(){
    A.apiFetch('/api/dashboard/summary').then(function(r){return r.json();}).then(function(s){
      var e1=document.getElementById('d-rev');if(e1)e1.textContent=fp(s.totalRevenue||0);
      var e2=document.getElementById('d-ord');if(e2)e2.textContent=s.totalOrders||0;
      var e3=document.getElementById('d-prod');if(e3)e3.textContent=s.totalProducts||0;
      var e4=document.getElementById('d-cust');if(e4)e4.textContent=s.totalCustomers||0;
    }).catch(function(){});
    A.apiFetch('/api/order?sort=newest&limit=5').then(function(r){return r.json();}).then(function(orders){
      var tb=document.getElementById('d-orders-tbody');
      if(tb) tb.innerHTML=(orders||[]).map(function(o){return '<tr><td class="font-mono">'+(o.orderNumber||'#'+o.orderId)+'</td><td>'+(o.customerName||'')+'</td><td>'+fd(o.orderDate||o.createdAt)+'</td><td class="font-semibold">'+fp(o.totalAmount||o.total||0)+'</td><td>'+SB(o.orderStatus||o.status)+'</td></tr>';}).join('')||'<tr><td colspan="5" class="text-center">Không có dữ liệu</td></tr>';
    }).catch(function(){});
  });
};

// ===== Products List =====
A.pages.productsList = function(){
  var allProds=[];
  function mapP(p){return {id:p.productId,code:p.sku||'',name:p.productName,category:p.categoryName||'',basePrice:p.basePrice||p.price||0,salePrice:p.salePrice||null,images:[p.imageUrl||'https://placehold.co/100x100?text=img'],variants:p.variants||[],status:p.isActive===false?'inactive':'active'};}
  function rows(prods){return prods.map(function(p){var ts=(p.variants||[]).reduce(function(s,v){return s+(v.stock||0);},0);return '<tr><td><img src="'+p.images[0]+'" alt="" class="w-12 h-12 object-cover rounded-lg" /></td><td class="font-mono text-sm">'+p.code+'</td><td class="font-medium">'+p.name+'</td><td>'+p.category+'</td><td>'+fp(p.salePrice||p.basePrice)+'</td><td><span class="'+(ts<10?'text-error font-semibold':'')+'">'+ts+'</span></td><td><span class="badge '+(p.status==='active'?'badge-default':'badge-outline')+'">'+(p.status==='active'?'Hoạt động':'Ngừng')+'</span></td><td class="text-right"><div class="flex justify-end gap-2"><a href="#/admin/products/edit/'+p.id+'" class="btn btn-outline btn-sm">'+ic('pencil','w-4 h-4')+'</a><button class="btn btn-outline btn-sm text-error" data-del-prod="'+p.id+'">'+ic('trash-2','w-4 h-4')+'</button></div></td></tr>';}).join('');}
  var content='<div><div class="flex justify-between items-center mb-6"><div><h1 class="text-3xl font-bold">Sản phẩm</h1><p class="text-text-secondary mt-2" id="prod-count">Đang tải...</p></div><a href="#/admin/products/add" class="btn btn-default">'+ic('plus','w-4 h-4')+' Thêm sản phẩm</a></div><div class="card"><div class="card-header"><div class="flex justify-between items-center"><h3 class="card-title">Danh sách</h3><div class="relative">'+ic('search','w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary')+'<input class="input pl-10 w-80" placeholder="Tìm kiếm..." id="admin-product-search" /></div></div></div><div class="card-content"><div class="table-wrapper"><table class="data-table"><thead><tr><th>Ảnh</th><th>Mã</th><th>Tên</th><th>Danh mục</th><th>Giá</th><th>Tồn</th><th>TT</th><th class="text-right">Thao tác</th></tr></thead><tbody id="admin-products-tbody"><tr><td colspan="8" class="text-center">Đang tải...</td></tr></tbody></table></div></div></div></div>';
  A.renderAdmin(content,function(){
    function bindDel(){document.querySelectorAll('[data-del-prod]').forEach(function(b){b.addEventListener('click',function(){A.showConfirm('Xóa sản phẩm?','Không thể hoàn tác.',function(){A.apiFetch('/api/products/'+b.dataset.delProd,{method:'DELETE'}).then(function(){A.toast.success('Đã xóa');A.pages.productsList();}).catch(function(){A.toast.error('Xóa thất bại');});});});});}
    A.apiFetch('/api/products').then(function(r){return r.json();})
      .then(function(data){allProds=data.map(mapP);var pc=document.getElementById('prod-count');if(pc)pc.textContent=allProds.length+' sản phẩm';var tb=document.getElementById('admin-products-tbody');if(tb){tb.innerHTML=rows(allProds)||'<tr><td colspan="8" class="text-center">Không có sản phẩm</td></tr>';A.initIcons();bindDel();}})
      .catch(function(){document.getElementById('admin-products-tbody').innerHTML='<tr><td colspan="8" class="text-center text-error">Không thể tải</td></tr>';});
    document.getElementById('admin-product-search').addEventListener('input',function(e){
      var t=e.target.value.toLowerCase();var f=allProds.filter(function(p){return p.name.toLowerCase().indexOf(t)>=0||p.code.toLowerCase().indexOf(t)>=0;});
      document.getElementById('admin-products-tbody').innerHTML=rows(f);A.initIcons();bindDel();
    });
  });
};

// ===== Add Product =====
A.pages.addProduct = function(){
  A.apiFetch('/api/category').then(function(r){return r.json();}).then(function(cats){
    var opts=cats.filter(function(c){return !c.parentId;}).map(function(c){return '<option value="'+c.categoryId+'">'+c.name+'</option>';}).join('');
    var content='<div><div class="mb-6"><a href="#/admin/products" class="text-primary hover:underline mb-4 inline-block">← Quay lại</a><h1 class="text-3xl font-bold">Thêm sản phẩm</h1></div><form id="add-product-form"><div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-6"><div class="card"><div class="card-content space-y-4"><div class="grid grid-cols-2 gap-4"><div><label class="label">Mã SP *</label><input class="input" id="ap-code" required /></div><div><label class="label">Danh mục *</label><select class="custom-select" id="ap-cat"><option value="">Chọn</option>'+opts+'</select></div></div><div><label class="label">Tên *</label><input class="input" id="ap-name" required /></div><div><label class="label">Mô tả</label><textarea class="input" id="ap-desc" rows="4"></textarea></div><div class="grid grid-cols-2 gap-4"><div><label class="label">Giá gốc *</label><input class="input" type="number" id="ap-price" required /></div><div><label class="label">Giá sale</label><input class="input" type="number" id="ap-sale" /></div></div></div></div></div><div class="space-y-6"><div class="card"><div class="card-content space-y-3"><button type="submit" class="btn btn-default w-full">'+ic('save','w-4 h-4')+' Lưu</button><a href="#/admin/products" class="btn btn-outline w-full">Hủy</a></div></div></div></div></form></div>';
    A.renderAdmin(content,function(){
      document.getElementById('add-product-form').addEventListener('submit',function(e){
        e.preventDefault();
        var body={productName:document.getElementById('ap-name').value,sku:document.getElementById('ap-code').value,description:document.getElementById('ap-desc').value,categoryId:parseInt(document.getElementById('ap-cat').value)||null,basePrice:parseFloat(document.getElementById('ap-price').value)||0,salePrice:parseFloat(document.getElementById('ap-sale').value)||null};
        A.apiFetch('/api/products',{method:'POST',body:JSON.stringify(body)}).then(function(r){if(!r.ok)throw new Error('Lỗi');return r.json();})
          .then(function(){A.toast.success('Đã thêm');A.navigateTo('/admin/products');})
          .catch(function(e){A.toast.error(e.message||'Thất bại');});
      });
    });
  }).catch(function(){A.renderAdmin('<div class="py-12 text-center text-error">Không tải được danh mục</div>');});
};

// ===== Edit Product =====
A.pages.editProduct = function(productId){
  A.renderAdmin('<div class="py-12 text-center text-text-secondary">Đang tải...</div>');
  Promise.all([A.apiFetch('/api/products/'+productId).then(function(r){if(!r.ok)throw new Error();return r.json();}),A.apiFetch('/api/category').then(function(r){return r.json();})])
  .then(function(res){
    var raw=res[0],cats=res[1]||[];
    var p={id:raw.productId,code:raw.sku||'',name:raw.productName,categoryId:raw.categoryId,description:raw.description||'',basePrice:raw.basePrice||0,salePrice:raw.salePrice||'',variants:raw.variants||[]};
    var opts=cats.filter(function(c){return !c.parentId;}).map(function(c){return '<option value="'+c.categoryId+'" '+(c.categoryId===p.categoryId?'selected':'')+'>'+c.name+'</option>';}).join('');
    var content='<div><div class="mb-6"><a href="#/admin/products" class="text-primary hover:underline mb-4 inline-block">← Quay lại</a><h1 class="text-3xl font-bold">Chỉnh sửa: '+p.name+'</h1></div><form id="edit-product-form"><div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-6"><div class="card"><div class="card-content space-y-4"><div class="grid grid-cols-2 gap-4"><div><label class="label">Mã SP</label><input class="input" id="ep-code" value="'+p.code+'" /></div><div><label class="label">Danh mục</label><select class="custom-select" id="ep-cat"><option value="">Chọn</option>'+opts+'</select></div></div><div><label class="label">Tên</label><input class="input" id="ep-name" value="'+p.name+'" /></div><div><label class="label">Mô tả</label><textarea class="input" id="ep-desc" rows="4">'+p.description+'</textarea></div><div class="grid grid-cols-2 gap-4"><div><label class="label">Giá gốc</label><input class="input" type="number" id="ep-price" value="'+p.basePrice+'" /></div><div><label class="label">Giá sale</label><input class="input" type="number" id="ep-sale" value="'+p.salePrice+'" /></div></div></div></div><div class="card"><div class="card-header"><h3 class="card-title">Biến thể ('+p.variants.length+')</h3></div><div class="card-content"><div class="table-wrapper"><table class="data-table"><thead><tr><th>SKU</th><th>Size</th><th>Màu</th><th>Tồn</th></tr></thead><tbody>'+p.variants.map(function(v){return '<tr><td class="font-mono text-sm">'+(v.sku||'')+'</td><td>'+(v.size||v.sizeName||'')+'</td><td>'+(v.color||v.colorName||'')+'</td><td>'+(v.stock||0)+'</td></tr>';}).join('')+'</tbody></table></div></div></div></div><div class="space-y-6"><div class="card"><div class="card-content space-y-3"><button type="submit" class="btn btn-default w-full">'+ic('save','w-4 h-4')+' Lưu</button><a href="#/admin/products" class="btn btn-outline w-full">Hủy</a></div></div></div></div></form></div>';
    A.renderAdmin(content,function(){
      document.getElementById('edit-product-form').addEventListener('submit',function(e){
        e.preventDefault();
        var body={productName:document.getElementById('ep-name').value,sku:document.getElementById('ep-code').value,description:document.getElementById('ep-desc').value,categoryId:parseInt(document.getElementById('ep-cat').value)||null,basePrice:parseFloat(document.getElementById('ep-price').value)||0,salePrice:parseFloat(document.getElementById('ep-sale').value)||null};
        A.apiFetch('/api/products/'+p.id,{method:'PUT',body:JSON.stringify(body)}).then(function(r){if(!r.ok)throw new Error('Lỗi');return r.json();})
          .then(function(){A.toast.success('Đã cập nhật');A.navigateTo('/admin/products');})
          .catch(function(err){A.toast.error(err.message||'Thất bại');});
      });
    });
  }).catch(function(){A.renderAdmin('<div class="text-center py-12"><h2 class="text-2xl">Không tìm thấy</h2><a href="#/admin/products" class="btn btn-default mt-4">Quay lại</a></div>');});
};

// ===== Orders =====
A.pages.adminOrders = function(){
  var allOrders=[];
  function rows(orders){return orders.map(function(o){var num=o.orderNumber||('#'+o.orderId);return '<tr><td class="font-mono">'+num+'</td><td>'+(o.customerName||o.fullName||'')+'</td><td>'+fd(o.orderDate||o.createdAt)+'</td><td class="font-semibold">'+fp(o.totalAmount||o.total||0)+'</td><td>'+SB(o.orderStatus||o.status)+'</td><td class="text-right"><a href="#/admin/orders/'+o.orderId+'" class="btn btn-outline btn-sm">'+ic('eye','w-4 h-4')+'</a></td></tr>';}).join('');}
  var content='<div><div class="mb-6"><h1 class="text-3xl font-bold">Đơn hàng</h1></div><div class="card"><div class="card-header"><div class="flex justify-between items-center"><h3 class="card-title">Danh sách</h3><div class="relative">'+ic('search','w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary')+'<input class="input pl-10 w-80" placeholder="Tìm kiếm..." id="admin-order-search" /></div></div></div><div class="card-content"><div class="table-wrapper"><table class="data-table"><thead><tr><th>Mã đơn</th><th>Khách</th><th>Ngày</th><th>Tổng</th><th>TT</th><th class="text-right">Thao tác</th></tr></thead><tbody id="admin-orders-tbody"><tr><td colspan="6" class="text-center">Đang tải...</td></tr></tbody></table></div></div></div></div>';
  A.renderAdmin(content,function(){
    A.apiFetch('/api/order/all').then(function(r){return r.json();})
      .then(function(data){allOrders=data||[];var tb=document.getElementById('admin-orders-tbody');if(tb){tb.innerHTML=rows(allOrders)||'<tr><td colspan="6" class="text-center">Không có đơn</td></tr>';A.initIcons();}})
      .catch(function(){document.getElementById('admin-orders-tbody').innerHTML='<tr><td colspan="6" class="text-center text-error">Không thể tải</td></tr>';});
    document.getElementById('admin-order-search').addEventListener('input',function(e){
      var t=e.target.value.toLowerCase();
      var f=allOrders.filter(function(o){return (o.orderNumber||'').toLowerCase().indexOf(t)>=0||(o.customerName||'').toLowerCase().indexOf(t)>=0;});
      document.getElementById('admin-orders-tbody').innerHTML=rows(f);A.initIcons();
    });
  });
};

A.pages.adminOrderDetail = function(orderId){
  A.renderAdmin('<div class="py-12 text-center text-text-secondary">Đang tải...</div>');
  A.apiFetch('/api/order/'+orderId).then(function(r){if(!r.ok)throw new Error();return r.json();})
  .then(function(o){
    var statusOpts=['pending','confirmed','shipping','completed','cancelled'];
    var statusLabels={pending:'Chờ xử lý',confirmed:'Đã xác nhận',shipping:'Đang giao',completed:'Hoàn thành',cancelled:'Đã hủy'};
    var curStatus=o.orderStatus||o.status||'pending';
    var items=o.items||o.orderItems||[];
    var content='<div><div class="mb-6"><a href="#/admin/orders" class="text-primary hover:underline mb-4 inline-block">← Quay lại</a><h1 class="text-3xl font-bold">Đơn hàng '+(o.orderNumber||'#'+o.orderId)+'</h1></div><div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2"><div class="card"><div class="card-header"><h3 class="card-title">Sản phẩm</h3></div><div class="card-content"><div class="table-wrapper"><table class="data-table"><thead><tr><th>Sản phẩm</th><th>Biến thể</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>'+items.map(function(i){return '<tr><td class="font-medium">'+(i.productName||'')+'</td><td>'+(i.variantLabel||i.sku||'')+'</td><td>'+(i.quantity||0)+'</td><td>'+fp(i.price||0)+'</td><td class="font-semibold">'+fp((i.price||0)*(i.quantity||0))+'</td></tr>';}).join('')+'</tbody></table></div><div class="text-right mt-6 pt-4 border-t border-border"><p class="text-2xl font-bold text-accent">Tổng: '+fp(o.totalAmount||o.total||0)+'</p></div></div></div></div><div class="space-y-6"><div class="card"><div class="card-header"><h3 class="card-title">Cập nhật trạng thái</h3></div><div class="card-content space-y-4"><div>'+SB(curStatus)+'</div><select class="custom-select" id="admin-order-status">'+statusOpts.map(function(s){return '<option value="'+s+'" '+(s===curStatus?'selected':'')+'>'+statusLabels[s]+'</option>';}).join('')+'</select><button class="btn btn-default w-full" id="update-order-status">Cập nhật</button></div></div><div class="card"><div class="card-header"><h3 class="card-title">Khách hàng</h3></div><div class="card-content text-sm space-y-2"><p class="font-medium">'+(o.customerName||o.fullName||'')+'</p><p class="text-text-secondary mt-2">'+(o.shippingAddress||o.deliveryAddress||'')+'</p></div></div></div></div></div>';
    A.renderAdmin(content,function(){
      document.getElementById('update-order-status').addEventListener('click',function(){
        var newStatus=document.getElementById('admin-order-status').value;
        A.apiFetch('/api/order/'+o.orderId+'/status',{method:'PUT',body:JSON.stringify({status:newStatus})})
          .then(function(){A.toast.success('Đã cập nhật');A.pages.adminOrderDetail(orderId);})
          .catch(function(){A.toast.error('Cập nhật thất bại');});
      });
    });
  }).catch(function(){A.renderAdmin('<div class="text-center py-12"><h2 class="text-2xl">Không tìm thấy</h2></div>');});
};

// ===== Categories =====
A.pages.adminCategories = function(){
  var cats=[];
  function rows(){return cats.map(function(c){var parent=cats.find(function(p){return p.categoryId===c.parentId;});return '<tr><td class="font-medium">'+c.name+'</td><td class="font-mono text-sm text-text-secondary">'+(c.slug||'')+'</td><td>'+(parent?parent.name:'—')+'</td><td>'+(c.isVisible?'Có':'Không')+'</td><td class="text-right"><button class="btn btn-outline btn-sm text-error" data-del-cat="'+c.categoryId+'">'+ic('trash-2','w-4 h-4')+'</button></td></tr>';}).join('');}
  var content='<div><div class="flex justify-between items-center mb-6"><div><h1 class="text-3xl font-bold">Danh mục</h1><p class="text-text-secondary mt-2" id="cat-count">Đang tải...</p></div><button class="btn btn-default" id="add-cat-btn">'+ic('plus','w-4 h-4')+' Thêm danh mục</button></div><div class="card"><div class="card-content"><div class="table-wrapper"><table class="data-table"><thead><tr><th>Tên</th><th>Slug</th><th>Danh mục cha</th><th>Hiển thị</th><th class="text-right">Thao tác</th></tr></thead><tbody id="cats-tbody"><tr><td colspan="5" class="text-center">Đang tải...</td></tr></tbody></table></div></div></div></div>';
  A.renderAdmin(content,function(){
    function load(){A.apiFetch('/api/category').then(function(r){return r.json();}).then(function(data){cats=data||[];var cc=document.getElementById('cat-count');if(cc)cc.textContent=cats.length+' danh mục';var tb=document.getElementById('cats-tbody');if(tb){tb.innerHTML=rows()||'<tr><td colspan="5" class="text-center">Trống</td></tr>';A.initIcons();bindDel();}}).catch(function(){});}
    function bindDel(){document.querySelectorAll('[data-del-cat]').forEach(function(b){b.addEventListener('click',function(){A.showConfirm('Xóa danh mục?','Không thể hoàn tác.',function(){A.apiFetch('/api/category/'+b.dataset.delCat,{method:'DELETE'}).then(function(){A.toast.success('Đã xóa');load();}).catch(function(){A.toast.error('Xóa thất bại');});});});});}
    load();
    document.getElementById('add-cat-btn').addEventListener('click',function(){
      var dc='<div class="dialog-header"><h3 class="dialog-title">Thêm danh mục</h3></div><div class="space-y-4"><div><label class="label">Tên *</label><input class="input" id="nc-name" /></div><div><label class="label">Slug</label><input class="input" id="nc-slug" /></div></div><div class="dialog-footer"><button class="btn btn-outline" data-close>Hủy</button><button class="btn btn-default" id="nc-save">Thêm</button></div>';
      var dlg=A.showDialog(dc,{maxWidth:'max-w-lg'});
      dlg.element.querySelector('#nc-save').addEventListener('click',function(){
        var name=dlg.element.querySelector('#nc-name').value;if(!name){A.toast.error('Nhập tên');return;}
        var slug=dlg.element.querySelector('#nc-slug').value||name.toLowerCase().replace(/\s+/g,'-');
        A.apiFetch('/api/category',{method:'POST',body:JSON.stringify({name:name,slug:slug,isVisible:true})})
          .then(function(){dlg.close();A.toast.success('Đã thêm');load();})
          .catch(function(){A.toast.error('Thêm thất bại');});
      });
    });
  });
};

// ===== Customers =====
A.pages.adminCustomers = function(){
  var allCusts=[];
  function rows(custs){return custs.map(function(c){var name=c.fullName||c.name||'';var email=c.email||'';var phone=c.phone||'';return '<tr><td class="font-medium">'+name+'</td><td>'+email+'</td><td>'+phone+'</td><td>'+fd(c.createdAt||c.registeredAt)+'</td><td class="text-right"><button class="btn btn-outline btn-sm" data-view-cust="'+c.userId+'">'+ic('eye','w-4 h-4')+'</button></td></tr>';}).join('');}
  var content='<div><div class="mb-6"><h1 class="text-3xl font-bold">Khách hàng</h1><p class="text-text-secondary mt-2" id="cust-count">Đang tải...</p></div><div class="card"><div class="card-header"><div class="flex justify-between items-center"><h3 class="card-title">Danh sách</h3><div class="relative">'+ic('search','w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary')+'<input class="input pl-10 w-80" placeholder="Tìm kiếm..." id="admin-cust-search" /></div></div></div><div class="card-content"><div class="table-wrapper"><table class="data-table"><thead><tr><th>Tên</th><th>Email</th><th>SĐT</th><th>Ngày tham gia</th><th class="text-right">Thao tác</th></tr></thead><tbody id="admin-custs-tbody"><tr><td colspan="5" class="text-center">Đang tải...</td></tr></tbody></table></div></div></div></div>';
  A.renderAdmin(content,function(){
    function bindCustView(){document.querySelectorAll('[data-view-cust]').forEach(function(b){b.addEventListener('click',function(){
      A.apiFetch('/api/customer/'+b.dataset.viewCust).then(function(r){return r.json();}).then(function(c){
        var name=c.fullName||c.name||'';
        var dc='<div class="dialog-header"><h3 class="dialog-title">'+name+'</h3><p class="dialog-description">'+(c.email||'')+' · '+(c.phone||'')+'</p></div><div class="text-sm space-y-2 mt-4"><div class="flex justify-between"><span class="text-text-secondary">Ngày tham gia:</span><span>'+fd(c.createdAt||c.registeredAt)+'</span></div></div><div class="dialog-footer"><button class="btn btn-outline" data-close>Đóng</button></div>';
        A.showDialog(dc,{maxWidth:'max-w-lg'});
      }).catch(function(){A.toast.error('Không thể tải');});
    });});}
    A.apiFetch('/api/customer/search?query=&page=1&pageSize=50').then(function(r){return r.json();})
      .then(function(data){
        allCusts=data.items||data||[];
        var cc=document.getElementById('cust-count');if(cc)cc.textContent=allCusts.length+' khách hàng';
        var tb=document.getElementById('admin-custs-tbody');if(tb){tb.innerHTML=rows(allCusts)||'<tr><td colspan="5" class="text-center">Trống</td></tr>';A.initIcons();bindCustView();}
      }).catch(function(){document.getElementById('admin-custs-tbody').innerHTML='<tr><td colspan="5" class="text-center text-error">Không thể tải</td></tr>';});
    document.getElementById('admin-cust-search').addEventListener('input',function(e){
      var t=e.target.value.toLowerCase();
      var f=allCusts.filter(function(c){return (c.fullName||c.name||'').toLowerCase().indexOf(t)>=0||(c.email||'').toLowerCase().indexOf(t)>=0;});
      document.getElementById('admin-custs-tbody').innerHTML=rows(f);A.initIcons();bindCustView();
    });
  });
};

// ===== Inventory =====
A.pages.inventory = function(){
  var allVariants=[];
  function invRows(vars){return vars.map(function(v){var st=v.stock===0?'Hết hàng':v.stock<10?'Sắp hết':'Còn hàng';var cls=v.stock===0?'text-error font-bold':v.stock<10?'text-warning font-semibold':'text-success';return '<tr><td class="font-mono text-sm">'+(v.productCode||v.sku||'')+'</td><td>'+(v.productName||'')+'</td><td class="font-mono text-sm">'+(v.sku||'')+'</td><td>'+(v.size||v.sizeName||'')+'</td><td>'+(v.color||v.colorName||'')+'</td><td><span class="text-lg '+cls+'">'+v.stock+'</span></td><td>'+st+'</td></tr>';}).join('');}
  var content='<div><div class="flex justify-between items-center mb-6"><div><h1 class="text-3xl font-bold">Quản lý kho</h1></div></div><div class="card"><div class="card-header"><div class="flex justify-between items-center"><h3 class="card-title">Tồn kho theo biến thể</h3><div class="relative">'+ic('search','w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary')+'<input class="input pl-10 w-80" placeholder="Tìm kiếm..." id="inv-search" /></div></div></div><div class="card-content"><div class="table-wrapper"><table class="data-table"><thead><tr><th>Mã SP</th><th>Tên</th><th>SKU</th><th>Size</th><th>Màu</th><th>Tồn</th><th>TT</th></tr></thead><tbody id="inv-tbody"><tr><td colspan="7" class="text-center">Đang tải...</td></tr></tbody></table></div></div></div></div>';
  A.renderAdmin(content,function(){
    A.apiFetch('/api/products?pageSize=200').then(function(r){return r.json();})
      .then(function(prods){
        allVariants=[];
        (prods||[]).forEach(function(p){
          (p.variants||[]).forEach(function(v){
            allVariants.push({productCode:p.sku||'',productName:p.productName||'',sku:v.sku||'',size:v.size||v.sizeName||'',color:v.color||v.colorName||'',stock:v.stock||0,variantId:v.variantId});
          });
        });
        var tb=document.getElementById('inv-tbody');
        if(tb){tb.innerHTML=invRows(allVariants)||'<tr><td colspan="7" class="text-center">Không có dữ liệu</td></tr>';}
      }).catch(function(){document.getElementById('inv-tbody').innerHTML='<tr><td colspan="7" class="text-center text-error">Không thể tải</td></tr>';});
    document.getElementById('inv-search').addEventListener('input',function(e){
      var t=e.target.value.toLowerCase();
      var f=allVariants.filter(function(v){return (v.productName||'').toLowerCase().indexOf(t)>=0||(v.sku||'').toLowerCase().indexOf(t)>=0;});
      document.getElementById('inv-tbody').innerHTML=invRows(f);
    });
  });
};

// ===== POS =====
A.pages.pos = function(){
  var posProducts=[];
  function renderGrid(prods){return prods.map(function(p){var ts=(p.variants||[]).reduce(function(s,v){return s+(v.stock||0);},0);return '<button class="text-left border border-border rounded-lg p-3 hover:bg-surface transition-colors '+(ts===0?'opacity-50':'')+'" '+(ts===0?'disabled':'')+' data-pos-add="'+p.id+'"><img src="'+p.images[0]+'" class="w-full aspect-square object-cover rounded mb-2" /><p class="font-medium text-sm mb-1">'+p.name+'</p><p class="text-sm font-semibold text-primary">'+fp(p.salePrice||p.basePrice)+'</p></button>';}).join('');}
  var content='<div><div class="mb-6"><h1 class="text-3xl font-bold">Bán hàng tại quầy</h1></div><div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2"><div class="relative mb-4">'+ic('search','w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary')+'<input class="input pl-10" placeholder="Tìm sản phẩm..." id="pos-search" /></div><div class="bg-white rounded-xl border border-border p-4"><div class="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto" id="pos-grid"><p class="text-center text-text-secondary col-span-full py-8">Đang tải...</p></div></div></div><div><div class="bg-white rounded-xl border border-border p-4 mb-4"><h2 class="font-semibold mb-4">Thông tin khách hàng</h2><div class="space-y-3"><div><label class="label">Tên *</label><input class="input" id="pos-name" placeholder="Khách lẻ" /></div><div><label class="label">SĐT *</label><input class="input" id="pos-phone" type="tel" /></div></div></div><div class="bg-white rounded-xl border border-border p-4"><div class="flex items-center justify-between mb-4"><h2 class="font-semibold">Giỏ hàng (<span id="pos-count">0</span>)</h2><button class="btn btn-ghost btn-sm text-error" id="pos-clear">Xóa tất cả</button></div><div class="space-y-3 max-h-[250px] overflow-y-auto mb-4" id="pos-cart-items"><p class="text-center text-text-secondary py-8">Trống</p></div><div class="space-y-2 mb-4 pt-4 border-t"><div class="flex justify-between text-lg font-bold"><span>Tổng:</span><span class="text-accent" id="pos-total">0đ</span></div></div><button class="btn btn-default w-full btn-lg" id="pos-checkout-btn" disabled>'+ic('receipt','w-5 h-5')+' Thanh toán</button></div></div></div></div>';

  A.renderAdmin(content,function(){
    var posCart=[];
    function updateUI(){
      document.getElementById('pos-count').textContent=posCart.length;
      var total=posCart.reduce(function(s,i){return s+i.price*i.quantity;},0);
      document.getElementById('pos-total').textContent=fp(total);
      document.getElementById('pos-checkout-btn').disabled=posCart.length===0;
      var el=document.getElementById('pos-cart-items');
      if(posCart.length===0){el.innerHTML='<p class="text-center text-text-secondary py-8">Trống</p>';return;}
      el.innerHTML=posCart.map(function(i){return '<div class="flex gap-3 pb-3 border-b last:border-0"><img src="'+i.image+'" class="w-14 h-14 object-cover rounded" /><div class="flex-1 min-w-0"><p class="font-medium text-sm">'+i.productName+'</p><p class="text-xs text-text-secondary">'+i.variantLabel+'</p><p class="text-sm font-semibold">'+fp(i.price)+'</p><div class="flex items-center gap-2 mt-1"><button class="btn btn-outline btn-sm" data-pm="'+i.variantId+'">-</button><span class="text-sm w-6 text-center">'+i.quantity+'</span><button class="btn btn-outline btn-sm" data-pp="'+i.variantId+'">+</button><button class="btn btn-ghost btn-sm ml-auto text-error" data-pr="'+i.variantId+'">'+ic('trash-2','w-3 h-3')+'</button></div></div></div>';}).join('');
      A.initIcons(el);
      el.querySelectorAll('[data-pm]').forEach(function(b){b.addEventListener('click',function(){var it=posCart.find(function(x){return x.variantId===b.dataset.pm;});if(it&&it.quantity>1){it.quantity--;updateUI();}});});
      el.querySelectorAll('[data-pp]').forEach(function(b){b.addEventListener('click',function(){var it=posCart.find(function(x){return x.variantId===b.dataset.pp;});if(it&&it.quantity<it.stock){it.quantity++;updateUI();}});});
      el.querySelectorAll('[data-pr]').forEach(function(b){b.addEventListener('click',function(){posCart=posCart.filter(function(x){return x.variantId!==b.dataset.pr;});updateUI();});});
    }
    function bindAdd(){document.querySelectorAll('[data-pos-add]').forEach(function(b){b.addEventListener('click',function(){var p=posProducts.find(function(x){return String(x.id)===String(b.dataset.posAdd);});if(!p)return;var v=(p.variants||[])[0];if(!v||v.stock===0){A.toast.error('Hết hàng');return;}var ex=posCart.find(function(x){return x.variantId===v.id;});if(ex){if(ex.quantity>=v.stock){A.toast.error('Không đủ hàng');return;}ex.quantity++;}else posCart.push({variantId:v.id,productId:p.id,productName:p.name,variantLabel:(v.size||'')+' / '+(v.color||''),quantity:1,price:p.salePrice||p.basePrice,image:p.images[0],stock:v.stock});A.toast.success('Đã thêm');updateUI();});});}
    A.apiFetch('/api/products?pageSize=100').then(function(r){return r.json();})
      .then(function(data){
        posProducts=(data||[]).map(function(p){return {id:p.productId,code:p.sku||'',name:p.productName,basePrice:p.basePrice||0,salePrice:p.salePrice||null,images:[p.imageUrl||'https://placehold.co/200x200?text=img'],variants:(p.variants||[])}; });
        document.getElementById('pos-grid').innerHTML=renderGrid(posProducts)||'<p class="col-span-full text-center">Không có sản phẩm</p>';
        A.initIcons();bindAdd();
      }).catch(function(){document.getElementById('pos-grid').innerHTML='<p class="col-span-full text-center text-error">Không thể tải</p>';});
    document.getElementById('pos-search').addEventListener('input',function(e){var t=e.target.value.toLowerCase();var f=posProducts.filter(function(p){return p.name.toLowerCase().indexOf(t)>=0||(p.code||'').toLowerCase().indexOf(t)>=0;});document.getElementById('pos-grid').innerHTML=renderGrid(f);bindAdd();});
    document.getElementById('pos-clear').addEventListener('click',function(){posCart=[];updateUI();});
    document.getElementById('pos-checkout-btn').addEventListener('click',function(){
      if(!document.getElementById('pos-name').value||!document.getElementById('pos-phone').value){A.toast.error('Nhập thông tin khách hàng');return;}
      var body={customerName:document.getElementById('pos-name').value,customerPhone:document.getElementById('pos-phone').value,orderType:'pos',items:posCart.map(function(i){return {variantId:i.variantId,quantity:i.quantity,price:i.price};})};
      A.apiFetch('/api/order',{method:'POST',body:JSON.stringify(body)})
        .then(function(){posCart=[];updateUI();document.getElementById('pos-name').value='';document.getElementById('pos-phone').value='';A.toast.success('Thanh toán thành công!');})
        .catch(function(){A.toast.error('Thanh toán thất bại');});
    });
  });
};

// ===== Promotions =====
A.pages.adminPromotions = function(){
  var content='<div><div class="flex justify-between items-center mb-6"><div><h1 class="text-3xl font-bold">Khuyến mãi</h1></div><button class="btn btn-default" id="add-promo-btn">'+ic('plus','w-4 h-4')+' Thêm</button></div><div class="card"><div class="card-content"><div class="table-wrapper"><table class="data-table"><thead><tr><th>Tên</th><th>Mã</th><th>Giảm giá</th><th>Thời gian</th><th>TT</th><th class="text-right">Thao tác</th></tr></thead><tbody id="promo-tbody"><tr><td colspan="6" class="text-center">Đang tải...</td></tr></tbody></table></div></div></div></div>';
  A.renderAdmin(content,function(){
    function load(){
      A.apiFetch('/api/discounts').then(function(r){return r.json();})
        .then(function(promos){
          var tb=document.getElementById('promo-tbody');
          if(tb) tb.innerHTML=(promos||[]).map(function(p){
            var val=p.discountType==='percentage'||(p.type==='percentage')?(p.discountValue||p.value)+'%':fp(p.discountValue||p.value||0);
            var active=p.isActive!==false;
            return '<tr><td>'+(p.discountName||p.name||'')+'</td><td><span class="badge badge-outline font-mono">'+(p.discountCode||p.code||'')+'</span></td><td>'+val+'</td><td class="text-sm">'+(p.startDate?fd(p.startDate):'-')+' → '+(p.endDate?fd(p.endDate):'-')+'</td><td><span class="badge '+(active?'badge-default':'badge-outline')+'">'+(active?'Hoạt động':'Tạm dừng')+'</span></td><td class="text-right"><button class="btn btn-outline btn-sm text-error" data-del-promo="'+(p.discountId||p.id)+'">'+ic('trash-2','w-4 h-4')+'</button></td></tr>';
          }).join('')||'<tr><td colspan="6" class="text-center">Không có khuyến mãi</td></tr>';
          A.initIcons();
          document.querySelectorAll('[data-del-promo]').forEach(function(b){b.addEventListener('click',function(){
            A.showConfirm('Xóa khuyến mãi?','Không thể hoàn tác.',function(){
              A.apiFetch('/api/discounts/'+b.dataset.delPromo,{method:'DELETE'}).then(function(){A.toast.success('Đã xóa');load();}).catch(function(){A.toast.error('Xóa thất bại');});
            });
          });});
        }).catch(function(){document.getElementById('promo-tbody').innerHTML='<tr><td colspan="6" class="text-center text-error">Không thể tải</td></tr>';});
    }
    load();
    document.getElementById('add-promo-btn').addEventListener('click',function(){
      var dc='<div class="dialog-header"><h3 class="dialog-title">Thêm khuyến mãi</h3></div><div class="space-y-4"><div class="grid grid-cols-2 gap-4"><div><label class="label">Tên *</label><input class="input" id="np-name" /></div><div><label class="label">Mã *</label><input class="input" id="np-code" /></div></div><div class="grid grid-cols-2 gap-4"><div><label class="label">Loại</label><select class="custom-select" id="np-type"><option value="percentage">%</option><option value="fixed">VNĐ</option></select></div><div><label class="label">Giá trị *</label><input class="input" type="number" id="np-value" /></div></div><div class="grid grid-cols-2 gap-4"><div><label class="label">Ngày bắt đầu</label><input class="input" type="date" id="np-start" /></div><div><label class="label">Ngày kết thúc</label><input class="input" type="date" id="np-end" /></div></div></div><div class="dialog-footer"><button class="btn btn-outline" data-close>Hủy</button><button class="btn btn-default" id="np-save">Thêm</button></div>';
      var dlg=A.showDialog(dc,{maxWidth:'max-w-2xl'});
      dlg.element.querySelector('#np-save').addEventListener('click',function(){
        var name=dlg.element.querySelector('#np-name').value;
        var code=dlg.element.querySelector('#np-code').value.toUpperCase();
        if(!name||!code){A.toast.error('Nhập tên và mã');return;}
        var body={discountName:name,discountCode:code,discountType:dlg.element.querySelector('#np-type').value,discountValue:parseFloat(dlg.element.querySelector('#np-value').value)||0,startDate:dlg.element.querySelector('#np-start').value||null,endDate:dlg.element.querySelector('#np-end').value||null,isActive:true};
        A.apiFetch('/api/discounts',{method:'POST',body:JSON.stringify(body)})
          .then(function(){dlg.close();A.toast.success('Đã thêm');load();})
          .catch(function(){A.toast.error('Thêm thất bại');});
      });
    });
  });
};

// ===== Staff =====
A.pages.staff = function(){
  var allStaff=[];
  function rows(list){return list.map(function(s){var name=s.fullName||s.name||'';var active=s.isActive!==false&&s.status!=='locked';return '<tr><td class="font-medium">'+name+'</td><td class="font-mono">'+(s.username||'')+'</td><td>'+(s.email||'')+'</td><td>'+(s.phone||'')+'</td><td><span class="badge '+(active?'badge-default':'badge-destructive')+'">'+(active?'Hoạt động':'Đã khóa')+'</span></td><td class="text-right"><button class="btn btn-outline btn-sm" data-del-staff="'+s.userId+'">'+ic('trash-2','w-4 h-4')+'</button></td></tr>';}).join('');}
  var content='<div><div class="flex justify-between items-center mb-6"><div><h1 class="text-3xl font-bold">Nhân viên</h1><p class="text-text-secondary mt-1" id="staff-count">Đang tải...</p></div><button class="btn btn-default" id="add-staff-btn">'+ic('plus','w-4 h-4')+' Thêm</button></div><div class="card"><div class="card-content"><div class="table-wrapper"><table class="data-table"><thead><tr><th>Họ tên</th><th>Username</th><th>Email</th><th>SĐT</th><th>TT</th><th class="text-right">Thao tác</th></tr></thead><tbody id="staff-tbody"><tr><td colspan="6" class="text-center">Đang tải...</td></tr></tbody></table></div></div></div></div>';
  A.renderAdmin(content,function(){
    function bindDel(){document.querySelectorAll('[data-del-staff]').forEach(function(b){b.addEventListener('click',function(){A.showConfirm('Xóa nhân viên?','Không thể hoàn tác.',function(){A.apiFetch('/api/staff/'+b.dataset.delStaff,{method:'DELETE'}).then(function(){A.toast.success('Đã xóa');load();}).catch(function(){A.toast.error('Xóa thất bại');});});});});}
    function load(){
      A.apiFetch('/api/staff').then(function(r){return r.json();})
        .then(function(data){
          allStaff=data||[];
          var sc=document.getElementById('staff-count');if(sc)sc.textContent=allStaff.length+' nhân viên';
          var tb=document.getElementById('staff-tbody');if(tb){tb.innerHTML=rows(allStaff)||'<tr><td colspan="6" class="text-center">Trống</td></tr>';A.initIcons();bindDel();}
        }).catch(function(){document.getElementById('staff-tbody').innerHTML='<tr><td colspan="6" class="text-center text-error">Không thể tải</td></tr>';});
    }
    load();
    document.getElementById('add-staff-btn').addEventListener('click',function(){
      var dc='<div class="dialog-header"><h3 class="dialog-title">Thêm nhân viên</h3></div><div class="space-y-4"><div><label class="label">Họ tên *</label><input class="input" id="ns-name" /></div><div><label class="label">Username *</label><input class="input" id="ns-user" /></div><div><label class="label">Email *</label><input class="input" id="ns-email" type="email" /></div><div><label class="label">SĐT</label><input class="input" id="ns-phone" /></div><div><label class="label">Mật khẩu *</label><input class="input" type="password" id="ns-pass" /></div></div><div class="dialog-footer"><button class="btn btn-outline" data-close>Hủy</button><button class="btn btn-default" id="ns-save">Thêm</button></div>';
      var dlg=A.showDialog(dc,{maxWidth:'max-w-lg'});
      dlg.element.querySelector('#ns-save').addEventListener('click',function(){
        var name=dlg.element.querySelector('#ns-name').value;
        var user=dlg.element.querySelector('#ns-user').value;
        var email=dlg.element.querySelector('#ns-email').value;
        var pass=dlg.element.querySelector('#ns-pass').value;
        if(!name||!user||!email||!pass){A.toast.error('Điền đầy đủ');return;}
        var body={fullName:name,username:user,email:email,phone:dlg.element.querySelector('#ns-phone').value,password:pass,role:'Staff'};
        A.apiFetch('/api/staff',{method:'POST',body:JSON.stringify(body)})
          .then(function(r){if(!r.ok)throw new Error('Lỗi');dlg.close();A.toast.success('Đã thêm');load();})
          .catch(function(){A.toast.error('Thêm thất bại');});
      });
    });
  });
};

})();
