import { adminClient, safeEqual } from '../_shared/common.ts';
import { runSalesAgent } from '../_shared/agent.ts';

type WaMessage = { id?: string; from?: string; type?: string; text?: { body?: string } };
type WaValue = { messages?: WaMessage[]; contacts?: { profile?: { name?: string } }[] };
type WaPayload = { entry?: { changes?: { value?: WaValue }[] }[] };

async function validSignature(raw: string, header: string | null, secret: string): Promise<boolean> {
  if (!header) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(raw)));
  const expected = 'sha256=' + [...digest].map((b) => b.toString(16).padStart(2, '0')).join('');
  return safeEqual(expected, header);
}

Deno.serve(async (req) => {
  if (req.method === 'GET') {
    const u = new URL(req.url);
    const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN') ?? '';
    const ok = verifyToken && u.searchParams.get('hub.mode') === 'subscribe' && safeEqual(u.searchParams.get('hub.verify_token') ?? '', verifyToken);
    return ok ? new Response(u.searchParams.get('hub.challenge') ?? '', { status: 200 }) : new Response('Forbidden', { status: 403 });
  }
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  // Assinatura da Meta é SEMPRE obrigatória: sem META_APP_SECRET o webhook recusa tudo.
  const appSecret = Deno.env.get('META_APP_SECRET');
  if (!appSecret) return new Response('Webhook not configured', { status: 503 });
  const raw = await req.text();
  if (raw.length > 1_000_000) return new Response('Payload too large', { status: 413 });
  if (!(await validSignature(raw, req.headers.get('x-hub-signature-256'), appSecret))) return new Response('Invalid signature', { status: 401 });

  let payload: WaPayload;
  try { payload = JSON.parse(raw); } catch { return new Response('Invalid JSON', { status: 400 }); }

  const db = adminClient();
  for (const entry of payload.entry ?? []) for (const change of entry.changes ?? []) {
    const value = change.value ?? {};
    for (const message of value.messages ?? []) {
      try {
        if (message.type !== 'text' || !message.from || !message.text?.body) continue;
        const phone = String(message.from).replace(/\D/g, '');
        const body = String(message.text.body).slice(0, 5000);
        if (message.id) {
          const { data: existing } = await db.from('messages').select('id').eq('external_message_id', message.id).maybeSingle();
          if (existing) continue;
        }
        let { data: lead } = await db.from('leads').select('id').eq('phone', phone).order('created_at', { ascending: false }).limit(1).maybeSingle();
        if (!lead) {
          const created = await db.from('leads').insert({ name: (value.contacts?.[0]?.profile?.name ?? `WhatsApp ${phone}`).slice(0, 120), phone, source: 'whatsapp', stage: 'new', interest: '', consent_contact: false }).select('id').single();
          lead = created.data;
        }
        let { data: conv } = await db.from('conversations').select('id,status').eq('channel', 'whatsapp').eq('external_contact_id', phone).neq('status', 'closed').order('created_at', { ascending: false }).limit(1).maybeSingle();
        if (!conv) {
          const created = await db.from('conversations').insert({ lead_id: lead?.id ?? null, channel: 'whatsapp', external_contact_id: phone, status: 'open' }).select('id,status').single();
          conv = created.data;
        }
        if (!conv?.id) continue;
        const ins = await db.from('messages').insert({ conversation_id: conv.id, external_message_id: message.id ?? null, direction: 'inbound', body, status: 'received', metadata: { type: message.type } });
        if (ins.error) continue; // duplicado concorrente (unique) ou falha: não responde duas vezes
        await db.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conv.id);

        if (conv.status === 'human_handoff') continue; // atendimento humano em curso: o robô não responde
        const since = new Date(Date.now() - 3600_000).toISOString();
        const { count } = await db.from('messages').select('id', { count: 'exact', head: true }).eq('conversation_id', conv.id).eq('direction', 'inbound').gte('created_at', since);
        if ((count ?? 0) > 20) continue; // proteção contra flood/custo de IA

        await runSalesAgent(db, { phone, message: body, leadId: lead?.id, conversationId: conv.id });
      } catch (e) {
        console.error('webhook message error', e instanceof Error ? e.message : e);
      }
    }
  }
  return new Response('EVENT_RECEIVED', { status: 200 });
});
