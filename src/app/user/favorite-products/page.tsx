"use client";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import { useEffect, useRef, useMemo } from "react";
import {
  loadFavorites,
  clearFavorites,
  clearError,
} from "@/lib/favoritesSlice";
import { createSelector } from "@reduxjs/toolkit";
import ProductCard from "@/ui/components/product-card";
import CircularProgress from "@/ui/components/circular-progress";
import PaginationButtons from "@/ui/components/pagination";
import usePagination, { ITEMS_PER_PAGE } from "@/lib/usePagination";

export default function FavoriteProductsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const selectUser = (state: RootState) => state.user;
  const selectFavorites = (state: RootState) => state.favorites;

  const selectUserInfo = useMemo(
    () =>
      createSelector([selectUser], (user) => ({
        id: user.id,
        isLoggedIn: user.isLoggedIn,
      })),
    []
  );

  const selectFavoritesData = useMemo(
    () =>
      createSelector([selectFavorites], (favorites) => ({
        products: Array.isArray(favorites.products) ? favorites.products : [],
        loading: favorites.loading,
        error: favorites.error,
      })),
    []
  );

  const { id: userId, isLoggedIn } = useSelector(selectUserInfo);
  const authLoading = !userId && isLoggedIn === undefined;

  const {
    products: favoriteProducts,
    loading: favoritesLoading,
    error,
  } = useSelector(selectFavoritesData);

  const isLoading = authLoading || favoritesLoading;
  const initialLoad = useRef(true);

  const { currentPage, currentItems, paginate } =
    usePagination(favoriteProducts);

  useEffect(() => {
    if (authLoading) return;

    if (isLoggedIn && userId) {
      dispatch(loadFavorites(userId));
    } else if (!isLoggedIn) {
      dispatch(clearFavorites());
    }

    if (initialLoad.current) {
      initialLoad.current = false;
    }

    return () => {
      dispatch(clearError());
    };
  }, [dispatch, isLoggedIn, userId, authLoading]);

  const handleAddToCart = (productId: string) => {
    console.log(`Продукт с id ${productId} е добавен в кошницата.`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-4 sm:py-6 bg-bg-primary min-h-[60vh] flex items-center justify-center">
        <CircularProgress message="Зареждане на любимите продукти..." />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto py-4 sm:py-6 bg-bg-primary">
        <h1 className="text-3xl text-center font-bold mb-4 sm:mb-6 tracking-wide text-text-primary">
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
      <h1 className="text-3xl text-center font-bold mb-4 sm:mb-6 tracking-wide text-text-primary">
        Любими продукти
      </h1>

      {favoriteProducts.length > 0 && (
        <div>
          <PaginationButtons
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={favoriteProducts.length}
            paginate={paginate}
            currentPage={currentPage}
          />
        </div>
      )}

      {currentItems.length === 0 ? (
        <div className="container mx-auto px-4 font-bold">
          <p className="text-center text-2xl p-16 bg-card-bg rounded-md text-text-secondary border border-card-border transition-colors duration-300">
            Нямате добавени любими продукти.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 py-4 sm:py-6 md:py-8 px-4">
            {currentItems.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
          <PaginationButtons
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={favoriteProducts.length}
            paginate={paginate}
            currentPage={currentPage}
          />
        </>
      )}

      {error && !isLoading && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => userId && dispatch(loadFavorites(userId))}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
          >
            Опитай отново
          </button>
        </div>
      )}
    </div>
  );
}
