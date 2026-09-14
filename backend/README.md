# NKG dos Importados — Backend

Estrutura inicial (MVC) do backend em Node.js + Express + MySQL.

## Produção

1. Copie `.env.example` para `.env` e forneça os segredos por um gerenciador de segredos.
2. Configure `FRONTEND_URL`, `JWT_ISSUER`, `JWT_AUDIENCE` e `MERCADOPAGO_WEBHOOK_SECRET`.
3. Aponte o `MERCADOPAGO` para a URL HTTPS pública `/api/pagamentos/webhook`.
4. Ative `DB_SSL=true` quando o servidor MySQL oferecer certificado verificável.
5. Para desenvolvimento com Mercado Pago, configure `NGROK_AUTHTOKEN` e execute `npm run tunnel` dentro de `backend`.

A API exige `Idempotency-Key` no `POST /api/pedidos`. O webhook valida o manifesto oficial do Mercado Pago (`ts`, `v1`, `x-request-id` e `data.id`) e ignora eventos já processados.

O frete de envio é cotado pelo Melhor Envio usando `CEP_ORIGEM=64900000`, peso e dimensões dos produtos. Configure `MELHOR_ENVIO_TOKEN` e um `MELHOR_ENVIO_USER_AGENT` com o contato da aplicação. Destinos no mesmo CEP de origem recebem frete grátis sem chamada externa. Execute a migração para criar os campos logísticos antes de publicar.

Em desenvolvimento, cadastre no Mercado Pago a URL exibida pelo túnel com o sufixo `/api/pagamentos/webhook`. Em produção, use uma URL HTTPS estável; não use a URL temporária do ngrok como configuração permanente.
