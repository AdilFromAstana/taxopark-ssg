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

const AppRouter = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
      }
    }
  }, []);

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/*" element={<LoginPage />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Главная страница с Header */}
        <Route path="/" element={<MainLayout />}>
          <Route path="/" index element={<HomePage />} />
          <Route path="promotions" element={<PromotionsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* Админка с Sidebar */}
        {user.roles.includes("admin") ? (
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="parks" replace />} />
            <Route path="website" element={<WebsiteInfo />} />
            <Route path="parks" element={<Parks />} />
            <Route path="cities" element={<Cities />} />
            <Route path="forms" element={<Forms />} />
            <Route path="promotions" element={<Promotions />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="users" element={<Users />} />
          </Route>
        ) : user.roles.includes("manager") ? (
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="forms" element={<Forms />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
    </Router>
  );
};

export default AppRouter;
