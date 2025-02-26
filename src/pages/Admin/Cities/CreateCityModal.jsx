/* eslint-disable react/prop-types */
import { Modal, Form, Input, Button, Row, Col, message } from "antd";
import axios from "axios";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const CreateCityModal = ({ open, onClose, refreshData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      console.log("🔄 Начало создания города...", values);

      const response = await axios.post(`${API_URL}/cities`, values);

      console.log("✅ Успешный ответ сервера:", response.data);
      message.success("🎉 Город успешно создан!");

      refreshData(); // Обновление данных после создания
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
      title="Создать промо-акцию"
      footer={null}
      width="50vw"
      maskClosable={false}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="title"
              label="Город"
              rules={[{ required: true, message: "Введите название" }]}
            >
              <Input />
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

export default CreateCityModal;
