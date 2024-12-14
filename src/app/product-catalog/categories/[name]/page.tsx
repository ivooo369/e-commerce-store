import { PrismaClient, Category, Subcategory } from "@prisma/client";
import CategoryPageServerComponent from "@/app/ui/components/category-page";

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
    console.error("Error fetching data:", error);
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-red-500">
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
