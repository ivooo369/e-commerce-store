"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardNav from "@/ui/dashboard/dashboard-primary-nav";
import DashboardSecondaryNav from "@/ui/dashboard/dashboard-secondary-nav";
import ProductCard from "@/ui/components/product-card-dashboard";
import ConfirmationModal from "@/ui/components/confirmation-modal";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { Category, Subcategory } from "@prisma/client";
import DashboardSearch from "@/ui/dashboard/dashboard-search";
import CircularProgress from "@/ui/components/circular-progress";
import usePagination, { ITEMS_PER_PAGE } from "@/lib/usePagination";
import PaginationButtons from "@/ui/components/pagination";
import { ProductWithSubcategories } from "@/lib/interfaces";
import { deleteProduct, fetchProducts } from "@/services/productService";
import { fetchCategories } from "@/services/categoryService";
import { fetchSubcategories } from "@/services/subcategoryService";

export default function DashboardProductsPage() {
  const queryClient = useQueryClient();
  const [filteredProducts, setFilteredProducts] = useState<
    ProductWithSubcategories[]
  >([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    []
  );
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

  const {
    data: subcategoriesData,
    isLoading: subcategoriesLoading,
    isError: subcategoriesError,
  } = useQuery({
    queryKey: ["subcategories"],
    queryFn: fetchSubcategories,
  });

  const filterProducts = useCallback(
    (products: ProductWithSubcategories[], selectedSubcategory: string[]) => {
      let filtered = products;

      if (selectedSubcategory.length > 0) {
        filtered = filtered.filter((product) =>
          product.subcategories.some((sub) =>
            selectedSubcategory.includes(sub.subcategory.id)
          )
        );
      }

      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.code.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setFilteredProducts(filtered);
    },
    [searchTerm]
  );

  useEffect(() => {
    if (productsData) {
      filterProducts(productsData, selectedSubcategories);
    }
  }, [searchTerm, selectedSubcategories, productsData, filterProducts]);

  const { currentPage, currentItems, paginate } =
    usePagination(filteredProducts);

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

      setFilteredProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== productToDelete)
      );

      try {
        await deleteProduct(productToDelete);
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } catch (error) {
        console.error("Възникна грешка при изтриване на продукта:", error);
        setFilteredProducts((prevProducts) => [
          ...prevProducts,
          productsData?.find(
            (product) => product.id === productToDelete
          ) as ProductWithSubcategories,
        ]);
      } finally {
        setIsDeleting(false);
        handleCloseModal();
      }
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedCategories(event.target.value as string[]);
  };

  const handleSubcategoryChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedSubcategories(event.target.value as string[]);
  };

  const isLoading =
    productsLoading || categoriesLoading || subcategoriesLoading;
  const isError = productsError || categoriesError || subcategoriesError;

  return (
    <>
      <DashboardNav />
      <DashboardSecondaryNav />
      <div className="container mx-auto pb-4 products-filter-container flex flex-col items-center max-w-screen-2xl mx-auto space-y-4 py-4 px-4">
        <DashboardSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="category-select">
            Филтриране на подкатегориите според избраните категории
          </InputLabel>
          <Select
            multiple
            value={selectedCategories}
            onChange={handleCategoryChange}
            label="Филтриране на подкатегориите според избраните категории"
            id="category-select"
          >
            {categoriesData?.map((category: Category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.code} - {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="subcategory-select">
            Филтриране на продуктите според избраните подкатегории
          </InputLabel>
          <Select
            multiple
            value={selectedSubcategories}
            onChange={handleSubcategoryChange}
            label="Филтриране на продуктите според избраните подкатегории"
            id="subcategory-select"
            renderValue={(selected) =>
              selected
                .map((id) => {
                  const subcategory = subcategoriesData?.find(
                    (s: { id: string }) => s.id === id
                  );
                  return subcategory
                    ? `${subcategory.code} - ${subcategory.name}`
                    : "";
                })
                .join(", ")
            }
          >
            {subcategoriesData
              ?.filter(
                (subcategory: Subcategory) =>
                  selectedCategories.length === 0 ||
                  selectedCategories.includes(subcategory.categoryId)
              )
              .map((subcategory: Subcategory) => (
                <MenuItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.code} - {subcategory.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        {!isLoading && filteredProducts.length > 0 && (
          <div className="pb-2">
            <PaginationButtons
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredProducts.length}
              paginate={paginate}
              currentPage={currentPage}
            />
          </div>
        )}
        {isLoading ? (
          <Box className="flex justify-center items-center min-h-[50vh] w-full">
            <CircularProgress message="Зареждане на продуктите..." />
          </Box>
        ) : isError ? (
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold">
              Възникна грешка при извличане на продуктите
            </h2>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="container mx-auto font-bold min-w-full">
            <p className="text-center text-2xl p-16 bg-card-bg rounded-md text-text-secondary border border-card-border transition-colors duration-300">
              Няма намерени продукти
            </p>
          </div>
        ) : (
          <div className="container mx-auto">
            <div className="grid gap-5 sm:gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currentItems.map((product: ProductWithSubcategories) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onDelete={() => product.id && handleOpenModal(product.id)}
                />
              ))}
            </div>
            <div className="pt-6">
              {currentItems.length > 0 && (
                <PaginationButtons
                  itemsPerPage={ITEMS_PER_PAGE}
                  totalItems={filteredProducts.length}
                  paginate={paginate}
                  currentPage={currentPage}
                />
              )}
            </div>
          </div>
        )}
        <ConfirmationModal
          open={isModalOpen}
          onCancel={handleCloseModal}
          onConfirm={handleDeleteProduct}
          message="Сигурни ли сте, че искате да изтриете този продукт? Това действие е необратимо!"
          deletingMessage="Изтриване на продукта..."
          isDeleting={isDeleting}
          title="Изтриване на продукт"
          confirmText="Изтрий"
          cancelText="Отказ"
        />
      </div>
    </>
  );
}
