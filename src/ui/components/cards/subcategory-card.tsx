import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import { FaTrash } from "react-icons/fa";
import Link from "next/link";
import type { DashboardSubcategoryCardProps } from "@/lib/types/interfaces";

export default function SubcategoryCard({
  subcategory,
  onDelete,
}: DashboardSubcategoryCardProps) {
  return (
    <Card className="subcategory-card max-w-xs mx-auto text-center min-w-full flex flex-col justify-between shadow-lg transition-colors duration-300">
      <CardContent>
        <p className="text-xl font-bold truncate whitespace-nowrap text-text-primary">
          {subcategory.name}
        </p>
        <p className="text-sm text-text-muted font-bold">
          Код: {subcategory.code}
        </p>
        <p className="text-sm text-text-muted font-bold">
          Категория: {subcategory.category.name}
        </p>
        <div className="mt-4 flex justify-center gap-2 dashboard-primary-nav">
          <Link href={`/dashboard/subcategories/edit/${subcategory.id}`}>
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
            onClick={() => onDelete(subcategory.id)}
          >
            <FaTrash /> Изтрий
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
