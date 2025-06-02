import type { Context } from '@netlify/edge-functions';

export default async (req: Request, ctx: Context) => {
  // Encryption key from environment context
  const k = ctx.env.ENCRYPTION_KEY;

  // Encrypt sensitive data
  const e = async (d: any): Promise<string> => {
    const t = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const key = await crypto.subtle.importKey(
      'raw',
      t.encode(k),
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    
    const c = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      t.encode(JSON.stringify(d))
    );
    
    return btoa(String.fromCharCode(...new Uint8Array(c))) + 
           '.' + 
           btoa(String.fromCharCode(...iv));
  };

  try {
    const d = await req.json();
    
    // Encrypt sensitive data
    const c = await e(d.data);
    
    return new Response(
      JSON.stringify({ encrypted: c }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: 'Failed to encrypt data' }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}