import express from "express";
import fetch from "node-fetch";
import cors from "cors";

import { insertEwonHistory } from "./sql/value-sql.js";
import {
  getLatestTags,
  getHistoryMinutes,
  cleanupOldData
} from "./sql/history-sql.js";

const app = express();
const PORT = 3000;

app.use(cors());

/* ================= KONFIG eWON ================= */
const EWON_IP = "192.168.100.239";
const USER = "admin";
const PASS = "Admin123";
/* ============================================== */

/* =================================================
   FETCH DATA DARI eWON
================================================= */
async function getAllTags() {
  const url =
    `http://${EWON_IP}/rcgi.bin/ParamForm?AST_Param=$dtIV$ftT`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${USER}:${PASS}`).toString("base64")
      },
      signal: controller.signal
    });

    if (!res.ok) {
      throw new Error(`eWON HTTP ${res.status}`);
    }

    const text = await res.text();
    return parseEwonResponse(text);

  } finally {
    clearTimeout(timeoutId);
  }
}

/* =================================================
   PARSER RESPONSE eWON
================================================= */
function parseEwonResponse(text) {
  const lines = text.trim().split(/\r?\n/);

  // header
  lines.shift();

  const data = {};
  for (const line of lines) {
    const parts = line.split(";");
    if (parts.length < 3) continue;

    const tag = parts[1].replace(/"/g, "");
    const value = parseFloat(parts[2]);

    if (!isNaN(value)) {
      data[tag] = value;
    }
  }
  return data;
}

/* =================================================
   AUTO LOGGER → INSERT KE SQL
================================================= */
const LOG_INTERVAL = 30_000; // ⏱ 30 detik

setInterval(async () => {
  try {
    const tags = await getAllTags();
    await insertEwonHistory(tags);

    // hapus data lebih dari 60 menit
    await cleanupOldData(3600);

    console.log("[LOGGER] OK", new Date().toLocaleTimeString());
  } catch (err) {
    console.error("[LOGGER ERROR]", err.message);
  }
}, LOG_INTERVAL);

/* =================================================
   API REALTIME (LANGSUNG EWON)
================================================= */
app.get("/api/ewon", async (req, res) => {
  try {
    const t = await getAllTags();
    res.json({
      Voltage_AN: t.Voltage_AN ?? null,
      Frekuensi: t.Frekuensi ?? null,
      Ampere: t.Ampere ?? null,
      Kilowatt_hour: t.Kilowatt_hour ?? null,
      THD_AN: t.THD_AN ?? null
    });
  } catch {
    res.status(500).json({ error: "EWON ERROR" });
  }
});

/* =================================================
   API DASHBOARD (DATA TERAKHIR SQL)
================================================= */
app.get("/api/history/latest", async (req, res) => {
  try {
    const rows = await getLatestTags();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =================================================
   API HISTORY X MENIT
================================================= */
app.get("/api/history/:minutes", async (req, res) => {
  try {
    const minutes = Number(req.params.minutes) || 60;
    const rows = await getHistoryMinutes(minutes);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "HISTORY ERROR" });
  }
});

/* ================================================= */
app.listen(PORT, () => {
  console.log(`✅ Backend running → http://localhost:${PORT}`);
  console.log("⏱ Auto logger aktif (30 detik)");
});
