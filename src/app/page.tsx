import { fetchCategories } from "@/services/categoryService";
import CategoryCard from "@/ui/components/cards/category-card";
import Link from "next/link";
import { generateMetadata } from "@/lib/utils/metadata";

export const metadata = generateMetadata("/");

export default async function HomePage() {
  const categories = await fetchCategories();
  const sortedCategories = [...categories].sort((a, b) =>
    a.code.localeCompare(b.code)
  );

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
