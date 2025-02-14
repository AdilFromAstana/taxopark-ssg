import { Modal, Form, Input, Button, Select, Timeline, message } from "antd";
import axios from "axios";
import { useState, useEffect } from "react";

const statuses = {
  consultation: [
    {
      code: "pending",
      title: "Ожидание обработки",
      next: [
        {
          code: "registered",
          title: "Зарегистрирован",
          requires_reason: false,
        },
      ],
    },
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
      code: "pending",
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

const EditFormModal = ({ open, onClose, record, refreshData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [statusOptions, setStatusOptions] = useState([]);
  const [requiresReason, setRequiresReason] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (record?.id) {
      fetchStatusHistory();
    }
  }, [record]);

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

  // Загружаем доступные статусы для текущего статуса
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

  // Проверяем, нужен ли ввод причины
  const handleStatusChange = (value) => {
    const selectedStatus = statusOptions.find((s) => s.code === value);
    setRequiresReason(selectedStatus?.requires_reason || false);
  };

  const handleUpdate = async (values) => {
    try {
      setLoading(true);

      const payload = { newStatusCode: values.status };
      if (requiresReason) {
        if (!values.reason) {
          message.error("Введите причину смены статуса!");
          return;
        }
        payload.reason = values.reason;
      }

      await axios.put(`${API_URL}/forms/${record.id}/status`, payload);
      refreshData();
      handleClose();
    } catch (error) {
      console.error("Ошибка при обновлении статуса:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields(); // ✅ Сбрасываем поля формы
    setIsEditMode(false); // ✅ Выключаем режим редактирования
    onClose(); // ✅ Закрываем модальное окно
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title="Просмотр и редактирование"
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={record}
        onFinish={handleUpdate}
      >
        <Form.Item name="name" label="ФИО">
          <Input disabled={!isEditMode} />
        </Form.Item>
        <Form.Item name="phoneNumber" label="Номер">
          <Input disabled={!isEditMode} />
        </Form.Item>
        <Form.Item name="status" label="Статус">
          <Select disabled={!isEditMode} onChange={handleStatusChange}>
            {statusOptions.map((status) => (
              <Select.Option key={status.code} value={status.code}>
                {status.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Поле для причины, если требуется */}
        {requiresReason && (
          <Form.Item
            name="reason"
            label="Причина смены статуса"
            rules={[{ required: true, message: "Введите причину!" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Введите причину смены статуса"
            />
          </Form.Item>
        )}

        {/* История изменений статуса */}
        <div style={{ marginTop: "16px" }}>
          <h3>История изменений статуса</h3>
          <Timeline>
            {history.map((item) => {
              const newStatus = statuses[record?.formType]?.find(
                (s) => s.code === item.newStatusCode
              );
              return (
                <Timeline.Item key={item.id}>
                  {newStatus ? newStatus.title : item.newStatusCode} (
                  {new Date(item.createdAt).toLocaleString()})
                  {item.reason && (
                    <div style={{ color: "#888" }}>Причина: {item.reason}</div>
                  )}
                </Timeline.Item>
              );
            })}
          </Timeline>
        </div>

        <div
          style={{
            marginTop: "16px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {isEditMode ? (
            <>
              <Button onClick={() => setIsEditMode(false)}>Отмена</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Сохранить
              </Button>
            </>
          ) : (
            <Button type="primary" onClick={() => setIsEditMode(true)}>
              Редактировать
            </Button>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default EditFormModal;
