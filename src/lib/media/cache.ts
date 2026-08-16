import { createAdminClient } from "@/lib/supabase/admin";
import { MediaItemData } from "./types";

export async function upsertMediaItem(item: MediaItemData): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  const supabase = createAdminClient();

  const { error } = await supabase.from("media_item").upsert(
    {
      type: item.type,
      title: item.title,
      year: item.year,
      image_url: item.imageUrl,
      external_source: item.externalSource,
      external_id: item.externalId,
      metadata: item.metadata,
    },
    { onConflict: "external_source,external_id" },
  );

  if (error) console.error("Failed to cache media item:", error.message);
}
