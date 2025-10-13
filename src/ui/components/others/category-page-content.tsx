"use client";

import { useState, useMemo } from "react";
import { Box } from "@mui/material";
import ProductCard from "@/ui/components/cards/product-card";
import CircularProgress from "@/ui/components/feedback/circular-progress";
import usePagination, { ITEMS_PER_PAGE } from "@/lib/hooks/usePagination";
import PaginationButtons from "@/ui/components/navigation/pagination";
import { useQuery } from "@tanstack/react-query";
import { fetchFilteredProducts } from "@/services/productService";
import { useProductFilters } from "@/lib/hooks/useProductFilters";
import ProductFilters from "./product-filters";
import type {
  CategoryPageProps,
  Product,
  ProductFiltersState,
} from "@/lib/types/interfaces";

export default function CategoryPageContent({
  category,
  subcategories,
  allProducts,
  categories = [],
}: CategoryPageProps) {
  const [filters, setFilters] = useState<ProductFiltersState>({
    selectedCategories: [],
    selectedSubcategories: [],
    sortOption: "newest",
    priceRange: [0, 500],
  });
  const isAllProductsPage = category.id === "all";

  const { data: productsData = allProducts || [], isLoading } = useQuery({
    queryKey: ["products", category.id, filters.selectedSubcategories],
    queryFn: () =>
      allProducts && allProducts.length > 0
        ? Promise.resolve(allProducts)
        : fetchFilteredProducts(
            category.id,
            filters.selectedSubcategories,
            subcategories
          ),
    enabled: !!category.id && (!allProducts || allProducts.length === 0),
  });

  const products = useMemo(
    () =>
      Array.isArray(productsData)
        ? productsData.map((item) => ({
            ...item,
            subcategories: item.subcategories || [],
          }))
        : [],
    [productsData]
  );

  const availableCategories = useMemo(
    () =>
      isAllProductsPage && categories
        ? [...categories].sort((a, b) => a.code.localeCompare(b.code))
        : [],
    [isAllProductsPage, categories]
  );

  const displayedProducts = useProductFilters(products, filters);

  const { currentPage, currentItems, paginate } =
    usePagination<Product>(displayedProducts);

  const handleFiltersChange = (newFilters: ProductFiltersState) => {
    setFilters(newFilters);
  };

  return (
    <div className="container mx-auto py-4 sm:py-6 bg-bg-primary">
      <h1 className="text-2xl sm:text-3xl text-center font-bold mb-0 sm:mb-2 tracking-wide text-text-primary">
        {category.name}
      </h1>

      <ProductFilters
        categories={availableCategories}
        subcategories={subcategories}
        showCategoryFilter={isAllProductsPage}
        onFiltersChange={handleFiltersChange}
        initialFilters={filters}
      />

      {displayedProducts.length > 0 && (
        <PaginationButtons
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={displayedProducts.length}
          paginate={paginate}
          currentPage={currentPage}
        />
      )}

      <div>
        {isLoading ? (
          <Box className="flex justify-center items-center py-10 my-auto">
            <CircularProgress message="Зареждане на продуктите..." />
          </Box>
        ) : currentItems.length === 0 ? (
          <div className="container mx-auto px-4 mt-4 font-bold">
            <p className="text-center text-2xl p-16 bg-card-bg rounded-md text-text-secondary border border-card-border transition-colors duration-300">
              {filters.selectedSubcategories.length > 0 ||
              filters.selectedCategories.length > 0 ||
              filters.priceRange[0] > 0 ||
              filters.priceRange[1] < 500
                ? "Няма продукти, отговарящи на избраните филтри"
                : "Няма налични продукти"}
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
              totalItems={displayedProducts.length}
              paginate={paginate}
              currentPage={currentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
