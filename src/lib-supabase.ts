const url = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const supabaseConfigured = Boolean(url && anon && !url.includes('SEU-PROJETO'));
export const supabaseUrl = url;
export const supabaseAnonKey = anon;

// Colunas públicas de veículos (a vitrine anônima não pode ler custo, placa, chassi etc.)
export const PUBLIC_VEHICLE_COLUMNS = 'id,brand,model,year,price,mileage,fuel,transmission,color,image_url,gallery,features,description,is_new,status,created_at';

export type AuthUser = { id: string; email?: string };
type Tokens = { access: string; refresh: string; expiresAt: number };
let tokens: Tokens | null = null; // somente em memória: fechar/recarregar a aba encerra a sessão

export function getAccessToken() { return tokens?.access ?? ''; }
export function errorMessage(e: unknown, fallback = 'Ocorreu um erro.') { return e instanceof Error && e.message ? e.message : fallback; }

function storeTokens(r: { access_token: string; refresh_token: string; expires_in?: number }) {
  tokens = { access: r.access_token, refresh: r.refresh_token, expiresAt: Date.now() + (r.expires_in ?? 3600) * 1000 };
}

async function rawFetch(path: string, options: RequestInit, bearer: string) {
  const headers = new Headers(options.headers || {});
  headers.set('apikey', anon);
  headers.set('Authorization', `Bearer ${bearer}`);
  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${url}${path}`, { ...options, headers });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.message || body?.error_description || body?.error || `Erro HTTP ${response.status}`);
  return body;
}

async function ensureFreshToken() {
  if (!tokens || tokens.expiresAt - Date.now() > 60_000) return;
  try {
    storeTokens(await rawFetch('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: JSON.stringify({ refresh_token: tokens.refresh }) }, anon));
  } catch {
    tokens = null;
    throw new Error('Sessão expirada. Entre novamente.');
  }
}

export async function api(path: string, options: RequestInit = {}) {
  if (!supabaseConfigured) throw new Error('Supabase ainda não configurado. Copie .env.example para .env.local e preencha as credenciais.');
  await ensureFreshToken();
  return rawFetch(path, options, tokens?.access || anon);
}

/** Entra e confirma que o usuário é da equipe (perfil ativo). Caso contrário, encerra a sessão. */
export async function signIn(email: string, password: string): Promise<{ user: AuthUser; role: string }> {
  const result = await rawFetch('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) }, anon);
  storeTokens(result);
  const user: AuthUser = { id: result.user.id, email: result.user.email };
  const profiles = await api(`/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=role,active`).catch(() => []);
  const profile = Array.isArray(profiles) ? profiles[0] : null;
  if (!profile || profile.active !== true) {
    await signOut();
    throw new Error('Este usuário não tem permissão de acesso ao painel.');
  }
  return { user, role: profile.role };
}

export async function signOut() {
  const t = tokens;
  tokens = null;
  if (t && supabaseConfigured) await rawFetch('/auth/v1/logout', { method: 'POST' }, t.access).catch(() => null);
}
