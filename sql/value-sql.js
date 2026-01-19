import pool from "./db-value.js";

const ALLOWED_TAGS = [
  "Voltage_AN",
  "Frekuensi",
  "Ampere",
  "Kilowatt_hour",
  "THD_AN"
];

// DEBUG: simpan data hanya 10 detik terakhir
const RETENTION_SECONDS = 60 * 60; // 60 menit

export async function insertEwonHistory(tags) {
  const conn = await pool.getConnection();
  try {
    // 🔥 HAPUS DATA LAMA (> 10 detik)
    await conn.query(
      `DELETE FROM ewon_history
       WHERE created_at < NOW() - INTERVAL ? SECOND`,
      [RETENTION_SECONDS]
    );

    // 🔥 INSERT DATA BARU
    for (const tag of ALLOWED_TAGS) {
      const value = tags[tag];
      if (typeof value === "number" && !isNaN(value)) {
        await conn.query(
          `INSERT INTO ewon_history (tag_name, tag_value)
           VALUES (?, ?)`,
          [tag, value]
        );
      }
    }
  } finally {
    conn.release();
  }
}
