"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type LogStatus = "want" | "in_progress" | "done";

export async function saveLog({
  mediaItemId,
  rating,
  status,
  reviewBody,
  path,
}: {
  mediaItemId: string;
  rating: number | null;
  status: LogStatus;
  reviewBody: string;
  path: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not logged in");

  const { data: log, error } = await supabase
    .from("log")
    .upsert(
      { user_id: user.id, media_item_id: mediaItemId, rating, status },
      { onConflict: "user_id,media_item_id" },
    )
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const trimmedReview = reviewBody.trim();
  if (trimmedReview) {
    const { error: reviewError } = await supabase
      .from("review")
      .upsert(
        { log_id: log.id, body: trimmedReview },
        { onConflict: "log_id" },
      );
    if (reviewError) throw new Error(reviewError.message);
  }

  revalidatePath(path);
}
