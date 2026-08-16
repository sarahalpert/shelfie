import { Home, Search, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NavItem } from "@/components/nav-item";

export async function BottomNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profileHref = "/login";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();
    if (profile) profileHref = `/u/${profile.username}`;
  }

  return (
    <nav className="bg-card/95 fixed inset-x-0 bottom-0 z-50 flex border-t backdrop-blur-sm">
      <NavItem href="/" icon={<Home className="size-4" />} label="Feed" />
      <NavItem
        href="/search"
        icon={<Search className="size-4" />}
        label="Search"
      />
      <NavItem
        href={profileHref}
        icon={<User className="size-4" />}
        label="Profile"
      />
    </nav>
  );
}
