import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Product } from "@prisma/client";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
}

export default function ProductCard({ product, onDelete }: ProductCardProps) {
  return (
    <Card className="max-w-xs mx-auto text-center min-w-full flex flex-col justify-between shadow-lg">
      <CardMedia
        className="min-w-80 h-52 object-cover"
        component="img"
        image={product.images[0]}
        alt={product.name}
      />
      <CardContent>
        <Typography variant="h6" component="div" className="font-bold">
          {product.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          className="font-bold"
        >
          Код: {product.code}
        </Typography>
        <Typography variant="body1" color="text.primary" className="font-bold">
          Цена: {product.price} лв.
        </Typography>
        <div className="mt-4 flex justify-center gap-2">
          <Link href="/dashboard/products/edit">
            <Button variant="contained" className="font-bold w-32">
              Редактирай
            </Button>
          </Link>
          <Button
            variant="contained"
            color="error"
            className="font-bold w-32"
            onClick={() => onDelete(product.id)}
          >
            Изтрий
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
