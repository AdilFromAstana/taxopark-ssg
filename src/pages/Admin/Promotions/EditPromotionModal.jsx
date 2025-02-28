/* eslint-disable react/prop-types */
import {
  Modal,
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Radio,
  Row,
  Col,
  message,
  Upload,
  Image,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import moment from "moment";
import { UploadOutlined } from "@ant-design/icons";

const API_URL = import.meta.env.VITE_API_URL;

const EditPromotionModal = ({
  open,
  onClose,
  record,
  parks = [],
  queryClient,
  queryData,
  setSelectedRecord,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(false);

  const handleImageUpload = async (info) => {
    if (info.file.status === "uploading") return;

    if (info.file.status === "done") {
      message.success("Файл успешно загружен!");
      queryClient.setQueryData(["promotions", queryData], (oldData) => {
        if (!oldData || !oldData.data) return oldData;

        return {
          ...oldData,
          data: oldData.data.map((item) => {
            if (item.id === record.id) {
              setSelectedRecord({ ...item, imageUrl: info.file.response });
              return { ...item, imageUrl: info.file.response };
            } else {
              return item;
            }
          }),
        };
      });
    } else if (info.file.status === "error") {
      message.error("Ошибка загрузки файла");
    }
  };

  useEffect(() => {
    if (open && record) {
      form.setFieldsValue({
        ...record,
        expires: record.expires ? moment(record.expires) : null,
      });
    }
  }, [record, open]);

  const handleCancel = () => {
    setIsEditMode(false);
    form.setFieldsValue({
      title: record.title,
      parkId: record.parkId,
      description: record.description,
      expires: record.expires ? moment(record.expires) : null,
      active: record.active,
    });
  };

  const handleUpdate = async () => {
    const data = form.getFieldsValue();
    try {
      setLoading(true);

      const updatedData = await axios.put(
        `${API_URL}/promotions/update/${record.id}`,
        data
      );

      queryClient.setQueryData(["promotions", queryData], (oldData) => {
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

      message.success("🎉 Промо-акция успешно обновлена!");

      setIsEditMode(false);
      onClose();
    } catch (error) {
      console.error("❌ Ошибка при обновлении:", error);
      message.error(
        `Ошибка при обновлении акции: ${
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
      title={isEditMode ? "Редактировать промо-акцию" : "Просмотр промо-акции"}
      footer={null}
      width="50vw"
      maskClosable={false}
    >
      <Form form={form} layout="vertical" onFinish={handleUpdate}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="title"
              label="Название акции"
              rules={[{ required: true, message: "Введите название" }]}
            >
              <Input disabled={!isEditMode} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="parkId"
              label="Таксопарк"
              rules={[{ required: true, message: "Выберите таксопарк" }]}
            >
              <Select disabled={!isEditMode} placeholder="Выберите таксопарк">
                {parks.map((park) => (
                  <Select.Option key={park.id} value={park.id}>
                    {park.title}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="highPriority" label="Закрепить">
              <Select disabled={!isEditMode} placeholder="Выберите значение" allowClear>
                <Select.Option value={true}>Да</Select.Option>
                <Select.Option value={false}>Нет</Select.Option>
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
              <Input.TextArea rows={4} disabled={!isEditMode} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="expires" label="Дата истечения">
              <DatePicker
                format="DD.MM.YYYY"
                style={{ width: "100%" }}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="active" label="Активность">
              <Radio.Group disabled={!isEditMode}>
                <Radio value={true}>Активно</Radio>
                <Radio value={false}>Неактивно</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="image"
              label="Изображение парка"
              valuePropName="fileList"
              getValueFromEvent={(e) => e && e.fileList}
            >
              <Upload
                name="file"
                listType="picture-card"
                action={`${API_URL}/promotions/uploadImage/${record.id}`}
                onChange={handleImageUpload}
                showUploadList={true}
                fileList={
                  record?.imageUrl
                    ? [
                        {
                          uid: "1",
                          name: "image",
                          status: "done",
                          url: `${API_URL}/uploads/${record?.imageUrl}`,
                        },
                      ]
                    : []
                }
                onPreview={() => {
                  setPreviewImage(`${API_URL}/uploads/${record?.imageUrl}`);
                  setPreviewOpen(true);
                }}
                onRemove={() => {
                  Modal.confirm({
                    title: "Вы действительно хотите удалить изображение?",
                    content: "Это действие нельзя отменить.",
                    okText: "Удалить",
                    cancelText: "Отмена",
                    onOk: () => {
                      fetch(`${API_URL}/promotions/deleteImage/${record.id}`, {
                        method: "DELETE",
                      })
                        .then((res) => res.json())
                        .then(() => {
                          message.success("Изображение удалено");
                          queryClient.setQueryData(
                            ["promotions", queryData],
                            (oldData) => {
                              if (!oldData || !oldData.data) return oldData;
                              return {
                                ...oldData,
                                data: oldData.data.map((item) => {
                                  if (item.id === record.id) {
                                    setSelectedRecord({
                                      ...item,
                                      imageUrl: null,
                                    });
                                    return { ...item, imageUrl: null };
                                  } else {
                                    return item;
                                  }
                                }),
                              };
                            }
                          );
                        })
                        .catch((error) => {
                          console.error(
                            "Ошибка при удалении изображения:",
                            error
                          );
                          message.error("Не удалось удалить изображение");
                        });
                    },
                  });
                  return false; // предотвращаем автоматическое удаление до подтверждения
                }}
              >
                {!record?.imageUrl && <UploadOutlined />}
              </Upload>
              {record?.imageUrl && (
                <Image
                  wrapperStyle={{ display: "none" }}
                  preview={{
                    visible: previewOpen,
                    onVisibleChange: (visible) => setPreviewOpen(visible),
                    afterOpenChange: (visible) =>
                      !visible && setPreviewImage(""),
                  }}
                  src={previewImage}
                />
              )}
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

export default EditPromotionModal;
