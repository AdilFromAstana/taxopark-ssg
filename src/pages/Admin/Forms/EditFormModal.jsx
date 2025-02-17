/* eslint-disable react/prop-types */
import { Modal, Form, Input, Button, Select, Timeline, message } from "antd";
import axios from "axios";
import { useState, useEffect } from "react";
import "./style.css";

const statuses = {
  consultation: [
    {
      code: "registered",
      title: "Зарегистрирован",
      next: [
        {
          code: "sent_to_other_park",
          title: "Отправлен в другой парк",
          requires_reason: true,
        },
        { code: "thinking", title: "Клиент думает", requires_reason: false },
        {
          code: "no_answer",
          title: "Клиент не отвечает",
          requires_reason: false,
        },
        {
          code: "incorrect_data",
          title: "Неверные данные",
          requires_reason: true,
        },
        { code: "approved", title: "Подключен", requires_reason: false },
        { code: "rejected", title: "Отклонен", requires_reason: true },
      ],
    },
    {
      code: "sent_to_other_park",
      title: "Отправлен в другой парк",
      next: [
        { code: "approved", title: "Подключен", requires_reason: false },
        { code: "rejected", title: "Отклонен", requires_reason: true },
      ],
    },
    {
      code: "thinking",
      title: "Клиент думает",
      next: [
        { code: "approved", title: "Подключен", requires_reason: false },
        { code: "rejected", title: "Отклонен", requires_reason: true },
      ],
    },
    {
      code: "no_answer",
      title: "Клиент не отвечает",
      next: [
        {
          code: "registered",
          title: "Зарегистрирован",
          requires_reason: false,
        },
        { code: "rejected", title: "Отклонен", requires_reason: true },
      ],
    },
    {
      code: "incorrect_data",
      title: "Неверные данные",
      next: [
        {
          code: "registered",
          title: "Зарегистрирован",
          requires_reason: false,
        },
        { code: "rejected", title: "Отклонен", requires_reason: true },
      ],
    },
    {
      code: "approved",
      title: "Подключен",
      next: [],
    },
    {
      code: "rejected",
      title: "Отклонен",
      next: [],
    },
  ],
  taxiPark: [
    {
      code: "registered",
      title: "Ожидание обработки",
      next: [
        {
          code: "sent_to_partner",
          title: "Отправлен партнеру",
          requires_reason: false,
        },
      ],
    },
    {
      code: "sent_to_partner",
      title: "Отправлен партнеру",
      next: [
        {
          code: "partner_error",
          title: "Ошибка при отправке партнеру",
          requires_reason: true,
        },
        { code: "approved", title: "Подключен", requires_reason: false },
        { code: "rejected", title: "Отклонен", requires_reason: true },
      ],
    },
    {
      code: "partner_error",
      title: "Ошибка при отправке партнеру",
      next: [
        {
          code: "registered",
          title: "Зарегистрирован",
          requires_reason: false,
        },
        { code: "rejected", title: "Отклонен", requires_reason: true },
      ],
    },
    {
      code: "approved",
      title: "Подключен",
      next: [],
    },
    {
      code: "rejected",
      title: "Отклонен",
      next: [],
    },
  ],
};

const API_URL = import.meta.env.VITE_API_URL;

const EditFormModal = ({ open, onClose, record }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [statusOptions, setStatusOptions] = useState([]);
  const [requiresReason, setRequiresReason] = useState(false);
  const [history, setHistory] = useState([]);
  const status = Form.useWatch("status", form);
  const reason = Form.useWatch("reason", form);

  const fetchStatusHistory = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/forms/${record.id}/statusHistory`
      );
      setHistory(response.data);
    } catch (error) {
      console.error("Ошибка при загрузке истории статусов:", error);
    }
  };

  useEffect(() => {
    if (record?.id) {
      fetchStatusHistory();
    }
  }, [record?.id]);

  useEffect(() => {
    if (record?.statusCode) {
      const currentStatus = statuses.taxiPark.find(
        (s) => s.code === record.statusCode
      );
      if (currentStatus) {
        setStatusOptions(currentStatus.next);
      }
    }
  }, [record?.statusCode]);

  const handleStatusChange = (value) => {
    const selectedStatus = statusOptions.find((s) => s.code === value);
    setRequiresReason(selectedStatus?.requires_reason || false);
  };

  const handleUpdate = async () => {
    const data = form.getFieldsValue();
    try {
      setLoading(true);
      if (requiresReason && !data.reason) {
        message.error("❌ Введите причину смены статуса!");
        return;
      }
      const payload = { newStatusCode: data.status };
      if (requiresReason) {
        payload.reason = data.reason;
      }
      const response = await axios.put(
        `${API_URL}/forms/${record.id}/status`,
        payload
      );

      console.log("✅ Статус успешно обновлен:", response.data);
      message.success("🎉 Статус успешно обновлен!");

      handleClose(); // Закрываем модальное окно
    } catch (error) {
      console.error("❌ Ошибка при обновлении статуса:", error);
      message.error(
        `Ошибка обновления: ${
          error.response?.data?.message || "Неизвестная ошибка"
        }`
      );
    } finally {
      setLoading(false);
      console.log("🔽 Завершение обновления статуса.");
    }
  };

  const handleClose = () => {
    form.resetFields();
    setIsEditMode(false);
    onClose();
  };

  const resetStatusAndReason = () => {
    form.setFieldValue("status", undefined);
    form.setFieldValue("reason", undefined);
  };

  const isUpdateButtonDisabled = requiresReason ? !(status && reason) : !status;

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title="Просмотр и редактирование"
      footer={null}
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={record}
        onFinish={handleUpdate}
      >
        <Form.Item name="name" label="ФИО">
          <Input disabled />
        </Form.Item>
        <Form.Item name="phoneNumber" label="Номер">
          <Input disabled />
        </Form.Item>
        <Form.Item name="formType" label="Тип заявки">
          <Input disabled />
        </Form.Item>
        {record.parkId && (
          <Form.Item name={["Park", "title"]} label="Таксопарк">
            <Input disabled />
          </Form.Item>
        )}
        <Form.Item label="История изменений статуса">
          <Timeline style={{ marginTop: 8 }}>
            {history.map((item, index) => {
              const newStatus = statuses[record?.formType]?.find(
                (s) => s.code === item.newStatusCode
              );
              const isLastItem = index === history.length - 1;
              return (
                <Timeline.Item
                  key={item.id}
                  className={isLastItem ? "blinking" : ""}
                >
                  {newStatus ? newStatus.title : item.newStatusCode} (
                  {new Date(item.createdAt).toLocaleString()})
                  {item.reason && (
                    <div style={{ color: "#888" }}>Причина: {item.reason}</div>
                  )}
                </Timeline.Item>
              );
            })}
          </Timeline>
        </Form.Item>
        <Form.Item name="status" label="Сменить статус на">
          <Select
            disabled={!isEditMode}
            onChange={handleStatusChange}
            allowClear
          >
            {statusOptions.map((status) => (
              <Select.Option key={status.code} value={status.code}>
                {status.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        {requiresReason && (
          <Form.Item
            name="reason"
            label="Причина смены статуса"
            rules={[{ required: true, message: "Введите причину!" }]}
          >
            <Input.TextArea
              disabled={!isEditMode}
              rows={3}
              placeholder="Введите причину смены статуса"
            />
          </Form.Item>
        )}

        <div
          style={{
            marginTop: "16px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {isEditMode ? (
            <>
              <Button
                type="primary"
                onClick={handleUpdate}
                loading={loading}
                disabled={isUpdateButtonDisabled}
              >
                Сохранить
              </Button>
              <Button
                onClick={() => {
                  setIsEditMode(false);
                  resetStatusAndReason();
                  handleStatusChange(undefined);
                }}
                danger
              >
                Отмена
              </Button>
            </>
          ) : (
            <Button type="primary" onClick={() => setIsEditMode(true)}>
              Обновить статус
            </Button>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default EditFormModal;
