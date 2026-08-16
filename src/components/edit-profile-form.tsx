"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateProfile } from "@/app/actions/profile";

export function EditProfileForm({
  initialDisplayName,
  initialBio,
  path,
}: {
  initialDisplayName: string | null;
  initialBio: string | null;
  path: string;
}) {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(initialDisplayName ?? "");
  const [bio, setBio] = useState(initialBio ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await updateProfile({
        displayName: displayName.trim() || null,
        bio: bio.trim() || null,
        path,
      });
      setEditing(false);
    });
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-primary text-sm underline"
      >
        Edit profile
      </button>
    );
  }

  return (
    <div className="bg-card flex flex-col gap-2 rounded-2xl p-4">
      <input
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Display name"
        className="bg-input/20 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
      />
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Bio"
        className="bg-input/20 min-h-16 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={isPending}
          size="sm"
          className="rounded-full"
        >
          {isPending ? "Saving..." : "Save"}
        </Button>
        <Button
          onClick={() => setEditing(false)}
          disabled={isPending}
          variant="secondary"
          size="sm"
          className="rounded-full"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
