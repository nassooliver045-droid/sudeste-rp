# Sistema de WL — Sudeste RP

A página `wl.html` já está pronta e envia os dados para um backend. O backend envia cada WL para um canal do Discord através de um webhook mantido como segredo no servidor.

## 1. Backend

O arquivo está em `backend/worker.js` e foi preparado para Cloudflare Workers.

Crie um Worker e cole o conteúdo de `backend/worker.js`.

Depois, crie uma variável/secret no Worker:

`DISCORD_WEBHOOK_URL`

O valor deve ser o webhook do canal da Staff. **Não coloque esse webhook dentro do GitHub ou do `config.js`.**

## 2. URL do backend

Depois de publicar o Worker, copie a URL pública dele e abra `config.js`.

Troque:

`COLOQUE_AQUI_A_URL_DO_SEU_WORKER`

pela URL do Worker.

## 3. Resultado

Quando um jogador enviar a WL, a Staff receberá no Discord:

- Nome do jogador
- ID de liberação
- Discord
- Idade
- Experiência
- Resposta sobre Roleplay
- Motivo para entrar
- RDM
- VDM
- Metagaming
- Situação de rendição
- Protocolo da WL
- Data/hora do envio

O webhook fica somente no backend, evitando expor a URL do Discord no site público.
