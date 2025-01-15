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
import CircularProgress from "@/app/ui/components/circular-progress";
import PaginationButtons from "@/app/ui/components/pagination";
import usePagination from "@/app/lib/usePagination";
import { ITEMS_PER_PAGE } from "@/app/lib/usePagination";
import Box from "@mui/material/Box";

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
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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

  const { currentPage, currentItems, paginate } = usePagination(
    filteredSubcategories
  );

  useEffect(() => {
    const fetchCategoriesAndSubcategories = async () => {
      try {
        const [categoriesResponse, subcategoriesResponse] = await Promise.all([
          fetch("/api/dashboard/categories"),
          fetch("/api/dashboard/subcategories"),
        ]);

        if (!categoriesResponse.ok || !subcategoriesResponse.ok) {
          throw new Error(
            "Възникна грешка при извличане на категориите или подкатегориите!"
          );
        }

        const categoriesData = await categoriesResponse.json();
        const subcategoriesData = await subcategoriesResponse.json();

        subcategoriesData.sort((a: { code: string }, b: { code: string }) =>
          a.code.localeCompare(b.code)
        );

        setCategories(categoriesData);
        setSubcategories(subcategoriesData);
      } catch (error) {
        console.error(
          "Възникна грешка при извличане на категориите или подкатегориите:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoriesAndSubcategories();
  }, []);

  const handleOpenSubcategoryModal = (id: string) => {
    setSubcategoryToDelete(id);
    setIsSubcategoryModalOpen(true);
  };

  const handleCloseSubcategoryModal = () => {
    setIsSubcategoryModalOpen(false);
    setSubcategoryToDelete(null);
  };

  const handleDeleteSubcategory = async () => {
    if (subcategoryToDelete) {
      setIsDeleting(true);
      try {
        const response = await fetch(
          `/api/dashboard/subcategories/${subcategoryToDelete}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok)
          throw new Error("Възникна грешка при изтриване на подкатегорията!");

        setSubcategories((prevSubcategories) =>
          prevSubcategories.filter(
            (subcategory) => subcategory.id !== subcategoryToDelete
          )
        );
      } catch (error) {
        console.error(
          "Възникна грешка при изтриване на подкатегорията:",
          error
        );
      } finally {
        setIsDeleting(false);
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
        {currentItems.length > 0 && (
          <div className="pb-2">
            <PaginationButtons
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredSubcategories.length}
              paginate={paginate}
              currentPage={currentPage}
            />
          </div>
        )}
      </div>
      {isLoading ? (
        <Box className="flex justify-center items-center py-10 my-auto">
          <CircularProgress message="Зареждане на подкатегориите..." />
        </Box>
      ) : currentItems.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold">Няма намерени подкатегории</h2>
        </div>
      ) : (
        <>
          <div className="container mx-auto py-4 lg:px-4">
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {currentItems.map((subcategory) => (
                <SubcategoryCard
                  key={subcategory.id}
                  subcategory={subcategory}
                  onDelete={handleOpenSubcategoryModal}
                />
              ))}
            </div>
            <div className="pt-10">
              {currentItems.length > 0 && (
                <PaginationButtons
                  itemsPerPage={ITEMS_PER_PAGE}
                  totalItems={filteredSubcategories.length}
                  paginate={paginate}
                  currentPage={currentPage}
                />
              )}
            </div>
          </div>
        </>
      )}
      <ConfirmationModal
        isOpen={isSubcategoryModalOpen}
        onClose={handleCloseSubcategoryModal}
        onConfirm={handleDeleteSubcategory}
        mainMessage="Сигурни ли сте, че искате да изтриете тази подкатегория?"
        deletingMessage="Изтриване на подкатегорията..."
        isDeleting={isDeleting}
      />
    </>
  );
}
