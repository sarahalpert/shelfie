import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="font-heading text-3xl font-bold">
        Shelfie<span className="text-primary">.</span>
      </h1>
      <p className="text-muted-foreground max-w-md">
        Rate and discuss books, movies, and TV with your friends.
      </p>
      <Button
        nativeButton={false}
        render={<Link href="/search" />}
        className="rounded-full"
      >
        Search
      </Button>
    </div>
  );
}
