import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/Main";
import AdminLayout from "./layouts/AdminLayout";
import Forms from "./pages/Admin/Forms/Forms";
import Parks from "./pages/Admin/Parks/Parks";
import Promotions from "./pages/Admin/Promotions/Promotions";
// import Table1Page from "@/pages/admin/Table1Page";
// import Table2Page from "@/pages/admin/Table2Page";
// import Table3Page from "@/pages/admin/Table3Page";

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                {/* Главная страница с Header */}
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                </Route>

                {/* Админка с Sidebar */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="parks" replace />} /> {/* ✅ Редирект */}
                    <Route path="parks" element={<Parks />} />
                    <Route path="forms" element={<Forms />} />
                    <Route path="promotions" element={<Promotions />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default AppRouter;
