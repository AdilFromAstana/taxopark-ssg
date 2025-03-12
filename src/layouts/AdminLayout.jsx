import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const AdminLayout = () => {
  const nav = useNavigate();
  const [selectedKey, setSelectedKey] = useState(
    localStorage.getItem("selectedMenuKey") || "parks"
  );

  const items = [
    { key: "website", label: "Веб-сайт" },
    { key: "parks", label: "Таксопарки" },
    { key: "forms", label: "Заявки" },
    { key: "promotions", label: "Акции" },
    { key: "cities", label: "Города" },
    { key: "reviews", label: "Отзывы" },
    { key: "users", label: "Пользователи" },
  ];

  useEffect(() => {
    localStorage.setItem("selectedMenuKey", selectedKey);
    nav(selectedKey);
  }, [selectedKey]);

  const onClick = (e) => {
    setSelectedKey(e.key);
    nav(e.key);
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
