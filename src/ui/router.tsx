import { ComponentType } from 'preact';
import { useEffect, useState } from 'preact/hooks';

type RouteProps = { path: string; component: ComponentType<any> };
const routes: RouteProps[] = [];

export function Route(_props: RouteProps) {
  return null;
}

function matchRoute(pathname: string) {
  const path = pathname.replace(/^#/, '').replace(/^\/try240\//, '/');
  const url = new URL(path, location.origin);
  const pathnameOnly = url.pathname;
  return routes.find((r) => r.path === pathnameOnly) ?? routes.find((r) => r.path === '/');
}

export function Router(props: { children: any }) {
  const [node, setNode] = useState<preact.VNode | null>(null);

  useEffect(() => {
    const reg = (child: any) => {
      if (child?.type?.name === 'Route') {
        routes.push({ path: child.props.path, component: child.props.component });
      }
      if (child?.props?.children) ([] as any[]).concat(child.props.children).forEach(reg);
    };
    ([] as any[]).concat(props.children).forEach(reg);

    const renderRoute = () => {
      const m = matchRoute(location.hash || '#/');
      const C = m?.component;
      setNode(C ? (/* @ts-ignore */ <C />) : null);
    };
    window.addEventListener('hashchange', renderRoute);
    renderRoute();
    return () => window.removeEventListener('hashchange', renderRoute);
  }, [props.children]);

  return node;
}