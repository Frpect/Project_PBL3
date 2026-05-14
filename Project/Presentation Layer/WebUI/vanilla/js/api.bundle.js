// ===== API Helper + JWT =====
(function() {
var App = window.App;

App.API_BASE = 'http://localhost:5247';

// ===== Token Management =====
App.getToken = function() { return localStorage.getItem('leon_token'); };
App.setToken = function(token) { localStorage.setItem('leon_token', token); };
App.clearToken = function() { localStorage.removeItem('leon_token'); };

// ===== Authenticated Fetch =====
App.apiFetch = function(url, options) {
  options = options || {};
  options.headers = options.headers || {};
  options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
  var token = App.getToken();
  if (token) options.headers['Authorization'] = 'Bearer ' + token;
  var fullUrl = url.indexOf('http') === 0 ? url : App.API_BASE + url;
  return fetch(fullUrl, options).then(function(res) {
    if (res.status === 401) {
      App.clearToken();
      App.setCurrentUser(null);
      App.toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      App.navigateTo('/login');
      return Promise.reject(new Error('Unauthorized'));
    }
    return res;
  });
};

})();
