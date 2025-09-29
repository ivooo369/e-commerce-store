import CategoryPageContent from "@/ui/components/others/category-page-content";
import { fetchCategoryByNameWithProducts } from "@/services/categoryService";
import { getDynamicMetadata } from "@/lib/utils/metadata";

export async function generateMetadata({
  params,
}: {
  params: { name: string };
}) {
  return getDynamicMetadata("/product-catalog/categories/[name]", async () => {
    try {
      const { category } = await fetchCategoryByNameWithProducts(params.name);
      return {
        title: `${category.name} | Lipci Design Studio`,
        description: `Разгледайте нашата колекция от продукти в категория "${
          category.name
        }". ${
          category.description || "Висококачествени продукти на достъпни цени."
        }`,
      };
    } catch {
      return {
        title: "Категория | Lipci Design Studio",
        description:
          "Разгледайте нашите висококачествени продукти на достъпни цени.",
        robots: {
          index: false,
          follow: true,
        },
      };
    }
  });
}

export default async function CategoryPage({
  params,
}: {
  params: { name: string };
}) {
  try {
    const { category, subcategories, products } =
      await fetchCategoryByNameWithProducts(params.name);

    return (
      <CategoryPageContent
        category={category}
        subcategories={subcategories}
        allProducts={products}
      />
    );
  } catch {
    return (
      <div className="container mx-auto px-4 py-4 sm:py-6 bg-bg-primary min-h-screen">
        <h1 className="text-3xl font-bold text-center text-error-color">
          Възникна грешка при зареждане на продуктите от избраната категория!
        </h1>
      </div>
    );
  }
}
