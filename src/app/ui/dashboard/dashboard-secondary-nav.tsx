"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardSecondaryNav() {
  const pathname = usePathname();

  return (
    <nav className="w-full p-4 bg-gray-200">
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
        <Link
          href="/dashboard/products"
          aria-label="Управление на продукти"
          className={`flex items-center text-white font-bold py-2 px-4 rounded-lg transition ${
            pathname === "/dashboard/products"
              ? "bg-gray-800"
              : "bg-gray-600 hover:bg-gray-800"
          }`}
        >
          Управление на продукти
        </Link>
        <Link
          href="/dashboard/categories"
          aria-label="Управление на категории"
          className={`flex items-center text-white font-bold py-2 px-4 rounded-lg transition ${
            pathname === "/dashboard/categories"
              ? "bg-gray-800"
              : "bg-gray-600 hover:bg-gray-800"
          }`}
        >
          Управление на категории
        </Link>
        <Link
          href="/dashboard/subcategories"
          aria-label="Управление на подкатегории"
          className={`flex items-center text-white font-bold py-2 px-4 rounded-lg transition ${
            pathname === "/dashboard/subcategories"
              ? "bg-gray-800"
              : "bg-gray-600 hover:bg-gray-800"
          }`}
        >
          Управление на подкатегории
        </Link>
      </div>
    </nav>
  );
}
