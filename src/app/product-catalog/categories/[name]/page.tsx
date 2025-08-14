import { PrismaClient, Category, Subcategory } from "@prisma/client";
import CategoryPageServerComponent from "@/ui/components/category-page";

const prisma = new PrismaClient();

export default async function CategoryPage({
  params,
}: {
  params: { name: string };
}) {
  let category: Category | null = null;
  let subcategories: Subcategory[] = [];
  const decodedName = decodeURIComponent(params.name);

  try {
    category = await prisma.category.findUnique({
      where: { name: decodedName },
    });

    if (category) {
      subcategories = await prisma.subcategory.findMany({
        where: { categoryId: category.id },
      });
    }
  } catch (error) {
    console.error(
      "Възникна грешка при извличане на категориите или подкатегориите:",
      error
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-4 sm:py-6 bg-bg-primary min-h-screen">
        <h1 className="text-3xl font-bold text-center text-error-color tracking-wide">
          Категорията не е намерена
        </h1>
      </div>
    );
  }

  return (
    <CategoryPageServerComponent
      category={category}
      subcategories={subcategories}
    />
  );
}
