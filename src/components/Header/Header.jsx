"use client";
import { useEffect, useState } from "react";
import { Drawer, Button } from "antd";
import "./Header.css";

function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isDrawerOpen]);

  return (
    <header className="header-container">
      <div className="header-inner">
        {/* Логотип */}
        <div className="header-logo-container">
          <a href="/" className="header-logo">Лого</a>
        </div>

        {/* Навигация (десктоп) */}
        <nav className="header-nav-desktop">
          <a href="/" className="header-nav-link" onClick={() => setIsDrawerOpen(false)}>Главная</a>
          <a href="/how-it-works" className="header-nav-link" onClick={() => setIsDrawerOpen(false)}>Как это работает?</a>
          <a href="/promotions" className="header-nav-link" onClick={() => setIsDrawerOpen(false)}>Акции и бонусы</a>
          <a href="tel:+77767777777" className="header-phone-link">📞 +7-776-777-77-77</a>
        </nav>

        {/* Кнопка бургера (мобилка) */}
        <div className="header-burger-menu">
          <Button type="primary" onClick={() => setIsDrawerOpen(true)} className="header-burger-button">
            ☰
          </Button>
        </div>
      </div>

      {/* Мобильное меню */}
      <Drawer
        title="MyCompany"
        placement="right"
        closable={true}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
      >
        <nav className="header-mobile-nav">
          <a href="/" className="header-mobile-link" onClick={() => setIsDrawerOpen(false)}>🏠 Главная</a>
          <a href="/how-it-works" className="header-mobile-link" onClick={() => setIsDrawerOpen(false)}>⚙️ Как это работает?</a>
          <a href="/promotions" className="header-mobile-link" onClick={() => setIsDrawerOpen(false)}>🎁 Акции и бонусы</a>
          <a href="tel:+77767777777" className="header-mobile-link">📞 +7-776-777-77-77</a>
        </nav>
      </Drawer>
    </header>
  );
}

export default Header;
