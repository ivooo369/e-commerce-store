import { DashboardSearchProps } from "@/lib/interfaces";

export default function DashboardSearch({
  searchTerm,
  onSearchChange,
}: DashboardSearchProps) {
  return (
    <input
      type="text"
      placeholder="Търсене..."
      className="px-3 py-4 w-full border border-border-color rounded focus:border-accent-color focus:ring focus:ring-accent-color focus:outline-none bg-bg-secondary text-text-primary placeholder-text-muted transition-colors duration-300"
      aria-label="Search"
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
    />
  );
}
