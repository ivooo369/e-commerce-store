import { PrismaClient, Category } from "@prisma/client";
import CategoryCard from "./ui/components/category-card";

const prisma = new PrismaClient();

export default async function HomePage() {
  let categories: Category[] = [];

  try {
    categories = await prisma.category.findMany({
      orderBy: { code: "asc" },
    });
  } catch (error) {
    console.error("Възникна грешка при извличане на категориите:", error);
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 tracking-wide">
        Категории продукти
      </h1>
      {categories.length === 0 ? (
        <p className="text-center text-lg text-red-500">
          Няма налични категории
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}
