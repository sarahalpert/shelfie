"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile({
  displayName,
  bio,
  path,
}: {
  displayName: string | null;
  bio: string | null;
  path: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not logged in");

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName, bio })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath(path);
}
