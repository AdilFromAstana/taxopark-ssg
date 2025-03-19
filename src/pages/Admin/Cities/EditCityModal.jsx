/* eslint-disable react/prop-types */
import { Modal, Form, Input, Button, Row, Col, message } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const EditCityModal = ({
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

  const handleChangeStatus = async () => {
    setLoading(true);
    try {
      const updatedData = await axios.put(
        `${API_URL}/cities/update/${record.id}`,
        { active: !record.active }
      );
      queryClient.setQueryData(["cities", queryData], (oldData) => {
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
      onClose();
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
        `${API_URL}/cities/update/${record.id}`,
        data
      );

      queryClient.setQueryData(["cities", queryData], (oldData) => {
        console.log("oldData: ", oldData);
        if (!oldData) return oldData;
        return oldData.map((item) => {
          if (item.id === record.id) {
            setSelectedRecord(updatedData.data);
            form.setFieldsValue(updatedData.data);
            return updatedData.data.user;
          } else {
            return item;
          }
        });
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
      title={isEditMode ? "Редактировать город" : "Просмотр города"}
      footer={null}
      closeIcon={false}
      maskClosable={false}
    >
      <Form form={form} layout="vertical" onFinish={handleUpdate}>
        <Row gutter={10}>
          <Col span={24}>
            <Form.Item
              name="title"
              label="Город"
              rules={[{ required: true, message: "Введите название" }]}
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
              <Button danger onClick={onClose} style={{ marginLeft: "auto" }}>
                Закрыть
              </Button>
            </>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default EditCityModal;
