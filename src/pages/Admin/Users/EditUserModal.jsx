/* eslint-disable react/prop-types */
import {
  Modal,
  Form,
  Input,
  Button,
  Row,
  Col,
  message,
  Select,
  Tooltip,
  Space,
} from "antd";
import axios from "axios";
import { useState } from "react";
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  CopyOutlined,
} from "@ant-design/icons";

const API_URL = import.meta.env.VITE_API_URL;

const EditUserModal = ({
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

  const [visible, setVisible] = useState(false);

  const toggleVisibility = () => setVisible((prev) => !prev);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(record.password);
      message.success("Пароль скопирован!");
    } catch (err) {
      message.error("Ошибка при копировании", err);
    }
  };

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
        `${API_URL}/users/update/${record.id}`,
        data
      );

      queryClient.setQueryData(["users", queryData], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((item) => {
          if (item.id === record.id) {
            setSelectedRecord(updatedData.data.user);
            form.setFieldsValue(updatedData.data.user);
            return updatedData.data.user;
          } else {
            return item;
          }
        });
      });

      message.success("🎉 Пользователь успешно обновлен!");

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

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        isEditMode ? "Редактировать пользователя" : "Просмотр пользователя"
      }
      footer={null}
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleUpdate}
        initialValues={record}
      >
        <Row gutter={16}>
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
              <Input disabled={!isEditMode} />
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
                disabled={!isEditMode}
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
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Пароль" name="decryptPassword">
              <Input
                id="password-input"
                readOnly
                type={visible ? "text" : "password"}
                suffix={
                  <Space>
                    <Tooltip title={visible ? "Скрыть" : "Показать"}>
                      <Button
                        type="text"
                        icon={
                          visible ? <EyeInvisibleOutlined /> : <EyeOutlined />
                        }
                        onClick={toggleVisibility}
                      />
                    </Tooltip>
                    <Tooltip title="Копировать">
                      <Button
                        type="text"
                        icon={<CopyOutlined />}
                        onClick={handleCopy}
                      />
                    </Tooltip>
                  </Space>
                }
              />
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
              <Button type="default" danger onClick={onClose}>
                Закрыть
              </Button>
            </>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default EditUserModal;
