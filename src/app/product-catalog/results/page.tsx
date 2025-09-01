"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/ui/components/product-card";
import PaginationButtons from "@/ui/components/pagination";
import CircularProgress from "@/ui/components/circular-progress";
import { Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import usePagination, { ITEMS_PER_PAGE } from "@/lib/usePagination";
import { fetchProductsByQuery } from "@/services/productService";

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
    queryFn: () => fetchProductsByQuery(query),
    enabled: query.trim() !== "",
  });

  const { currentPage, currentItems, paginate } =
    usePagination(filteredProducts);

  if (isLoading) {
    return (
      <div className="container mx-auto py-4 sm:py-6 bg-bg-primary flex flex-col">
        <h1 className="text-3xl text-center font-bold mb-4 sm:mb-6 tracking-wide text-text-primary">
          Резултати за &quot;{query}&quot;
        </h1>
        <div className="flex-1 flex items-center justify-center">
          <CircularProgress message="Зареждане на продуктите..." />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 bg-bg-primary min-h-[calc(100vh-243.5px)]">
      <h1 className="text-3xl text-center font-bold mb-4 sm:mb-6 tracking-wide text-text-primary">
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
          <p className="text-center text-2xl p-16 bg-card-bg rounded-md text-text-secondary border border-card-border transition-colors duration-300">
            Няма намерени продукти
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 py-4 sm:py-6 md:py-8 px-4">
            {currentItems.map((product) => (
              <ProductCard key={product.id} product={product} />
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
