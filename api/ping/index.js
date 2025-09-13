export default async function (context, req) {
  return {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: { ok: true, ts: new Date().toISOString(), hint: "API is alive" }
  };
}
