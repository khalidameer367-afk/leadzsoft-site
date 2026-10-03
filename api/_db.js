const U = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const T = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
exports.cmd = async (a) => {
  if (!U || !T) throw new Error("Database not connected (add Upstash Redis in Vercel Storage)");
  const r = await fetch(U, { method: "POST", headers: { Authorization: "Bearer " + T }, body: JSON.stringify(a) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
};
