"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import useProtectedRoute from "@/lib/hooks/useProtectedRoute";
import ProductCard from "@/ui/components/cards/product-card";
import CircularProgress from "@/ui/components/feedback/circular-progress";
import PaginationButtons from "@/ui/components/navigation/pagination";
import { ITEMS_PER_PAGE } from "@/lib/hooks/usePagination";
import { useFavorites } from "@/lib/hooks/useFavorites";
import Box from "@mui/material/Box";

export default function FavoriteProductsPage() {
  useProtectedRoute();

  const { favorites, isLoading } = useFavorites();
  const [currentPage, setCurrentPage] = useState(1);

  const memoizedProducts = useMemo(() => favorites || [], [favorites]);

  useEffect(() => {
    const totalPages = Math.ceil(memoizedProducts.length / ITEMS_PER_PAGE) || 1;
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [memoizedProducts, currentPage]);

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = memoizedProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (isLoading) {
    return (
      <Box className="container mx-auto py-4 sm:py-6 bg-bg-primary min-h-[60vh] flex items-center justify-center">
        <CircularProgress message="Зареждане на любимите продукти..." />
      </Box>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="container mx-auto py-4 sm:py-6 bg-bg-primary">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 tracking-wide text-text-primary">
          Любими продукти
        </h1>
        <div className="container mx-auto px-4 mt-4 font-bold">
          <p className="text-center text-2xl p-16 bg-card-bg rounded-md text-text-secondary border border-card-border transition-colors duration-300">
            Нямате добавени любими продукти.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 bg-bg-primary">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 tracking-wide text-text-primary">
        Любими продукти
      </h1>

      <PaginationButtons
        itemsPerPage={ITEMS_PER_PAGE}
        totalItems={memoizedProducts.length}
        paginate={handlePageChange}
        currentPage={currentPage}
      />

      <div className="grid gap-5 sm:gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 py-4 sm:py-6 md:py-8 px-4">
        {currentItems.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <PaginationButtons
        itemsPerPage={ITEMS_PER_PAGE}
        totalItems={memoizedProducts.length}
        paginate={handlePageChange}
        currentPage={currentPage}
      />
    </div>
  );
}
