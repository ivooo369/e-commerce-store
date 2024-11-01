import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className="bg-gray-800 text-white text-center py-4"
      aria-label="Footer"
    >
      <div className="flex items-center justify-center space-x-2">
        <p className="text-xs sm:text-sm md:text-base">
          &copy; {new Date().getFullYear()} LIPCI Design Studio. Всички права
          запазени.
        </p>

        <a
          href="https://www.facebook.com/LIPCIdesignstudio?locale=bg_BG"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Посетете нашата Facebook страница"
        >
          <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 relative">
            <Image
              src="/assets/images/facebook-icon.png"
              alt="Facebook Icon"
              width={100}
              height={100}
              className="rounded-md object-contain"
            />
          </div>
        </a>
      </div>
    </footer>
  );
}
