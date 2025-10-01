import { useMemo } from "react";
import {
  ProductFiltersState,
  ProductWithSubcategories,
} from "@/lib/types/interfaces";

export function useProductFilters(
  products: ProductWithSubcategories[],
  filters: ProductFiltersState,
  searchTerm: string = ""
) {
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.selectedSubcategories.length > 0) {
      filtered = filtered.filter((product) =>
        product.subcategories.some((sub) =>
          filters.selectedSubcategories.includes(sub.subcategory.id)
        )
      );
    }

    filtered = [...filtered].sort((a, b) => {
      switch (filters.sortOption) {
        case "alphabetical":
          return a.name.localeCompare(b.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "newest":
        default:
          return (
            new Date(b.updatedAt || new Date()).getTime() -
            new Date(a.updatedAt || new Date()).getTime()
          );
      }
    });

    filtered = filtered.filter(
      (product) =>
        product.price >= filters.priceRange[0] &&
        product.price <= filters.priceRange[1]
    );

    return filtered;
  }, [products, filters, searchTerm]);

  return filteredProducts;
}
