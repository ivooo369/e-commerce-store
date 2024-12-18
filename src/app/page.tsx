import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";

const prisma = new PrismaClient();

export default async function HomePage() {
  let categories: {
    id: string;
    name: string;
    code: string;
    imageUrl: string;
  }[] = [];

  try {
    categories = await prisma.category.findMany({
      orderBy: { code: "asc" },
    });
  } catch (error) {
    console.error("Възникна грешка при извличане на категориите:", error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Категории продукти
      </h1>
      {categories.length === 0 ? (
        <p className="text-center text-lg text-red-500">
          Няма налични категории
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
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
              <h2 className="text-lg font-bold">{category.name}</h2>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
