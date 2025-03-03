/* eslint-disable react/prop-types */
import { Modal, Form, Input, Button, Row, Col, message } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const EditReviewModal = ({
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
      name: record.name,
      description: record.description,
    });
  };

  const handleChangeStatus = async () => {
    setLoading(true);
    try {
      const updatedData = await axios.put(
        `${API_URL}/reviews/update/${record.id}`,
        { active: !record.active }
      );
      queryClient.setQueryData(["reviews", queryData], (oldData) => {
        if (!oldData || !oldData.data) return oldData;
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
      message.success("Запись успешно обновлена!");
      handleCancel();
    } catch (error) {
      message.error(
        `Ошибка: ${error?.response?.data?.message || "Неизвестная ошибка"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    const data = form.getFieldsValue();
    try {
      setLoading(true);

      const updatedData = await axios.put(
        `${API_URL}/reviews/update/${record.id}`,
        data
      );

      queryClient.setQueryData(["reviews", queryData], (oldData) => {
        if (!oldData || !oldData.data) return oldData;
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

      message.success("🎉 Город успешно обновлен!");

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
      title={isEditMode ? "Редактировать отзыв" : "Просмотр отзыва"}
      footer={null}
      maskClosable={false}
    >
      <Form form={form} layout="vertical" onFinish={handleUpdate}>
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="ФИО"
              rules={[{ required: true, message: "Введите ФИО" }]}
            >
              <Input disabled={!isEditMode} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              name="description"
              label="Описание"
              rules={[{ required: true, message: "Введите описание" }]}
            >
              <Input disabled={!isEditMode} />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ display: "flex", gap: 10 }}>
          {isEditMode ? (
            <>
              <Button type="primary" onClick={handleUpdate} loading={loading}>
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
              <Button
                type="primary"
                style={{ backgroundColor: record.active ? "red" : "green" }}
                onClick={handleChangeStatus}
              >
                {record.active ? "Архивировать" : "Активировать"}
              </Button>
            </>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default EditReviewModal;
