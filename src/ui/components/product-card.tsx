import React, { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Link from "next/link";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { ProductCardProps } from "@/lib/interfaces";

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  const { isLoggedIn } = useSelector((state: RootState) => state.user);
  const [isFavorite, setIsFavorite] = useState(false);

  const onToggleFavorite = () => {
    if (!isLoggedIn) {
      alert("Трябва да влезете в акаунта си, за да добавяте към любими!");
      return;
    }
    setIsFavorite((prev) => !prev);
  };

  return (
    <Card className="product-card max-w-xs mx-auto text-center min-w-full flex flex-col justify-between shadow-lg transition-colors duration-300">
      <CardMedia
        className="h-52 w-full object-cover"
        component="img"
        image={product.images[0]}
        alt={product.name}
        onContextMenu={(e) => e.preventDefault()}
      />
      <CardContent sx={{ paddingBottom: "1rem !important" }}>
        <div className="relative flex items-center justify-center">
          <p className="text-xl font-bold truncate whitespace-nowrap text-text-primary">
            {product.name}
          </p>
          {isLoggedIn && (
            <IconButton
              onClick={onToggleFavorite}
              aria-label={
                isFavorite ? "Remove from Favorites" : "Add to Favorites"
              }
              className="absolute right-0"
            >
              {isFavorite ? (
                <StarIcon style={{ color: "#FFD700", fontSize: "1.8rem" }} />
              ) : (
                <StarBorderIcon style={{ fontSize: "1.8rem" }} />
              )}
            </IconButton>
          )}
        </div>
        <p className="text-sm text-text-muted font-bold">Код: {product.code}</p>
        <p className="text-base font-bold text-text-primary">
          Цена: {product.price} лв.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Link href={`/product-catalog/details/${product.code}`}>
            <Button
              variant="contained"
              sx={{
                fontWeight: "bold",
                maxWidth: "8rem",
              }}
            >
              Детайли
            </Button>
          </Link>
          <Button
            variant="contained"
            color="error"
            sx={{
              fontWeight: "bold",
              maxWidth: "8rem",
            }}
            onClick={() => onAddToCart(product.id)}
            startIcon={<ShoppingCartIcon />}
          >
            Купи
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
