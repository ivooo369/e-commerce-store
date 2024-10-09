import Link from "next/link";
import Image from "next/image";
import HomeIcon from "@mui/icons-material/Home";
import ViewListIcon from "@mui/icons-material/ViewList";
import InfoIcon from "@mui/icons-material/Info";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import PhoneIcon from "@mui/icons-material/Phone";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

export default function Header() {
  return (
    <>
      <header className="bg-white text-black border-b-4 px-4 md:px-6 lg:px-10 py-2 md:py-4 flex flex-col md:flex-row justify-around items-center gap-2 md:gap-4 flex-wrap">
        <div className="flex justify-center w-full md:w-auto gap-4 md:gap-8">
          <Link href="/" className="flex items-center" aria-label="Home">
            <Image
              src="/assets/images/logo.jpg"
              alt="Lipci Design Studio Logo"
              width={100}
              height={100}
              className="rounded-md"
              priority
            />
          </Link>
          <span
            className="hidden sm:flex items-center gap-2 text-sm md:text-base"
            aria-label="Contact Phone Number"
          >
            <PhoneIcon />
            +359 88 911 5233
          </span>
        </div>
        <div className="flex items-center border border-gray-300 w-full max-w-md order-2 md:order-1">
          <input
            type="text"
            placeholder="Търсене..."
            className="px-3 py-2 focus:outline-none w-full"
            aria-label="Search"
            aria-required="false"
          />
          <button
            className="bg-gray-300 p-2 hover:bg-gray-300 transition"
            aria-label="Search"
          >
            <SearchIcon />
          </button>
        </div>

        <nav className="flex items-center font-medium order-1 md:order-2">
          <Link
            href="/sign-in"
            className="hover:underline mr-2 text-sm md:text-base"
            aria-label="Sign In"
          >
            ВХОД
          </Link>
          <span className="text-sm md:text-base">/</span>
          <Link
            href="/sign-out"
            className="hover:underline ml-2 text-sm md:text-base"
            aria-label="Sign Out"
          >
            РЕГИСТРАЦИЯ
          </Link>
          <Link
            href="/cart"
            className="flex items-center hover:bg-gray-300 rounded px-3 py-2 transition ml-0 sm:ml-4 md:ml-6 lg:ml-8 text-sm md:text-base"
            aria-label="Shopping Cart"
          >
            <ShoppingCartIcon className="mr-1" />
            КОЛИЧКА
          </Link>
        </nav>
      </header>
      <nav className="text-black bg-gray-100 py-3" aria-label="Main Navigation">
        <div className="container mx-auto flex justify-center flex-wrap">
          <div className="grid grid-cols-2 gap-4 md:space-x-4 md:flex md:flex-row">
            {[
              {
                href: "/",
                label: "НАЧАЛО",
                icon: (
                  <HomeIcon
                    className="mr-2"
                    style={{ width: 28.5, height: 28.5 }}
                  />
                ),
              },
              {
                href: "/catalog",
                label: "КАТАЛОГ",
                icon: (
                  <ViewListIcon
                    className="mr-2"
                    style={{ width: 28, height: 28 }}
                  />
                ),
              },
              {
                href: "/about",
                label: "ЗА НАС",
                icon: <InfoIcon className="mr-2" />,
              },
              {
                href: "/contact",
                label: "КОНТАКТИ",
                icon: <ContactMailIcon className="mr-2" />,
              },
            ].map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center hover:bg-gray-300 rounded px-3 py-2 transition duration-300 text-sm md:text-base"
                aria-label={label}
              >
                {icon}
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
