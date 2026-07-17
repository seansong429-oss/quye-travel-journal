export async function runtimeValue(name: string): Promise<string | undefined> {
  const nodeValue = typeof process !== "undefined" ? process.env[name] : undefined;
  if (typeof nodeValue === "string" && nodeValue.trim()) return nodeValue.trim();

  let value: unknown;
  try {
    const { env } = await import("cloudflare:workers");
    value = (env as unknown as Record<string, unknown>)[name];
  } catch {
    // Plain Node previews do not implement the Cloudflare module scheme.
    return undefined;
  }
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function errorMessage(error: unknown, fallback = "服务暂时不可用，请稍后再试") {
  return error instanceof Error && error.message ? error.message : fallback;
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`上游服务返回 ${response.status}`);
  return response.json() as Promise<T>;
}
