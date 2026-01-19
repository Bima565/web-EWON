import pool from "./db-value.js";

/**
 * Ambil history 60 menit terakhir
 */
export async function getHistory60Minutes() {
  const [rows] = await pool.query(`
    SELECT
      tag_name,
      tag_value,
      created_at
    FROM ewon_history
    WHERE created_at >= NOW() - INTERVAL 60 MINUTE
    ORDER BY created_at ASC
  `);

  return rows;
}

/**
 * Hapus data lebih lama dari 60 menit
 */
export async function cleanupOldHistory() {
  await pool.query(`
    DELETE FROM ewon_history
    WHERE created_at < NOW() - INTERVAL 60 MINUTE
  `);
}
