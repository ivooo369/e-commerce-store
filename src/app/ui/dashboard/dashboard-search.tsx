interface DashboardSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function DashboardSearch({
  searchTerm,
  onSearchChange,
}: DashboardSearchProps) {
  return (
    <input
      type="text"
      placeholder="Търсене..."
      className="px-3 py-4 w-full border border-gray-400 rounded focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none"
      aria-label="Search"
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
    />
  );
}
