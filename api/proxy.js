export default async function handler(req, res) {
  const url = req.query.url;

  if (!url) {
    res.status(400).json({ error: 'Missing URL parameter' });
    return;
  }

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.status(204).end();
    return;
  }

  try {
    const upstreamRes = await fetch(url, {
      method: req.method,
      headers: {
        ...req.headers,
        host: new URL(url).host,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
      },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body
    });

    const contentType = upstreamRes.headers.get('content-type');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (contentType) res.setHeader('Content-Type', contentType);

    const data = await upstreamRes.arrayBuffer();
    res.status(upstreamRes.status).send(Buffer.from(data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}