import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

function getPath() {
  const raw = location.hash.replace(/^#/, '');
  const pathOnly = raw.split('?')[0] || '/';
  return pathOnly;
}

export function Router({ children }: { children: any }) {
  const [path, setPath] = useState(getPath());

  useEffect(() => {
    // On initial load without a hash (typical on GH Pages deep links),
    // preserve the search (?code, ?state) and route correctly.
    if (!location.hash) {
      if (location.pathname.endsWith('/callback')) {
        location.replace('#/callback');
      } else {
        location.replace('#/');
      }
      // setPath will update on hashchange
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
  return null;
}