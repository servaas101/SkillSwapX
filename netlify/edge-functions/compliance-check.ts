import { Context } from '@netlify/edge-functions';

// Compliance rules
const r = {
  gdpr: {
    required: ['consent', 'purpose', 'retention'],
    pii: ['email', 'phone', 'location']
  },
  ccpa: {
    required: ['notice', 'optout', 'deletion'],
    pii: ['id', 'ip', 'device']
  }
};

// Validate compliance requirements
const v = (d: any, t: 'gdpr' | 'ccpa'): boolean => {
  const c = r[t];
  
  // Check required fields
  for (const f of c.required) {
    if (!d[f]) return false;
  }
  
  // Check PII handling
  for (const p of c.pii) {
    if (d[p] && !d[`${p}_handling`]) return false;
  }
  
  return true;
};

export default async (req: Request, ctx: Context) => {
  try {
    const d = await req.json();
    const t = d.type as 'gdpr' | 'ccpa';
    
    if (!r[t]) {
      return new Response(JSON.stringify({ error: 'Invalid compliance type' }), { 
        status: 400 
      });
    }
    
    const c = v(d.data, t);
    
    return new Response(JSON.stringify({ 
      compliant: c,
      missing: c ? [] : r[t].required.filter(f => !d.data[f])
    }));
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to validate compliance' }), {
      status: 500
    });
  }
}