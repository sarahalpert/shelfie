"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleLike({
  logId,
  isLiked,
  path,
}: {
  logId: string;
  isLiked: boolean;
  path: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not logged in");

  if (isLiked) {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("log_id", logId)
      .eq("user_id", user.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("likes")
      .insert({ log_id: logId, user_id: user.id });
    if (error) throw new Error(error.message);
  }

  revalidatePath(path);
}

export async function addComment({
  logId,
  body,
  path,
}: {
  logId: string;
  body: string;
  path: string;
}) {
  const trimmed = body.trim();
  if (!trimmed) throw new Error("Comment cannot be empty");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not logged in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("id", user.id)
    .single();

  const { data: comment, error } = await supabase
    .from("comments")
    .insert({ log_id: logId, user_id: user.id, body: trimmed })
    .select("id, body")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath(path);

  return {
    id: comment.id,
    body: comment.body,
    username: profile?.username ?? "you",
    displayName: profile?.display_name ?? null,
  };
}
