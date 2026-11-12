/** Convert Mongoose docs/lean objects to plain JSON (ObjectId → string, Date → ISO). */
export function plain<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value ?? null)) as T;
}
