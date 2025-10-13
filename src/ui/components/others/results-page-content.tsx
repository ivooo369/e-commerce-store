"use client";

import { useState, useCallback, useEffect } from "react";
import ProductCard from "@/ui/components/cards/product-card";
import PaginationButtons from "@/ui/components/navigation/pagination";
import { ITEMS_PER_PAGE } from "@/lib/hooks/usePagination";
import type { ResultsProps } from "@/lib/types/interfaces";

export default function ResultsPageContent({
  initialProducts,
  query,
}: ResultsProps) {
  const [filteredProducts, setFilteredProducts] = useState(initialProducts);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setFilteredProducts(initialProducts);
    setCurrentPage(1);
  }, [initialProducts]);

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="container mx-auto py-4 sm:py-6 bg-bg-primary min-h-[calc(100vh-243.5px)]">
      <h1 className="text-3xl text-center font-bold mb-4 sm:mb-6 tracking-wide text-text-primary">
        Резултати за &quot;{query}&quot;
      </h1>

      {filteredProducts.length === 0 ? (
        <div className="container mx-auto px-4 font-bold">
          <p className="text-center text-2xl p-16 bg-card-bg rounded-md text-text-secondary border border-card-border transition-colors duration-300">
            Няма намерени продукти
          </p>
        </div>
      ) : (
        <>
          <PaginationButtons
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={filteredProducts.length}
            paginate={paginate}
            currentPage={currentPage}
          />

          {currentItems.length > 0 && (
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
        </>
      )}
    </div>
  );
}
