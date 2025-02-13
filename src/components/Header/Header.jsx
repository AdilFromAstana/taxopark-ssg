import "./Header.css";
// import logo from "assets/logo.svg";

import { Button, Col, Drawer, Row, Typography } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import React, { useState } from "react";
const { Text } = Typography;

function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <header className="header">
      <Row align="middle" justify="space-between" className="header-row">
        <Col className="header-logo">
          {/* <img alt="logo" src={logo} className="header-logo-img" /> */}
        </Col>
        <Col className="header-contact">
          <div className="header-contact-info">
            <span className="header-contact-number">+7-776-777-77-77</span>
            <span className="header-contact-hours">Круглосуточно</span>
          </div>
        </Col>
        <Col className="header-nav">
          <Row justify="space-evenly" className="header-nav-links">
            <Text strong className="header-link">
              Главная
            </Text>
            <Text strong className="header-link">
              Как это работает?
            </Text>
            <Text strong className="header-link">
              Акции и бонусы
            </Text>
            <Text strong className="header-link">
              Контакты
            </Text>
          </Row>
        </Col>
        <Col className="header-button">
          <Button className="header-register-button">Зарегистрироваться</Button>
        </Col>
        <Col className="header-menu">
          <MenuOutlined
            style={{ color: "white", fontSize: "36px" }}
            onClick={() => window.innerWidth <= 768 && setIsDrawerOpen(true)}
          />
        </Col>
      </Row>

      <Drawer
        title="Меню"
        placement="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        className="header-drawer"
      >
        <div className="drawer-content">
          <div className="drawer-links">
            <Text strong className="header-link">
              Главная
            </Text>
            <Text strong className="header-link">
              Как это работает?
            </Text>
            <Text strong className="header-link">
              Акции и бонусы
            </Text>
            <Text strong className="header-link">
              Контакты
            </Text>
          </div>
        </div>
      </Drawer>
    </header>
  );
}

export default Header;