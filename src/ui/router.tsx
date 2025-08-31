import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

function getPath() {
  // Strip query from hash path so exact path matching still works
  const raw = location.hash.replace(/^#/, '');
  const pathOnly = raw.split('?')[0] || '/';
  return pathOnly;
}

export function Router({ children }: { children: any }) {
  const [path, setPath] = useState(getPath());

  useEffect(() => {
    // On initial load without a hash (common on GitHub Pages deep links),
    // preserve query params and set the appropriate hash route.
    if (!location.hash) {
      // If we landed on the PKCE callback path, route to /callback
      if (location.pathname.endsWith('/callback')) {
        // Keep the ?code and ?state in the URL; only set the hash
        location.replace('#/callback');
      } else {
        location.replace('#/');
      }
      // setPath will update on hashchange below
    } else {
      setPath(getPath());
    }

    const onHash = () => setPath(getPath());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const kids = Array.isArray(children) ? children : [children];
  let match: any = null;
  for (const child of kids) {
    if (child && child.props && child.props.path === path) {
      match = child;
      break;
    }
  }
  return match ? h(match.props.component, {}) : null;
}

export function Route(_props: { path: string; component: any }) {
  // Marker component; Router reads its props
  return null;
}