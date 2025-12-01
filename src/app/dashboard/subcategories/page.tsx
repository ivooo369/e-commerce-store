"use client";

import DashboardNav from "@/ui/components/layouts/dashboard-primary-nav";
import DashboardSecondaryNav from "@/ui/components/layouts/dashboard-secondary-nav";
import ConfirmationModal from "@/ui/components/modals/confirmation-modal";
import DashboardSearch from "@/ui/components/search/dashboard-search";
import SubcategoryCard from "@/ui/components/cards/subcategory-card";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@/ui/components/feedback/circular-progress";
import PaginationButtons from "@/ui/components/navigation/pagination";
import usePagination, { ITEMS_PER_PAGE } from "@/lib/hooks/usePagination";
import Box from "@mui/material/Box";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { fetchDashboardCategories } from "@/services/categoryService";
import {
  deleteSubcategory,
  fetchSubcategories,
} from "@/services/subcategoryService";
import type { Subcategory } from "@/lib/types/interfaces";
import type {
  Category,
  Subcategory as SubcategoryPrisma,
} from "@/generated/client/client";

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
    queryKey: ["dashboardCategories"],
    queryFn: fetchDashboardCategories,
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
      } catch {
        throw new Error("Възникна грешка при изтриване на подкатегорията!");
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
                  id={subcategory.id}
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
          open={isSubcategoryModalOpen}
          onCancel={handleCloseSubcategoryModal}
          onConfirm={handleDeleteSubcategory}
          message="Сигурни ли сте, че искате да изтриете тази подкатегория? Това действие ще изтрие и свързаните продукти!"
          deletingMessage="Изтриване на подкатегорията..."
          isDeleting={isDeleting}
          title="Изтриване на подкатегория"
        />
      </div>
    </>
  );
}
