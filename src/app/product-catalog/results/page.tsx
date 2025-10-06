import { notFound, redirect } from "next/navigation";
import { fetchProductsByQuery } from "@/services/productService";
import ResultsPageContent from "@/ui/components/others/results-page-content";
import { getDynamicMetadata } from "@/lib/utils/metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { query?: string };
}) {
  const query = searchParams.query?.trim() || "";

  return getDynamicMetadata("/product-catalog/results", async () => {
    if (!query) {
      return {
        title: "Търсене | Lipci Design Studio",
        description: "Търсене на продукти в Lipci Design Studio.",
      };
    }

    return {
      title: `Резултати за "${query}" | Lipci Design Studio`,
      description: `Резултати от търсенето на "${query}" в Lipci Design Studio. Разгледайте нашите продукти.`,
      robots: {
        index: false,
        follow: true,
      },
    };
  });
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: { query?: string };
}) {
  const query = searchParams.query || "";

  if (!query.trim()) {
    notFound();
  }

  try {
    const filteredProducts = await fetchProductsByQuery(query);

    return (
      <ResultsPageContent initialProducts={filteredProducts} query={query} />
    );
  } catch {
    redirect(
      `/?error=${encodeURIComponent(
        "Възникна грешка при зареждане на резултатите!"
      )}`
    );
  }
}
