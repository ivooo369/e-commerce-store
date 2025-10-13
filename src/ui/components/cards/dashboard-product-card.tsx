import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import { FaTrash } from "react-icons/fa";
import Link from "next/link";
import { formatPrice } from "@/lib/utils/currency";
import type { DashboardProductCardProps } from "@/lib/types/interfaces";

export default function DashboardProductCard({
  product,
  onDelete,
}: DashboardProductCardProps) {
  const handleDelete = () => {
    if (product.id) {
      onDelete(product.id);
    }
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
      <CardContent className="!pb-4">
        <p className="text-xl font-bold truncate whitespace-nowrap text-text-primary">
          {product.name}
        </p>
        <p className="text-sm text-text-muted font-bold">Код: {product.code}</p>
        <p className="text-base font-bold text-text-primary">
          Цена: {formatPrice(product.price, "BGN")} /{" "}
          {formatPrice(product.price, "EUR")}
        </p>
        <div className="mt-4 flex justify-center gap-2 dashboard-primary-nav">
          <Link
            href={product.id ? `/dashboard/products/edit/${product.id}` : "#"}
          >
            <Button
              variant="contained"
              className="font-bold w-32 bg-blue-500 hover:bg-blue-600 text-white"
              disabled={!product.id}
            >
              Редактирай
            </Button>
          </Link>
          <Button
            variant="contained"
            color="error"
            className="flex font-bold w-32 gap-1.5 bg-red-500 hover:bg-red-600"
            onClick={handleDelete}
            disabled={!product.id}
          >
            <FaTrash /> Изтрий
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
