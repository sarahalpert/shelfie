import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { FollowButton } from "@/components/follow-button";

export type PersonResult = {
  id: string;
  username: string;
  displayName: string | null;
  isFollowing: boolean;
};

export function PersonRow({
  person,
  isLoggedIn,
}: {
  person: PersonResult;
  isLoggedIn: boolean;
}) {
  return (
    <div className="bg-card flex items-center justify-between gap-3 rounded-2xl p-3">
      <Link
        href={`/u/${person.username}`}
        className="flex items-center gap-3"
      >
        <Avatar username={person.username} size="sm" />
        <div className="flex flex-col leading-tight">
          <span className="font-medium">
            {person.displayName ?? person.username}
          </span>
          <span className="text-muted-foreground text-sm">
            @{person.username}
          </span>
        </div>
      </Link>
      {isLoggedIn && (
        <FollowButton
          followeeId={person.id}
          username={person.username}
          initialIsFollowing={person.isFollowing}
        />
      )}
    </div>
  );
}
