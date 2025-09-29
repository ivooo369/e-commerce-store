import React, { useState, useRef, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { useDebounce } from "use-debounce";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchRecommendations } from "@/services/productService";
import { formatPrice } from "@/lib/utils/currency";

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
          className="px-3 py-2 focus:outline-none w-full border border-border-color bg-bg-secondary text-text-primary placeholder-text-muted rounded-l transition-colors duration-300"
          aria-label="Търсачка"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSearchSubmit}
          className="bg-accent-color hover:bg-accent-hover text-bg-primary p-2 transition duration-300 rounded-r"
          aria-label="Бутон на търсачка"
        >
          <SearchIcon />
        </button>
      </div>
      {isDropdownVisible && (
        <div className="absolute -m-2 top-full w-full max-h-96 overflow-y-auto bg-card-bg shadow-lg rounded border border-border-color z-10 transition-colors duration-300">
          {isLoading ? (
            <div className="w-full p-4 text-center font-bold text-lg text-text-secondary">
              Зареждане...
            </div>
          ) : recommendations.length > 0 ? (
            <ul className="space-y-4 p-4">
              {recommendations
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name, "bg"))
                .map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center space-x-4 bg-bg-secondary p-3 gap-3 rounded-lg hover:bg-bg-tertiary cursor-pointer transition-colors duration-300"
                    onClick={() =>
                      router.push(`/product-catalog/details/${product.code}`)
                    }
                  >
                    <div className="w-12 h-12 relative flex-shrink-0">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover rounded"
                        onContextMenu={(e) => e.preventDefault()}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        Код: {product.code}
                      </p>
                      <p className="text-sm font-bold text-accent-color">
                        {product.price} лв.{" "}
                        <span className="text-xs text-gray-400 ml-1">
                          ({formatPrice(product.price, "EUR")})
                        </span>
                      </p>
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <div className="w-full p-4 text-center font-bold text-lg text-text-secondary">
              Няма намерени продукти
            </div>
          )}
        </div>
      )}
    </div>
  );
}
