import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from "@/services/favoriteService";
import type { RootState } from "@/lib/types/types";
import type { Product, UseFavoritesReturn } from "@/lib/types/interfaces";

export const useFavorites = (): UseFavoritesReturn => {
  const queryClient = useQueryClient();
  const { isLoggedIn, id: userId } = useSelector(
    (state: RootState) => state.user
  );

  const {
    data: favorites = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["favorites", userId],
    queryFn: () => {
      if (!userId) return Promise.resolve([]);
      return getFavorites(userId);
    },
    enabled: !!isLoggedIn && !!userId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });

  const addFavoriteMutation = useMutation({
    mutationFn: ({
      customerId,
      productId,
    }: {
      customerId: string;
      productId: string;
    }) => addFavorite(customerId, productId),
    onMutate: async ({ productId }) => {
      await queryClient.cancelQueries({
        queryKey: ["favorites"],
      });

      const previousFavorites =
        queryClient.getQueryData<Product[]>(["favorites", userId]) || [];

      const getProductFromCache = (id: string): Product | undefined => {
        const cartData = queryClient.getQueryData<Array<{ product: Product }>>([
          "cart",
        ]);
        const cartProduct = cartData?.find(
          (item) => item.product.id === id
        )?.product;
        if (cartProduct) return cartProduct;

        const productCaches = queryClient.getQueriesData<Product | Product[]>({
          predicate: (query) =>
            query.queryKey[0] === "product" || query.queryKey[0] === "products",
        });

        for (const [, data] of productCaches) {
          if (Array.isArray(data)) {
            const found = data.find((p) => p.id === id);
            if (found) return found;
          } else if (data && data.id === id) {
            return data;
          }
        }

        return undefined;
      };

      const product = getProductFromCache(productId);

      if (product) {
        queryClient.setQueriesData<Product[]>(
          { queryKey: ["favorites", userId] },
          (old = []) => {
            const exists = old.some((fav) => fav.id === productId);
            return exists ? old : [...old, product];
          }
        );
      }

      return { previousFavorites, product };
    },
    onError: (error, variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueriesData(
          { queryKey: ["favorites", userId] },
          context.previousFavorites
        );
      }
    },
    onSuccess: (data, { productId }, context) => {
      if (context?.product) {
        queryClient.setQueriesData<Product[]>(
          { queryKey: ["favorites", userId] },
          (old: Product[] = []) => {
            const exists = old.some((fav) => fav?.id === productId);
            return exists
              ? old.filter(Boolean)
              : [...old.filter(Boolean), context.product].filter(
                  (p): p is Product => p !== undefined
                );
          }
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["favorites"],
      });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: ({
      customerId,
      productId,
    }: {
      customerId: string;
      productId: string;
    }) => removeFavorite(customerId, productId),
    onMutate: async ({ productId }) => {
      await queryClient.cancelQueries({
        queryKey: ["favorites"],
      });

      const previousFavorites =
        queryClient.getQueryData<Product[]>(["favorites", userId]) || [];

      queryClient.setQueriesData<Product[]>(
        { queryKey: ["favorites", userId] },
        (old = []) => old.filter((fav: Product) => fav.id !== productId)
      );

      return { previousFavorites };
    },
    onError: (err, variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueriesData(
          { queryKey: ["favorites", userId] },
          context.previousFavorites
        );
      }
    },
    onSuccess: (data, { productId }) => {
      queryClient.setQueriesData<Product[]>(
        { queryKey: ["favorites", userId] },
        (old = []) => old.filter((fav: Product) => fav.id !== productId)
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["favorites"],
      });
    },
  });

  const isFavorite = (productId: string | undefined): boolean => {
    if (!productId) return false;
    return favorites.some((fav: Product) => fav.id === productId);
  };

  const isToggling = (productCode: string | undefined): boolean => {
    if (!productCode) return false;
    const product = favorites.find((fav: Product) => fav.code === productCode);
    if (!product) return addFavoriteMutation.isPending;
    return addFavoriteMutation.isPending || removeFavoriteMutation.isPending;
  };

  const toggleFavorite = async (product: Product): Promise<void> => {
    if (!isLoggedIn || !userId) {
      throw new Error(
        "Трябва да влезете в акаунта си, за да добавяте към 'Любими'!"
      );
    }

    if (!product?.id) {
      throw new Error("Невалиден продукт!");
    }

    try {
      if (isFavorite(product.id)) {
        await removeFavoriteMutation.mutateAsync({
          customerId: userId,
          productId: product.id,
        });
      } else {
        await addFavoriteMutation.mutateAsync({
          customerId: userId,
          productId: product.id,
        });
      }
    } catch {
      throw new Error("Възникна грешка!");
    }
  };

  return {
    favorites,
    isLoading,
    error: error as Error | null,
    isFavorite,
    toggleFavorite,
    isToggling,
  };
};
