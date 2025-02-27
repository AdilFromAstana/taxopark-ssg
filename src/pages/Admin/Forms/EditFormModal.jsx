/* eslint-disable react/prop-types */
import { Modal, Form, Input, Button, Select, Timeline, message } from "antd";
import axios from "axios";
import { useState, useEffect, memo } from "react";
import "./style.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const fetchAvailableStatuses = async ({ queryKey }) => {
  const [, formId] = queryKey;
  if (!formId) return [];
  const response = await axios.get(
    `${API_URL}/forms/${formId}/getAvailableStatusesById`
  );
  return response.data;
};

const fetchStatusHistory = async ({ queryKey }) => {
  const [, formId] = queryKey;
  if (!formId) return [];

  try {
    const response = await axios.get(
      `${API_URL}/forms/${formId}/statusHistory`
    );
    return response.data;
  } catch (error) {
    console.error("Ошибка при загрузке истории статусов:", error);
    throw new Error("Ошибка загрузки истории статусов");
  }
};

const API_URL = import.meta.env.VITE_API_URL;

const EditFormModal = memo(({ open, onClose, record }) => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [requiresReason, setRequiresReason] = useState(false);
  const status = Form.useWatch("status", form);
  const reason = Form.useWatch("reason", form);

  const { data: statusOptions = [], isFetching: isFetchingStatuses } = useQuery(
    {
      queryKey: ["availableStatuses", record?.id],
      queryFn: fetchAvailableStatuses,
      enabled: !!record?.id,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
    }
  );

  const { data: history = [] } = useQuery({
    queryKey: ["statusHistory", record?.id],
    queryFn: fetchStatusHistory,
    enabled: !!record?.id,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (record?.id) {
      form.setFieldsValue(record);
    }
  }, [record?.id]);

  const handleStatusChange = (value) => {
    const selectedStatus = statusOptions.find((s) => s.toStatus === value);
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
        `${API_URL}/forms/update/${record.id}/status`,
        payload
      );

      console.log("✅ Статус успешно обновлен:", response.data);
      message.success("🎉 Статус успешно обновлен!");
      queryClient.invalidateQueries(["statusHistory", record?.id]);
      queryClient.invalidateQueries(["availableStatuses", record?.id]);
      setRequiresReason(false);

      handleClose(); // Закрываем модальное окно
    } catch (error) {
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
        onFinish={handleUpdate}
        initialValues={record}
      >
        <Form.Item name="name" label="ФИО">
          <Input disabled />
        </Form.Item>
        <Form.Item name="phoneNumber" label="Номер телефона">
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
          <Timeline
            style={{ marginTop: 8 }}
            items={history?.map((item, index) => {
              const isLastItem = index === history.length - 1;

              return {
                key: item.id,
                className: isLastItem ? "blinking" : "",
                children: (
                  <div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span>
                        {item?.statusDetail?.title
                          ? item?.statusDetail?.title
                          : item?.newStatusCode}
                      </span>
                      <span>({new Date(item.createdAt).toLocaleString()})</span>
                    </div>
                    <div>
                      {item.reason && (
                        <div style={{ color: "#888" }}>
                          Причина: {item.reason}
                        </div>
                      )}
                    </div>
                  </div>
                ),
              };
            })}
          />
        </Form.Item>
        {statusOptions.length > 0 && (
          <Form.Item name="status" label="Сменить статус на">
            <Select
              disabled={!isEditMode || isFetchingStatuses}
              onChange={handleStatusChange}
              loading={isFetchingStatuses}
              allowClear
            >
              {statusOptions.map((status) => {
                return (
                  <Select.Option key={status.toStatus} value={status.toStatus}>
                    {status.toStatusDetail.title}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        )}
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

        {statusOptions.length > 0 && (
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
        )}
      </Form>
    </Modal>
  );
});

EditFormModal.displayName = "EditFormModal";

export default EditFormModal;
