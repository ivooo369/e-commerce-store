import {
  Subcategory as SubcategoryPrisma,
  Category as CategoryPrisma,
  Product as ProductPrisma,
} from "@prisma/client";
import CategoryPageServerComponent from "@/ui/components/category-page";
import { fetchAllPublicProducts } from "@/services/productService";
import { fetchCategories } from "@/services/categoryService";
import { ProductWithRelations } from "@/lib/interfaces";

type SubcategoryWithRelations = SubcategoryPrisma & {
  category: CategoryPrisma;
};

type ProductWithSubcategories = ProductPrisma & {
  subcategories: Array<{
    subcategory: SubcategoryWithRelations;
  }>;
  createdAt: Date;
  updatedAt: Date;
};

export default async function AllProductsPage() {
  try {
    const [products, allCategories] = await Promise.all([
      fetchAllPublicProducts() as unknown as ProductWithSubcategories[],
      fetchCategories(),
    ]);

    const transformedProducts: ProductWithRelations[] = products.map(
      (product: ProductWithSubcategories) => {
        const createdAt = product.createdAt
          ? new Date(product.createdAt)
          : new Date();
        const updatedAt = product.updatedAt
          ? new Date(product.updatedAt)
          : new Date();

        return {
          ...product,
          createdAt,
          updatedAt,
          subcategories: (product.subcategories || []).map(
            ({ subcategory }) => ({
              subcategory: {
                id: subcategory.id,
                name: subcategory.name,
                code: subcategory.code,
                category: {
                  id: subcategory.categoryId,
                  name: subcategory.category.name,
                  code: subcategory.category.code,
                  imageUrl: null,
                },
              },
            })
          ),
        };
      }
    );

    const categoryData = {
      id: "all",
      name: "Всички продукти",
      image: null as string | null,
      slug: "all",
      code: "ALL",
      createdAt: new Date(),
      updatedAt: new Date(),
      subcategories: [] as SubcategoryPrisma[],
    };

    const categoryMap = new Map<string, CategoryPrisma>();
    const subcategoryMap = new Map<string, SubcategoryPrisma>();

    (products as ProductWithSubcategories[]).forEach(
      (product: ProductWithSubcategories) => {
        product.subcategories?.forEach(
          ({ subcategory }: { subcategory: SubcategoryWithRelations }) => {
            if (subcategory?.category) {
              const { category, ...subcategoryData } = subcategory;
              categoryMap.set(category.id, category);
              subcategoryMap.set(subcategoryData.id, {
                ...subcategoryData,
                categoryId: category.id,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            }
          }
        );
      }
    );

    const categories =
      allCategories.length > 0
        ? allCategories
        : Array.from(categoryMap.values());

    const subcategories = Array.from(subcategoryMap.values()).map(
      (subcategory) => {
        const category = categoryMap.get(subcategory.categoryId);
        return {
          ...subcategory,
          category: category
            ? {
                id: category.id,
                name: category.name,
                code: category.code,
              }
            : {
                id: "",
                name: "Unknown",
                code: "unknown",
              },
        };
      }
    );

    return (
      <CategoryPageServerComponent
        category={categoryData}
        subcategories={subcategories}
        allProducts={transformedProducts}
        categories={categories}
      />
    );
  } catch (error) {
    console.error("Възникна грешка при зареждане на продуктите:", error);
    return (
      <div className="container mx-auto px-4 py-4 sm:py-6 bg-bg-primary min-h-screen">
        <h1 className="text-3xl font-bold text-center text-error-color">
          Възникна грешка при зареждане на продуктите. Моля, опитайте отново
          по-късно!
        </h1>
      </div>
    );
  }
}
