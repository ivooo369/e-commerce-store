"use client";

import { useEffect, useState } from "react";
import DashboardNav from "@/app/ui/dashboard/dashboard-primary-nav";
import DashboardSecondaryNav from "@/app/ui/dashboard/dashboard-secondary-nav";
import ProductCard from "@/app/ui/components/product-card";
import ConfirmationModal from "@/app/ui/components/confirmation-modal";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { Product } from "@prisma/client";
import DashboardSearch from "@/app/ui/dashboard/dashboard-search";

interface Subcategory {
  id: string;
  name: string;
  code: string;
}

interface ProductWithSubcategories extends Product {
  subcategories: {
    subcategory: Subcategory;
    id: string;
    name: string;
    code: string;
    categoryId: string;
  }[];
}

export default function DashboardInventoryPage() {
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
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, categoriesResponse, subcategoriesResponse] =
          await Promise.all([
            fetch("/api/products"),
            fetch("/api/categories"),
            fetch("/api/subcategories"),
          ]);

        if (
          !productsResponse.ok ||
          !categoriesResponse.ok ||
          !subcategoriesResponse.ok
        ) {
          throw new Error("Failed to fetch data");
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

        filterProducts(productsData, selectedSubcategory);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedSubcategory]);

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
      try {
        const response = await fetch(`/api/products/${productToDelete}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete product");

        setProducts((prevProducts) =>
          prevProducts.filter((product) => product.id !== productToDelete)
        );
        setFilteredProducts((prevProducts) =>
          prevProducts.filter((product) => product.id !== productToDelete)
        );
      } catch (error) {
        console.error("Error deleting product:", error);
      } finally {
        handleCloseModal();
      }
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent<string[]>) => {
    const categoryIds = event.target.value as string[];
    setSelectedCategory(categoryIds);
    setSelectedSubcategory([]);
  };

  const handleSubcategoryChange = (event: SelectChangeEvent<string[]>) => {
    const subcategoryIds = event.target.value as string[];
    setSelectedSubcategory(subcategoryIds);
  };

  const filteredSubcategories = selectedCategory.length
    ? subcategories.filter((subcategory) =>
        selectedCategory.includes(subcategory.categoryId)
      )
    : subcategories;

  useEffect(() => {
    filterProducts(products, selectedSubcategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, products, selectedSubcategory]);

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
            value={selectedCategory}
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
            value={selectedSubcategory}
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
            {filteredSubcategories.map((subcategory) => (
              <MenuItem key={subcategory.id} value={subcategory.id}>
                {subcategory.code} - {subcategory.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <div className="container mx-auto py-4 lg:px-4">
        <Box className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={handleOpenModal}
            />
          ))}
        </Box>
      </div>
      <ConfirmationModal
        open={openModal}
        onClose={handleCloseModal}
        onConfirm={handleDeleteProduct}
      />
    </>
  );
}
