/**
 * Lightweight hash-based SPA router for Evermore Archive
 */

const routes = {};
let currentCleanup = null;
let notFoundHandler = null;

export function route(path, handler) {
  routes[path] = handler;
}

export function setNotFound(handler) {
  notFoundHandler = handler;
}

export function navigate(path) {
  window.location.hash = '#' + path;
}

export function currentPath() {
  return window.location.hash.slice(1) || '/';
}

export async function resolve() {
  const path = currentPath();
  const app = document.getElementById('app');

  // Run cleanup from previous page
  if (typeof currentCleanup === 'function') {
    currentCleanup();
    currentCleanup = null;
  }

  // Find matching route (supports simple :param patterns)
  let handler = routes[path];
  let params = {};

  if (!handler) {
    for (const [pattern, h] of Object.entries(routes)) {
      const match = matchRoute(pattern, path);
      if (match) {
        handler = h;
        params = match;
        break;
      }
    }
  }

  if (handler) {
    const result = await handler(app, params);
    if (typeof result === 'function') {
      currentCleanup = result;
    }
  } else if (notFoundHandler) {
    notFoundHandler(app);
  }
}

function matchRoute(pattern, path) {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');
  if (patternParts.length !== pathParts.length) return null;
  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

/* Auto-resolve on hash change */
window.addEventListener('hashchange', resolve);
