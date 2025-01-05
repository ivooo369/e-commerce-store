import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import { Product } from "@prisma/client";
import Link from "next/link";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

interface ProductCardProps {
  product: Product;
  onAddToCart: (id: string) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  return (
    <Card className="max-w-xs mx-auto text-center min-w-full flex flex-col justify-between shadow-lg">
      <CardMedia
        className="h-52 w-full object-cover"
        component="img"
        image={product.images[0]}
        alt={product.name}
        onContextMenu={(e) => e.preventDefault()}
      />
      <CardContent sx={{ paddingBottom: "1rem !important" }}>
        <p className="text-xl font-bold truncate whitespace-nowrap">
          {product.name}
        </p>
        <p className="text-sm text-gray-500 font-bold">Код: {product.code}</p>
        <p className="text-base font-bold text-black">
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
