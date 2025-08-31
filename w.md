### Token-Exchange Proxy (Serverless)

Deploy one of these minimal proxies:

1) Cloudflare Worker (recommended)
```js
export default {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname !== '/api/token') return new Response('Not found', { status: 404 });
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    const body = await req.text();
    const resp = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body
    });
    const hdrs = new Headers(resp.headers);
    hdrs.set('access-control-allow-origin', '*');
    hdrs.set('access-control-allow-headers', '*');
    return new Response(resp.body, { status: resp.status, headers: hdrs });
  }
}
```
Set `TOKEN_EXCHANGE_URL=https://<your-worker>.workers.dev/api/token` for production.