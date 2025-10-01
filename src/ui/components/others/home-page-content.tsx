"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/services/categoryService";
import CategoryCard from "@/ui/components/cards/category-card";
import Link from "next/link";
import CircularProgress from "@/ui/components/feedback/circular-progress";
import Box from "@mui/material/Box";

export default function HomePageContent() {
  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const sortedCategories = [...categories].sort((a, b) =>
    a.code.localeCompare(b.code)
  );

  if (isLoading) {
    return (
      <Box className="flex justify-center items-center py-10 my-auto">
        <CircularProgress message="Зареждане на категориите..." />
      </Box>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-text-primary">
          Възникна грешка при зареждане на категориите
        </h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 tracking-wide text-text-primary">
        Категории продукти
      </h1>
      <div className="mb-6">
        <Link
          href="/product-catalog/all"
          className="view-all-button block w-full px-6 py-5 text-center rounded-xl shadow-lg text-xl font-semibold no-underline"
        >
          Вижте всички продукти в магазина
        </Link>
      </div>
      {categories.length === 0 ? (
        <p className="text-center text-lg text-error-color">
          Няма налични категории
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {sortedCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}
