export function buildMediaHref(item: {
  type: string;
  external_id: string;
  title: string;
  year: number | null;
  image_url: string | null;
  metadata: Record<string, unknown> | null;
}): string {
  if (item.type !== "book") {
    return `/media/${item.type}/${item.external_id}`;
  }

  const params = new URLSearchParams({ title: item.title });
  if (item.year) params.set("year", String(item.year));
  if (item.image_url) params.set("image", item.image_url);
  const authors = item.metadata?.authors as string[] | undefined;
  if (authors?.length) params.set("authors", authors.join(", "));

  return `/media/book/${item.external_id}?${params.toString()}`;
}
