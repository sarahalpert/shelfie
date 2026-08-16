import { createAdminClient } from "@/lib/supabase/admin";
import { MediaItemData } from "./types";

export async function upsertMediaItem(
  item: MediaItemData,
): Promise<string | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("media_item")
    .upsert(
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
    )
    .select("id")
    .single();

  if (error) {
    console.error("Failed to cache media item:", error.message);
    return null;
  }

  return data.id;
}
