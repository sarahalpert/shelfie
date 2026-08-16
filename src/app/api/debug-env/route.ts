import { NextResponse } from "next/server";

// Temporary diagnostic route -- reports which env vars are present
// without exposing their values. Remove once env var issues are sorted.
export async function GET() {
  return NextResponse.json({
    hasTmdbToken: Boolean(process.env.TMDB_READ_ACCESS_TOKEN),
    tmdbTokenLength: process.env.TMDB_READ_ACCESS_TOKEN?.length ?? 0,
    hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasSiteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    siteUrlValue: process.env.NEXT_PUBLIC_SITE_URL ?? null,
  });
}
