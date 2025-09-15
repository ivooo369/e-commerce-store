import CategoryPage from "@/ui/components/category-page";
import { fetchCategoryByNameWithProducts } from "@/services/categoryService";

export default async function CategoryPageServerComponent({
  params,
}: {
  params: { name: string };
}) {
  try {
    const { category, subcategories, products } =
      await fetchCategoryByNameWithProducts(params.name);

    return (
      <CategoryPage
        category={category}
        subcategories={subcategories}
        allProducts={products}
      />
    );
  } catch (error) {
    console.error("Възникна грешка при зареждане на страницата:", error);
    return (
      <div className="container mx-auto px-4 py-4 sm:py-6 bg-bg-primary min-h-screen">
        <h1 className="text-3xl font-bold text-center text-error-color tracking-wide">
          {error instanceof Error
            ? error.message
            : "Възникна грешка при зареждане на категорията!"}
        </h1>
      </div>
    );
  }
}
