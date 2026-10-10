export function cookies(request: Request) {
  const pairs = (request.headers.get("cookie") || "").split(";").map(s => s.trim().split("="));
  return { get(name: string) { const p = pairs.find(p => p[0] === name); return p ? { value: p.slice(1).join("=") } : undefined; } };
}
