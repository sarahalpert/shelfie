import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTmdbDetail } from "@/lib/media/tmdb";
import { upsertMediaItem } from "@/lib/media/cache";
import { MediaItemData, MediaType } from "@/lib/media/types";
import { createClient } from "@/lib/supabase/server";
import { LogControl } from "@/components/log-control";

function isTmdbType(type: string): type is Extract<MediaType, "movie" | "tv"> {
  return type === "movie" || type === "tv";
}

async function loadItem(
  type: string,
  id: string,
  searchParams: { title?: string; year?: string; image?: string; authors?: string },
): Promise<MediaItemData | null> {
  if (isTmdbType(type)) {
    return getTmdbDetail(type, id);
  }

  if (type === "book" && searchParams.title) {
    return {
      type: "book",
      externalSource: "openlibrary",
      externalId: id,
      title: searchParams.title,
      year: searchParams.year ? Number(searchParams.year) : null,
      imageUrl: searchParams.image ?? null,
      metadata: {
        authors: searchParams.authors ? searchParams.authors.split(", ") : [],
      },
    };
  }

  return null;
}

export default async function MediaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string; id: string }>;
  searchParams: Promise<{
    title?: string;
    year?: string;
    image?: string;
    authors?: string;
  }>;
}) {
  const { type, id } = await params;
  const item = await loadItem(type, id, await searchParams);

  if (!item) notFound();

  const mediaItemId = await upsertMediaItem(item);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let existingLog: {
    rating: number | null;
    status: "want" | "in_progress" | "done";
    review: string;
  } | null = null;

  if (user && mediaItemId) {
    const { data: logRow } = await supabase
      .from("log")
      .select("id, rating, status")
      .eq("user_id", user.id)
      .eq("media_item_id", mediaItemId)
      .maybeSingle();

    if (logRow) {
      const { data: reviewRow } = await supabase
        .from("review")
        .select("body")
        .eq("log_id", logRow.id)
        .maybeSingle();

      existingLog = {
        rating: logRow.rating,
        status: logRow.status,
        review: reviewRow?.body ?? "",
      };
    }
  }

  const overview =
    typeof item.metadata.overview === "string" ? item.metadata.overview : "";
  const authors = Array.isArray(item.metadata.authors)
    ? (item.metadata.authors as string[])
    : [];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-5">
      <div className="flex gap-6">
        <div className="bg-muted h-60 w-40 shrink-0 overflow-hidden rounded-2xl">
          {item.imageUrl && (
            <Image
              src={item.imageUrl}
              alt={item.title}
              width={160}
              height={240}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-primary text-xs font-medium uppercase">
            {item.type}
          </span>
          <h1 className="font-heading text-2xl font-bold">{item.title}</h1>
          {item.year && (
            <span className="text-muted-foreground">{item.year}</span>
          )}
          {authors.length > 0 && (
            <span className="text-muted-foreground">
              by {authors.join(", ")}
            </span>
          )}
          {overview && <p className="mt-2 leading-relaxed">{overview}</p>}
        </div>
      </div>

      {mediaItemId &&
        (user ? (
          <LogControl
            mediaItemId={mediaItemId}
            mediaType={item.type}
            initialRating={existingLog?.rating ?? null}
            initialStatus={existingLog?.status ?? null}
            initialReview={existingLog?.review ?? ""}
            path={`/media/${type}/${id}`}
          />
        ) : (
          <p className="text-muted-foreground bg-card rounded-2xl p-4 text-sm">
            <Link href="/login" className="text-primary underline">
              Log in
            </Link>{" "}
            to add this to your shelf.
          </p>
        ))}
    </div>
  );
}
