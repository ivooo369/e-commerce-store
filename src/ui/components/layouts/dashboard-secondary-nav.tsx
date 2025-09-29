"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardSecondaryNav() {
  const pathname = usePathname();

  return (
    <nav className="w-full p-4 bg-bg-secondary border-b border-border-color transition-colors duration-300">
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
        <Link
          href="/dashboard/products"
          aria-label="Управление на продукти"
          className={`flex items-center text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 ${
            pathname === "/dashboard/products"
              ? "bg-accent-color"
              : "bg-accent-color hover:bg-accent-hover"
          }`}
        >
          Управление на продукти
        </Link>
        <Link
          href="/dashboard/categories"
          aria-label="Управление на категории"
          className={`flex items-center text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 ${
            pathname === "/dashboard/categories"
              ? "bg-accent-color"
              : "bg-accent-color hover:bg-accent-hover"
          }`}
        >
          Управление на категории
        </Link>
        <Link
          href="/dashboard/subcategories"
          aria-label="Управление на подкатегории"
          className={`flex items-center text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 ${
            pathname === "/dashboard/subcategories"
              ? "bg-accent-color"
              : "bg-accent-color hover:bg-accent-hover"
          }`}
        >
          Управление на подкатегории
        </Link>
      </div>
    </nav>
  );
}
