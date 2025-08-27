"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useCart } from "@/lib/useCart";
import {} from "@mui/material";
import {
  Button,
  Typography,
  Divider,
  IconButton,
  TextField,
  Alert,
} from "@mui/material";
import CircularSize from "@/ui/components/circular-progress";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Image from "next/image";
import ClearCartConfirmationModal from "@/ui/components/clear-cart-confirmation-modal";
import Link from "next/link";

export default function CartPage() {
  const [isClient, setIsClient] = useState(false);
  const [showClearCartModal, setShowClearCartModal] = useState(false);
  const router = useRouter();
  const {} = useSelector((state: RootState) => state.user);

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
      <div className="container mx-auto px-4 py-10 flex justify-center items-center min-h-[50vh]">
        <CircularSize message="Зареждане на количката..." />
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 flex justify-center items-center min-h-[50vh]">
        <CircularSize message="Зареждане на количката..." />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Typography variant="h4" className="mb-4">
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
      <h1 className="tracking-wide text-text-primary text-2xl sm:text-3xl font-bold text-center mb-8">
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
                      ? item.product.price.toFixed(2)
                      : "0.00"}{" "}
                    лв.
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
                    <div className="ml-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveItem(item.product.code)}
                        className="w-full h-full"
                        aria-label="Remove item"
                      >
                        <DeleteIcon className="text-red-600 dark:text-red-500" />
                      </IconButton>
                    </div>
                  </div>
                </div>
                <Typography variant="subtitle1" className="font-bold">
                  {(item.product.price * item.quantity).toFixed(2)} лв.
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
                    Общо: {getCartTotal().toFixed(2)} лв.
                  </Typography>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant="contained"
                    color="primary"
                    className="w-full font-bold text-white bg-blue-500 hover:bg-blue-600 h-11"
                    fullWidth
                    onClick={() => router.push("/product-catalog")}
                  >
                    Продължи пазаруването
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
        title="Изчистване на количката"
        message="Сигурни ли сте, че искате да изчистите всички продукти от количката?"
        confirmText="Изчисти количката"
        cancelText="Отказ"
        onConfirm={confirmClearCart}
        onCancel={cancelClearCart}
      />
    </div>
  );
}
