import { Context } from '@netlify/edge-functions';

// PII patterns to redact
const p = {
  em: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  ph: /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/g,
  ip: /(\d{1,3}\.){3}\d{1,3}/g,
  id: /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g
};

// Redact PII from text
const r = (t: string): string => {
  let s = t;
  for (const [k, v] of Object.entries(p)) {
    s = s.replace(v, `[REDACTED_${k}]`);
  }
  return s;
};

// Redact PII from object
const o = (d: any): any => {
  if (!d) return d;
  if (typeof d === 'string') return r(d);
  if (Array.isArray(d)) return d.map(o);
  if (typeof d === 'object') {
    const n = {};
    for (const [k, v] of Object.entries(d)) {
      n[k] = o(v);
    }
    return n;
  }
  return d;
};

export default async (req: Request, ctx: Context) => {
  try {
    const d = await req.json();
    const c = d.data;
    
    // Skip redaction for internal system data
    if (d.sys) return new Response(JSON.stringify(d));
    
    // Redact PII from content
    const s = o(c);
    
    return new Response(JSON.stringify({ data: s }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to process data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}