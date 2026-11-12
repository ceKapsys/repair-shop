/** Read/write nested values by dot path ("seo.metaTitle", "faqs.0.question"). */
export function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), obj);
}

export function setPath<T>(obj: T, path: string, value: unknown): T {
  const keys = path.split(".");
  const clone = (v: unknown, nextKey: string) =>
    Array.isArray(v) ? [...v] : v && typeof v === "object" ? { ...(v as object) } : /^\d+$/.test(nextKey) ? [] : {};
  const root = clone(obj, keys[0]) as Record<string, unknown>;
  let cur = root;
  keys.forEach((k, i) => {
    if (i === keys.length - 1) cur[k] = value;
    else {
      cur[k] = clone(cur[k], keys[i + 1]);
      cur = cur[k] as Record<string, unknown>;
    }
  });
  return root as T;
}
