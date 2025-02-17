/* eslint-disable react/prop-types */
import { Modal, Form, Input, Button, Row, Col, Select, DatePicker, message } from "antd";
import axios from "axios";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const CreatePromotionModal = ({ open, onClose, refreshData, parks = [] }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      console.log("🔄 Начало создания промо-акции...", values);

      const response = await axios.post(`${API_URL}/promotions`, values);

      console.log("✅ Успешный ответ сервера:", response.data);
      message.success("🎉 Промо-акция успешно создана!");

      refreshData(); // Обновление данных после создания
      onClose();
      form.resetFields(); // Очистка формы
    } catch (error) {
      console.error("❌ Ошибка при создании записи:", error);
      message.error(
        `Ошибка при создании акции: ${
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
          <Col span={12}>
            <Form.Item
              name="title"
              label="Название акции"
              rules={[{ required: true, message: "Введите название" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="parkId"
              label="Таксопарк"
              rules={[{ required: true, message: "Выберите таксопарк" }]}
            >
              <Select placeholder="Выберите таксопарк">
                {parks.map((park) => (
                  <Select.Option key={park.id} value={park.id}>
                    {park.title}
                  </Select.Option>
                ))}
              </Select>
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
              <Input.TextArea rows={4} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="expires" label="Дата истечения">
              <DatePicker format="DD.MM.YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        {/* <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="imageUrl" label="Загрузить изображение">
              <Upload
                fileList={fileList}
                beforeUpload={() => false} // Отключаем автоматическую загрузку
                onChange={({ fileList }) => setFileList(fileList)}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Выбрать файл</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row> */}

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

export default CreatePromotionModal;
