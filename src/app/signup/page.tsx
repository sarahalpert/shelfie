import Link from "next/link";
import { signup } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 p-5">
      <h1 className="font-heading text-2xl font-bold">Sign up</h1>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <form action={signup} className="flex flex-col gap-3">
        <Input
          type="text"
          name="username"
          placeholder="Username"
          required
          className="rounded-full"
        />
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
          minLength={6}
          required
          className="rounded-full"
        />
        <Button type="submit" className="rounded-full">
          Sign up
        </Button>
      </form>

      <p className="text-muted-foreground text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-primary underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
