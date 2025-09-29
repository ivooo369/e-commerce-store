"use client";

import React, { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import { IconButton, Tooltip } from "@mui/material";
import Link from "next/link";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Favorite from "@mui/icons-material/Favorite";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import { ProductCardProps } from "@/lib/types/interfaces";
import { useCart } from "@/lib/hooks/useCart";
import { formatPrice } from "@/lib/utils/currency";
import { useFavorites } from "@/lib/hooks/useFavorites";

export default function ProductCard({ product }: ProductCardProps) {
  const { addItemToCart } = useCart();
  const { isFavorite, toggleFavorite, isToggling } = useFavorites();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  if (!product.id) {
    throw new Error("Идентификаторът на продукта липсва!");
  }

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      await addItemToCart(product, 1);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = () => {
    toggleFavorite(product);
  };

  const favorite = isFavorite(product.id);
  const toggling = isToggling(product.code);

  return (
    <Card className="product-card max-w-xs mx-auto text-center min-w-full flex flex-col justify-between shadow-lg transition-colors duration-300">
      <CardMedia
        className="h-52 w-full object-cover"
        component="img"
        image={product.images?.[0]}
        alt={product.name}
        onContextMenu={(e) => e.preventDefault()}
      />
      <CardContent className="!pb-4">
        <div className="relative flex items-center justify-center">
          <p className="text-xl font-bold truncate whitespace-nowrap text-text-primary">
            {product.name}
          </p>
          {favorite !== undefined && (
            <div className="absolute right-0">
              <Tooltip
                title={
                  toggling
                    ? "Моля изчакайте..."
                    : favorite
                    ? "Премахни от любими"
                    : "Добави в любими"
                }
                arrow
              >
                <span>
                  <IconButton
                    onClick={handleToggleFavorite}
                    disabled={toggling}
                    size="small"
                    className="p-1 -mr-2"
                    aria-label={
                      favorite ? "Премахни от любими" : "Добави в любими"
                    }
                  >
                    {favorite ? (
                      <Favorite
                        className={`text-red-500 text-[1.8rem] ${
                          toggling ? "opacity-50" : ""
                        }`}
                      />
                    ) : (
                      <FavoriteBorder
                        className={`text-red-500 text-[1.8rem] ${
                          toggling ? "opacity-50" : ""
                        }`}
                      />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            </div>
          )}
        </div>

        <p className="text-sm text-text-muted font-bold">Код: {product.code}</p>
        <p className="text-base font-bold text-text-primary">
          Цена: {formatPrice(product.price, "BGN")} /{" "}
          {formatPrice(product.price, "EUR")}
        </p>

        <div className="mt-4 flex flex-col gap-3 w-full">
          <Link
            href={`/product-catalog/details/${product.code}`}
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
            disabled={isAddingToCart}
          >
            {isAddingToCart ? "Добавяне..." : "Добави в количката"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
