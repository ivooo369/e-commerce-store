"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardNav from "@/ui/components/layouts/dashboard-primary-nav";
import DashboardSecondaryNav from "@/ui/components/layouts/dashboard-secondary-nav";
import DashboardProductCard from "@/ui/components/cards/dashboard-product-card";
import ConfirmationModal from "@/ui/components/modals/confirmation-modal";
import Box from "@mui/material/Box";
import DashboardSearch from "@/ui/components/search/dashboard-search";
import CircularProgress from "@/ui/components/feedback/circular-progress";
import usePagination, { ITEMS_PER_PAGE } from "@/lib/hooks/usePagination";
import PaginationButtons from "@/ui/components/navigation/pagination";
import { deleteProduct, fetchProducts } from "@/services/productService";
import { fetchCategories } from "@/services/categoryService";
import ProductFilters from "@/ui/components/others/product-filters";
import { useProductFilters } from "@/lib/hooks/useProductFilters";
import type {
  ProductFiltersState,
  ProductWithNestedSubcategories,
} from "@/lib/types/interfaces";

export default function DashboardProductsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ProductFiltersState>({
    selectedCategories: [],
    selectedSubcategories: [],
    sortOption: "newest",
    priceRange: [0, 500],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const subcategoriesData = useMemo(() => {
    if (!productsData) return [];

    const subcategoryMap = new Map<
      string,
      {
        id: string;
        name: string;
        code: string;
        categoryId: string;
        category: {
          id: string;
          name: string;
          code: string;
        };
        createdAt: Date;
        updatedAt: Date;
      }
    >();

    productsData.forEach((product: ProductWithNestedSubcategories) => {
      product.subcategories?.forEach(({ subcategory }) => {
        if (subcategory) {
          const { category, ...subcategoryData } = subcategory;
          const fullCategory = categoriesData?.find(
            (cat) => cat.id === subcategoryData.categoryId
          );
          subcategoryMap.set(subcategoryData.id, {
            ...subcategoryData,
            categoryId: subcategoryData.categoryId,
            category: {
              id: subcategoryData.categoryId,
              name: category?.name || "",
              code: fullCategory?.code || "",
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      });
    });

    return Array.from(subcategoryMap.values()).sort((a, b) =>
      a.code.localeCompare(b.code)
    );
  }, [productsData, categoriesData]);

  const displayedProducts = useProductFilters(
    productsData || [],
    filters,
    searchTerm
  );

  const { currentPage, currentItems, paginate } =
    usePagination(displayedProducts);

  const handleOpenModal = (id: string) => {
    setProductToDelete(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProductToDelete(null);
  };

  const handleDeleteProduct = async () => {
    if (productToDelete) {
      setIsDeleting(true);

      try {
        const result = await deleteProduct(productToDelete);
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["products", "all"] });
        queryClient.invalidateQueries({ queryKey: ["publicProducts"] });
        queryClient.invalidateQueries({ queryKey: ["allPublicProducts"] });
        queryClient.invalidateQueries({
          queryKey: ["products"],
          predicate: (query) => query.queryKey[0] === "products",
        });
        if (result.newCount !== undefined) {
          queryClient.setQueryData(["productCount"], result.newCount);
        }
      } catch {
        throw new Error("Възникна грешка при изтриване на продукта!");
      } finally {
        setIsDeleting(false);
        handleCloseModal();
      }
    }
  };

  const handleFiltersChange = (newFilters: ProductFiltersState) => {
    setFilters(newFilters);
  };

  const isLoading = productsLoading || categoriesLoading;
  const isError = productsError || categoriesError;

  return (
    <>
      <DashboardNav />
      <DashboardSecondaryNav />
      <div className="container mx-auto py-4 sm:py-6 bg-bg-primary min-h-screen">
        <div className="mb-4 px-4">
          <DashboardSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>

        <div className="flex flex-col items-center space-y-4 w-full px-4">
          <ProductFilters
            categories={categoriesData || []}
            subcategories={subcategoriesData}
            showCategoryFilter={true}
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
            includeContainer={false}
          />
        </div>

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
          ) : isError ? (
            <div className="container mx-auto px-4 text-center py-10">
              <h2 className="text-2xl font-bold">
                Възникна грешка при извличане на продуктите
              </h2>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="container mx-auto px-4 mt-4 font-bold">
              <p className="text-center text-2xl p-16 bg-card-bg rounded-md text-text-secondary border border-card-border transition-colors duration-300">
                {filters.selectedSubcategories.length > 0 ||
                filters.selectedCategories.length > 0 ||
                filters.priceRange[0] > 0 ||
                filters.priceRange[1] < 500 ||
                searchTerm.length > 0
                  ? "Няма продукти, отговарящи на избраните филтри"
                  : "Няма налични продукти"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 py-4 sm:py-6 md:py-8 px-4">
                {currentItems.map((product: ProductWithNestedSubcategories) => (
                  <DashboardProductCard
                    key={product.id}
                    product={product}
                    onDelete={() => product.id && handleOpenModal(product.id)}
                  />
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

        <ConfirmationModal
          open={isModalOpen}
          onCancel={handleCloseModal}
          onConfirm={handleDeleteProduct}
          message="Сигурни ли сте, че искате да изтриете този продукт? Това действие е необратимо!"
          deletingMessage="Изтриване на продукта..."
          isDeleting={isDeleting}
          title="Изтриване на продукт"
        />
      </div>
    </>
  );
}
