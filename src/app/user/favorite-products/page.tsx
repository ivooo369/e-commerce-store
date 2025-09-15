"use client";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import { useState, useEffect, useMemo } from "react";
import { loadFavorites, clearFavorites, clearError } from "@/lib/favoriteSlice";
import ProductCard from "@/ui/components/product-card";
import CircularProgress from "@/ui/components/circular-progress";
import PaginationButtons from "@/ui/components/pagination";
import usePagination, { ITEMS_PER_PAGE } from "@/lib/usePagination";

export default function FavoriteProductsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { id: userId, isLoggedIn } = useSelector((state: RootState) => ({
    id: state.user.id,
    isLoggedIn: state.user.isLoggedIn,
  }));

  const { products: favoriteProducts, loading: favoritesLoading } = useSelector(
    (state: RootState) => state.favorites
  );
  const [initialLoad, setInitialLoad] = useState(true);

  const memoizedProducts = useMemo(() => favoriteProducts, [favoriteProducts]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      if (initialLoad) {
        dispatch(loadFavorites(userId));
        setInitialLoad(false);
      }
    } else if (!isLoggedIn) {
      dispatch(clearFavorites());
    }

    return () => {
      if (initialLoad) {
        dispatch(clearError());
      }
    };
  }, [dispatch, isLoggedIn, userId, initialLoad]);

  const { currentPage, currentItems, paginate } =
    usePagination(memoizedProducts);

  if (favoritesLoading) {
    return (
      <div className="container mx-auto py-4 sm:py-6 bg-bg-primary min-h-[60vh] flex items-center justify-center">
        <CircularProgress message="Зареждане на любимите продукти..." />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto py-4 sm:py-6 bg-bg-primary">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 tracking-wide text-text-primary">
          Любими продукти
        </h1>
        <div className="flex justify-center items-center">
          <p className="text-center text-text-secondary text-2xl p-16 bg-card-bg rounded-md border border-card-border font-bold transition-colors duration-300">
            Трябва да влезете в акаунта си, за да видите любимите си продукти.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 bg-bg-primary">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 tracking-wide text-text-primary">
        Любими продукти
      </h1>

      {memoizedProducts.length > 0 ? (
        <>
          <PaginationButtons
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={memoizedProducts.length}
            paginate={paginate}
            currentPage={currentPage}
          />

          <div className="grid gap-5 sm:gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 py-4 sm:py-6 md:py-8 px-4">
            {currentItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <PaginationButtons
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={memoizedProducts.length}
            paginate={paginate}
            currentPage={currentPage}
          />
        </>
      ) : (
        <div className="container mx-auto px-4 font-bold">
          <p className="text-center text-2xl p-16 bg-card-bg rounded-md text-text-secondary border border-card-border transition-colors duration-300">
            Нямате добавени любими продукти.
          </p>
        </div>
      )}
    </div>
  );
}
