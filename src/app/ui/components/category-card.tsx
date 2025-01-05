import Link from "next/link";
import Image from "next/image";
import { Category } from "@prisma/client";

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/product-catalog/categories/${category.name}`}
      className="border-4 border-gray-200 rounded-lg shadow-lg p-4 flex flex-col items-center justify-center bg-white hover:bg-gray-100 transition duration-200"
    >
      <Image
        src={category.imageUrl}
        alt={category.name}
        width={300}
        height={200}
        className="w-full h-48 object-cover mb-4 rounded"
      />
      <p className="text-md text-gray-500 font-semibold">
        Код: {category.code}
      </p>
      <h2 className="text-lg text-center font-bold">{category.name}</h2>
    </Link>
  );
}
