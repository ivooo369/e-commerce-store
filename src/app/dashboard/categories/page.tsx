"use client";

import { Category } from "@prisma/client";
import DashboardNav from "@/ui/dashboard/dashboard-primary-nav";
import DashboardSecondaryNav from "@/ui/dashboard/dashboard-secondary-nav";
import CategoryCard from "@/ui/components/category-card-dashboard";
import ConfirmationModal from "@/ui/components/confirmation-modal";
import DashboardSearch from "@/ui/dashboard/dashboard-search";
import CircularProgress from "@/ui/components/circular-progress";
import PaginationButtons from "@/ui/components/pagination";
import usePagination, { ITEMS_PER_PAGE } from "@/lib/usePagination";
import Box from "@mui/material/Box";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { deleteCategory, fetchCategories } from "@/services/categoryService";

export default function DashboardCategoriesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const filteredCategories = categories
    .filter(
      (category: Category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: Category, b: Category) => a.code.localeCompare(b.code));

  const { currentPage, currentItems, paginate } =
    usePagination(filteredCategories);

  const handleOpenModal = (id: string) => {
    setCategoryToDelete(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCategoryToDelete(null);
  };

  const handleDeleteCategory = async () => {
    if (categoryToDelete) {
      setIsDeleting(true);

      queryClient.setQueryData(["categories"], (old: Category[] | undefined) =>
        old ? old.filter((cat) => cat.id !== categoryToDelete) : []
      );

      try {
        await deleteCategory(categoryToDelete);
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      } catch (error) {
        console.error("Възникна грешка при изтриване на категорията:", error);
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      } finally {
        setIsDeleting(false);
        handleCloseModal();
      }
    }
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
        {currentItems.length > 0 && (
          <div className="pb-2">
            <PaginationButtons
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredCategories.length}
              paginate={paginate}
              currentPage={currentPage}
            />
          </div>
        )}
        {isLoading ? (
          <Box className="flex justify-center items-center py-10 my-auto">
            <CircularProgress message="Зареждане на категориите..." />
          </Box>
        ) : isError ? (
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold text-text-primary">
              Възникна грешка при извличане на категориите
            </h2>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="container mx-auto font-bold min-w-full">
            <p className="text-center text-2xl p-16 bg-card-bg rounded-md text-text-secondary border border-card-border transition-colors duration-300">
              Няма намерени категории
            </p>
          </div>
        ) : (
          <div className="container mx-auto">
            <div className="grid gap-5 sm:gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currentItems.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onDelete={handleOpenModal}
                />
              ))}
            </div>
            <div className="pt-6">
              <PaginationButtons
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={filteredCategories.length}
                paginate={paginate}
                currentPage={currentPage}
              />
            </div>
          </div>
        )}
        <ConfirmationModal
          open={isModalOpen}
          onCancel={handleCloseModal}
          onConfirm={handleDeleteCategory}
          message="Сигурни ли сте, че искате да изтриете тази категория? Това действие ще премахне и свързаните подкатегории!"
          deletingMessage="Изтриване на категорията..."
          isDeleting={isDeleting}
          title="Изтриване на категория"
        />
      </div>
    </>
  );
}
