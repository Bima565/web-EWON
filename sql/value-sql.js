import pool from "./db-value.js";

export async function insertEwonHistory(tagData) {
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const insertSQL = `
            INSERT INTO ewon_history (tag_name, tag_value, created_at)
            VALUES (?, ?, NOW())
        `;

        for (const [tagName, value] of Object.entries(tagData)) {
            if (typeof value === "number" && !isNaN(value)) {
                await conn.execute(insertSQL, [tagName, value]);
            }
        }

        // Hapus data lebih dari 60 menit
        await conn.execute(`
            DELETE FROM ewon_history
            WHERE created_at < NOW() - INTERVAL 60 MINUTE
        `);

        await conn.commit();
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}
