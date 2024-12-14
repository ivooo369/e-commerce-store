import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import { FaTrash } from "react-icons/fa";
import { Product } from "@prisma/client";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
}

export default function ProductCard({ product, onDelete }: ProductCardProps) {
  return (
    <Card className="max-w-xs mx-auto text-center min-w-full flex flex-col justify-between shadow-lg ">
      <CardMedia
        className="min-w-80 h-52 object-cover"
        component="img"
        image={product.images[0]}
        alt={product.name}
      />
      <CardContent>
        <p className="text-xl font-bold truncate whitespace-nowrap">
          {product.name}
        </p>
        <p className="text-sm text-gray-500 font-bold">Код: {product.code}</p>
        <p className="text-base font-bold text-black">
          Цена: {product.price} лв.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Link href={`/dashboard/products/edit/${product.id}`}>
            <Button variant="contained" className="font-bold w-32">
              Редактирай
            </Button>
          </Link>
          <Button
            variant="contained"
            color="error"
            className="flex font-bold w-32 gap-1.5"
            onClick={() => onDelete(product.id)}
          >
            <FaTrash /> Изтрий
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
