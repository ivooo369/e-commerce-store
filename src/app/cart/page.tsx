"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import { useCart } from "@/lib/useCart";
import { formatPrice } from "@/lib/currencyUtils";
import { Tooltip } from "@mui/material";
import {
  Button,
  Typography,
  Divider,
  IconButton,
  TextField,
  Alert,
} from "@mui/material";
import CircularProgress from "@/ui/components/circular-progress";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import Image from "next/image";
import ClearCartConfirmationModal from "@/ui/components/clear-cart-confirmation-modal";
import Link from "next/link";
import {
  addFavoriteToServer,
  removeFavoriteFromServer,
  loadFavorites,
} from "@/lib/favoriteSlice";
import { Product } from "@/lib/interfaces";

export default function CartPage() {
  const [isClient, setIsClient] = useState(false);
  const [showClearCartModal, setShowClearCartModal] = useState(false);
  const [togglingFavorites, setTogglingFavorites] = useState<
    Record<string, boolean>
  >({});
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggedIn, id: userId } = useSelector(
    (state: RootState) => state.user
  );
  const { products: favorites, loading: favoritesLoading } = useSelector(
    (state: RootState) => state.favorites
  );

  useEffect(() => {
    if (isLoggedIn && userId) {
      dispatch(loadFavorites(userId));
    }
  }, [dispatch, isLoggedIn, userId]);

  const {
    items,
    loading,
    updateCartItemQuantity,
    removeItemFromCart,
    clearUserCart,
    getCartTotal,
  } = useCart();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleQuantityChange = (productCode: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateCartItemQuantity(productCode, newQuantity);
  };

  const handleRemoveItem = (productCode: string) => {
    removeItemFromCart(productCode);
  };

  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-10 flex justify-center items-center min-h-[calc(100vh-243.5px)]">
        <CircularProgress message="Зареждане на количката..." />
      </div>
    );
  }

  const handleClearCart = () => {
    setShowClearCartModal(true);
  };

  const confirmClearCart = () => {
    clearUserCart();
    setShowClearCartModal(false);
  };

  const cancelClearCart = () => {
    setShowClearCartModal(false);
  };

  const handleToggleFavorite = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn || !userId) {
      alert("Трябва да влезете в акаунта си, за да добавяте към 'Любими'!");
      return;
    }

    if (!product?.id || !product?.code) return;

    setTogglingFavorites((prev) => ({ ...prev, [product.code]: true }));

    try {
      const isCurrentlyFavorite = favorites.some(
        (fav) => fav.code === product.code
      );

      if (isCurrentlyFavorite) {
        await dispatch(
          removeFavoriteFromServer({
            customerId: userId,
            productId: product.id,
          })
        ).unwrap();
      } else {
        await dispatch(
          addFavoriteToServer({
            customerId: userId,
            product: product,
          })
        ).unwrap();
      }

      if (userId) {
        await dispatch(loadFavorites(userId));
      }
    } catch (error) {
      console.error("Възникна грешка при обновяване на 'Любими':", error);
    } finally {
      setTogglingFavorites((prev) => ({ ...prev, [product.code]: false }));
    }
  };

  if (loading || (isLoggedIn && favoritesLoading)) {
    return (
      <div className="container mx-auto px-4 py-10 flex justify-center items-center min-h-[calc(100vh-243.5px)]">
        <CircularProgress message="Зареждане на количката..." />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Typography
          variant="h4"
          className="mb-4 text-2xl sm:text-3xl font-bold"
        >
          Вашата количка е празна
        </Typography>
        <Button
          variant="contained"
          className="font-bold"
          color="primary"
          onClick={() => router.push("/product-catalog/all")}
        >
          Разгледайте нашите продукти
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-4 sm:py-6 bg-bg-primary">
      <h1 className="tracking-wide text-text-primary text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">
        КОЛИЧКА
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card-bg p-4 sm:p-6 rounded-lg border border-card-border transition-colors duration-300">
          {items.map((item, index) => (
            <div
              key={item.product.code}
              className={
                index < items.length - 1
                  ? "mb-6 pb-6 border-b border-gray-200"
                  : ""
              }
            >
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden mb-4 sm:mb-0 sm:mr-6">
                  {item.product?.images?.[0] ? (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      width={128}
                      height={128}
                      priority
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Typography variant="subtitle1">
                    <Link
                      href={
                        item.product
                          ? `/product-catalog/details/${item.product.code}`
                          : "#"
                      }
                    >
                      {item.product?.name}
                    </Link>
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {item.product?.price
                      ? `${formatPrice(
                          item.product.price,
                          "BGN"
                        )} / ${formatPrice(item.product.price, "EUR")}`
                      : `${formatPrice(0, "BGN")} / ${formatPrice(0, "EUR")}`}
                  </Typography>
                  <div className="flex items-center mt-2">
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleQuantityChange(
                          item.product.code,
                          item.quantity - 1
                        )
                      }
                      disabled={item.quantity <= 1}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <TextField
                      value={item.quantity}
                      size="small"
                      type="number"
                      className="w-16 text-center"
                      onChange={(e) =>
                        handleQuantityChange(
                          item.product.code,
                          parseInt(e.target.value) || 1
                        )
                      }
                    />
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleQuantityChange(
                          item.product.code,
                          item.quantity + 1
                        )
                      }
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                    <div className="flex items-center ml-2">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveItem(item.product.code)}
                          className="w-full h-full"
                          aria-label="Remove item"
                        >
                          <DeleteIcon className="text-red-600 dark:text-red-500" />
                        </IconButton>
                      </div>
                      {isLoggedIn && item.product?.code && (
                        <Tooltip
                          title={
                            favorites?.some(
                              (fav) => fav.code === item.product.code
                            )
                              ? "Премахни от любими"
                              : "Добави в любими"
                          }
                          arrow
                        >
                          <span>
                            <IconButton
                              size="small"
                              onClick={(e) =>
                                handleToggleFavorite(e, item.product)
                              }
                              disabled={
                                togglingFavorites[item.product.code] ||
                                favoritesLoading
                              }
                              className="ml-1"
                              aria-label={
                                favorites?.some(
                                  (fav) => fav.code === item.product.code
                                )
                                  ? "Премахни от любими"
                                  : "Добави в любими"
                              }
                            >
                              {favorites?.some(
                                (fav) => fav.code === item.product.code
                              ) ? (
                                <StarIcon className="text-yellow-400" />
                              ) : (
                                <StarBorderIcon className="text-yellow-400" />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>
                <Typography variant="subtitle1" className="font-bold">
                  <div className="flex flex-col items-end">
                    <span>
                      {formatPrice(item.product.price * item.quantity, "BGN")}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatPrice(item.product.price * item.quantity, "EUR")}
                    </span>
                  </div>
                </Typography>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card-bg p-6 rounded-lg shadow-md border border-card-border transition-colors duration-300">
            <Typography variant="h5" className="font-bold mb-4 text-center">
              Общо за плащане
            </Typography>
            <Divider className="my-4 border-gray-200" />
            <div className="space-y-2">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Typography variant="h6" className="font-bold">
                    <span>
                      Общо: {formatPrice(getCartTotal(), "BGN")} /{" "}
                      {formatPrice(getCartTotal(), "EUR")}
                    </span>
                  </Typography>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant="contained"
                    color="primary"
                    className="w-full font-bold text-white bg-blue-500 hover:bg-blue-600 h-11"
                    fullWidth
                    onClick={() => router.push("/checkout")}
                  >
                    Финализирай поръчката
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon className="-mr-1" />}
                    onClick={handleClearCart}
                    className="w-full font-bold text-white bg-red-500 hover:bg-red-600 h-11"
                    fullWidth
                  >
                    Изчисти количката
                  </Button>
                </div>
                {items.length === 0 && (
                  <Alert severity="info" className="mt-1">
                    Вашата количка е празна
                  </Alert>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ClearCartConfirmationModal
        open={showClearCartModal}
        onConfirm={confirmClearCart}
        onCancel={cancelClearCart}
      />
    </div>
  );
}
