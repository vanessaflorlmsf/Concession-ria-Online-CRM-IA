import { createClient } from 'jsr:@supabase/supabase-js@2';

export type Db = ReturnType<typeof createClient>;

export function adminClient(): Db {
  return createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
    auth: { persistSession: false },
  });
}

/** CORS restrito. Defina ALLOWED_ORIGIN (ex.: https://www.sualoja.com.br). Sem ela, nenhum site de navegador é liberado. */
export function corsHeaders(req: Request): Record<string, string> {
  const allowed = Deno.env.get('ALLOWED_ORIGIN') ?? '';
  const origin = req.headers.get('origin') ?? '';
  const h: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
  if (allowed && origin === allowed) h['Access-Control-Allow-Origin'] = origin;
  return h;
}

export function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } });
}

/** Comparação em tempo constante. */
export function safeEqual(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  let diff = ea.length ^ eb.length;
  const len = Math.max(ea.length, eb.length);
  for (let i = 0; i < len; i++) diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
  return diff === 0;
}

/** Autoriza: service role key (chamadas internas) OU usuário ativo da equipe (JWT do Supabase Auth). */
export async function isAuthorizedCaller(req: Request, db: Db): Promise<boolean> {
  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (service && safeEqual(token, service)) return true;
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) return false;
  const { data: profile } = await db.from('profiles').select('active').eq('id', data.user.id).maybeSingle();
  return profile?.active === true;
}

export async function sendWhatsApp(to: string, text: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  const token = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
  const phoneId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
  if (!token || !phoneId) return { ok: false, error: 'WhatsApp não configurado.' };
  const res = await fetch(`https://graph.facebook.com/${Deno.env.get('META_GRAPH_VERSION') || 'v23.0'}/${phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to: to.replace(/\D/g, ''), type: 'text', text: { preview_url: false, body: text.slice(0, 4000) } }),
    signal: AbortSignal.timeout(15000),
  });
  const result = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: result?.error?.message || 'Falha no envio pelo WhatsApp' };
  return { ok: true, id: result?.messages?.[0]?.id };
}
