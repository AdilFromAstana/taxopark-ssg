/* eslint-disable react/prop-types */
import {
  Modal,
  Form,
  Input,
  Button,
  Row,
  Col,
  message,
  InputNumber,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const EditCommissionModal = ({
  open,
  onClose,
  record,
  queryClient,
  queryData,
  setSelectedRecord,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleCancel = () => {
    setIsEditMode(false);
    form.setFieldsValue({
      title: record.title,
    });
  };

  const handleUpdate = async () => {
    const data = form.getFieldsValue();
    try {
      setLoading(true);

      const updatedData = await axios.put(
        `${API_URL}/commissions/update/${record.id}`,
        data
      );

      queryClient.setQueryData(["commissions", queryData], (oldData) => {
        console.log("oldData: ", oldData);
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((item) => {
            if (item.id === record.id) {
              setSelectedRecord(updatedData.data);
              form.setFieldsValue(updatedData.data);
              return updatedData.data;
            } else {
              return item;
            }
          }),
        };
      });

      message.success("🎉 Коммисия успешно обновлена!");

      setIsEditMode(false);
      onClose();
    } catch (error) {
      console.error("❌ Ошибка при обновлении:", error);
      message.error(
        `Ошибка при обновлении: ${
          error.response?.data?.message || "Неизвестная ошибка"
        }`
      );
    } finally {
      setLoading(false);
      console.log("🔽 Завершение обновления.");
    }
  };

  useEffect(() => {
    if (open && record) {
      form.setFieldsValue({
        ...record,
      });
    }
  }, [open, record]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={isEditMode ? "Редактировать комиссию" : "Просмотр комиссии"}
      footer={null}
      closeIcon={false}
      maskClosable={false}
    >
      <Form form={form} layout="vertical" onFinish={handleUpdate}>
        <Row gutter={10}>
          <Col span={24}>
            <Form.Item
              name="title"
              label="Название"
              rules={[{ required: true, message: "Введите название" }]}
            >
              <Input disabled={!isEditMode} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={24}>
            <Form.Item
              name="code"
              label="Код"
              rules={[{ required: true, message: "Введите код" }]}
            >
              <Input disabled={!isEditMode} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={24}>
            <Form.Item
              name="sum"
              label="Сумма комиссии"
              rules={[
                { required: true, message: "Введите сумму" },
                {
                  type: "number",
                  max: 100,
                  message: "Максимальная сумма комиссии - 100",
                },
              ]}
            >
              <InputNumber disabled={!isEditMode} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ display: "flex", gap: 10 }}>
          {isEditMode ? (
            <>
              <Button
                type="primary"
                onClick={() => form.submit()}
                loading={loading}
              >
                Сохранить
              </Button>
              <Button type="default" onClick={handleCancel}>
                Отмена
              </Button>
            </>
          ) : (
            <>
              <Button type="primary" onClick={() => setIsEditMode(true)}>
                Редактировать
              </Button>
              <Button danger onClick={onClose}>
                Закрыть
              </Button>
            </>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default EditCommissionModal;
