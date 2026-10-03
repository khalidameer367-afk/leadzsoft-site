const crypto = require("crypto");
const sign = (d, s) => crypto.createHmac("sha256", s).update(d).digest("hex");
const eq = (a, b) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

module.exports = (req, res) => {
  const { ADMIN_USER: u, ADMIN_PASS: p, ADMIN_SECRET: s } = process.env;
  res.setHeader("Cache-Control", "no-store");
  if (!u || !p || !s)
    return res.status(500).json({ error: "Login is not configured. Add ADMIN_USER, ADMIN_PASS and ADMIN_SECRET in Vercel settings." });

  if (req.method === "GET") {
    const t = (req.headers.authorization || "").replace("Bearer ", "");
    const [exp, sig] = t.split(".");
    const ok = !!(exp && sig && +exp > Date.now() && eq(sig, sign(exp, s)));
    return res.status(ok ? 200 : 401).json({ ok });
  }
  if (req.method !== "POST") return res.status(405).end();

  const b = req.body && typeof req.body === "object" ? req.body : {};
  if (eq(String(b.u || ""), u) && eq(String(b.p || ""), p)) {
    const exp = String(Date.now() + 12 * 3600 * 1000);
    return res.status(200).json({ token: exp + "." + sign(exp, s) });
  }
  setTimeout(() => res.status(401).json({ error: "Wrong username or password." }), 800);
};
