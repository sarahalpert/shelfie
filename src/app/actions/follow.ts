"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleFollow({
  followeeId,
  username,
  isFollowing,
}: {
  followeeId: string;
  username: string;
  isFollowing: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not logged in");

  if (isFollowing) {
    const { error } = await supabase
      .from("follow")
      .delete()
      .eq("follower_id", user.id)
      .eq("followee_id", followeeId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("follow")
      .insert({ follower_id: user.id, followee_id: followeeId });
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/u/${username}`);
  revalidatePath("/");
}
