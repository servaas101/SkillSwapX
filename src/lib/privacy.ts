import { sb } from './supabase';

// Privacy shield service
export const p = {
  // Redact PII from data
  async redact(d: any) {
    const r = await fetch('/.netlify/functions/pii-redact', {
      method: 'POST',
      body: JSON.stringify({ data: d })
    });
    return r.json();
  },

  // Check compliance requirements
  async check(d: any, t: 'gdpr' | 'ccpa') {
    const r = await fetch('/.netlify/functions/compliance-check', {
      method: 'POST',
      body: JSON.stringify({ type: t, data: d })
    });
    return r.json();
  },

  // Encrypt sensitive data
  async encrypt(d: any) {
    const r = await fetch('/.netlify/functions/data-encrypt', {
      method: 'POST',
      body: JSON.stringify({ data: d })
    });
    const { encrypted } = await r.json();
    
    if (encrypted) {
      const [dat, iv] = encrypted.split('.');
      await sb.rpc('store_encrypted', {
        p_typ: 'sensitive',
        p_dat: dat,
        p_iv: iv
      });
    }
    
    return encrypted;
  },

  // Log compliance action
  async log(t: string, a: string, d: any) {
    return sb.rpc('log_consent', {
      p_typ: t,
      p_act: a,
      p_dat: d
    });
  }
};