const crypto = require("crypto");
const sign = (d, s) => crypto.createHmac("sha256", s).update(d).digest("hex");
exports.ok = (req) => {
  const s = process.env.ADMIN_SECRET;
  if (!s) return false;
  const [e, g] = (req.headers.authorization || "").replace("Bearer ", "").split(".");
  if (!e || !g || +e <= Date.now()) return false;
  const a = Buffer.from(g), b = Buffer.from(sign(e, s));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
