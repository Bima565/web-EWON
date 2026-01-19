import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors()); // <<< WAJIB
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
        throw new Error(`eWON request failed with status ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    const lines = text.trim().split(/\r?\n/);
    
    if (lines.length < 2 || !lines[0].includes('"TagId";"TagName";"Value"')) {
        console.error("Unexpected response format from eWON:", text);
        throw new Error("Unexpected response format from eWON.");
    }

    lines.shift(); // remove header

    const tagData = {};
    for (const line of lines) {
        const parts = line.split(';');
        if (parts.length >= 3) {
            const tagName = parts[1].replace(/"/g, '');
            const value = parseFloat(parts[2]);
            if (!isNaN(value)) {
                tagData[tagName] = value;
            }
        }
    }
    return tagData;
}


app.get("/api/ewon", async (req, res) => {
  try {
    const allTags = await getAllTags();

    const data = {
      pm139voltAN: allTags.hasOwnProperty("pm139voltAN") ? allTags["pm139voltAN"] : null,
      pmtest1: allTags.hasOwnProperty("pmtest1") ? allTags["pmtest1"] : null,
      pmtest2: allTags.hasOwnProperty("pmtest2") ? allTags["pmtest2"] : null,
      pmtest3: allTags.hasOwnProperty("pmtest3") ? allTags["pmtest3"] : null,
      pm139THDVAN: allTags.hasOwnProperty("pm139THDVAN") ? allTags["pm139THDVAN"] : null
    };

    res.json(data);
  } catch (err) {
    console.error("Error in /api/ewon:", err.message);
    res.status(500).json({ error: "EWON ERROR", message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running → http://localhost:${PORT}`);
});