import React, { useEffect, useRef, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { useDebounce } from "use-debounce";
import Image from "next/image";
import { Product } from "@prisma/client";
import { useRouter } from "next/navigation";

export default function MainSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = () => {
    if (recommendations.length > 0 || searchTerm !== "") {
      router.push(`/product-catalog/results?query=${debouncedSearchTerm}`);
    }
  };

  useEffect(() => {
    if (debouncedSearchTerm) {
      setLoading(true);
      fetch(`/api/public/products/search?query=${debouncedSearchTerm}`)
        .then((response) => response.json())
        .then((data) => {
          setRecommendations(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Възникна грешка при извличане на продуктите:", error);
          setLoading(false);
        });
    } else {
      setRecommendations([]);
      setLoading(false);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm) {
      setDropdownVisible(true);
    } else {
      setDropdownVisible(false);
    }
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
          {loading ? (
            <div className="w-full p-4 text-center font-bold text-lg text-gray-600">
              Зареждане...
            </div>
          ) : recommendations.length > 0 ? (
            <ul className="space-y-4 p-4">
              {recommendations.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
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
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold">{product.name}</h4>
                    <span className="text-sm text-gray-600">
                      {product.price} лв
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
