# Correções de segurança aplicadas

| # | Problema encontrado | Correção |
|---|---|---|
| 1 | `ai-sales-agent` aceitava qualquer JWT, inclusive a chave **anon pública**: qualquer pessoa podia mandar WhatsApp para qualquer número usando o token da loja e gastar crédito de IA. | Exige service role key ou usuário ativo da equipe. Valida telefone e tamanho da mensagem. |
| 2 | Webhook do WhatsApp aceitava POST **sem assinatura** (a verificação era opcional). Dava para forjar mensagens. | Assinatura HMAC da Meta sempre obrigatória, comparação em tempo constante; sem `META_APP_SECRET` recusa tudo. |
| 3 | A vitrine pública lia `select=*`, expondo `cost_price`, placa, chassi e data de aquisição. | Acesso anônimo só às colunas públicas (migração 002) e consulta explícita no frontend. |
| 4 | Sem limite de envio no formulário de leads (spam e lixo no CRM). | Limite por telefone e global por hora, honeypot, tamanhos máximos, campos internos bloqueados na política RLS. |
| 5 | CORS `*` / `localhost` nas funções. | CORS só para `ALLOWED_ORIGIN`. |
| 6 | Robô respondia mesmo com atendimento humano em curso e sem limite de mensagens. | Respeita `human_handoff`, limite de 20 mensagens/hora por conversa, histórico das últimas mensagens, instruções contra prompt injection. |
| 7 | Em caso de falha do Supabase, a vitrine mostrava veículos de demonstração como se fossem reais. | Dados de exemplo só aparecem quando o Supabase não está configurado. |
| 8 | Login: qualquer usuário do Auth entrava no painel; sessão expirava sem aviso. | Confere perfil ativo na tabela `profiles`, renova o token, faz logout no servidor. |
| 9 | Sem cabeçalhos de segurança. | CSP, HSTS, X-Frame-Options, nosniff, Referrer/Permissions-Policy no `vercel.json` e `netlify.toml`. |
| 10 | Equipe comum podia apagar registros; sem trilha de auditoria. | Delete revogado para a equipe; triggers de auditoria (só nomes de colunas, sem dados pessoais). |
| 11 | Pipeline do GitHub (Deno) falhava por não haver testes. | Trocado por CI Node: lint, typecheck, build e `npm audit`. |
| 12 | `any` no TypeScript quebrava o lint; título/idioma do HTML genéricos. | Tipos corrigidos; `index.html` em pt-BR. |

## Ainda depende de você
- Criar as contas, colar os secrets e publicar (ver README e `DEPLOY_CHECKLIST.md`).
- Aviso de privacidade e base legal LGPD reais; processo de exclusão de dados (feito por admin no SQL Editor).
- Se o Supabase usar domínio próprio, ajustar `connect-src` do CSP.
- Componentes antigos (`CustomerForm`, `FinancingSimulator`, `Header`, `Hero`...) não são usados pelo `App.tsx`; o `CustomerForm` coleta CPF e **não deve** ser ligado sem proteção adicional.
- Testes automatizados e backups.
