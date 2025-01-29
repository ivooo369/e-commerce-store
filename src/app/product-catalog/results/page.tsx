"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Product } from "@prisma/client";
import ProductCard from "@/app/ui/components/product-card";
import PaginationButtons from "@/app/ui/components/pagination";
import CircularProgress from "@/app/ui/components/circular-progress";
import { Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import usePagination, { ITEMS_PER_PAGE } from "@/app/lib/usePagination";

const fetchProducts = async (query: string): Promise<Product[]> => {
  const response = await fetch(`/api/public/products/search?query=${query}`);
  const data = await response.json();
  if (Array.isArray(data)) {
    return data;
  } else {
    return [];
  }
};

export default function ResultsPage() {
  return (
    <Suspense fallback={<CircularProgress message="Зареждане..." />}>
      <Results />
    </Suspense>
  );
}

function Results() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const { data: filteredProducts = [], isLoading } = useQuery({
    queryKey: ["products", query],
    queryFn: () => fetchProducts(query),
    enabled: query.trim() !== "",
  });

  const { currentPage, currentItems, paginate } =
    usePagination(filteredProducts);

  const handleAddToCart = (id: string) => {
    console.log(`Продукт с id ${id} е добавен в кошницата.`);
  };

  if (isLoading) {
    return (
      <Box className="flex justify-center items-center py-10 my-auto">
        <CircularProgress message="Зареждане на продуктите..." />
      </Box>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-6">
      <h1 className="text-3xl text-center font-bold mb-4 sm:mb-6 tracking-wide">
        Резултати за &quot;{query}&quot;
      </h1>
      {filteredProducts.length > 0 && (
        <div>
          <PaginationButtons
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={filteredProducts.length}
            paginate={paginate}
            currentPage={currentPage}
          />
        </div>
      )}
      {isLoading ? (
        <Box className="flex justify-center items-center py-10 my-auto">
          <CircularProgress message="Зареждане на продуктите..." />
        </Box>
      ) : currentItems.length === 0 ? (
        <div className="container mx-auto px-4 font-bold">
          <p className="text-center text-2xl p-16 bg-white rounded-md text-gray-600">
            Няма намерени продукти
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 py-4 sm:py-6 md:py-8 px-4">
            {currentItems.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
          <PaginationButtons
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={filteredProducts.length}
            paginate={paginate}
            currentPage={currentPage}
          />
        </>
      )}
    </div>
  );
}
