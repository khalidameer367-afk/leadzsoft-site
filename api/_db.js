const U = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const K = process.env.SUPABASE_SERVICE_KEY || "";

const h = () => {
  const x = { apikey: K, "Content-Type": "application/json" };
  if (K.startsWith("eyJ")) x.Authorization = "Bearer " + K;
  return x;
};
const need = () => {
  if (!U || !K) throw new Error("Database not connected (add SUPABASE_URL and SUPABASE_SERVICE_KEY in Vercel)");
};

exports.get = async (key) => {
  need();
  const r = await fetch(`${U}/rest/v1/lz_store?key=eq.${encodeURIComponent(key)}&select=value`, { headers: h() });
  if (!r.ok) throw new Error("Supabase read failed: " + (await r.text()).slice(0, 120));
  const a = await r.json();
  return a[0] ? a[0].value : null;
};

exports.set = async (key, value) => {
  need();
  const r = await fetch(`${U}/rest/v1/lz_store?on_conflict=key`, {
    method: "POST",
    headers: { ...h(), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
  });
  if (!r.ok) throw new Error("Supabase save failed: " + (await r.text()).slice(0, 120));
};
