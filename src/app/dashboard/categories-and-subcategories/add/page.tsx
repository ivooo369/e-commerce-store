"use client";

import DashboardNav from "@/ui/dashboard/dashboard-primary-nav";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/services/categoryService";
import CategoryForm from "@/ui/components/category-form";
import SubcategoryForm from "@/ui/components/subcategory-form";

export default function DashboardAddCategoriesAndSubcategoriesPage() {
  const { data: categories, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  return (
    <>
      <DashboardNav />
      <div className="flex flex-col gap-11 container mx-auto px-4 py-6 sm:py-10 max-w-5xl">
        <CategoryForm refetch={refetch} />
        <SubcategoryForm categories={categories || []} refetch={refetch} />
      </div>
    </>
  );
}
