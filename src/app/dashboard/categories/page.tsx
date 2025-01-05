"use client";

import { useState, useEffect } from "react";
import { Category } from "@prisma/client";
import DashboardNav from "@/app/ui/dashboard/dashboard-primary-nav";
import DashboardSecondaryNav from "@/app/ui/dashboard/dashboard-secondary-nav";
import CategoryCard from "@/app/ui/components/category-card-dashboard";
import ConfirmationModal from "@/app/ui/components/confirmation-modal";
import DashboardSearch from "@/app/ui/dashboard/dashboard-search";
import CircularProgress from "@/app/ui/components/circular-progress";
import PaginationButtons from "@/app/ui/components/pagination";
import usePagination from "@/app/lib/usePagination";
import { ITEMS_PER_PAGE } from "@/app/lib/usePagination";
import Box from "@mui/material/Box";

export default function DashboardCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<boolean>(false);

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { currentPage, currentItems, paginate } =
    usePagination(filteredCategories);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/dashboard/categories");
        if (!response.ok)
          throw new Error("Възникна грешка при извличане на категорията!");
        const data: Category[] = await response.json();

        data.sort((a, b) => a.code.localeCompare(b.code));

        setCategories(data);
      } catch (error) {
        console.error("Възникна грешка при извличане на категорията:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleOpenCategoryModal = (id: string) => {
    setCategoryToDelete(id);
    setOpenCategoryModal(true);
  };

  const handleCloseCategoryModal = () => {
    setOpenCategoryModal(false);
    setCategoryToDelete(null);
  };

  const handleDeleteCategory = async () => {
    if (categoryToDelete) {
      setDeleting(true);
      try {
        const response = await fetch(
          `/api/dashboard/categories/${categoryToDelete}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok)
          throw new Error("Възникна грешка при изтриване на категорията!");

        setCategories((prevCategories) =>
          prevCategories.filter((category) => category.id !== categoryToDelete)
        );
      } catch (error) {
        console.error("Възникна грешка при изтриване на категорията:", error);
      } finally {
        setDeleting(false);
        handleCloseCategoryModal();
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
      </div>
      {loading ? (
        <Box className="flex justify-center items-center py-10 my-auto">
          <CircularProgress message="Зареждане на категориите..." />
        </Box>
      ) : currentItems.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold">Няма намерени категории</h2>
        </div>
      ) : (
        <>
          <div className="container mx-auto py-4 lg:px-4">
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {currentItems.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onDelete={handleOpenCategoryModal}
                />
              ))}
            </div>
            <div className="pt-10">
              <PaginationButtons
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={filteredCategories.length}
                paginate={paginate}
                currentPage={currentPage}
              />
            </div>
          </div>
        </>
      )}
      <ConfirmationModal
        open={openCategoryModal}
        onClose={handleCloseCategoryModal}
        onConfirm={handleDeleteCategory}
        mainMessage="Сигурни ли сте, че искате да изтриете тази категория? Това действие ще премахне и свързаните подкатегории!"
        deletingMessage="Изтриване на категорията и свързаните с нея подкатегории..."
        isDeleting={deleting}
      />
    </>
  );
}
