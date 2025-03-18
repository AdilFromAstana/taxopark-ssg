/* eslint-disable react/prop-types */
import {
  Modal,
  Form,
  Input,
  Button,
  Row,
  Col,
  message,
  Upload,
  Image,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { UploadOutlined } from "@ant-design/icons";

const API_URL = import.meta.env.VITE_API_URL;

const EditBannerModal = ({
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
  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (record?.bannerUrl) {
      setFileList([
        {
          uid: "-1",
          name: "image",
          status: "done",
          url: `${API_URL}/uploads/${record?.bannerUrl}`,
        },
      ]);
      setPreviewImage(`${API_URL}/uploads/${record?.bannerUrl}`);
    } else {
      setFileList([]);
    }
    form.setFieldsValue(record);
  }, [record]);

  const handleChangeStatus = async () => {
    setLoading(true);
    try {
      const updatedData = await axios.put(
        `${API_URL}/banners/update/${record.id}`,
        { active: !record.active }
      );
      queryClient.setQueryData(["banners", queryData], (oldData) => {
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

  const handleCancel = () => {
    setIsEditMode(false);
    form.setFieldsValue(record);
    onClose();
  };

  const handleUpdate = async () => {
    const data = form.getFieldsValue();
    try {
      setLoading(true);

      const updatedData = await axios.put(
        `${API_URL}/banners/update/${record.id}`,
        data
      );

      queryClient.setQueryData(["banners", queryData], (oldData) => {
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

      message.success("🎉 Баннер успешно обновлен!");

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

  const handleChange = ({ fileList }) => {
    setFileList(Array.isArray(fileList) ? fileList : []);
    if (fileList.length > 0) {
      setPreviewImage(fileList[0].url || fileList[0].thumbUrl);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={isEditMode ? "Редактировать баннер" : "Просмотр баннера"}
      footer={null}
      maskClosable={false}
      closeIcon={false}
    >
      <Form form={form} layout="vertical" onFinish={handleUpdate}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="title"
              label="Заголовок"
              rules={[{ required: true, message: "Введите заголовок" }]}
            >
              <Input disabled={!isEditMode} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="link"
              label="Ссылка"
              rules={[{ type: "url", message: "Введите корректный URL" }]}
            >
              <Input disabled={!isEditMode} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="image"
              label="Изображение"
              valuePropName="fileList"
            >
              {previewImage ? (
                <Image
                  src={previewImage}
                  style={{ width: "100%", marginBottom: 10 }}
                  preview={{
                    visible: previewOpen,
                    onVisibleChange: setPreviewOpen,
                  }}
                />
              ) : (
                <Upload.Dragger
                  name="file"
                  multiple={false}
                  fileList={fileList}
                  isImageUrl={record?.bannerUrl}
                  beforeUpload={() => false}
                  onChange={handleChange}
                >
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag file to this area to upload
                  </p>
                  <p className="ant-upload-hint">
                    Support for a single upload only.
                  </p>
                </Upload.Dragger>
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
              <Button
                type="primary"
                style={{ backgroundColor: record.active ? "red" : "green" }}
                onClick={handleChangeStatus}
              >
                {record.active ? "Архивировать" : "Активировать"}
              </Button>
              <Button
                danger
                onClick={handleCancel}
                style={{ marginLeft: "auto" }}
              >
                Закрыть
              </Button>
            </>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default EditBannerModal;
