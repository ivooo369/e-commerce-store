"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useCart } from "@/lib/hooks/useCart";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { formatPrice } from "@/lib/utils/currency";
import { Tooltip } from "@mui/material";
import {
  Button,
  Typography,
  Divider,
  IconButton,
  TextField,
} from "@mui/material";
import CircularProgress from "@/ui/components/feedback/circular-progress";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Favorite from "@mui/icons-material/Favorite";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Image from "next/image";
import ClearCartConfirmationModal from "@/ui/components/modals/clear-cart-confirmation-modal";
import Link from "next/link";
import Box from "@mui/material/Box";
import type { RootState } from "@/lib/types/types";
import type { Product } from "@/lib/types/interfaces";

export default function CartPage() {
  const [isClient, setIsClient] = useState(false);
  const [showClearCartModal, setShowClearCartModal] = useState(false);
  const router = useRouter();
  const { isLoggedIn } = useSelector((state: RootState) => state.user);

  const {
    items,
    loading: cartLoading,
    updateCartItemQuantity,
    removeItemFromCart,
    clearUserCart,
    getCartTotal,
  } = useCart();

  const { isFavorite, toggleFavorite, isToggling } = useFavorites();

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

  const handleToggleFavorite = async (
    e: React.MouseEvent,
    product: Product
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleFavorite(product);
    } catch {
      throw new Error("Възникна грешка!");
    }
  };

  if (!isClient || cartLoading) {
    return (
      <Box className="container mx-auto px-4 py-10 flex justify-center items-center min-h-[calc(100vh-243.5px)]">
        <CircularProgress message="Зареждане на количката..." />
      </Box>
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

  const sortedItems = [...items].sort((a, b) => {
    const codeA = a.product?.code?.toLowerCase() || "";
    const codeB = b.product?.code?.toLowerCase() || "";
    return codeA.localeCompare(codeB);
  });

  return (
    <div className="container mx-auto max-w-6xl px-4 py-4 sm:py-6 bg-bg-primary">
      <h1 className="tracking-wide text-text-primary text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">
        КОЛИЧКА
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card-bg p-4 sm:p-6 rounded-lg border border-card-border transition-colors duration-300">
          {sortedItems.map((item, index) => {
            const product = item.product;
            const productId = product?.id;
            const productCode = product?.code;

            return (
              <div
                key={productCode}
                className={`block w-full ${
                  index < items.length - 1
                    ? "mb-6 pb-6 border-b border-gray-200"
                    : ""
                } hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-lg p-3`}
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden mb-4 sm:mb-0 sm:mr-6">
                    {product?.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
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
                    <Typography variant="subtitle1" component="div">
                      <Link
                        className="font-bold hover:underline text-gray-900 dark:text-white"
                        href={`/product-catalog/details/${productCode}`}
                      >
                        {product?.name}
                      </Link>
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      className="font-bold"
                    >
                      {product?.price
                        ? `${formatPrice(product.price, "BGN")} / ${formatPrice(
                            product.price,
                            "EUR"
                          )}`
                        : `${formatPrice(0, "BGN")} / ${formatPrice(0, "EUR")}`}
                    </Typography>

                    <div className="flex items-center mt-2">
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleQuantityChange(productCode, item.quantity - 1)
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
                            productCode,
                            parseInt(e.target.value) || 1
                          )
                        }
                      />
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleQuantityChange(productCode, item.quantity + 1)
                        }
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>

                      <div className="flex items-center ml-2">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveItem(productCode)}
                            className="w-full h-full"
                            aria-label="Remove item"
                          >
                            <DeleteIcon className="text-red-600 dark:text-red-500" />
                          </IconButton>
                        </div>

                        {isLoggedIn && productCode && (
                          <Tooltip
                            title={
                              isFavorite(productId)
                                ? "Премахни от любими"
                                : "Добави в любими"
                            }
                            arrow
                          >
                            <span>
                              <IconButton
                                size="small"
                                onClick={(e) =>
                                  handleToggleFavorite(e, product)
                                }
                                disabled={isToggling(productCode)}
                                className="ml-1"
                                aria-label={
                                  isFavorite(productId)
                                    ? "Премахни от любими"
                                    : "Добави в любими"
                                }
                              >
                                {isFavorite(productId) ? (
                                  <Favorite className="text-red-500" />
                                ) : (
                                  <FavoriteBorder className="text-red-500" />
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
                        {formatPrice(product.price * item.quantity, "BGN")}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatPrice(product.price * item.quantity, "EUR")}
                      </span>
                    </div>
                  </Typography>
                </div>
              </div>
            );
          })}
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
