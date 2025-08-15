"use client";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { useEffect, useState } from "react";
import { setAllFavorites } from "@/lib/favoritesSlice";
import ProductCard from "@/ui/components/product-card";
import CircularProgress from "@/ui/components/circular-progress";

export default function FavoriteProductsPage() {
  const dispatch = useDispatch();
  const favoriteProducts = useSelector(
    (state: RootState) => state.favorites.products
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("favoriteProducts");
      if (stored) {
        try {
          dispatch(setAllFavorites(JSON.parse(stored)));
        } catch {}
      }
      setIsLoading(false);
    }
  }, [dispatch]);

  return (
    <div className="container mx-auto py-4 sm:py-6 bg-bg-primary min-h-screen">
      <h1 className="text-3xl text-center font-bold mb-4 sm:mb-6 tracking-wide text-text-primary">
        Любими продукти
      </h1>
      {isLoading && (
        <div className="flex justify-center items-center mb-6">
          <CircularProgress message="Зареждане на любими продукти..." />
        </div>
      )}
      <div className="grid gap-5 sm:gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 py-4 sm:py-6 md:py-8 px-4">
        {!isLoading && favoriteProducts.length === 0 ? (
          <p className="text-center text-text-secondary col-span-full text-2xl p-16 bg-card-bg rounded-md border border-card-border font-bold transition-colors duration-300">
            Нямате добавени любими продукти.
          </p>
        ) : (
          favoriteProducts.map((product) => {
            const productWithPrismaFields = {
              id: product.code,
              createdAt: new Date(),
              updatedAt: new Date(),
              ...product,
              price: product.price ?? 0,
            };
            return (
              <ProductCard
                key={product.code}
                product={productWithPrismaFields}
                onAddToCart={() => {}}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
