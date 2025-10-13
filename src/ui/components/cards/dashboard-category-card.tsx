import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import { FaTrash } from "react-icons/fa";
import Link from "next/link";
import type { DashboardCategoryCardProps } from "@/lib/types/interfaces";

export default function DashboardCategoryCard({
  category,
  onDelete,
}: DashboardCategoryCardProps) {
  return (
    <Card className="category-card max-w-xs mx-auto text-center min-w-full flex flex-col justify-between shadow-lg transition-colors duration-300">
      <CardMedia
        className="min-w-80 h-52 object-cover"
        component="img"
        image={category.imageUrl}
        alt={category.name}
      />
      <CardContent>
        <p className="text-xl font-bold truncate whitespace-nowrap text-text-primary">
          {category.name}
        </p>
        <p className="text-sm text-text-muted font-bold">
          Код: {category.code}
        </p>
        <div className="mt-4 flex justify-center gap-2 dashboard-primary-nav">
          <Link href={`/dashboard/categories/edit/${category.id}`}>
            <Button
              variant="contained"
              className="font-bold w-32 bg-blue-500 hover:bg-blue-600 text-white"
            >
              Редактирай
            </Button>
          </Link>
          <Button
            variant="contained"
            color="error"
            className="flex font-bold w-32 gap-1.5 bg-red-500 hover:bg-red-600"
            onClick={() => onDelete(category.id)}
          >
            <FaTrash /> Изтрий
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
