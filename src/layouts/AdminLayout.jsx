import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import { Outlet, useNavigate } from "react-router-dom";

const AdminLayout = () => {
    const nav = useNavigate();
    const items = [
        {
            key: 'parks',
            label: 'Таксопарки',
        },
        {
            key: 'forms',
            label: 'Заявки',
        },
        {
            key: 'promotions',
            label: 'Акции',
        },
    ];

    const onClick = (e) => {
        nav(e.key);
    };
    return (
        <div style={{ display: "flex", width: "100%", justifyContent: 'flex-start', height: '100%' }}>
            <Sider>
                <Menu
                    onClick={onClick}
                    defaultSelectedKeys={['1']}
                    defaultOpenKeys={['sub1']}
                    mode="inline"
                    items={items}
                />
            </Sider>
            <main style={{ width: "100%" }}>
                <Outlet />
            </main>
        </div >
    );
};

export default AdminLayout;
