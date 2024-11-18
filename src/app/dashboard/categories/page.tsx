"use client";

import DashboardNav from "@/app/ui/dashboard/dashboard-primary-nav";
import DashboardSecondaryNav from "@/app/ui/dashboard/dashboard-secondary-nav";
import { useState, useEffect } from "react";
import CategoryCard from "@/app/ui/components/category-card";
import { Category } from "@prisma/client";
import ConfirmationModal from "@/app/ui/components/confirmation-modal";
import DashboardSearch from "@/app/ui/dashboard/dashboard-search";

export default function DashboardCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data: Category[] = await response.json();

        data.sort((a, b) => a.code.localeCompare(b.code));

        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
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
      try {
        const response = await fetch(`/api/categories/${categoryToDelete}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete category");

        setCategories((prevCategories) =>
          prevCategories.filter((category) => category.id !== categoryToDelete)
        );
      } catch (error) {
        console.error("Error deleting category:", error);
      } finally {
        handleCloseCategoryModal();
      }
    }
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <DashboardNav />
      <DashboardSecondaryNav />
      <div className="products-filter-container flex flex-col items-center max-w-screen-2xl mx-auto space-y-4 py-4 px-4">
        <DashboardSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>
      <div className="container mx-auto py-4 lg:px-4">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onDelete={handleOpenCategoryModal}
            />
          ))}
        </div>
      </div>
      <ConfirmationModal
        open={openCategoryModal}
        onClose={handleCloseCategoryModal}
        onConfirm={handleDeleteCategory}
      />
    </>
  );
}
