import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/Main";
import PromotionsPage from "./pages/Promotions";
import AdminLayout from "./layouts/AdminLayout";
import Forms from "./pages/Admin/Forms/Forms";
import Parks from "./pages/Admin/Parks/Parks";
import Promotions from "./pages/Admin/Promotions/Promotions";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Главная страница с Header */}
        <Route path="/" element={<MainLayout />}>
          <Route path="/" index element={<HomePage />} />
          <Route index element={<Navigate to="/" replace />} />
          <Route path="promotions" element={<PromotionsPage />} />
        </Route>

        {/* Админка с Sidebar */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="parks" replace />} />
          <Route path="parks" element={<Parks />} />
          <Route path="forms" element={<Forms />} />
          <Route path="promotions" element={<Promotions />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
