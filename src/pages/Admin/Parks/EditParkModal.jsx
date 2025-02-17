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
} from "antd";
import axios from "axios";
import moment from "moment";
import { memo, useEffect, useState } from "react";
const { RangePicker } = TimePicker;

const API_URL = import.meta.env.VITE_API_URL;

const EditParkModal = memo(
  ({ open, onClose, record, cities = [], queryClient }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [radioValues, setRadioValues] = useState({});

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
        await axios.put(`${API_URL}/parks/${record.id}`, data);
        queryClient.refetchQueries("parks");
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

    console.log("record: ", record);
    console.log("form.getFieldsValue(): ", form.getFieldsValue());

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
              <Form.Item name="paymentType" label="Тип оплаты">
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  disabled={!isEditMode}
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
