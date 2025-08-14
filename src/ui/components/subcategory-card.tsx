import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import { FaTrash } from "react-icons/fa";
import Link from "next/link";
import { DashboardSubcategoryCardProps } from "@/lib/interfaces";

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
            onClick={() => onDelete(subcategory.id)}
          >
            <FaTrash /> Изтрий
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
