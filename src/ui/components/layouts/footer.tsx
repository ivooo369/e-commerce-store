import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className="bg-bg-tertiary text-text-primary text-center py-4 border-t border-border-color transition-colors duration-300"
      aria-label="Footer"
    >
      <div className="flex items-center justify-center space-x-2">
        <p className="text-xs sm:text-sm md:text-base">
          &copy; {new Date().getFullYear()} Lipci Design Studio. Всички права
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
