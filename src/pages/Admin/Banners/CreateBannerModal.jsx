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
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const CreateBannerModal = ({ open, onClose, queryClient, queryData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", values.title);
      if (values.link) {
        formData.append("link", values.link);
      }
      if (fileList.length > 0) {
        formData.append("file", fileList[0].originFileObj);
      }

      const response = await axios.post(`${API_URL}/banners`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Успешный ответ сервера:", response.data);
      message.success("🎉 Баннер успешно создан!");

      queryClient.setQueryData(["parks", queryData], (oldData) => {
        if (!oldData || !oldData.data) return oldData;
        return { ...oldData, data: [...oldData.data, data.data.dataValues] };
      });
      onClose();
      form.resetFields(); // Очистка формы
      setFileList([]);
    } catch (error) {
      console.error("❌ Ошибка при создании записи:", error);
      message.error(
        `Ошибка при создании: ${
          error.response?.data?.message || "Неизвестная ошибка"
        }`
      );
    } finally {
      setLoading(false);
      console.log("🔽 Завершение создания.");
    }
  };

  const handleChange = ({ fileList }) => {
    setFileList(fileList);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Создать баннера"
      footer={null}
      maskClosable={false}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="title"
              label="Заголовок"
              rules={[{ required: true, message: "Введите заголовок" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="link" label="Ссылка">
              <Input />
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
              <Upload
                name="file"
                listType="picture-card"
                showUploadList={true}
                fileList={fileList}
                beforeUpload={() => false} // Предотвращает автоматическую загрузку
                onChange={handleChange}
                onPreview={(file) => {
                  setPreviewImage(file.url || file.thumbUrl);
                  setPreviewOpen(true);
                }}
                onRemove={(file) => {
                  Modal.confirm({
                    title: "Вы действительно хотите удалить изображение?",
                    content: "Это действие нельзя отменить.",
                    okText: "Удалить",
                    cancelText: "Отмена",
                    onOk: () => {
                      setFileList((prevList) =>
                        prevList.filter((item) => item.uid !== file.uid)
                      );
                      message.success("Изображение удалено");
                    },
                  });
                  return false;
                }}
              >
                {fileList.length === 0 && <UploadOutlined />}
              </Upload>
              {previewImage && (
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
          <Button type="primary" htmlType="submit" loading={loading}>
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

export default CreateBannerModal;
