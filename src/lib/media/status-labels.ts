import type { MediaType } from "./types";

export type LogStatus = "want" | "in_progress" | "done";

export function statusLabel(status: LogStatus, mediaType: MediaType): string {
  const isBook = mediaType === "book";

  switch (status) {
    case "want":
      return isBook ? "Want to read" : "Want to watch";
    case "in_progress":
      return isBook ? "Reading" : "Watching";
    case "done":
      return "Done";
  }
}

export function statusVerbPhrase(
  status: LogStatus,
  mediaType: MediaType,
): string {
  const isBook = mediaType === "book";

  switch (status) {
    case "want":
      return isBook ? "wants to read" : "wants to watch";
    case "in_progress":
      return isBook ? "is reading" : "is watching";
    case "done":
      return "finished";
  }
}
