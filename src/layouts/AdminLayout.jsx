import { Menu, Modal } from "antd";
import Sider from "antd/es/layout/Sider";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AdminLayout = () => {
  const nav = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [selectedKey, setSelectedKey] = useState(
    localStorage.getItem("selectedMenuKey") || ""
  );
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
      } catch {
        setUser(null);
      }
    }

    if (!user || !user.roles) {
      return;
    }

    if (!selectedKey) {
      setSelectedKey(user.roles.includes("manager") ? "forms" : "parks");
    }

    localStorage.setItem("selectedMenuKey", selectedKey);

    if (location.pathname === "/admin") {
      if (user.roles.includes("admin")) {
        nav("/admin/parks", { replace: true });
      } else if (user.roles.includes("manager")) {
        nav("/admin/forms", { replace: true });
      }
    }
  }, [token]);

  const adminItems = [
    { key: "banners", label: <span>Баннеры</span> },
    { key: "parks", label: <span>Таксопарки</span> },
    { key: "forms", label: <span>Заявки</span> },
    { key: "promotions", label: <span>Акции</span> },
    { key: "cities", label: <span>Города</span> },
    { key: "reviews", label: <span>Отзывы</span> },
    { key: "users", label: <span>Пользователи</span> },
  ];

  const managerItems = [{ key: "forms", label: <span>Заявки</span> }];

  const items = user?.roles.includes("admin")
    ? adminItems
    : user?.roles.includes("manager")
    ? managerItems
    : [];

  const onClick = (e) => {
    if (e.key === "logout") {
      showLogoutModal();
    } else {
      setSelectedKey(e.key);
      nav(`/admin/${e.key}`);
    }
  };

  const showLogoutModal = () => {
    setIsModalVisible(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
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
          items={[
            ...items,
            {
              key: "logout",
              label: "Выйти",
            },
          ]}
        />
      </Sider>
      <main style={{ width: "100%" }}>
        <Outlet />
      </main>

      <Modal
        title="Выход"
        open={isModalVisible}
        onOk={handleLogout}
        onCancel={() => setIsModalVisible(false)}
        okText="Да, выйти"
        cancelText="Отмена"
      >
        <p>Вы уверены, что хотите выйти?</p>
      </Modal>
    </div>
  );
};

export default AdminLayout;
