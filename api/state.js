export const config = { runtime: 'edge' };

export default async function handler(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (req.method === 'OPTIONS') return new Response(null, { headers });

  const ecId = process.env.EDGE_CONFIG_ID;
  const token = process.env.VERCEL_API_TOKEN;
  const base = `https://api.vercel.com/v1/edge-config/${ecId}`;

  if (req.method === 'GET') {
    const res = await fetch(`${base}/items`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const items = await res.json();
    const layout   = items.find?.(i => i.key === 'layout')?.value ?? null;
    const bookings = items.find?.(i => i.key === 'bookings')?.value ?? {};
    return Response.json({ layout, bookings }, { headers });
  }

  if (req.method === 'POST') {
    const { type, data } = await req.json();
    await fetch(`${base}/items`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [{ operation: 'upsert', key: type, value: data }]
      })
    });
    return Response.json({ ok: true }, { headers });
  }

  return new Response('Method not allowed', { status: 405, headers });
}
