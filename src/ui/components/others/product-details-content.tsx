"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Favorite from "@mui/icons-material/Favorite";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import CircularProgress from "@/ui/components/feedback/circular-progress";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { fetchProductByCode } from "@/services/productService";
import { useCart } from "@/lib/hooks/useCart";
import { formatPrice } from "@/lib/utils/currency";
import { Tooltip, IconButton } from "@mui/material";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { Product } from "@/lib/types/interfaces";
import Box from "@mui/material/Box";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/types/types";

export default function ProductDetailsContent({
  product,
  code,
}: {
  product: Product;
  code: string;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItemToCart } = useCart();
  const { isLoggedIn } = useSelector((state: RootState) => state.user);

  const { data: fetchedProduct, isLoading } = useQuery({
    queryKey: ["product", code],
    queryFn: () => fetchProductByCode(code, false),
    initialData: product
      ? {
          ...product,
          id: product.id ?? "",
          code: product.code ?? "",
          name: product.name ?? "",
          price: product.price ?? 0,
          description: product.description ?? "",
          images: product.images ?? [],
          createdAt: product.createdAt
            ? new Date(product.createdAt)
            : new Date(),
          updatedAt: product.updatedAt
            ? new Date(product.updatedAt)
            : new Date(),
        }
      : undefined,
    staleTime: 5 * 60 * 1000,
  });

  const { isFavorite, toggleFavorite, isToggling } = useFavorites();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const selectImage = (index: number) => setCurrentImageIndex(index);
  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeModal();
  };

  const showNextImage = () => {
    if (fetchedProduct && fetchedProduct.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === fetchedProduct.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const showPrevImage = () => {
    if (fetchedProduct && fetchedProduct.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? fetchedProduct.images.length - 1 : prev - 1
      );
    }
  };

  const handleAddToCart = async () => {
    if (!fetchedProduct) return;
    setIsAddingToCart(true);
    try {
      await addItemToCart(fetchedProduct, 1);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!fetchedProduct) return;
    try {
      await toggleFavorite(fetchedProduct);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (isLoading || !fetchedProduct) {
    return (
      <Box className="container mx-auto py-6 min-h-[60vh] flex items-center justify-center">
        <CircularProgress message="Зареждане на данните за продукта..." />
      </Box>
    );
  }

  return (
    <div className="mx-auto p-4 sm:p-6">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 rounded-lg border-slate-200 border-2">
        <div className="relative">
          <div
            className="bg-cover bg-center h-96 rounded-lg cursor-pointer"
            style={{
              backgroundImage: `url(${fetchedProduct.images[currentImageIndex]})`,
            }}
            onClick={openModal}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <span className="text-center text-white text-lg sm:text-xl md:text-2xl font-bold">
                Вижте изображението в цял размер
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-4 relative">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[150px] overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            {fetchedProduct.images.map((img, idx) => (
              <div
                key={idx}
                className="w-28 h-28 sm:w-32 sm:h-32 flex justify-center items-center overflow-hidden"
              >
                <Image
                  src={img}
                  alt={`product image ${idx + 1}`}
                  width={150}
                  height={150}
                  loading="lazy"
                  className={`object-cover w-full h-full max-h-[150px] rounded-lg cursor-pointer transition-all duration-200 ${
                    idx === currentImageIndex ? "border-2 border-blue-500" : ""
                  }`}
                  onClick={() => selectImage(idx)}
                />
              </div>
            ))}
          </div>

          {fetchedProduct.images.length > 1 && (
            <>
              <button
                onClick={showPrevImage}
                className="absolute font-bold text-lg sm:text-xl left-0 top-1/2 transform -translate-y-1/2 text-white bg-gray-700 bg-opacity-75 p-3 sm:p-4 md:p-5 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300"
              >
                &lt;
              </button>
              <button
                onClick={showNextImage}
                className="absolute font-bold text-lg sm:text-xl right-0 top-1/2 transform -translate-y-1/2 text-white bg-gray-700 bg-opacity-75 p-3 sm:p-4 md:p-5 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300"
              >
                &gt;
              </button>
            </>
          )}
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl md:text-3xl font-bold text-center break-words">
              {fetchedProduct.name}
            </h2>
            {isLoggedIn && (
              <Tooltip
                title={
                  isToggling(fetchedProduct.code)
                    ? "Моля изчакайте..."
                    : isFavorite(fetchedProduct.id)
                    ? "Премахни от любими"
                    : "Добави в любими"
                }
                arrow
              >
                <span>
                  <IconButton
                    onClick={handleToggleFavorite}
                    disabled={isToggling(fetchedProduct.code)}
                    size="small"
                  >
                    {isFavorite(fetchedProduct.id) ? (
                      <Favorite className="text-red-500 text-[1.8rem]" />
                    ) : (
                      <FavoriteBorder className="text-red-500 text-[1.8rem]" />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </div>

          <p className="text-sm md:text-lg text-center text-gray-500">
            Код на продукта: {fetchedProduct.code}
          </p>
          <p className="text-lg md:text-xl text-center text-black mt-2">
            Цена: {formatPrice(fetchedProduct.price, "BGN")} /{" "}
            {formatPrice(fetchedProduct.price, "EUR")}
          </p>
          <p className="text-sm md:text-lg text-center text-gray-700 mt-2">
            Описание:{" "}
            {fetchedProduct.description || "Няма описание за този продукт."}
          </p>

          <div className="flex justify-center mt-4">
            <Button
              variant="contained"
              className="bg-red-500 hover:bg-red-600 font-bold text-white"
              startIcon={<ShoppingCartIcon />}
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? "Добавяне..." : "Добави в количката"}
            </Button>
          </div>
        </div>

        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-2"
            onClick={handleOutsideClick}
          >
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <Image
                src={fetchedProduct.images[currentImageIndex]}
                alt="Enlarged product image"
                width={800}
                height={800}
                priority
                className="max-w-screen max-h-screen object-contain"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showPrevImage();
                }}
                className="absolute font-bold text-xl top-1/2 transform -translate-y-1/2 text-white bg-gray-700 bg-opacity-75 p-3 md:p-4 lg:p-5 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300 left-2 lg:left-[-100px]"
              >
                &lt;
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showNextImage();
                }}
                className="absolute font-bold text-xl top-1/2 transform -translate-y-1/2 text-white bg-gray-700 bg-opacity-75 p-3 md:p-4 lg:p-5 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300 right-2 lg:right-[-100px]"
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
