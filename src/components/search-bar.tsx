import { Search } from "lucide-react";

export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form action="/" className="relative">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" />
      <input
        type="text"
        name="q"
        placeholder="Search books, films, series..."
        defaultValue={defaultValue}
        className="bg-secondary placeholder:text-muted-foreground focus:ring-primary w-full rounded-full py-3 pr-4 pl-11 text-sm outline-none focus:ring-2"
      />
    </form>
  );
}
