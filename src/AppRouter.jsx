import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import AdminLayout from "./layouts/AdminLayout";
import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/Admin/Login/LoginPage";
import HomePage from "./pages/Main";
import PromotionsPage from "./pages/Promotions";
import Forms from "./pages/Admin/Forms/Forms";
import Parks from "./pages/Admin/Parks/Parks";
import Promotions from "./pages/Admin/Promotions/Promotions";
import Cities from "./pages/Admin/Cities/Cities";
import Banners from "./pages/Admin/Banners/Banners";
import Reviews from "./pages/Admin/Reviews/Reviews";
import Users from "./pages/Admin/Users/Users";
import Commissions from "./pages/Admin/Commissions/Commissions";

const adminRoutes = [
  { path: "banners", element: <Banners />, roles: ["admin"] },
  { path: "parks", element: <Parks />, roles: ["admin"] },
  { path: "forms", element: <Forms />, roles: ["admin", "manager"] },
  { path: "promotions", element: <Promotions />, roles: ["admin"] },
  { path: "cities", element: <Cities />, roles: ["admin"] },
  { path: "reviews", element: <Reviews />, roles: ["admin"] },
  { path: "commissions", element: <Commissions />, roles: ["admin"] },
  { path: "users", element: <Users />, roles: ["admin"] },
];

const AppRouter = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      try {
        setUser(jwtDecode(token));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="promotions" element={<PromotionsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          <Route path="/admin/*" element={<AdminLayout />}>
            {adminRoutes
              .filter(({ roles }) =>
                roles.some((role) => user.roles.includes(role))
              )
              .map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}
            {user.roles.includes("admin") ? (
              <Route index element={<Navigate to="parks" replace />} />
            ) : (
              <Route index element={<Navigate to="forms" replace />} />
            )}
          </Route>
        </Routes>
      </Router>
    );
  } else {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="promotions" element={<PromotionsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin/*"
            element={<Navigate to="/admin/login" replace />}
          />
        </Routes>
      </Router>
    );
  }
};

export default AppRouter;
