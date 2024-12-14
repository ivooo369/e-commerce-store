import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import { FaTrash } from "react-icons/fa";
import Link from "next/link";

interface SubcategoryCardProps {
  subcategory: {
    id: string;
    name: string;
    code: string;
    category: {
      name: string;
    };
  };
  onDelete: (id: string) => void;
}

export default function SubcategoryCard({
  subcategory,
  onDelete,
}: SubcategoryCardProps) {
  return (
    <Card className="max-w-xs mx-auto text-center min-w-full flex flex-col justify-between shadow-lg">
      <CardContent>
        <p className="text-xl font-bold truncate whitespace-nowrap">
          {subcategory.name}
        </p>
        <p className="text-sm text-gray-500 font-bold">
          Код: {subcategory.code}
        </p>
        <p className="text-sm text-gray-500 font-bold">
          Категория: {subcategory.category.name}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Link href={`/dashboard/subcategories/edit/${subcategory.id}`}>
            <Button variant="contained" className="font-bold w-32">
              Редактирай
            </Button>
          </Link>
          <Button
            variant="contained"
            color="error"
            className="flex font-bold w-32 gap-1.5"
            onClick={() => onDelete(subcategory.id)}
          >
            <FaTrash /> Изтрий
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
