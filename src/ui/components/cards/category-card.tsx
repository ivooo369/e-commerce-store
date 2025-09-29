import Link from "next/link";
import Image from "next/image";
import { CategoryCardProps } from "@/lib/types/interfaces";

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/product-catalog/categories/${category.name}`}
      className="category-card border-4 border-border-color rounded-lg shadow-lg p-4 flex flex-col items-center justify-center bg-card-bg hover:bg-gray-100 dark:hover:bg-slate-600 transition-all duration-300"
    >
      {category.imageUrl ? (
        <Image
          src={category.imageUrl}
          alt={category.name}
          width={300}
          height={200}
          className="w-full h-48 object-cover mb-4 rounded"
        />
      ) : (
        <div className="w-full h-48 bg-bg-secondary rounded mb-4 flex items-center justify-center">
          <span className="text-text-muted text-lg">Няма изображение</span>
        </div>
      )}
      <p className="text-md text-text-muted font-semibold">
        Код: {category.code}
      </p>
      <h2 className="text-lg text-center font-bold text-text-primary">
        {category.name}
      </h2>
    </Link>
  );
}
