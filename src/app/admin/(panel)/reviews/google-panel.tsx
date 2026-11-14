"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { inputClass } from "@/components/ui/field";
import { formatDate } from "@/lib/format";
import type { SiteSettings } from "@/lib/settings";
import { chooseLocation, disconnectGoogle, loadLocations, savePlaceId, syncNow } from "./actions";

type Location = { account: string; location: string; title: string; placeId?: string; mapsUri?: string };

export function GooglePanel({ isOwner, oauthConfigured, placesConfigured, google }: { isOwner: boolean; oauthConfigured: boolean; placesConfigured: boolean; google: SiteSettings["google"] }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  const [locations, setLocations] = useState<Location[] | null>(null);
  const [placeId, setPlaceId] = useState(google.placeId ?? "");
  const [confirm, setConfirm] = useState(false);
  const run = (fn: () => Promise<{ ok: boolean; message?: string; error?: string }>) =>
    start(async () => {
      const r = await fn();
      if (r.ok) toast.success(r.message ?? "Done");
      else toast.error(r.error ?? "Something went wrong");
      router.refresh();
    });

  return (
    <section className="rounded-card border border-line bg-bg p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base leading-6 font-semibold">Google reviews</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {google.connected ? (google.locationTitle ? `Connected to ${google.locationTitle}.` : "Connected. Choose your location to finish.") : "Not connected."}
            {google.lastSyncAt ? ` Last sync ${formatDate(google.lastSyncAt, { dateStyle: "medium", timeStyle: "short" })}.` : ""}
            {google.rating && google.ratingCount ? ` ${google.rating} from ${google.ratingCount} reviews.` : ""}
          </p>
          {google.lastSyncError && <p role="alert" className="mt-1 text-sm text-emergency">Last sync failed: {google.lastSyncError}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" disabled={busy} onClick={() => run(syncNow)}>{busy ? "Working…" : "Sync now"}</Button>
          {isOwner && !google.connected && (
            oauthConfigured ? <a href="/api/google/connect" className={buttonVariants({ variant: "outline" })}>Connect Google</a> : <span className="self-center text-sm text-ink-soft">Add Google OAuth keys to connect.</span>
          )}
          {isOwner && google.connected && <Button type="button" variant="outline" disabled={busy} onClick={() => setConfirm(true)}>Disconnect</Button>}
        </div>
      </div>

      {isOwner && google.connected && (
        <div className="mt-5 border-t border-line pt-5">
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => start(async () => { const r = await loadLocations(); if (r.ok) setLocations(r.data ?? []); else toast.error(r.error); })}>
            {google.locationTitle ? "Change location" : "Choose location"}
          </Button>
          {locations && locations.length === 0 && <p className="mt-3 text-sm text-ink-soft">This Google account doesn&apos;t manage any business locations.</p>}
          {locations && locations.length > 0 && (
            <ul className="mt-3 divide-y divide-line rounded-input border border-line">
              {locations.map((l) => (
                <li key={l.location} className="flex min-h-12 items-center justify-between gap-3 px-3 py-1">
                  <span className="text-sm font-medium">{l.title}</span>
                  <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => { run(() => chooseLocation(l)); setLocations(null); }}>Use this</Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {isOwner && (
        <div className="mt-5 border-t border-line pt-5">
          <label htmlFor="place-id" className="text-sm font-medium">Google Place ID (fallback)</label>
          <p className="text-sm text-ink-soft">
            Used when Google isn&apos;t connected: shows your rating, review count and up to five reviews.
            {placesConfigured ? "" : " Needs GOOGLE_PLACES_API_KEY."}
          </p>
          <div className="mt-2 flex max-w-xl gap-2">
            <input id="place-id" value={placeId} onChange={(e) => setPlaceId(e.target.value)} placeholder="ChIJ…" className={`${inputClass} mt-0`} />
            <Button type="button" variant="outline" disabled={busy || placeId === (google.placeId ?? "")} onClick={() => run(() => savePlaceId(placeId))}>Save</Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirm}
        onCancel={() => setConfirm(false)}
        title="Disconnect Google?"
        body="Reviews already synced stay on the site. New reviews stop arriving until you connect again."
        confirmLabel="Disconnect"
        destructive
        onConfirm={() => { setConfirm(false); run(disconnectGoogle); }}
      />
    </section>
  );
}
