import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

function getPath() {
  return location.hash.replace(/^#/, '') || '/';
}

export function Router({ children }: { children: any }) {
  const [path, setPath] = useState(getPath());

  useEffect(() => {
    // Ensure we land on Home by default so the app actually renders a route.
    if (!location.hash) {
      location.replace('#/');
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