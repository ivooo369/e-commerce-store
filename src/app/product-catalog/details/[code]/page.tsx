import { fetchProductByCode } from "@/services/productService";
import { notFound } from "next/navigation";
import ProductDetailsContent from "../../../../ui/components/others/product-details-content";
import { getDynamicMetadata } from "@/lib/utils/metadata";

export async function generateMetadata({
  params,
}: {
  params: { code: string };
}) {
  return getDynamicMetadata("/product-catalog/details/[code]", async () => {
    try {
      const product = await fetchProductByCode(params.code, true);

      if (!product) {
        return {
          title: "Продуктът не е намерен | Lipci Design Studio",
          description: "Продуктът, който търсите, не беше намерен!",
        };
      }

      const mainImage =
        product.images && product.images.length > 0
          ? typeof product.images[0] === "string"
            ? product.images[0]
            : typeof product.images[0] === "object" &&
              product.images[0] !== null &&
              "url" in product.images[0]
            ? (product.images[0] as { url: string }).url
            : undefined
          : undefined;

      return {
        title: `${product.name} | Lipci Design Studio`,
        description:
          product.description ||
          `Разгледайте ${product.name} в Lipci Design Studio.`,
        openGraph: {
          images: mainImage
            ? [
                {
                  url: mainImage,
                  width: 800,
                  height: 600,
                  alt: product.name,
                },
              ]
            : [],
        },
      };
    } catch {
      return {
        title: "Грешка при зареждане | Lipci Design Studio",
        description: "Възникна грешка при зареждането на продукта!",
      };
    }
  });
}

export default async function ProductDetailsPage({
  params,
}: {
  params: { code: string };
}) {
  try {
    const product = await fetchProductByCode(params.code, true);

    if (!product) {
      notFound();
    }

    return <ProductDetailsContent product={product} code={params.code} />;
  } catch {
    return (
      <div className="container mx-auto mt-4 font-bold text-center text-2xl p-16 bg-card-bg rounded-md text-text-secondary flex flex-col items-center border border-card-border transition-colors duration-300">
        <p>
          Възникна грешка при зареждането на продукта. Моля, опитайте отново
          по-късно!
        </p>
      </div>
    );
  }
}
