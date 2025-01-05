import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import { FaTrash } from "react-icons/fa";
import { Category } from "@prisma/client";
import Link from "next/link";

interface CategoryCardProps {
  category: Category;
  onDelete: (id: string) => void;
}

export default function CategoryCard({
  category,
  onDelete,
}: CategoryCardProps) {
  return (
    <Card className="max-w-xs mx-auto text-center min-w-full flex flex-col justify-between shadow-lg">
      <CardMedia
        className="min-w-80 h-52 object-cover"
        component="img"
        image={category.imageUrl}
        alt={category.name}
      />
      <CardContent>
        <p className="text-xl font-bold truncate whitespace-nowrap">
          {category.name}
        </p>
        <p className="text-sm text-gray-500 font-bold">Код: {category.code}</p>
        <div className="mt-4 flex justify-center gap-2">
          <Link href={`/dashboard/categories/edit/${category.id}`}>
            <Button variant="contained" sx={{ fontWeight: "bold" }}>
              Редактирай
            </Button>
          </Link>
          <Button
            variant="contained"
            color="error"
            sx={{ fontWeight: "bold" }}
            onClick={() => onDelete(category.id)}
          >
            <FaTrash /> Изтрий
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
