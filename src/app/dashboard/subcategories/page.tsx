"use client";

import DashboardNav from "@/app/ui/dashboard/dashboard-primary-nav";
import DashboardSecondaryNav from "@/app/ui/dashboard/dashboard-secondary-nav";
import { useState, useEffect } from "react";
import ConfirmationModal from "@/app/ui/components/confirmation-modal";
import DashboardSearch from "@/app/ui/dashboard/dashboard-search";
import SubcategoryCard from "@/app/ui/components/subcategory-card";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

export default function DashboardSubcategoriesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [categories, setCategories] = useState<
    { id: string; name: string; code: string }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<string | null>(
    null
  );
  const [openSubcategoryModal, setOpenSubcategoryModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategoriesAndSubcategories = async () => {
      try {
        const [categoriesResponse, subcategoriesResponse] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/subcategories"),
        ]);

        if (!categoriesResponse.ok || !subcategoriesResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const categoriesData = await categoriesResponse.json();
        const subcategoriesData = await subcategoriesResponse.json();

        subcategoriesData.sort((a: { code: string }, b: { code: string }) =>
          a.code.localeCompare(b.code)
        );

        setCategories(categoriesData);
        setSubcategories(subcategoriesData);
      } catch (error) {
        console.error("Error fetching categories or subcategories:", error);
      }
    };

    fetchCategoriesAndSubcategories();
  }, []);

  const sortedCategories = categories.sort((a, b) =>
    a.code.localeCompare(b.code)
  );

  const filteredSubcategories = subcategories.filter(
    (subcategory) =>
      (selectedCategories.length === 0 ||
        selectedCategories.includes(subcategory.categoryId)) &&
      (subcategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subcategory.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenSubcategoryModal = (id: string) => {
    setSubcategoryToDelete(id);
    setOpenSubcategoryModal(true);
  };

  const handleCloseSubcategoryModal = () => {
    setOpenSubcategoryModal(false);
    setSubcategoryToDelete(null);
  };

  const handleDeleteSubcategory = async () => {
    if (subcategoryToDelete) {
      try {
        const response = await fetch(
          `/api/subcategories/${subcategoryToDelete}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) throw new Error("Failed to delete subcategory");

        setSubcategories((prevSubcategories) =>
          prevSubcategories.filter(
            (subcategory) => subcategory.id !== subcategoryToDelete
          )
        );
      } catch (error) {
        console.error("Error deleting subcategory:", error);
      } finally {
        handleCloseSubcategoryModal();
      }
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedCategories(typeof value === "string" ? value.split(",") : value);
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
            Филтриране на подкатегориите според категориите
          </InputLabel>
          <Select
            multiple
            value={selectedCategories}
            onChange={handleCategoryChange}
            label="Филтриране на подкатегориите според категориите"
            id="category-select"
          >
            {sortedCategories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.code} - {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <div className="container mx-auto py-4 lg:px-4">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredSubcategories.map((subcategory) => (
            <SubcategoryCard
              key={subcategory.id}
              subcategory={subcategory}
              onDelete={handleOpenSubcategoryModal}
            />
          ))}
        </div>
      </div>
      <ConfirmationModal
        open={openSubcategoryModal}
        onClose={handleCloseSubcategoryModal}
        onConfirm={handleDeleteSubcategory}
      />
    </>
  );
}
