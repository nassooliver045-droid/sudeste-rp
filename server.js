const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 10000);
const ROOT = __dirname;
const WEBHOOK = process.env.DISCORD_WEBHOOK;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

function json(res, data, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(data));
}

function clean(value, max = 1500) {
  return String(value ?? "").trim().slice(0, max);
}

function limitDiscord(value, max = 750) {
  const text = clean(value, 1500);
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", chunk => {
      raw += chunk;
      if (raw.length > 100000) req.destroy();
    });
    req.on("end", () => {
      try { resolve(JSON.parse(raw || "{}")); }
      catch { reject(new Error("JSON inválido")); }
    });
    req.on("error", reject);
  });
}

async function handleWhitelist(req, res) {
  if (req.method === "OPTIONS") return json(res, {}, 204);
  if (req.method !== "POST") return json(res, { ok: false, error: "Método não permitido." }, 405);
  if (!WEBHOOK) {
    console.error("WL: DISCORD_WEBHOOK não configurado no Render.");
    return json(res, { ok: false, error: "Webhook do Discord não configurado." }, 500);
  }

  try {
    const body = await parseBody(req);
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

    const required = ["nome", "idlib", "discord", "idade", "experiencia", "roleplay", "motivo", "rdm", "vdm", "mg", "situacao"];
    if (required.some(key => !data[key])) return json(res, { ok: false, error: "Preencha todos os campos obrigatórios." }, 400);
    if (!/^\d+$/.test(data.idlib)) return json(res, { ok: false, error: "ID de liberação inválido." }, 400);

    const age = Number(data.idade);
    if (!Number.isInteger(age) || age < 13 || age > 99) return json(res, { ok: false, error: "Idade inválida." }, 400);

    const protocol = `SD-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
    const now = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

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

    const response = await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "Sudeste RP • WL", embeds: [embed] })
    });

    if (!response.ok) {
      console.error("WL: Discord rejeitou o webhook. HTTP", response.status);
      return json(res, { ok: false, error: "Não foi possível enviar a WL para a Staff." }, 502);
    }

    console.log("WL: envio para Discord concluído", protocol);
    return json(res, { ok: true, protocol });
  } catch (error) {
    console.error("WL: erro interno", error instanceof Error ? error.message : String(error));
    return json(res, { ok: false, error: "Dados inválidos ou erro interno." }, 400);
  }
}

function serveStatic(req, res) {
  let requestPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname);
  if (requestPath === "/") requestPath = "/index.html";

  const filePath = path.normalize(path.join(ROOT, requestPath));
  if (!filePath.startsWith(ROOT)) return json(res, { ok: false }, 403);

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) return serveFile(path.join(filePath, "index.html"), res);
    serveFile(filePath, res);
  });
}

function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Página não encontrada.");
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname;
  if (pathname === "/api/health") return json(res, { ok: true, service: "sudeste-rp" });
  if (pathname === "/api/wl") return handleWhitelist(req, res);
  return serveStatic(req, res);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Sudeste RP online na porta ${PORT}`);
});
