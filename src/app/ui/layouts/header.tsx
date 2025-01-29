import Link from "next/link";
import Image from "next/image";
import { MdAccountCircle } from "react-icons/md";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import HomeIcon from "@mui/icons-material/Home";
import ViewListIcon from "@mui/icons-material/ViewList";
import InfoIcon from "@mui/icons-material/Info";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import PhoneIcon from "@mui/icons-material/Phone";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MainSearch from "../components/main-search";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "@/app/lib/userSlice";
import { RootState } from "@/app/lib/store";
import { useQuery } from "@tanstack/react-query";

async function fetchCategories() {
  const response = await fetch("/api/public/categories");
  if (!response.ok) {
    throw new Error("Възникна грешка при извличане на категориите!");
  }
  const data = await response.json();
  return data.map((category: { name: string }) => category.name);
}

export default function Header() {
  const pathname = usePathname();
  const [isCatalogMenuOpen, setIsCatalogMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const signedInUser = useSelector((state: RootState) => state.user);
  const catalogMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const handleClickCatalogMenuOutside = (event: MouseEvent) => {
    if (
      catalogMenuRef.current &&
      !catalogMenuRef.current.contains(event.target as Node)
    ) {
      setIsCatalogMenuOpen(false);
    }
  };

  const handleClickAccountMenuOutside = (event: MouseEvent) => {
    if (
      accountMenuRef.current &&
      !accountMenuRef.current.contains(event.target as Node)
    ) {
      setIsAccountMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickCatalogMenuOutside);
    document.addEventListener("mousedown", handleClickAccountMenuOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickCatalogMenuOutside);
      document.removeEventListener("mousedown", handleClickAccountMenuOutside);
    };
  }, []);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const toggleCatalogMenu = () => setIsCatalogMenuOpen(!isCatalogMenuOpen);
  const toggleAccountMenu = () => setIsAccountMenuOpen(!isAccountMenuOpen);

  const handleSignOut = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("userAccountData");
    dispatch(clearUser());
  };

  return (
    <>
      <header className="bg-white text-black px-4 md:px-6 lg:px-10 py-2 md:py-4 flex flex-col md:flex-row justify-around items-center gap-2 md:gap-4 flex-wrap">
        <div className="flex justify-center w-full md:w-auto gap-4 md:gap-8">
          <Link href="/" className="flex items-center" aria-label="Начало">
            <Image
              src="/assets/images/logo.jpg"
              alt="Lipci Design Studio Logo"
              width={100}
              height={100}
              className="rounded-md"
              priority
              style={{ width: "auto", height: "auto" }}
            />
          </Link>
          <span
            className="hidden sm:flex items-center gap-2 text-sm md:text-base font-medium"
            aria-label="Телефон за връзка"
          >
            <PhoneIcon />
            +359 88 911 5233
          </span>
        </div>
        <MainSearch />
        <div className="flex flex-col gap-1 sm:gap-0 sm:flex-row items-center font-medium order-1 md:order-2">
          {signedInUser.isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span
                onClick={toggleAccountMenu}
                className="flex items-center gap-1 relative rounded px-3 py-2 transition duration-300 text-sm md:text-base hover:bg-gray-300 cursor-pointer"
              >
                <MdAccountCircle className="w-7 h-7 text-gray-700" />{" "}
                {signedInUser.firstName} {signedInUser.lastName}
                {isAccountMenuOpen && (
                  <div
                    ref={accountMenuRef}
                    className="absolute top-full left-0 bg-white shadow-lg rounded p-2 z-50 w-48"
                  >
                    <Link
                      href="/user/my-account"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                    >
                      Моят акаунт
                    </Link>
                    <Link
                      href="/user/favorite-products"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                    >
                      Любими продукти
                    </Link>
                    <Link
                      href="/user/order-history"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                    >
                      Поръчки
                    </Link>
                    <Link
                      href="/user/change-password"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                    >
                      Смяна на парола
                    </Link>
                    <Link
                      href="/user/delete-account"
                      className="block px-4 py-2 text-red-600 hover:bg-red-100 rounded"
                    >
                      Изтрий акаунта
                    </Link>
                  </div>
                )}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm md:text-base text-blue-500 hover:underline"
              >
                ИЗХОД
              </button>
            </div>
          ) : (
            <div>
              <Link
                href="/user/sign-in"
                className="hover:underline mr-2 text-sm md:text-base"
                aria-label="Вход в потребителски акаунт"
              >
                ВХОД
              </Link>
              <span className="text-sm md:text-base">/</span>
              <Link
                href="/user/sign-up"
                className="hover:underline ml-2 text-sm md:text-base"
                aria-label="Изход от потребителски акаунт"
              >
                РЕГИСТРАЦИЯ
              </Link>
            </div>
          )}
          <Link
            href="/cart"
            className={`flex items-center rounded px-3 py-2 transition duration-300 ml-2 md:ml-4 lg:ml-8 text-sm md:text-base ${
              pathname === "/cart"
                ? "bg-gray-200 hover:bg-gray-300"
                : "hover:bg-gray-300"
            }`}
            aria-label="Количка"
          >
            <ShoppingCartIcon className="mr-1" />
            КОЛИЧКА
          </Link>
        </div>
      </header>
      <nav
        className="text-black bg-gray-100 py-3 border-t-4 border-b-4 font-medium"
        aria-label="Основна навигация"
      >
        <div className="container mx-auto flex justify-center flex-wrap">
          <div className="grid grid-cols-2 gap-4 md:space-x-4 md:flex md:flex-row">
            <Link
              href="/"
              className={`flex items-center rounded px-3 py-2 transition duration-300 text-sm md:text-base ${
                pathname === "/"
                  ? "bg-gray-200 hover:bg-gray-300"
                  : "hover:bg-gray-300"
              }`}
              aria-label="Начало"
            >
              <HomeIcon
                className="mr-2"
                style={{ width: 28.5, height: 28.5 }}
              />
              НАЧАЛО
            </Link>
            <div
              className="relative flex items-center rounded px-3 py-2 transition duration-300 text-sm md:text-base hover:bg-gray-300 cursor-pointer"
              onClick={toggleCatalogMenu}
              aria-label="Каталог"
            >
              <ViewListIcon
                className="mr-2"
                style={{ width: 28, height: 28 }}
              />
              КАТАЛОГ
              {isCatalogMenuOpen && (
                <div
                  ref={catalogMenuRef}
                  className="absolute top-full left-0 bg-white shadow-lg rounded p-2 z-50 w-48"
                >
                  {isLoading ? (
                    <p>Зареждане...</p>
                  ) : categories.length > 0 ? (
                    categories.map((category: string, index: number) => (
                      <Link
                        key={index}
                        href={`/product-catalog/categories/${encodeURIComponent(
                          category
                        )}`}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                      >
                        {category}
                      </Link>
                    ))
                  ) : (
                    <p>Няма налични категории</p>
                  )}
                </div>
              )}
            </div>
            <Link
              href="/about"
              className={`flex items-center rounded px-3 py-2 transition duration-300 text-sm md:text-base ${
                pathname === "/about"
                  ? "bg-gray-200 hover:bg-gray-300"
                  : "hover:bg-gray-300"
              }`}
              aria-label="За нас"
            >
              <InfoIcon className="mr-2" />
              ЗА НАС
            </Link>
            <Link
              href="/contact"
              className={`flex items-center rounded px-3 py-2 transition duration-300 text-sm md:text-base ${
                pathname === "/contact"
                  ? "bg-gray-200 hover:bg-gray-300"
                  : "hover:bg-gray-300"
              }`}
              aria-label="Контакти"
            >
              <ContactMailIcon className="mr-2" />
              КОНТАКТИ
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
