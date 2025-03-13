import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/Main";
import PromotionsPage from "./pages/Promotions";
import AdminLayout from "./layouts/AdminLayout";
import Forms from "./pages/Admin/Forms/Forms";
import Parks from "./pages/Admin/Parks/Parks";
import Promotions from "./pages/Admin/Promotions/Promotions";
import Cities from "./pages/Admin/Cities/Cities";
import WebsiteInfo from "./pages/Admin/WebsiteInfo/WebsiteInfo";
import Reviews from "./pages/Admin/Reviews/Reviews";
import Users from "./pages/Admin/Users/Users";
import LoginPage from "./pages/Admin/Login/LoginPage";

const adminRoutes = [
  { path: "website", element: <WebsiteInfo />, roles: ["admin"] },
  { path: "parks", element: <Parks />, roles: ["admin"] },
  { path: "forms", element: <Forms />, roles: ["admin", "manager"] },
  { path: "promotions", element: <Promotions />, roles: ["admin"] },
  { path: "cities", element: <Cities />, roles: ["admin"] },
  { path: "reviews", element: <Reviews />, roles: ["admin"] },
  { path: "users", element: <Users />, roles: ["admin"] },
];

const AppRouter = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);

        console.warn("Токен истёк");
        localStorage.removeItem("token");
        setUser(decoded);
      } catch (error) {
        console.error("Ошибка декодирования токена: ", error);
        localStorage.removeItem("token");
        setUser(null);
      }
    }
  }, []);

  const getAvailableRoutes = () => {
    if (!user) return [];
    return adminRoutes.filter((route) =>
      route.roles.some((role) => user.roles.includes(role))
    );
  };

  return (
    <Router>
      <Routes>
        {/* Главная страница */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="promotions" element={<PromotionsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* Логин */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Админка с проверкой ролей */}
        <Route
          path="/admin/*"
          element={
            user ? <AdminLayout /> : <Navigate to="/admin/login" replace />
          }
        >
          {getAvailableRoutes().map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}

          {/* Редирект для admin и manager */}
          <Route
            index
            element={
              user?.roles.includes("admin") ? (
                <Navigate to="parks" replace />
              ) : user?.roles.includes("manager") ? (
                <Navigate to="forms" replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Редирект менеджера, если он зашёл не в forms */}
          {user?.roles.includes("manager") && (
            <Route path="*" element={<Navigate to="/admin/forms" replace />} />
          )}
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
