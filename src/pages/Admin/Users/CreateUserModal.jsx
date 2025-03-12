/* eslint-disable react/prop-types */
import { Modal, Form, Input, Button, Row, Col, message, Select } from "antd";
import axios from "axios";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const CreateUserModal = ({ open, onClose, queryClient, queryData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const newUser = await axios.post(`${API_URL}/users/register`, values);

      message.success("🎉 Пользователь успешно создан!");

      queryClient.setQueryData(["users", queryData], (oldData) => {
        if (!oldData) return oldData;
        return [...oldData, newUser.data.user];
      });

      onClose();
      form.resetFields(); // Очистка формы
    } catch (error) {
      console.error("❌ Ошибка при создании записи:", error);
      message.error(
        `Ошибка при создании: ${
          error.response?.data?.message || "Неизвестная ошибка"
        }`
      );
    } finally {
      setLoading(false);
      console.log("🔽 Завершение создания.");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Создать пользователя"
      footer={null}
      maskClosable={false}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="ФИО"
              rules={[{ required: true, message: "Введите ФИО" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="userName"
              label="Ник"
              rules={[
                { required: true, message: "Введите ник" },
                {
                  pattern: /^[a-zA-Z0-9_-]+$/,
                  message:
                    "Можно использовать только латинские буквы, цифры, _ и - без пробелов",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="roles"
              label="Роли"
              rules={[{ required: true, message: "Выберите роль" }]}
            >
              <Select
                mode="multiple"
                options={[
                  { value: "admin", label: "Админ" },
                  { value: "manager", label: "Менеджер" },
                ]}
                min={0}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ display: "flex", gap: 10 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            Создать
          </Button>
          <Button type="default" danger onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateUserModal;
