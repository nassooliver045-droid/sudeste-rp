const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: HEADERS });
}

function clean(value, max = 1500) {
  return String(value ?? "").trim().slice(0, max);
}

function limitDiscord(value, max = 750) {
  const text = clean(value, 1500);
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/wl") {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: HEADERS });
      }

      if (request.method !== "POST") {
        return json({ ok: false, error: "Método não permitido." }, 405);
      }

      if (!env.DISCORD_WEBHOOK) {
        console.error("WL: DISCORD_WEBHOOK não está disponível na versão ativa do Worker.");
        return json({ ok: false, error: "Webhook do Discord não configurado." }, 500);
      }

      try {
        const body = await request.json();
        const data = {
          nome: clean(body.nome, 80),
          idlib: clean(body.idlib, 20),
          discord: clean(body.discord, 100),
          idade: clean(body.idade, 3),
          experiencia: clean(body.experiencia, 80),
          roleplay: clean(body.roleplay),
          motivo: clean(body.motivo),
          rdm: clean(body.rdm),
          vdm: clean(body.vdm),
          mg: clean(body.mg),
          situacao: clean(body.situacao)
        };

        const required = [
          "nome", "idlib", "discord", "idade", "experiencia",
          "roleplay", "motivo", "rdm", "vdm", "mg", "situacao"
        ];

        if (required.some(key => !data[key])) {
          return json({ ok: false, error: "Preencha todos os campos obrigatórios." }, 400);
        }

        if (!/^\d+$/.test(data.idlib)) {
          return json({ ok: false, error: "ID de liberação inválido." }, 400);
        }

        const age = Number(data.idade);
        if (!Number.isInteger(age) || age < 13 || age > 99) {
          return json({ ok: false, error: "Idade inválida." }, 400);
        }

        const protocol = `SD-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
        const now = new Date().toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo"
        });

        const embed = {
          title: "📋 NOVA WHITELIST — SUDESTE RP",
          description: `**Protocolo:** \`${protocol}\`\n**Enviada em:** ${now}`,
          color: 0x1683ff,
          fields: [
            { name: "👤 Nome do jogador", value: limitDiscord(data.nome), inline: true },
            { name: "🆔 ID de liberação", value: limitDiscord(data.idlib), inline: true },
            { name: "💬 Discord", value: limitDiscord(data.discord), inline: true },
            { name: "🎂 Idade", value: limitDiscord(data.idade), inline: true },
            { name: "🎮 Experiência", value: limitDiscord(data.experiencia), inline: true },
            { name: "📖 O que é Roleplay?", value: limitDiscord(data.roleplay) },
            { name: "🎯 Por que quer entrar?", value: limitDiscord(data.motivo) },
            { name: "🔴 O que é RDM?", value: limitDiscord(data.rdm) },
            { name: "🚗 O que é VDM?", value: limitDiscord(data.vdm) },
            { name: "🧠 O que é MG?", value: limitDiscord(data.mg) },
            { name: "⚠️ Situação de rendição", value: limitDiscord(data.situacao) }
          ],
          footer: { text: "Sudeste RP • Sistema de Whitelist" }
        };

        const response = await fetch(env.DISCORD_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "Sudeste RP • WL",
            embeds: [embed]
          })
        });

        if (!response.ok) {
          console.error("WL: Discord rejeitou o webhook. HTTP", response.status);
          return json({ ok: false, error: "Não foi possível enviar a WL para a Staff." }, 502);
        }

        console.log("WL: envio para Discord concluído", protocol);
        return json({ ok: true, protocol });
      } catch (error) {
        console.error("WL: erro interno", error instanceof Error ? error.message : String(error));
        return json({ ok: false, error: "Dados inválidos ou erro interno." }, 400);
      }
    }

    return env.ASSETS.fetch(request);
  }
};
