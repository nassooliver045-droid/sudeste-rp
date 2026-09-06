const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined
});

async function initDb() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL não configurado");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS whitelists (
      id BIGSERIAL PRIMARY KEY,
      protocol VARCHAR(20) UNIQUE NOT NULL,
      nome VARCHAR(80) NOT NULL,
      idlib VARCHAR(20) NOT NULL,
      discord VARCHAR(100) NOT NULL,
      idade INTEGER NOT NULL,
      experiencia VARCHAR(80) NOT NULL,
      roleplay TEXT NOT NULL,
      motivo TEXT NOT NULL,
      rdm TEXT NOT NULL,
      vdm TEXT NOT NULL,
      mg TEXT NOT NULL,
      situacao TEXT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'Em análise',
      reviewed_by VARCHAR(120),
      review_reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      reviewed_at TIMESTAMPTZ
    )
  `);
}

async function createWhitelist(data) {
  const result = await pool.query(`
    INSERT INTO whitelists
      (protocol,nome,idlib,discord,idade,experiencia,roleplay,motivo,rdm,vdm,mg,situacao)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING *
  `, [data.protocol,data.nome,data.idlib,data.discord,data.idade,data.experiencia,data.roleplay,data.motivo,data.rdm,data.vdm,data.mg,data.situacao]);
  return result.rows[0];
}

async function listWhitelists(status) {
  const result = status && ["Em análise","Aprovada","Reprovada"].includes(status)
    ? await pool.query("SELECT * FROM whitelists WHERE status=$1 ORDER BY created_at DESC", [status])
    : await pool.query("SELECT * FROM whitelists ORDER BY created_at DESC");
  return result.rows;
}

async function getWhitelist(protocol) {
  const result = await pool.query("SELECT * FROM whitelists WHERE protocol=$1", [protocol]);
  return result.rows[0] || null;
}

async function updateStatus(protocol, status, reviewedBy, reason) {
  const result = await pool.query(`
    UPDATE whitelists
    SET status=$1, reviewed_by=$2, review_reason=$3, reviewed_at=NOW()
    WHERE protocol=$4
    RETURNING *
  `, [status, reviewedBy || null, reason || null, protocol]);
  return result.rows[0] || null;
}

module.exports = { pool, initDb, createWhitelist, listWhitelists, getWhitelist, updateStatus };
