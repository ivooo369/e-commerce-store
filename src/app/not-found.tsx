export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-243.5px)] flex flex-col items-center justify-center px-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-md w-full space-y-6 text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-800/30">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-red-600 dark:text-red-500">
            404
          </h1>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-gray-100 sm:text-4xl">
            Страницата не е намерена
          </h2>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
            За съжаление, търсената страница не съществува или е била
            премахната!
          </p>
        </div>
      </div>
    </div>
  );
}
