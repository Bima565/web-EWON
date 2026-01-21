import pool from "./db-value.js";

/**
 * Ambil data TERAKHIR per tag
 * Dipakai Dashboard realtime (2 detik)
 */
export async function getLatestTags() {
  const [rows] = await pool.query(`
    SELECT h.tag_name, h.tag_value, h.created_at
    FROM ewon_history h
    INNER JOIN (
      SELECT tag_name, MAX(created_at) AS max_time
      FROM ewon_history
      GROUP BY tag_name
    ) t
      ON h.tag_name = t.tag_name
     AND h.created_at = t.max_time
  `);

  return rows;
}

/**
 * Ambil histori X menit terakhir
 * Default 60 menit (HistoryPower)
 */
export async function getHistoryMinutes(minutes = 60) {
  const [rows] = await pool.query(
    `
    SELECT tag_name, tag_value, created_at
    FROM ewon_history
    WHERE created_at >= NOW() - INTERVAL ? MINUTE
    ORDER BY created_at ASC
    `,
    [minutes]
  );

  return rows;
}

/**
 * Hapus data lama (RETENTION)
 * Default: 60 menit
 */
export async function cleanupOldData(minutes = 60) {
  await pool.query(
    `
    DELETE FROM ewon_history
    WHERE created_at < NOW() - INTERVAL ? MINUTE
    `,
    [minutes]
  );
}
