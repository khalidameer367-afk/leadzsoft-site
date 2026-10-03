const db = require("./_db");
const { ok } = require("./_auth");

module.exports = async (req, res) => {
  const id = String(req.query.id || "");
  if (!/^[a-f0-9]{16,64}$/.test(id)) return res.status(400).end();
  try {
    if (req.method === "GET") {
      const v = await db.get("img:" + id);
      const m = v && /^data:(image\/[a-z0-9.+-]+);base64,(.+)$/.exec(v);
      if (!m) return res.status(404).end();
      res.setHeader("Content-Type", m[1]);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      return res.status(200).send(Buffer.from(m[2], "base64"));
    }
    if (req.method === "POST") {
      if (!ok(req)) return res.status(401).json({ error: "Session expired, log in again" });
      const b = typeof req.body === "string" ? req.body : "";
      if (!/^data:image\//.test(b) || b.length > 900000) return res.status(400).json({ error: "Image too large, use a smaller image" });
      await db.set("img:" + id, b);
      return res.status(200).json({ ok: true });
    }
    res.status(405).end();
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
};
