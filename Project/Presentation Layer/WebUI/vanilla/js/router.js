// ===== Simple Hash-based SPA Router =====

class Router {
  constructor() {
    this.routes = [];
    this.currentRoute = null;
    this.beforeEach = null;
    window.addEventListener('hashchange', () => this.resolve());
    window.addEventListener('load', () => this.resolve());
  }

  add(path, handler) {
    this.routes.push({ path, handler });
    return this;
  }

  resolve() {
    const hash = window.location.hash.slice(1) || '/';
    const [pathname, queryString] = hash.split('?');
    const params = new URLSearchParams(queryString || '');

    for (const route of this.routes) {
      const match = this.matchRoute(route.path, pathname);
      if (match) {
        this.currentRoute = { path: pathname, params: match.params, query: params };
        if (this.beforeEach) {
          const proceed = this.beforeEach(this.currentRoute);
          if (proceed === false) return;
        }
        route.handler({ ...match.params, query: params });
        return;
      }
    }

    // 404
    if (this.notFoundHandler) {
      this.notFoundHandler();
    }
  }

  matchRoute(pattern, pathname) {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = pathname.split('/').filter(Boolean);

    if (patternParts.length !== pathParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }
    return { params };
  }

  navigate(path) {
    window.location.hash = path;
  }

  back() {
    window.history.back();
  }

  notFound(handler) {
    this.notFoundHandler = handler;
    return this;
  }

  getCurrentQuery() {
    const hash = window.location.hash.slice(1) || '/';
    const [, queryString] = hash.split('?');
    return new URLSearchParams(queryString || '');
  }
}

export const router = new Router();

// Helper to create links that use hash routing
export function navigateTo(path) {
  router.navigate(path);
}

// Get current path
export function getCurrentPath() {
  return (window.location.hash.slice(1) || '/').split('?')[0];
}
