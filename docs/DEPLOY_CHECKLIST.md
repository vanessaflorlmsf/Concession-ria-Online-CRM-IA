# Checklist de publicação

- [ ] Criar projeto Supabase e guardar credenciais em gerenciador seguro.
- [ ] Executar as duas migrações SQL, na ordem (001 e depois 002 de segurança).
- [ ] Criar usuário Auth e perfil admin.
- [ ] Preencher variáveis `VITE_*` no ambiente local e na hospedagem.
- [ ] Testar build (`npm run build`) e preview.
- [ ] Publicar em Vercel/Netlify e configurar domínio/HTTPS.
- [ ] Configurar secrets das Edge Functions.
- [ ] Implantar funções e validar webhook GET de verificação.
- [ ] Configurar Meta webhook, assinar `messages` e testar com número sandbox.
- [ ] Testar duplicação de eventos, falhas de API e fallback para atendimento humano.
- [ ] Validar RLS com usuário anônimo, vendedor e administrador (anônimo NÃO deve conseguir `select=cost_price` em veículos nem ler `leads`).
- [ ] Confirmar que o webhook responde 401 sem assinatura da Meta e que `ai-sales-agent` responde 401 com a chave anon.
- [ ] Ativar proteção de força bruta/CAPTCHA no Supabase Auth e desativar cadastro público de usuários (Authentication > Providers > Email > desativar "Allow new users to sign up").
- [ ] Rodar `npm audit` e testar os cabeçalhos em https://securityheaders.com
- [ ] Adicionar política de privacidade, base legal, consentimento e retenção LGPD.
- [ ] Remover dados fictícios e substituir telefone, e-mail, endereço e imagens pelos dados reais da loja.
- [ ] Configurar backups, monitoramento e alertas.
- [ ] Fazer teste ponta a ponta antes de anunciar o site.
