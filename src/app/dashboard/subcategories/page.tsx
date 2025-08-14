"use client";

import DashboardNav from "@/ui/dashboard/dashboard-primary-nav";
import DashboardSecondaryNav from "@/ui/dashboard/dashboard-secondary-nav";
import ConfirmationModal from "@/ui/components/confirmation-modal";
import DashboardSearch from "@/ui/dashboard/dashboard-search";
import SubcategoryCard from "@/ui/components/subcategory-card";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@/ui/components/circular-progress";
import PaginationButtons from "@/ui/components/pagination";
import usePagination, { ITEMS_PER_PAGE } from "@/lib/usePagination";
import Box from "@mui/material/Box";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Category, Subcategory as SubcategoryPrisma } from "@prisma/client";
import { Subcategory } from "@/lib/interfaces";
import { fetchCategories } from "@/services/categoryService";
import {
  deleteSubcategory,
  fetchSubcategories,
} from "@/services/subcategoryService";

export default function DashboardSubcategoriesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<string | null>(
    null
  );
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery<
    Category[]
  >({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const {
    data: subcategories = [],
    isLoading: isSubcategoriesLoading,
    isError,
  } = useQuery<SubcategoryPrisma[]>({
    queryKey: ["subcategories"],
    queryFn: fetchSubcategories,
  });

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

  const handleDeleteSubcategory = async () => {
    if (subcategoryToDelete) {
      setIsDeleting(true);

      queryClient.setQueryData<Subcategory[]>(
        ["subcategories"],
        (old) => old?.filter((sub) => sub.id !== subcategoryToDelete) || []
      );

      try {
        await deleteSubcategory(subcategoryToDelete);
        queryClient.invalidateQueries({ queryKey: ["subcategories"] });
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

  const handleOpenSubcategoryModal = (id: string) => {
    setSubcategoryToDelete(id);
    setIsSubcategoryModalOpen(true);
  };

  const handleCloseSubcategoryModal = () => {
    setIsSubcategoryModalOpen(false);
    setSubcategoryToDelete(null);
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
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.code} - {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {filteredSubcategories.length > 0 && (
          <div className="pb-2">
            <PaginationButtons
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredSubcategories.length}
              paginate={paginate}
              currentPage={currentPage}
            />
          </div>
        )}
        {isCategoriesLoading || isSubcategoriesLoading ? (
          <Box className="flex justify-center items-center py-10 my-auto">
            <CircularProgress message="Зареждане на подкатегориите..." />
          </Box>
        ) : isError ? (
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold">
              Възникна грешка при извличане на подкатегориите{" "}
            </h2>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="container mx-auto font-bold min-w-full">
            <p className="text-center text-2xl p-16 bg-card-bg rounded-md text-text-secondary border border-card-border transition-colors duration-300">
              Няма намерени подкатегории
            </p>
          </div>
        ) : (
          <div className="container mx-auto">
            <div className="grid gap-5 sm:gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currentItems.map((subcategory) => (
                <SubcategoryCard
                  key={subcategory.id}
                  subcategory={{
                    id: subcategory.id,
                    name: subcategory.name,
                    code: subcategory.code,
                    category: {
                      name:
                        categories.find(
                          (cat) => cat.id === subcategory.categoryId
                        )?.name || "Unknown",
                    },
                  }}
                  onDelete={handleOpenSubcategoryModal}
                  id={undefined}
                />
              ))}
            </div>
            <div className="pt-6">
              <PaginationButtons
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={filteredSubcategories.length}
                paginate={paginate}
                currentPage={currentPage}
              />
            </div>
          </div>
        )}
        <ConfirmationModal
          isOpen={isSubcategoryModalOpen}
          onClose={handleCloseSubcategoryModal}
          onConfirm={handleDeleteSubcategory}
          mainMessage="Сигурни ли сте, че искате да изтриете тази подкатегория?"
          deletingMessage="Изтриване на подкатегорията..."
          isDeleting={isDeleting}
        />
      </div>
    </>
  );
}
