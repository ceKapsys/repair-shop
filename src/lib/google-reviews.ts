import "server-only";
import { connectDb } from "./db";
import { decrypt, encrypt } from "./crypto";
import { reportError } from "./report";
import { siteDefaults } from "./site";
import { Review, Settings } from "@/models";

/**
 * Google reviews.
 *  - Preferred: Google Business Profile API with the owner's OAuth consent (all reviews, exact count).
 *  - Fallback: Places API by placeId (rating, count and up to 5 reviews).
 * Tokens are stored AES-256-GCM encrypted in settings.googleBusiness.tokensEncrypted.
 */

const SCOPE = "https://www.googleapis.com/auth/business.manage";
const STARS: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
type Tokens = { access_token: string; refresh_token?: string; expires_at: number };

export const googleOAuthConfigured = () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
export const placesConfigured = () => Boolean(process.env.GOOGLE_PLACES_API_KEY);
export const redirectUri = () => `${siteDefaults.url}/api/google/callback`;

export function authUrl(state: string) {
  const q = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${q}`;
}

async function tokenRequest(params: Record<string, string>): Promise<Tokens> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID ?? "", client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "", ...params }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || "Google sign-in failed");
  return { access_token: data.access_token, refresh_token: data.refresh_token, expires_at: Date.now() + (data.expires_in ?? 3600) * 1000 };
}

/** Exchange the OAuth code and store the encrypted tokens. */
export async function connectWithCode(code: string) {
  const tokens = await tokenRequest({ code, grant_type: "authorization_code", redirect_uri: redirectUri() });
  if (!tokens.refresh_token) throw new Error("Google did not return a refresh token. Remove this app's access in your Google account and connect again.");
  await connectDb();
  await Settings.updateOne({ _id: "site" }, { $set: { "googleBusiness.tokensEncrypted": encrypt(JSON.stringify(tokens)), "googleBusiness.connectedAt": new Date(), "googleBusiness.lastSyncError": "" } }, { upsert: true });
}

async function accessToken(): Promise<string | null> {
  await connectDb();
  const s = await Settings.findById("site").select("googleBusiness.tokensEncrypted").lean<{ googleBusiness?: { tokensEncrypted?: string } }>();
  const enc = s?.googleBusiness?.tokensEncrypted;
  if (!enc) return null;
  let tokens = JSON.parse(decrypt(enc)) as Tokens;
  if (tokens.expires_at - 60_000 < Date.now()) {
    const fresh = await tokenRequest({ grant_type: "refresh_token", refresh_token: tokens.refresh_token ?? "" });
    tokens = { ...fresh, refresh_token: fresh.refresh_token ?? tokens.refresh_token };
    await Settings.updateOne({ _id: "site" }, { $set: { "googleBusiness.tokensEncrypted": encrypt(JSON.stringify(tokens)) } });
  }
  return tokens.access_token;
}

async function gget<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, { headers: { authorization: `Bearer ${token}` }, cache: "no-store" });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Google API error ${res.status}`);
  return data as T;
}

/** Every location the connected Google account can manage, for the picker in admin. */
export async function listLocations(): Promise<{ account: string; location: string; title: string; placeId?: string; mapsUri?: string }[]> {
  const token = await accessToken();
  if (!token) return [];
  const { accounts = [] } = await gget<{ accounts?: { name: string }[] }>("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", token);
  const out = [];
  for (const a of accounts) {
    const { locations = [] } = await gget<{ locations?: { name: string; title: string; metadata?: { placeId?: string; mapsUri?: string } }[] }>(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${a.name}/locations?readMask=name,title,metadata&pageSize=100`,
      token,
    );
    for (const l of locations) out.push({ account: a.name, location: l.name, title: l.title, placeId: l.metadata?.placeId, mapsUri: l.metadata?.mapsUri });
  }
  return out;
}

type Incoming = { externalId: string; authorName: string; authorPhoto?: string; rating: number; text?: string; publishedAt?: Date };
export type SyncResult = { ok: true; source: "business-profile" | "places"; count: number; rating?: number; ratingCount?: number } | { ok: false; error: string };

async function fromBusinessProfile(account: string, location: string, token: string) {
  const reviews: Incoming[] = [];
  let pageToken = "";
  let rating: number | undefined;
  let ratingCount: number | undefined;
  for (let page = 0; page < 20; page++) {
    type R = { reviewId: string; reviewer?: { displayName?: string; profilePhotoUrl?: string; isAnonymous?: boolean }; starRating: string; comment?: string; createTime?: string };
    const data = await gget<{ reviews?: R[]; averageRating?: number; totalReviewCount?: number; nextPageToken?: string }>(
      `https://mybusiness.googleapis.com/v4/${account}/${location}/reviews?pageSize=50${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`,
      token,
    );
    rating = data.averageRating ?? rating;
    ratingCount = data.totalReviewCount ?? ratingCount;
    for (const r of data.reviews ?? []) {
      reviews.push({
        externalId: `gbp:${r.reviewId}`,
        authorName: r.reviewer?.isAnonymous ? "Google user" : r.reviewer?.displayName || "Google user",
        authorPhoto: r.reviewer?.profilePhotoUrl,
        rating: STARS[r.starRating] ?? 5,
        text: r.comment,
        publishedAt: r.createTime ? new Date(r.createTime) : undefined,
      });
    }
    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }
  return { reviews, rating, ratingCount, mapsUri: undefined as string | undefined };
}

async function fromPlaces(placeId: string) {
  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    headers: { "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY ?? "", "X-Goog-FieldMask": "rating,userRatingCount,reviews,googleMapsUri" },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Places API error ${res.status}`);
  type R = { name: string; rating: number; text?: { text?: string }; authorAttribution?: { displayName?: string; photoUri?: string }; publishTime?: string };
  const reviews: Incoming[] = ((data.reviews ?? []) as R[]).map((r) => ({
    externalId: `places:${r.name}`,
    authorName: r.authorAttribution?.displayName || "Google user",
    authorPhoto: r.authorAttribution?.photoUri,
    rating: Math.round(r.rating),
    text: r.text?.text,
    publishedAt: r.publishTime ? new Date(r.publishTime) : undefined,
  }));
  return { reviews, rating: data.rating as number | undefined, ratingCount: data.userRatingCount as number | undefined, mapsUri: data.googleMapsUri as string | undefined };
}

/**
 * Pull reviews and upsert them by externalId. Review text, rating and author follow Google;
 * the owner's hide/feature choices are never overwritten.
 */
export async function syncReviews(): Promise<SyncResult> {
  await connectDb();
  const s = await Settings.findById("site").select("googleBusiness").lean<{ googleBusiness?: { accountName?: string; locationName?: string; placeId?: string; tokensEncrypted?: string } }>();
  const g = s?.googleBusiness ?? {};
  try {
    let source: "business-profile" | "places";
    let result: Awaited<ReturnType<typeof fromPlaces>>;
    const token = g.tokensEncrypted && g.accountName && g.locationName ? await accessToken() : null;
    if (token) {
      source = "business-profile";
      result = await fromBusinessProfile(g.accountName!, g.locationName!, token);
    } else if (g.placeId && placesConfigured()) {
      source = "places";
      result = await fromPlaces(g.placeId);
    } else {
      return { ok: false, error: "Connect Google and choose a location, or set a Place ID, before syncing." };
    }
    for (const r of result.reviews) {
      await Review.updateOne(
        { externalId: r.externalId },
        { $set: { source: "google", authorName: r.authorName, authorPhoto: r.authorPhoto, rating: r.rating, text: r.text, publishedAt: r.publishedAt }, $setOnInsert: { isVisible: true, isFeatured: false } },
        { upsert: true },
      );
    }
    await Settings.updateOne(
      { _id: "site" },
      { $set: { "googleBusiness.rating": result.rating, "googleBusiness.ratingCount": result.ratingCount, "googleBusiness.lastSyncAt": new Date(), "googleBusiness.lastSyncError": "", ...(result.mapsUri ? { "googleBusiness.mapsUri": result.mapsUri } : {}) } },
    );
    return { ok: true, source, count: result.reviews.length, rating: result.rating, ratingCount: result.ratingCount };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Sync failed";
    await Settings.updateOne({ _id: "site" }, { $set: { "googleBusiness.lastSyncError": error } });
    await reportError(err, { where: "syncReviews" });
    return { ok: false, error };
  }
}
