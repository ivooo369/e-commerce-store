"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardSecondaryNav() {
  const pathname = usePathname();

  return (
    <nav className="w-full p-4 bg-gray-200 mb-4">
      <div className="flex justify-center space-x-6">
        <Link
          href="/dashboard/products"
          area-label="Управление на продукти"
          className={`flex items-center text-white font-bold py-2 px-4 rounded-lg transition ${
            pathname === "/dashboard/products"
              ? "bg-gray-800"
              : "bg-gray-600 hover:bg-gray-800"
          }`}
        >
          Управление на продукти
        </Link>
        <Link
          href="/dashboard/categories-and-subcategories"
          area-label="Управление на категории и подкатегории"
          className={`flex items-center text-white font-bold py-2 px-4 rounded-lg transition ${
            pathname === "/dashboard/categories-and-subcategories"
              ? "bg-gray-800"
              : "bg-gray-600 hover:bg-gray-800"
          }`}
        >
          Управление на категории и подкатегории
        </Link>
      </div>
    </nav>
  );
}
