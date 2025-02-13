import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pathname = useNavigate();

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isDrawerOpen]);

  if (pathname.includes("admin")) return null;

  return (
    <header className="bg-gradient-to-r bg-blue-500 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Логотип */}
        <div className="flex-1">
          <a href="/" className="text-2xl font-bold tracking-wide">
            Лого
          </Link>
        </div>

        {/* Навигация (десктоп) */}
        <nav className="hidden md:flex flex-1 justify-end space-x-6 text-sm font-medium">
          <Link
            href="/"
            className="hover:text-gray-200 transition"
            onClick={() => setIsDrawerOpen(false)}
          >
            Главная
          </Link>
          <Link
            href="/how-it-works"
            className="hover:text-gray-200 transition"
            onClick={() => setIsDrawerOpen(false)}
          >
            Как это работает?
          </Link>
          <Link
            href="/promotions"
            className="hover:text-gray-200 transition"
            onClick={() => setIsDrawerOpen(false)}
          >
            Акции и бонусы
          </Link>
          <Link
            href="tel:+77767777777"
            className="flex items-center gap-2 text-white hover:text-gray-300 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M6.62 10.79a15.07 15.07 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.23 11.36 11.36 0 003.64.61 1 1 0 011 1V21a1 1 0 01-1 1A19 19 0 013 5a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.61 3.64 1 1 0 01-.23 1.11z" />
            </svg>
          </Link>
        </nav>

        {/* Кнопка бургера (мобилка) */}
        <div className="md:hidden">
          <button onClick={() => setIsDrawerOpen(true)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-8 h-8"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zM3 19a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      <div
        className={`gap-4 fixed inset-0 z-50 flex flex-col p-5 bg-blue-500 transition-transform duration-300 transform ${
          isDrawerOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }`}
      >
        <div className="flex justify-between align-middle w-full border-b-2 border-white pb-4">
          <p className="text-lg font-bold text-white">MyCompany</p>
          <button
            className="text-white text-2xl"
            onClick={() => setIsDrawerOpen(false)}
          >
            ✕
          </button>
        </div>
        <nav className="flex flex-col items-start space-y-6 text-lg font-medium w-full">
          <Link
            href="/"
            className="text-white flex items-center gap-2 hover:text-gray-300 transition"
            onClick={() => setIsDrawerOpen(false)}
          >
            🏠 Главная
          </Link>
          <Link
            href="/how-it-works"
            className="text-white flex items-center gap-2 hover:text-gray-300 transition"
            onClick={() => setIsDrawerOpen(false)}
          >
            ⚙️ Как это работает?
          </Link>
          <Link
            href="/promotions"
            className="text-white flex items-center gap-2 hover:text-gray-300 transition"
            onClick={() => setIsDrawerOpen(false)}
          >
            🎁 Акции и бонусы
          </Link>
          <Link
            href="tel:+77767777777"
            className="flex items-center gap-2 text-white hover:text-gray-300 transition"
          >
            📞 +7-776-777-77-77
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
