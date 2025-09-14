"use client";

import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import CircularProgress from "@/ui/components/circular-progress";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { fetchProductByCode } from "@/services/productService";
import { useCart } from "@/lib/useCart";
import { formatPrice } from "@/lib/currencyUtils";
import { Tooltip, IconButton } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import {
  addFavoriteToServer,
  removeFavoriteFromServer,
  loadFavorites,
} from "@/lib/favoriteSlice";
import { Product } from "@/lib/interfaces";

export default function ProductDetailsPage({
  params,
}: {
  params: { code: string };
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggedIn, id: userId } = useSelector(
    (state: RootState) => state.user
  );
  const { products: favorites, loading: favoritesLoading } = useSelector(
    (state: RootState) => state.favorites
  );
  const [isToggling, setIsToggling] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItemToCart } = useCart();

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", params.code],
    queryFn: () => fetchProductByCode(params.code),
    retry: 1,
  });

  useEffect(() => {
    if (isLoggedIn && userId) {
      dispatch(loadFavorites(userId));
    }
  }, [dispatch, isLoggedIn, userId]);

  useEffect(() => {
    if (product?.code && !favoritesLoading) {
      const favorite = favorites.some(
        (fav: Product) => fav.code === product.code
      );
      setIsFavorite(favorite);
    }
  }, [favorites, product, favoritesLoading]);

  const onToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn || !userId) {
      alert("Трябва да влезете в акаунта си, за да добавяте към любими!");
      return;
    }

    if (!product) return;

    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    setIsToggling(true);

    try {
      if (newFavoriteState) {
        await dispatch(
          addFavoriteToServer({ customerId: userId, product })
        ).unwrap();
      } else {
        await dispatch(
          removeFavoriteFromServer({
            customerId: userId,
            productId: product.id,
          })
        ).unwrap();
      }
    } catch (error) {
      console.error("Грешка при обновяване на любими:", error);
      setIsFavorite(!newFavoriteState);
    } finally {
      setIsToggling(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) {
      console.error("Продуктът не е наличен!");
      return;
    }

    setIsAddingToCart(true);
    try {
      await addItemToCart(product, 1);
    } catch (error) {
      console.error(
        "Възникна грешка при добавяне на продукта към количката:",
        error
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  const showNextImage = () => {
    if (product && product.images.length > 1) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const showPrevImage = () => {
    if (product && product.images.length > 1) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
      );
    }
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-4 sm:py-6 bg-bg-primary min-h-[60vh] flex items-center justify-center">
        <CircularProgress message="Зареждане на данните за продукта..." />
      </div>
    );
  }

  if (error instanceof Error) {
    return (
      <div className="container mx-auto mt-4 font-bold text-center text-2xl p-16 bg-card-bg rounded-md text-text-secondary flex flex-col items-center border border-card-border transition-colors duration-300">
        <p>{error.message}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center">
        <p className="text-center text-2xl p-16 bg-card-bg rounded-md text-text-secondary border border-card-border transition-colors duration-300">
          Продуктът не е намерен
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto p-4 sm:p-6">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 rounded-lg border-slate-200 border-2">
        <div className="relative">
          <div
            className="bg-cover bg-center h-96 rounded-lg cursor-pointer"
            style={{
              backgroundImage: `url(${product.images[currentImageIndex]})`,
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[150px] overflow-hidden">
            {product.images.map((image, index) => (
              <div
                key={index}
                className="w-28 h-28 sm:w-32 sm:h-32 flex justify-center items-center overflow-hidden"
              >
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ maxHeight: "150px" }}
                >
                  <Image
                    src={image}
                    alt={`product image ${index + 1}`}
                    width={150}
                    height={150}
                    loading="lazy"
                    className={`object-cover w-full h-full rounded-lg cursor-pointer transition-all duration-200 ${
                      index === currentImageIndex
                        ? "border-2 border-blue-500"
                        : ""
                    }`}
                    onClick={() => selectImage(index)}
                    style={{
                      maxHeight: "150px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          {product.images.length > 1 && (
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
              {product.name}
            </h2>
            {isLoggedIn && (
              <Tooltip
                title={
                  isToggling
                    ? "Моля изчакайте..."
                    : isFavorite
                    ? "Премахни от любими"
                    : "Добави в любими"
                }
                arrow
              >
                <span>
                  <IconButton
                    onClick={onToggleFavorite}
                    disabled={isToggling}
                    size="small"
                    className="p-1 -mr-2"
                    aria-label={
                      isFavorite ? "Премахни от любими" : "Добави в любими"
                    }
                  >
                    {isFavorite ? (
                      <StarIcon
                        className={`text-yellow-400 text-[1.8rem] ${
                          isToggling ? "opacity-50" : ""
                        }`}
                      />
                    ) : (
                      <StarBorderIcon
                        className={`text-yellow-400 text-[1.8rem] ${
                          isToggling ? "opacity-50" : ""
                        }`}
                      />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </div>
          <p className="text-sm md:text-lg text-center text-gray-500 break-words">
            Код на продукта: {product.code}
          </p>
          <p className="text-lg md:text-xl text-center text-black mt-2 sm:mt-4">
            Цена: {formatPrice(product.price, "BGN")} /{" "}
            {formatPrice(product.price, "EUR")}
          </p>
          <p className="text-sm md:text-lg text-center text-gray-700 mt-2 sm:mt-4 break-words">
            Описание: {product.description || "Няма описание за този продукт."}
          </p>
          <div className="flex justify-center mt-2 sm:mt-4">
            <Button
              variant="contained"
              className="font-bold text-white bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:text-white disabled:opacity-70 disabled:cursor-not-allowed"
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
                src={product.images[currentImageIndex]}
                alt="Enlarged product image"
                width={800}
                height={800}
                priority
                className="max-w-screen max-h-screen object-contain"
              />
              <button
                onClick={showPrevImage}
                className="absolute font-bold text-xl top-1/2 transform -translate-y-1/2 text-white bg-gray-700 bg-opacity-75 p-3 md:p-4 lg:p-5 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300 left-2 lg:left-[-100px]"
              >
                &lt;
              </button>
              <button
                onClick={showNextImage}
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
