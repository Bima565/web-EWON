import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import { insertEwonHistory } from "./sql/value-sql.js";

const app = express();
const PORT = 3000;

app.use(cors());

// ===== SESUAIKAN =====
const EWON_IP = "192.168.100.239";
const USER = "admin";
const PASS = "Admin123";
// =====================

async function getAllTags() {
    const url =
        `http://${EWON_IP}/rcgi.bin/ParamForm` +
        `?AST_Param=$dtIV$ftT`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let response;
    try {
        response = await fetch(url, {
            headers: {
                Authorization:
                    "Basic " + Buffer.from(`${USER}:${PASS}`).toString("base64")
            },
            signal: controller.signal
        });
    } finally {
        clearTimeout(timeoutId);
    }

    if (!response.ok) {
        throw new Error(`eWON request failed ${response.status}`);
    }

    const text = await response.text();
    const lines = text.trim().split(/\r?\n/);

    if (!lines[0]?.includes('"TagId";"TagName";"Value"')) {
        throw new Error("Unexpected eWON response format");
    }

    lines.shift(); // remove header

    const tagData = {};
    for (const line of lines) {
        const parts = line.split(";");
        if (parts.length >= 3) {
            const tagName = parts[1].replace(/"/g, "");
            const value = parseFloat(parts[2]);
            if (!isNaN(value)) {
                tagData[tagName] = value;
            }
        }
    }
    return tagData;
}

//
// ==================== AUTO LOGGER ====================
// Simpan histori setiap 1 menit
//
const LOG_INTERVAL = 60_000; // 1 menit

setInterval(async () => {
    try {
        const tags = await getAllTags();
        await insertEwonHistory(tags);
        console.log(`[LOGGER] eWON logged @ ${new Date().toISOString()}`);
    } catch (err) {
        console.error("[LOGGER ERROR]", err.message);
    }
}, LOG_INTERVAL);

//
// ==================== API MANUAL ====================
//
app.get("/api/ewon", async (req, res) => {
    try {
        const allTags = await getAllTags();

        res.json({
            pm139voltAN: allTags.pm139voltAN ?? null,
            pmtest1: allTags.pmtest1 ?? null,
            pmtest2: allTags.pmtest2 ?? null,
            pmtest3: allTags.pmtest3 ?? null,
            pm139THDVAN: allTags.pm139THDVAN ?? null
        });
    } catch (err) {
        console.error("API ERROR:", err.message);
        res.status(500).json({ error: "EWON ERROR", message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Backend running → http://localhost:${PORT}`);
    console.log("Auto logger ACTIVE (1 minute interval)");
});
