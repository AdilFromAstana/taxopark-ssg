/* eslint-disable react/prop-types */
import {
  Modal,
  Form,
  Input,
  Button,
  InputNumber,
  Row,
  Col,
  TimePicker,
  Rate,
  Radio,
  Select,
  message,
  Upload,
  Image,
} from "antd";
import axios from "axios";
import moment from "moment";
import { memo, useEffect, useState } from "react";
const { RangePicker } = TimePicker;
import { UploadOutlined } from "@ant-design/icons";

const API_URL = import.meta.env.VITE_API_URL;

const EditParkModal = memo(
  ({ open, onClose, record, cities = [], queryClient, queryData, setSelectedRecord }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [radioValues, setRadioValues] = useState({});
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(false);

    const handleImageUpload = async (info) => {
      if (info.file.status === "uploading") return;

      if (info.file.status === "done") {
        message.success("Файл успешно загружен!");
        queryClient.setQueryData(["parks", queryData], (oldData) => {
          if (!oldData || !oldData.data) return oldData;

          return {
            ...oldData,
            data: oldData.data.map(item => {
              if (item.id === record.id) {
                setSelectedRecord({ ...item, imageUrl: info.file.response })
                return { ...item, imageUrl: info.file.response }
              } else {
                return item
              }
            }
            ),
          };
        });

      } else if (info.file.status === "error") {
        message.error("Ошибка загрузки файла");
      }
    };

    const handleClose = () => {
      form.resetFields();
      onClose();
    };

    const handleCancel = () => {
      setIsEditMode(false);
      form.setFieldsValue({
        ...record,
        supportWorkTime:
          record?.supportAlwaysAvailable === false
            ? [
              moment(record?.supportStartWorkTime, "HH:mm"),
              moment(record?.supportEndWorkTime, "HH:mm"),
            ]
            : [],
      });
    };

    useEffect(() => {
      if (open && record) {
        form.setFieldsValue({
          ...record,
          supportWorkTime:
            record?.supportStartWorkTime && record?.supportEndWorkTime
              ? [
                moment(record.supportStartWorkTime, "HH:mm"),
                moment(record.supportEndWorkTime, "HH:mm"),
              ]
              : [],
        });
        setRadioValues({
          parkEntrepreneurSupport: record?.parkEntrepreneurSupport ?? null,
          entrepreneurSupport: record?.entrepreneurSupport ?? null,
        });
      }
    }, [open, record]);

    const handleUpdate = async () => {
      const data = form.getFieldsValue();
      try {
        setLoading(true);
        const updatedData = await axios.put(`${API_URL}/parks/update/${record.id}`, data);
        queryClient.setQueryData(["parks", queryData], (oldData) => {
          if (!oldData || !oldData.data) return oldData;
          return {
            ...oldData,
            data: oldData.data.map(item => {
              if (item.id === record.id) {
                setSelectedRecord(updatedData.data)
                form.setFieldsValue(updatedData.data)
                return updatedData.data
              } else {
                return item
              }
            }
            ),
          };
        });
        message.success("Запись успешно обновлена!");
        setIsEditMode((prev) => !prev);
        handleClose();
      } catch (error) {
        message.error(
          `Ошибка: ${error?.response?.data?.message || "Неизвестная ошибка"}`
        );
      } finally {
        setLoading(false);
      }
    };

    const toggleRadioValue = (name, value) => {
      setRadioValues((prev) => {
        const newValue = prev[name] === value ? null : value;
        form.setFieldsValue({ [name]: newValue });
        return { ...prev, [name]: newValue };
      });
    };

    return (
      <Modal
        open={open}
        title="Редактировать запись"
        footer={null}
        width="75vw"
        maskClosable={false}
        closeIcon={false}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="title"
                label="Название парка"
                rules={[{ required: true }]}
              >
                <Input disabled={!isEditMode} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="cityId"
                label="Город"
                rules={[{ required: true, message: "Выберите город!" }]}
              >
                <Select disabled={!isEditMode} placeholder="Выберите город">
                  {cities.map((city) => (
                    <Select.Option key={city.id} value={city.id}>
                      {city.title}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="parkCommission"
                label="Комиссия парка"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: "100%" }}
                  disabled={!isEditMode}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="commissionWithdraw" label="Комиссия за вывод">
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: "100%" }}
                  disabled={!isEditMode}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="transferPaymentCommission"
                label="Комиссия за перевод"
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: "100%" }}
                  disabled={!isEditMode}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="parkPromotions" label="Акции и бонусы">
                <Select
                  maxTagCount={1}
                  disabled={!isEditMode}
                  allowClear
                  mode="multiple"
                  options={[
                    { label: "Гарантированные бонусы", value: 1 },
                    { label: "Приветственные бонусы", value: 2 },
                    { label: "Розыгрыш", value: 3 },
                    { label: "Бонус за активность", value: 4 },
                    { label: "Приведи друга", value: 5 },
                  ]}
                  min={0}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="averageCheck"
                label="Средний чек"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  disabled={!isEditMode}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="rating" label="Рейтинг">
                <Rate allowHalf disabled={!isEditMode} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="yandexGasStation" label="Яндекс Заправка">
                <Radio.Group
                  value={radioValues.yandexGasStation}
                  disabled={!isEditMode}
                >
                  <Radio
                    onClick={() => toggleRadioValue("yandexGasStation", true)}
                    value={true}
                  >
                    Да
                  </Radio>
                  <Radio
                    onClick={() => toggleRadioValue("yandexGasStation", false)}
                    value={false}
                  >
                    Нет
                  </Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="parkEntrepreneurSupport"
                label="Поддержка предпринимателей в парке"
              >
                <Radio.Group
                  value={radioValues.parkEntrepreneurSupport}
                  disabled={!isEditMode}
                >
                  <Radio
                    value={true}
                    onClick={() =>
                      toggleRadioValue("parkEntrepreneurSupport", true)
                    }
                  >
                    Да
                  </Radio>
                  <Radio
                    value={false}
                    onClick={() =>
                      toggleRadioValue("parkEntrepreneurSupport", false)
                    }
                  >
                    Нет
                  </Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="entrepreneurSupport"
                label="Общая поддержка предпринимателей"
              >
                <Radio.Group
                  value={radioValues.entrepreneurSupport}
                  disabled={!isEditMode}
                >
                  <Radio
                    onClick={() =>
                      toggleRadioValue("entrepreneurSupport", true)
                    }
                    value={true}
                  >
                    Да
                  </Radio>
                  <Radio
                    onClick={() =>
                      toggleRadioValue("entrepreneurSupport", false)
                    }
                    value={false}
                  >
                    Нет
                  </Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="accountantSupport"
                label="Бухгалтерская поддержка"
              >
                <Radio.Group
                  value={radioValues.accountantSupport}
                  disabled={!isEditMode}
                >
                  <Radio
                    onClick={() => toggleRadioValue("accountantSupport", true)}
                    value={true}
                  >
                    Да
                  </Radio>
                  <Radio
                    onClick={() => toggleRadioValue("accountantSupport", false)}
                    value={false}
                  >
                    Нет
                  </Radio>
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
                  action={`${API_URL}/parks/uploadImage/${form.getFieldValue("id")}`}
                  onChange={handleImageUpload}
                  showUploadList={true}
                  fileList={
                    record?.imageUrl
                      ? [{ uid: "1", name: "image", status: "done", url: `${API_URL}/uploads/${record?.imageUrl}` }]
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
                        fetch(`${API_URL}/parks/deleteImage/${record.id}`, {
                          method: "DELETE",
                        })
                          .then((res) => res.json())
                          .then(() => {
                            message.success("Изображение удалено");
                            queryClient.setQueryData(["parks", queryData], (oldData) => {
                              if (!oldData || !oldData.data) return oldData;
                              return {
                                ...oldData,
                                data: oldData.data.map(item => {
                                  if (item.id === record.id) {
                                    setSelectedRecord({ ...item, imageUrl: null })
                                    return { ...item, imageUrl: null }
                                  } else {
                                    return item
                                  }
                                }
                                ),
                              };
                            });
                          })
                          .catch((error) => {
                            console.error("Ошибка при удалении изображения:", error);
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
                      afterOpenChange: (visible) => !visible && setPreviewImage(""),
                    }}
                    src={previewImage}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="supportAlwaysAvailable"
                label="Круглосуточная поддержка"
              >
                <Radio.Group
                  value={radioValues.supportAlwaysAvailable}
                  disabled={!isEditMode}
                >
                  <Radio
                    onClick={() =>
                      toggleRadioValue("supportAlwaysAvailable", true)
                    }
                    value={true}
                  >
                    Да
                  </Radio>
                  <Radio
                    onClick={() =>
                      toggleRadioValue("supportAlwaysAvailable", false)
                    }
                    value={false}
                  >
                    Нет
                  </Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            {form.getFieldValue("supportAlwaysAvailable") === false && (
              <Col span={8}>
                <Form.Item
                  name="supportWorkTime"
                  label="Рабочее время поддержки"
                  rules={[
                    { required: true, message: "Выберите рабочее время!" },
                  ]}
                >
                  <RangePicker
                    format="HH:mm"
                    minuteStep={15}
                    placeholder={["Начало", "Конец"]}
                    disabled={!isEditMode}
                  />
                </Form.Item>
              </Col>
            )}
          </Row>
          {isEditMode ? (
            <>
              <Button type="primary" onClick={handleUpdate} loading={loading}>
                Сохранить
              </Button>
              <Button
                type="default"
                onClick={handleCancel}
                style={{ marginLeft: 8 }}
              >
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
                danger
                onClick={handleClose}
                style={{ marginLeft: 8 }}
              >
                Закрыть
              </Button>
            </>
          )}
        </Form>
      </Modal>
    );
  }
);

EditParkModal.displayName = "EditParkModal";

export default EditParkModal;
