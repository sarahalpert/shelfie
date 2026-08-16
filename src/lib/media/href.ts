export function buildMediaHref(item: { type: string; external_id: string }): string {
  return `/media/${item.type}/${item.external_id}`;
}
