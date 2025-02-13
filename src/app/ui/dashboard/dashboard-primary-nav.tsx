"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  FaBox,
  FaPlus,
  FaEnvelope,
  FaClipboardList,
  FaSignOutAlt,
} from "react-icons/fa";

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="w-full p-4 bg-gray-300">
      <div className="flex flex-wrap justify-center items-center mb-6 space-y-4 sm:space-y-0 sm:flex-nowrap">
        <Link
          href="/dashboard/products"
          className="flex items-center mb-4 sm:mb-0"
          aria-label="Лого"
        >
          <Image
            src="/assets/images/logo.jpg"
            alt="Lipci Design Studio Logo"
            width={50}
            height={50}
            className="rounded-md mr-4"
            priority
            style={{ width: "auto", height: "auto" }}
          />
        </Link>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center sm:text-left tracking-wide">
          АДМИНИСТРАТОРСКИ ПАНЕЛ
        </h1>
      </div>
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
        <Link
          href="/dashboard/products"
          aria-label="Инвентар"
          className={`flex items-center text-white font-bold py-2 px-4 rounded-lg shadow-lg transition ${
            pathname === "/dashboard/products" ||
            pathname === "/dashboard/categories-and-subcategories"
              ? "bg-gray-800"
              : "bg-gray-600 hover:bg-gray-800"
          }`}
        >
          <FaBox className="mr-2" />
          Инвентар
        </Link>
        <Link
          href="/dashboard/products/add"
          aria-label="Добавяне на нов продукт"
          className={`flex items-center text-white font-bold py-2 px-4 rounded-lg shadow-lg transition ${
            pathname === "/dashboard/products/add"
              ? "bg-gray-800"
              : "bg-gray-600 hover:bg-gray-800"
          }`}
        >
          <FaPlus className="mr-2" />
          Добавяне на нов продукт
        </Link>
        <Link
          href="/dashboard/categories-and-subcategories/add"
          aria-label="Добавяне на нови категории и подкатегории"
          className={`flex items-center text-white font-bold py-2 px-4 rounded-lg shadow-lg transition ${
            pathname === "/dashboard/categories-and-subcategories/add"
              ? "bg-gray-800"
              : "bg-gray-600 hover:bg-gray-800"
          }`}
        >
          <FaPlus className="mr-2" />
          Добавяне на нови категории и подкатегории
        </Link>
        <Link
          href="/dashboard/messages"
          aria-label="Съобщения"
          className={`flex items-center text-white font-bold py-2 px-4 rounded-lg shadow-lg transition ${
            pathname === "/dashboard/messages"
              ? "bg-gray-800"
              : "bg-gray-600 hover:bg-gray-800"
          }`}
        >
          <FaEnvelope className="mr-2" />
          Съобщения
        </Link>
        <Link
          href="/dashboard/orders"
          aria-label="Поръчки"
          className={`flex items-center text-white font-bold py-2 px-4 rounded-lg shadow-lg transition ${
            pathname === "/dashboard/orders"
              ? "bg-gray-800"
              : "bg-gray-600 hover:bg-gray-800"
          }`}
        >
          <FaClipboardList className="mr-2" />
          Поръчки
        </Link>
        <Link
          href="/"
          className="flex items-center text-white font-bold py-2 px-4 rounded-lg shadow-lg transition bg-red-600 hover:bg-red-800"
          aria-label="Изход"
        >
          <FaSignOutAlt className="mr-2" />
          Изход
        </Link>
      </div>
    </nav>
  );
}
