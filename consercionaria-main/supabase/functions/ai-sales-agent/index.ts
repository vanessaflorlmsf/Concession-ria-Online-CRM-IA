import { adminClient, corsHeaders, isAuthorizedCaller, json } from '../_shared/common.ts';
import { runSalesAgent } from '../_shared/agent.ts';

// Uso interno/equipe: exige service role key ou usuário ativo da equipe. A anon key pública NÃO basta.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed' }, 405);
  const db = adminClient();
  if (!(await isAuthorizedCaller(req, db))) return json(req, { error: 'Unauthorized' }, 401);
  const body = await req.json().catch(() => ({}));
  const phone = String(body.phone ?? '').replace(/\D/g, '');
  const message = String(body.message ?? '').trim();
  if (phone.length < 10 || phone.length > 15 || !message) return json(req, { error: 'phone e message válidos são obrigatórios' }, 400);
  const result = await runSalesAgent(db, { phone, message, leadId: body.leadId, conversationId: body.conversationId });
  return json(req, result.ok ? { ok: true, reply: result.reply } : { error: result.error }, result.ok ? 200 : 500);
});
