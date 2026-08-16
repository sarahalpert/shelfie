import Link from "next/link";
import { login } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 p-5">
      <h1 className="font-heading text-2xl font-bold">Log in</h1>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <form action={login} className="flex flex-col gap-3">
        <Input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="rounded-full"
        />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="rounded-full"
        />
        <Button type="submit" className="rounded-full">
          Log in
        </Button>
      </form>

      <p className="text-muted-foreground text-sm">
        No account?{" "}
        <Link href="/signup" className="text-primary underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
