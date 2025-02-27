/* eslint-disable react/prop-types */
import {
  Modal,
  Form,
  Input,
  Button,
  Row,
  Col,
  Select,
  DatePicker,
  message,
} from "antd";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

const useCreatePromotion = ({ form, onClose, invalidatePromotionsQuery }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values) => axios.post(`${API_URL}/promotions`, values),
    onSuccess: (response) => {
      console.log("✅ Успешный ответ сервера:", response.data);
      message.success("🎉 Промо-акция успешно создана!");

      // Инвалидация запроса
      queryClient.invalidateQueries({ queryKey: ['promotions'] })
      invalidatePromotionsQuery();
      onClose();
      form.resetFields(); // Очистка формы
    },
    onError: (error) => {
      console.error("❌ Ошибка при создании записи:", error);
      message.error(
        `Ошибка при создании акции: ${
          error.response?.data?.message || "Неизвестная ошибка"
        }`
      );
    },
  });
};

const CreatePromotionModal = ({
  open,
  onClose,
  parks = [],
  invalidatePromotionsQuery,
}) => {
  const [form] = Form.useForm();

  const { mutate: handleCreatePromotion, isLoading } = useCreatePromotion({
    form,
    onClose,
    invalidatePromotionsQuery,
  });

  const handleSubmit = async (values) => {
    console.log("🔄 Начало создания промо-акции...", values);
    handleCreatePromotion(values);
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

        <div style={{ display: "flex", gap: 10 }}>
          <Button type="primary" onClick={() => invalidatePromotionsQuery()}>
            Обновить
          </Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
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
