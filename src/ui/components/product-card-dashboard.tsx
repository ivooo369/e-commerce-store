import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import { FaTrash } from "react-icons/fa";
import Link from "next/link";
import { DashboardProductCardProps } from "@/lib/interfaces";

export default function ProductCard({
  product,
  onDelete,
}: DashboardProductCardProps) {
  return (
    <Card className="product-card max-w-xs mx-auto text-center min-w-full flex flex-col justify-between shadow-lg transition-colors duration-300">
      <CardMedia
        className="min-w-80 h-52 object-cover"
        component="img"
        image={product.images[0]}
        alt={product.name}
        onContextMenu={(e) => e.preventDefault()}
      />
      <CardContent sx={{ paddingBottom: "1rem !important" }}>
        <p className="text-xl font-bold truncate whitespace-nowrap text-text-primary">
          {product.name}
        </p>
        <p className="text-sm text-text-muted font-bold">Код: {product.code}</p>
        <p className="text-base font-bold text-text-primary">
          Цена: {product.price} лв.
        </p>
        <div className="mt-4 flex justify-center gap-2 dashboard-primary-nav">
          <Link href={`/dashboard/products/edit/${product.id}`}>
            <Button
              variant="contained"
              sx={{
                fontWeight: "bold",
                width: "8rem",
                backgroundColor: "#3b82f6",
                "&:hover": {
                  backgroundColor: "#2563eb",
                },
                color: "white",
              }}
            >
              Редактирай
            </Button>
          </Link>
          <Button
            variant="contained"
            color="error"
            sx={{
              display: "flex",
              fontWeight: "bold",
              width: "8rem",
              gap: "0.375rem",
              backgroundColor: "#ef4444",
              "&:hover": {
                backgroundColor: "#dc2626",
              },
            }}
            onClick={() => onDelete(product.id)}
          >
            <FaTrash /> Изтрий
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
