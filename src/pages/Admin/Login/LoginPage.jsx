import { Form, Input, Button, Card, Typography } from "antd";
import { useMutation } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import axios from "axios";
import "antd/dist/reset.css";

const API_URL = import.meta.env.VITE_API_URL;
const { Title } = Typography;

const loginUser = async (data) => {
  const response = await axios.post(`${API_URL}/users/login`, data);
  return response.data;
};

export default function LoginPage() {
  const [error, setError] = useState(null);
  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      const decodedUser = jwtDecode(data.token);
      localStorage.setItem("token", data.token);
      if (decodedUser.roles.includes("admin")) {
        window.location.href = "/admin/parks";
      } else {
        window.location.href = "/admin/forms";
      }
    },
    onError: (error) => {
      console.error(
        "Ошибка входа:",
        error.response?.data?.message || error.message
      );
      setError("Ошибка входа:", error.response?.data?.message || error.message);
    },
  });

  const onFinish = (values) => {
    mutation.mutate(values);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Card
        style={{
          width: 400,
          padding: 20,
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Title level={3} style={{ textAlign: "center" }}>
          Вход
        </Title>
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Ник"
            name="userName"
            rules={[{ required: true, message: "Введите ник" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Пароль"
            name="password"
            rules={[{ required: true, message: "Введите пароль" }]}
          >
            <Input.Password />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={mutation.isLoading}
          >
            Войти
          </Button>
        </Form>
      </Card>
    </div>
  );
}
