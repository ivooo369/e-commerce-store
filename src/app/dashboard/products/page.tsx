"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardNav from "@/app/ui/dashboard/dashboard-primary-nav";
import DashboardSecondaryNav from "@/app/ui/dashboard/dashboard-secondary-nav";
import ProductCard from "@/app/ui/components/product-card-dashboard";
import ConfirmationModal from "@/app/ui/components/confirmation-modal";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { Category, Product, Subcategory } from "@prisma/client";
import DashboardSearch from "@/app/ui/dashboard/dashboard-search";
import CircularProgress from "@/app/ui/components/circular-progress";
import usePagination, { ITEMS_PER_PAGE } from "@/app/lib/usePagination";
import PaginationButtons from "@/app/ui/components/pagination";

interface ProductWithSubcategories extends Product {
  subcategories: {
    subcategory: Subcategory;
    id: string;
    name: string;
    code: string;
    categoryId: string;
  }[];
}

const fetchProducts = async (): Promise<ProductWithSubcategories[]> => {
  const response = await fetch("/api/dashboard/products");
  if (!response.ok) {
    throw new Error("Възникна грешка при извличане на продуктите!");
  }
  const data: ProductWithSubcategories[] = await response.json();
  data.sort((a, b) => a.code.localeCompare(b.code));
  return data;
};

const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch("/api/dashboard/categories");
  if (!response.ok) {
    throw new Error("Възникна грешка при извличане на категориите!");
  }
  const data = await response.json();
  data.sort((a: { code: string }, b: { code: string }) =>
    a.code.localeCompare(b.code)
  );
  return data;
};

const fetchSubcategories = async (): Promise<Subcategory[]> => {
  const response = await fetch("/api/dashboard/subcategories");
  if (!response.ok) {
    throw new Error("Възникна грешка при извличане на подкатегориите!");
  }
  const data = await response.json();
  data.sort((a: { code: string }, b: { code: string }) =>
    a.code.localeCompare(b.code)
  );
  return data;
};

const deleteProduct = async (id: string) => {
  const response = await fetch(`/api/dashboard/products/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Възникна грешка при изтриване на продукта!");
  }
};

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
          <Box className="flex justify-center items-center py-10 my-auto">
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
            <p className="text-center text-2xl p-16 bg-white rounded-md text-gray-600">
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
                  onDelete={() => handleOpenModal(product.id)}
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
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleDeleteProduct}
          mainMessage="Сигурни ли сте, че искате да изтриете този продукт?"
          deletingMessage="Изтриване на продукта..."
          isDeleting={isDeleting}
        />
      </div>
    </>
  );
}
