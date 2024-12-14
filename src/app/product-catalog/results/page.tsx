"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Product } from "@prisma/client";
import ProductCard from "@/app/ui/components/product-card";
import PaginationButtons from "@/app/ui/components/pagination";
import CircularProgress from "@/app/ui/components/circular-progress";
import { Box } from "@mui/material";
import usePagination, { ITEMS_PER_PAGE } from "@/app/lib/usePagination";

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const { currentPage, currentItems, paginate } =
    usePagination(filteredProducts);

  useEffect(() => {
    if (query) {
      fetch(`/api/public/products/search?query=${query}`)
        .then((response) => response.json())
        .then((data) => {
          if (data && Array.isArray(data)) {
            setProducts(data);
            setFilteredProducts(data);
          } else {
            setProducts([]);
            setFilteredProducts([]);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching products:", error);
          setProducts([]);
          setFilteredProducts([]);
          setLoading(false);
        });
    } else {
      setProducts([]);
      setFilteredProducts([]);
      setLoading(false);
    }
  }, [query]);

  const filterProducts = (products: Product[]) => {
    setFilteredProducts(products);
  };

  useEffect(() => {
    filterProducts(products);
  }, [products]);

  const handleAddToCart = (id: string) => {
    console.log(`Продукт с id ${id} е добавен в кошницата.`);
  };

  return (
    <Suspense fallback={<div>Зареждане...</div>}>
      <div className="products-filter-container flex flex-col items-center max-w-screen-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Резултати за &quot;{query}&quot;
        </h1>
        {filteredProducts.length > 0 && (
          <div>
            <PaginationButtons
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredProducts.length}
              paginate={paginate}
              currentPage={currentPage}
            />
          </div>
        )}
        {loading ? (
          <Box className="flex justify-center items-center py-10 my-auto">
            <CircularProgress message="Зареждане на продуктите..." />
          </Box>
        ) : currentItems.length === 0 ? (
          <div className="container mx-auto px-4 font-bold">
            <p className="text-center text-2xl p-16 bg-white rounded-md text-gray-600">
              Няма намерени продукти
            </p>
          </div>
        ) : (
          <div>
            <div className="container my-7 py-4 lg:px-4">
              <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {currentItems.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </div>
            <div>
              <PaginationButtons
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={filteredProducts.length}
                paginate={paginate}
                currentPage={currentPage}
              />
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
}
