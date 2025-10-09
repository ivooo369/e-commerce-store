"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  FaBox,
  FaPlus,
  FaEnvelope,
  FaClipboardList,
  FaSignOutAlt,
} from "react-icons/fa";
import ThemeToggle from "@/ui/components/others/theme-toggle";
import { getProductCount } from "@/services/productService";
import { signOut } from "next-auth/react";

export default function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();

  const { data: productCount, isLoading } = useQuery({
    queryKey: ["productCount"],
    queryFn: getProductCount,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const handleLogout = async () => {
    try {
      await signOut({
        redirect: false,
        callbackUrl: "/",
      });
      router.push("/");
    } catch {
      router.push("/");
    }
  };

  return (
    <nav className="dashboard-primary-nav w-full p-4 bg-bg-tertiary border-b border-border-color transition-colors duration-300">
      <div className="flex flex-wrap justify-center items-center mb-6 space-y-4 sm:space-y-0 sm:flex-nowrap">
        <Link
          href="/dashboard/products"
          className="flex items-center mb-4 sm:mb-0"
          aria-label="Лого"
        >
          <Image
            src="/assets/images/logo.jpg"
            alt="LIPCI Design Studio Logo"
            width={50}
            height={50}
            className="rounded-md mr-4 w-auto h-auto"
            priority
          />
        </Link>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center sm:text-left tracking-wide text-text-primary">
          АДМИНИСТРАТОРСКИ ПАНЕЛ
        </h1>
      </div>
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
        <Link
          href="/dashboard/products"
          aria-label="Инвентар"
          className={`flex items-center text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors duration-300 ${
            pathname === "/dashboard/products" ||
            pathname === "/dashboard/categories-and-subcategories"
              ? "bg-accent-color"
              : "bg-accent-color hover:bg-accent-hover"
          }`}
        >
          <span className="flex items-center text-white hover:text-white transition-colors duration-300">
            <FaBox className="mr-2" />
            Инвентар{" "}
            {isLoading
              ? "(...)"
              : productCount !== undefined && `(${productCount})`}
          </span>
        </Link>
        <Link
          href="/dashboard/products/add"
          aria-label="Добавяне на нов продукт"
          className={`flex items-center text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors duration-300 ${
            pathname === "/dashboard/products/add"
              ? "bg-accent-color"
              : "bg-accent-color hover:bg-accent-hover"
          }`}
        >
          <FaPlus className="mr-2" />
          Добавяне на нов продукт
        </Link>
        <Link
          href="/dashboard/categories-and-subcategories/add"
          aria-label="Добавяне на нови категории и подкатегории"
          className={`flex items-center text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors duration-300 ${
            pathname === "/dashboard/categories-and-subcategories/add"
              ? "bg-accent-color"
              : "bg-accent-color hover:bg-accent-hover"
          }`}
        >
          <FaPlus className="mr-2" />
          Добавяне на нови категории и подкатегории
        </Link>
        <Link
          href="/dashboard/messages"
          aria-label="Съобщения"
          className={`flex items-center text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors duration-300 ${
            pathname === "/dashboard/messages"
              ? "bg-accent-color"
              : "bg-accent-color hover:bg-accent-hover"
          }`}
        >
          <FaEnvelope className="mr-2" />
          Съобщения
        </Link>
        <Link
          href="/dashboard/orders"
          aria-label="Поръчки"
          className={`flex items-center text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors duration-300 ${
            pathname === "/dashboard/orders"
              ? "bg-accent-color"
              : "bg-accent-color hover:bg-accent-hover"
          }`}
        >
          <FaClipboardList className="mr-2" />
          Поръчки
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors duration-300 bg-error-color hover:bg-red-700"
          aria-label="Изход"
        >
          <FaSignOutAlt className="mr-2" />
          Изход
        </button>
        <ThemeToggle />
      </div>
    </nav>
  );
}
