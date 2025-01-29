import React, { useState, useRef, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { useDebounce } from "use-debounce";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

const fetchRecommendations = async (searchTerm: string) => {
  const response = await fetch(
    `/api/public/products/search?query=${searchTerm}`
  );
  const data = await response.json();
  if (Array.isArray(data)) {
    return data;
  } else {
    throw new Error("Възникна грешка при извличане на продуктите!");
  }
};

export default function MainSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ["recommendations", debouncedSearchTerm],
    queryFn: () => fetchRecommendations(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length > 0,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = () => {
    if (recommendations.length > 0 || searchTerm !== "") {
      router.push(`/product-catalog/results?query=${debouncedSearchTerm}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  useEffect(() => {
    if (debouncedSearchTerm) {
      setIsDropdownVisible(true);
    } else {
      setIsDropdownVisible(false);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [debouncedSearchTerm]);

  return (
    <div
      ref={searchContainerRef}
      className="search-container flex flex-col items-center w-full max-w-md p-4 relative"
    >
      <div className="flex w-full items-center">
        <input
          type="text"
          placeholder="Търсене..."
          className="px-3 py-2 focus:outline-none w-full border border-gray-300"
          aria-label="Търсачка"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSearchSubmit}
          className="bg-gray-200 p-2 hover:bg-gray-300 transition duration-300"
          aria-label="Бутон на търсачка"
        >
          <SearchIcon />
        </button>
      </div>
      {isDropdownVisible && (
        <div className="absolute -m-2 top-full w-full max-h-96 overflow-y-auto bg-white shadow-lg rounded border border-gray-300 z-10">
          {isLoading ? (
            <div className="w-full p-4 text-center font-bold text-lg text-gray-600">
              Зареждане...
            </div>
          ) : recommendations.length > 0 ? (
            <ul className="space-y-4 p-4">
              {recommendations.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center space-x-4 bg-gray-50 p-3 gap-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() =>
                    router.push(`/product-catalog/details/${product.code}`)
                  }
                >
                  {product.images && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="object-cover rounded"
                    />
                  )}
                  <div>
                    <h4 className="text-lg font-semibold">{product.name}</h4>
                    <span className="text-sm text-gray-600">
                      {product.price} лв.
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : debouncedSearchTerm ? (
            <div className="w-full p-4 text-center font-bold text-lg text-gray-600">
              Няма намерени продукти
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
