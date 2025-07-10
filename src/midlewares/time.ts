import { formatDistanceToNow } from "date-fns";

export function formatCreatedAt(date: Date): string {
  return `created ${formatDistanceToNow(date, { addSuffix: true })}`;
}
