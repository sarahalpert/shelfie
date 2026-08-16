import Image from "next/image";
import { notFound } from "next/navigation";
import { getTmdbDetail } from "@/lib/media/tmdb";
import { upsertMediaItem } from "@/lib/media/cache";
import { MediaItemData, MediaType } from "@/lib/media/types";

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

  await upsertMediaItem(item);

  const overview =
    typeof item.metadata.overview === "string" ? item.metadata.overview : "";
  const authors = Array.isArray(item.metadata.authors)
    ? (item.metadata.authors as string[])
    : [];

  return (
    <div className="mx-auto flex max-w-2xl gap-6 p-8">
      <div className="bg-muted h-60 w-40 shrink-0 overflow-hidden rounded-lg">
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
        <span className="text-xs font-medium uppercase text-muted-foreground">
          {item.type}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          {item.title}
        </h1>
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
  );
}
