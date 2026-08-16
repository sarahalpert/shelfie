import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type LoggedItem = {
  id: string;
  rating: number | null;
  status: string;
  media_item: {
    title: string;
    type: string;
    year: number | null;
    image_url: string | null;
  } | null;
};

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio")
    .eq("username", username)
    .maybeSingle();

  if (!profile) notFound();

  const { data: logs } = await supabase
    .from("log")
    .select(
      "id, rating, status, media_item:media_item_id(title, type, year, image_url)",
    )
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .returns<LoggedItem[]>();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {profile.display_name ?? profile.username}
        </h1>
        <p className="text-muted-foreground">@{profile.username}</p>
        {profile.bio && <p className="mt-2">{profile.bio}</p>}
      </div>

      <div className="flex flex-col gap-2">
        {(logs ?? []).map((log) => {
          const media = log.media_item;
          if (!media) return null;

          return (
            <div
              key={log.id}
              className="flex items-center gap-4 rounded-lg border p-3"
            >
              <div className="bg-muted h-16 w-11 shrink-0 overflow-hidden rounded">
                {media.image_url && (
                  <Image
                    src={media.image_url}
                    alt={media.title}
                    width={44}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium uppercase text-muted-foreground">
                  {media.type}
                </span>
                <span className="font-medium">{media.title}</span>
                <span className="text-muted-foreground text-sm">
                  {log.rating ? `${log.rating}★ · ` : ""}
                  {log.status.replace("_", " ")}
                </span>
              </div>
            </div>
          );
        })}

        {(!logs || logs.length === 0) && (
          <p className="text-muted-foreground">No logs yet.</p>
        )}
      </div>
    </div>
  );
}
