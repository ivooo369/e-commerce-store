"use client";

import { useEffect, useState } from "react";
import DashboardNav from "@/app/ui/dashboard/dashboard-primary-nav";
import DashboardSecondaryNav from "@/app/ui/dashboard/dashboard-secondary-nav";
import ProductCard from "@/app/ui/components/product-card-dashboard";
import ConfirmationModal from "@/app/ui/components/confirmation-modal";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { Product, Subcategory } from "@prisma/client";
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

export default function DashboardProductsPage() {
  const [products, setProducts] = useState<ProductWithSubcategories[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<
    ProductWithSubcategories[]
  >([]);
  const [categories, setCategories] = useState<
    { id: string; name: string; code: string }[]
  >([]);
  const [subcategories, setSubcategories] = useState<
    { id: string; name: string; code: string; categoryId: string }[]
  >([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    []
  );
  const [openModal, setOpenModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<boolean>(false);

  const filterProducts = (
    products: ProductWithSubcategories[],
    selectedSubcategory: string[]
  ) => {
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
  };

  const { currentPage, currentItems, paginate } =
    usePagination(filteredProducts);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsResponse, categoriesResponse, subcategoriesResponse] =
          await Promise.all([
            fetch("/api/dashboard/products"),
            fetch("/api/dashboard/categories"),
            fetch("/api/dashboard/subcategories"),
          ]);

        if (
          !productsResponse.ok ||
          !categoriesResponse.ok ||
          !subcategoriesResponse.ok
        ) {
          throw new Error("Възникна грешка при извличане на данните!");
        }

        const productsData: ProductWithSubcategories[] =
          await productsResponse.json();
        const categoriesData = await categoriesResponse.json();
        const subcategoriesData = await subcategoriesResponse.json();

        productsData.sort((a, b) => a.code.localeCompare(b.code));
        subcategoriesData.sort((a: { code: string }, b: { code: string }) =>
          a.code.localeCompare(b.code)
        );
        categoriesData.sort((a: { code: string }, b: { code: string }) =>
          a.code.localeCompare(b.code)
        );

        setProducts(productsData);
        setCategories(categoriesData);
        setSubcategories(subcategoriesData);

        filterProducts(productsData, selectedSubcategories);
      } catch (error) {
        console.error("Възникна грешка при извличане на данните:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterProducts(products, selectedSubcategories);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedSubcategories]);

  const handleOpenModal = (id: string) => {
    setProductToDelete(id);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setProductToDelete(null);
  };

  const handleDeleteProduct = async () => {
    if (productToDelete) {
      setDeleting(true);
      try {
        const response = await fetch(
          `/api/dashboard/products/${productToDelete}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok)
          throw new Error("Възникна грешка при изтриване на продукта!");

        setProducts((prevProducts) =>
          prevProducts.filter((product) => product.id !== productToDelete)
        );
        setFilteredProducts((prevProducts) =>
          prevProducts.filter((product) => product.id !== productToDelete)
        );
      } catch (error) {
        console.error("Възникна грешка при изтриване на продукта:", error);
      } finally {
        setDeleting(false);
        handleCloseModal();
      }
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent<string[]>) => {
    const categoryIds = event.target.value as string[];
    setSelectedCategories(categoryIds);
  };

  const handleSubcategoryChange = (event: SelectChangeEvent<string[]>) => {
    const subcategoryIds = event.target.value as string[];
    setSelectedSubcategories(subcategoryIds);
  };

  return (
    <>
      <DashboardNav />
      <DashboardSecondaryNav />
      <div className="products-filter-container flex flex-col items-center max-w-screen-2xl mx-auto space-y-4 py-4 px-4">
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
            {categories.map((category) => (
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
                  const subcategory = subcategories.find((s) => s.id === id);
                  return subcategory
                    ? `${subcategory.code} - ${subcategory.name}`
                    : "";
                })
                .join(", ")
            }
          >
            {subcategories
              .filter(
                (subcategory) =>
                  selectedCategories.length === 0 ||
                  selectedCategories.includes(subcategory.categoryId)
              )
              .map((subcategory) => (
                <MenuItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.code} - {subcategory.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        {filteredProducts.length > 0 && (
          <div className="pb-2">
            <PaginationButtons
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredProducts.length}
              paginate={paginate}
              currentPage={currentPage}
            />
          </div>
        )}
      </div>
      <div>
        {loading ? (
          <Box className="flex justify-center items-center py-10 my-auto">
            <CircularProgress message="Зареждане на продуктите..." />
          </Box>
        ) : currentItems.length === 0 ? (
          <div className="container mx-auto px-4 mt-4 font-bold">
            <p className="text-center text-2xl p-16 bg-white rounded-md text-gray-600">
              Няма намерени продукти
            </p>
          </div>
        ) : (
          <div className="container mx-auto py-4 lg:px-4">
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {currentItems.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onDelete={handleOpenModal}
                />
              ))}
            </div>
            <div className="pt-10">
              <PaginationButtons
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={filteredProducts.length}
                paginate={paginate}
                currentPage={currentPage}
              />
            </div>
          </div>
        )}
      </div>
      <ConfirmationModal
        open={openModal}
        onClose={handleCloseModal}
        onConfirm={handleDeleteProduct}
        mainMessage="Сигурни ли сте, че искате да изтриете този продукт?"
        deletingMessage="Изтриване на продукта..."
        isDeleting={deleting}
      />
    </>
  );
}
