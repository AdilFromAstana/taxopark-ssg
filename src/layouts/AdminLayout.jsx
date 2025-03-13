import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const AdminLayout = () => {
  const nav = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user")); // Достаём пользователя из localStorage
  const [selectedKey, setSelectedKey] = useState(
    localStorage.getItem("selectedMenuKey") ||
      (user?.roles.includes("manager") ? "forms" : "parks")
  );

  // Определяем доступные пункты меню в зависимости от роли
  const adminItems = [
    { key: "website", label: <span>Веб-сайт</span> },
    { key: "parks", label: <span>Таксопарки</span> },
    { key: "forms", label: <span>Заявки</span> },
    { key: "promotions", label: <span>Акции</span> },
    { key: "cities", label: <span>Города</span> },
    { key: "reviews", label: <span>Отзывы</span> },
    { key: "users", label: <span>Пользователи</span> },
  ];

  const managerItems = [{ key: "forms", label: <span>Заявки</span> }];

  // Выбираем меню в зависимости от роли
  const items = user?.roles.includes("admin")
    ? adminItems
    : user?.roles.includes("manager")
    ? managerItems
    : [];

  useEffect(() => {
    // Если нет пользователя или у него нет прав, редиректим на страницу логина
    if (
      !user ||
      (!user.roles.includes("admin") && !user.roles.includes("manager"))
    ) {
      nav("/admin/login");
      return;
    }

    localStorage.setItem("selectedMenuKey", selectedKey);

    // Редирект при первом входе в админку (если пользователь не находится уже в нужном разделе)
    if (location.pathname === "/admin") {
      if (user.roles.includes("admin")) {
        nav("/admin/parks", { replace: true });
      } else if (user.roles.includes("manager")) {
        nav("/admin/forms", { replace: true });
      }
    }
  }, [selectedKey, user, location.pathname]);

  const onClick = (e) => {
    setSelectedKey(e.key); // Навигация происходит в useEffect
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        justifyContent: "flex-start",
        height: "100%",
      }}
    >
      <Sider>
        <Menu
          onClick={onClick}
          selectedKeys={[selectedKey]}
          mode="inline"
          items={items}
        />
      </Sider>
      <main style={{ width: "100%" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
