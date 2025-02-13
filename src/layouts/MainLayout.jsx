
import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";

const MainLayout = () => {
    return (
        <div>
            <Header />
            <main className="p-4">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;