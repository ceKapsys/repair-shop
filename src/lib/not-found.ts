import "server-only";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { getRedirect } from "./data";

/** Follow an admin-defined redirect for this path, else render the 404 page. */
export async function notFoundOrRedirect(path: string): Promise<never> {
  const r = await getRedirect(path);
  if (r) {
    if (r.code === 302) redirect(r.to);
    permanentRedirect(r.to);
  }
  notFound();
}
