# Concessionária Online + CRM + Agente de IA

Projeto baseado na vitrine React/Vite original, com painel inicial de estoque/CRM, schema Supabase e Edge Functions para integração com WhatsApp e agente de vendas.

> **Importante:** o código fica pronto para configuração e implantação, mas não pode receber tráfego real até você criar/configurar as contas externas (Supabase, Meta WhatsApp e provedor de IA), adicionar os secrets e validar o ambiente. Não há credenciais reais incluídas. A vitrine usa dados de demonstração quando o Supabase não está configurado.

## Requisitos
- Node.js 20+ e npm
- Projeto Supabase
- Para WhatsApp: conta Meta Business, WhatsApp Business Platform, número habilitado e webhook HTTPS
- Para respostas com IA: chave de API do provedor configurada somente nos secrets do Supabase

## 1. Rodar localmente
```bash
npm install
cp .env.example .env.local
npm run dev
```
Preencha `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_WHATSAPP_NUMBER` e `VITE_STORE_NAME` no `.env.local`. No Windows PowerShell, use `Copy-Item .env.example .env.local`.

Apenas URL do projeto e chave anon/public podem ir para `VITE_*`. **Nunca** coloque `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `WHATSAPP_ACCESS_TOKEN` ou `META_APP_SECRET` em variáveis `VITE_*`.

## 2. Configurar banco e usuário administrador
1. Crie um projeto em https://supabase.com.
2. Abra SQL Editor e execute, **nesta ordem**, `supabase/migrations/202610140001_initial_schema.sql` e depois `supabase/migrations/202610140002_security_hardening.sql`.
3. Em Authentication, crie um usuário com e-mail e senha fortes.
4. Copie o UUID desse usuário em Authentication > Users.
5. No SQL Editor, execute (substitua UUID e nome):
```sql
insert into public.profiles (id, full_name, role, active)
values ('UUID-DO-USUARIO', 'Administrador', 'admin', true);
```
6. Em Project Settings > API, copie a Project URL e a chave anon/public para `.env.local`.
7. Reinicie `npm run dev`. Abra Painel e entre com o usuário criado.

Atenção: o primeiro usuário administrativo deve ser criado por uma pessoa autorizada. Não exponha a service role key ao navegador.

## 3. Publicar frontend
### Vercel
1. Envie o projeto para um repositório Git privado.
2. Importe o repositório em https://vercel.com.
3. Framework: Vite; Build command `npm run build`; Output directory `dist`.
4. Cadastre as variáveis `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_WHATSAPP_NUMBER`, `VITE_STORE_NAME` nas configurações do projeto.
5. Faça deploy e teste catálogo, login e formulário.

O arquivo `vercel.json` já inclui fallback para rotas SPA. Alternativamente, `netlify.toml` contém configuração de deploy para Netlify.

## 4. Configurar Supabase Edge Functions
Instale a CLI do Supabase, faça login e vincule o projeto:
```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY='SUA_SERVICE_ROLE_KEY' OPENAI_API_KEY='SUA_CHAVE_IA' OPENAI_MODEL='gpt-4o-mini' WHATSAPP_ACCESS_TOKEN='TOKEN_META' WHATSAPP_PHONE_NUMBER_ID='ID_NUMERO_META' WHATSAPP_VERIFY_TOKEN='TOKEN_VERIFICACAO_FORTE' META_APP_SECRET='SEGREDO_APP_META' META_GRAPH_VERSION='v23.0' ALLOWED_ORIGIN='https://www.sualoja.com.br'
npx supabase functions deploy whatsapp-webhook
npx supabase functions deploy ai-sales-agent
npx supabase functions deploy whatsapp-send
```
Use a versão Graph API suportada atualmente no painel Meta, caso seja diferente da versão de exemplo. O valor `SUPABASE_URL` é disponibilizado automaticamente no ambiente de Edge Functions; configure manualmente os demais secrets quando solicitado. Não compartilhe tokens em mensagens, screenshots ou repositórios.

## 5. Configurar webhook da Meta
1. No painel Meta Developers, configure WhatsApp e a URL de callback:
   `https://SEU_PROJECT_REF.supabase.co/functions/v1/whatsapp-webhook`
2. Use exatamente o mesmo `WHATSAPP_VERIFY_TOKEN` cadastrado nos secrets.
3. Verifique a assinatura do aplicativo e assine o campo `messages` do webhook do WhatsApp.
4. Use um número de teste e valide mensagens de entrada e saída antes de liberar o número comercial.
5. A Meta exige regras de consentimento, janela de atendimento e templates aprovados para mensagens iniciadas pela empresa. Revise as políticas vigentes antes de ativar automações.

> `META_APP_SECRET` agora é **obrigatório**: sem ele o webhook recusa todas as chamadas. As funções `ai-sales-agent` e `whatsapp-send` só aceitam a service role key ou um usuário ativo da equipe. Veja `docs/SEGURANCA.md`.

## 6. O que já está incluído
- Vitrine responsiva com busca, filtro por marca e cartões de veículos.
- Modo de demonstração sem backend configurado.
- Integração REST com Supabase para veículos e leads.
- Login de equipe via Supabase Auth.
- Painel inicial com visão geral, alteração de estado do estoque e funil de leads.
- Formulário de interesse com confirmação de autorização de contato.
- Schema SQL para veículos, clientes, leads, conversas, mensagens, tarefas, propostas, execuções de agentes e auditoria.
- Webhook WhatsApp com deduplicação básica de mensagens e registro de conversas.
- Agente de vendas que consulta o estoque disponível e responde pelo WhatsApp, com fallback sem IA.
- Configuração inicial de deploy para Vercel e Netlify.

## 7. Limitações que devem ser resolvidas antes de operação comercial
- As credenciais e contas externas precisam ser configuradas por você.
- O webhook cobre mensagens de texto; mídia, áudio, botões, status de entrega/leitura e templates precisam de implementação adicional conforme o fluxo desejado.
- O painel atual é uma primeira versão funcional; não inclui ainda edição completa de veículo, upload de fotos, caixa de entrada de mensagens, propostas, agenda ou gestão de margem.
- O agente de IA é um atendente inicial, não um agente irrestrito de administração do negócio. Alterações de preço, reservas definitivas, descontos e decisões financeiras precisam de regras explícitas, autorização e auditoria.
- Configure um aviso de privacidade verdadeiro, processo para solicitações de titulares, retenção mínima e controle de acesso aos dados pessoais conforme LGPD.
- Adicione testes automatizados, alertas, backups e um procedimento humano de contingência antes de receber clientes reais.

## Scripts
- `npm run dev`: desenvolvimento
- `npm run build`: build de produção
- `npm run preview`: visualizar build localmente
- `npm run lint`: análise estática
