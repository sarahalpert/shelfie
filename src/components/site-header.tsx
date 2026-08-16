import Link from "next/link";
import { logout } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="flex items-center justify-between px-5 py-4">
      <Link href="/" className="font-heading text-xl font-bold">
        Shelfie
        <span className="text-primary">.</span>
      </Link>
      <nav className="flex items-center gap-3 text-sm">
        {user ? (
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              Log out
            </Button>
          </form>
        ) : (
          <>
            <Link href="/login" className="text-muted-foreground">
              Log in
            </Link>
            <Button size="sm" nativeButton={false} render={<Link href="/signup" />}>
              Sign up
            </Button>
          </>
        )}
      </nav>
    </header>
  );
}
