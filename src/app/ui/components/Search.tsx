"use client";

import SearchIcon from "@mui/icons-material/Search";

export default function Search() {
  return (
    <div className="search flex items-center border border-gray-300 w-full max-w-md">
      <input
        type="text"
        placeholder="Търсене..."
        className="px-3 py-2 focus:outline-none w-full"
        aria-label="Търсачка"
        aria-required="false"
      />
      <button
        className="bg-gray-200 p-2 hover:bg-gray-300 transition duration-300"
        aria-label="Бутон на търсачка"
      >
        <SearchIcon />
      </button>
    </div>
  );
}
