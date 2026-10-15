import { adminClient, corsHeaders, isAuthorizedCaller, json, sendWhatsApp } from '../_shared/common.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed' }, 405);
  const db = adminClient();
  if (!(await isAuthorizedCaller(req, db))) return json(req, { error: 'Unauthorized' }, 401);
  const body = await req.json().catch(() => ({}));
  const to = String(body.to ?? '').replace(/\D/g, '');
  const text = String(body.text ?? '');
  if (to.length < 10 || to.length > 15 || !text.trim() || text.length > 4000) return json(req, { error: 'Informe "to" válido e "text" de até 4000 caracteres.' }, 400);
  const r = await sendWhatsApp(to, text);
  return json(req, r.ok ? { ok: true, id: r.id } : { ok: false, error: r.error }, r.ok ? 200 : 502);
});
