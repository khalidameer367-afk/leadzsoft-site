const db = require("./_db");
const { ok } = require("./_auth");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method === "GET") {
      const v = await db.get("lz_cms");
      res.setHeader("Content-Type", "application/json");
      return res.status(200).send(v || "null");
    }
    if (req.method === "POST") {
      if (!ok(req)) return res.status(401).json({ error: "Session expired, log in again" });
      const b = typeof req.body === "string" ? req.body : JSON.stringify(req.body || null);
      if (b.length > 900000) return res.status(413).json({ error: "Content too large" });
      JSON.parse(b);
      await db.set("lz_cms", b);
      return res.status(200).json({ ok: true });
    }
    res.status(405).end();
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
};
