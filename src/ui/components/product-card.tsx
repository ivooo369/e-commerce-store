import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Link from "next/link";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import {
  addFavoriteToServer,
  removeFavoriteFromServer,
} from "@/lib/favoriteSlice";
import { ProductCardProps } from "@/lib/interfaces";
import { AppDispatch } from "@/lib/store";
import { useCart } from "@/lib/useCart";

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggedIn, id: userId } = useSelector(
    (state: RootState) => state.user
  );
  const { products: favorites, loading: favoritesLoading } = useSelector(
    (state: RootState) => state.favorites
  );
  const [isToggling, setIsToggling] = useState(false);
  const [isFavoriteState, setIsFavoriteState] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItemToCart } = useCart();

  useEffect(() => {
    if (product.code) {
      setIsFavoriteState(favorites.some((fav) => fav.code === product.code));
    }
  }, [favorites, product.code]);

  const isFavorite = product.code && isFavoriteState;

  const onToggleFavorite = async () => {
    if (!isLoggedIn || !userId) {
      alert("Трябва да влезете в акаунта си, за да добавяте към любими!");
      return;
    }

    setIsFavoriteState(!isFavoriteState);

    if (!product.code) {
      console.error("Идентификаторът на продукта липсва!");
      return;
    }

    if (isToggling || favoritesLoading) return;

    setIsToggling(true);

    try {
      if (isFavorite) {
        dispatch(
          removeFavoriteFromServer({
            productId: product.id,
            customerId: userId,
          })
        );
      } else {
        dispatch(addFavoriteToServer({ product, customerId: userId }));
      }
    } catch (error) {
      console.error(
        "Възникна грешка при обновяване на списъка с любими продукти:",
        error
      );
      setIsFavoriteState(!isFavoriteState);
    } finally {
      setIsToggling(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) {
      console.error("Липсва продукт!");
      return;
    }

    setIsAddingToCart(true);
    try {
      await addItemToCart(product, 1);
    } catch (error) {
      console.error(
        "Възникна грешка при добавяне на продукта в количката:",
        error
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (!product.id) {
    console.error("Идентификаторът на продукта липсва!");
    return null;
  }

  return (
    <Card className="product-card max-w-xs mx-auto text-center min-w-full flex flex-col justify-between shadow-lg transition-colors duration-300">
      <CardMedia
        className="h-52 w-full object-cover"
        component="img"
        image={product.images?.[0] || "/placeholder-product.jpg"}
        alt={product.name}
        onContextMenu={(e) => e.preventDefault()}
      />
      <CardContent className="!pb-4">
        <div className="relative flex items-center justify-center">
          <p className="text-xl font-bold truncate whitespace-nowrap text-text-primary">
            {product.name}
          </p>
          {isLoggedIn && (
            <IconButton
              onClick={onToggleFavorite}
              disabled={isToggling || favoritesLoading || !product.id}
              aria-label={
                isFavorite ? "Remove from Favorites" : "Add to Favorites"
              }
              className="absolute right-0"
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
          )}
        </div>
        <p className="text-sm text-text-muted font-bold">Код: {product.code}</p>
        <p className="text-base font-bold text-text-primary">
          Цена: {product.price} лв.
        </p>
        <div className="mt-4 flex flex-col gap-3 w-full">
          <Link
            href={`/product-catalog/details/${product.code || "#"}`}
            className="w-full"
          >
            <Button
              variant="contained"
              className="font-bold w-full bg-blue-500 hover:bg-blue-600 text-white"
              fullWidth
            >
              Виж детайли
            </Button>
          </Link>
          <Button
            variant="contained"
            className="font-bold w-full text-white bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:text-white disabled:opacity-70 disabled:cursor-not-allowed"
            onClick={handleAddToCart}
            startIcon={<ShoppingCartIcon />}
            fullWidth
            disabled={!product.id || isAddingToCart}
          >
            {isAddingToCart ? "Добавяне..." : "Добави в количката"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
