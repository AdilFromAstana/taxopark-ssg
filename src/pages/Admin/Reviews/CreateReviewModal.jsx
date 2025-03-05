/* eslint-disable react/prop-types */
import { Modal, Form, Input, Button, Row, Col, message } from "antd";
import axios from "axios";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const CreateReviewModal = ({ open, onClose, queryClient, queryData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const data = await axios.post(`${API_URL}/reviews`, values);
      queryClient.setQueryData(["reviews", queryData], (oldData) => {
        if (!oldData || !oldData.data) return oldData;
        return { ...oldData, data: [...oldData.data, data.data] };
      });

      message.success("🎉 Отзыв успешно создан!");

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
      title="Создать отзыв"
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
              name="description"
              label="Описание"
              rules={[{ required: true, message: "Введите описание" }]}
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

export default CreateReviewModal;
