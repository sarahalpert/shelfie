import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-semibold tracking-tight">shelfie</h1>
      <p className="text-muted-foreground max-w-md text-center">
        Rate and discuss books, movies, and TV with your friends.
      </p>
      <Button nativeButton={false} render={<Link href="/search" />}>
        Search
      </Button>
    </div>
  );
}
