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
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import moment from "moment";

const API_URL = import.meta.env.VITE_API_URL;

const EditPromotionModal = ({ open, onClose, record, parks }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        title: record.title,
        parkId: record.parkId,
        description: record.description,
        expires: record.expires ? moment(record.expires) : null,
        active: record.active,
      });
    }
  }, [record, form]);

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
      console.log("🔄 Начало обновления...");

      // let imageUrl = record.imageUrl;

      // if (fileList.length > 0 && fileList[0].originFileObj) {
      //   console.log("📤 Загрузка файла...");
      // const formData = new FormData();
      // formData.append("file", fileList[0].originFileObj);

      // const uploadResponse = await axios.post(`${API_URL}/upload`, formData);
      // imageUrl = uploadResponse?.data?.url;

      // console.log("✅ Файл загружен:", imageUrl);
      // }

      console.log("📡 Отправка обновленных данных...");
      const response = await axios.put(`${API_URL}/promotions/${record.id}`, {
        ...data,
        // imageUrl,
      });

      console.log("✅ Успешный ответ сервера:", response.data);
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
          <Col span={12}>
            <Form.Item
              name="title"
              label="Название акции"
              rules={[{ required: true, message: "Введите название" }]}
            >
              <Input disabled={!isEditMode} />
            </Form.Item>
          </Col>
          <Col span={12}>
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

        {/* <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="imageUrl" label="Заменить изображение">
              <Upload
                fileList={fileList}
                beforeUpload={() => false}
                onChange={({ fileList }) => setFileList(fileList)}
                maxCount={1}
                disabled={!isEditMode}
              >
                <Button icon={<UploadOutlined />} disabled={!isEditMode}>
                  Выбрать файл
                </Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row> */}

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
