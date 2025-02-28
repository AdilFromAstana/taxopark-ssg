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
  Flex,
  message,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import { useState } from "react";
const { RangePicker } = TimePicker;
const API_URL = import.meta.env.VITE_API_URL;

const { TextArea } = Input;

const CreateParkModal = ({
  open,
  onClose,
  cities = [],
  queryClient,
  queryData,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [radioValues, setRadioValues] = useState({});

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const data = await axios.post(`${API_URL}/parks/create`, values);

      message.success("Запись успешно создана!");
      queryClient.setQueryData(["parks", queryData], (oldData) => {
        console.log("oldData: ", oldData);
        console.log("oldData.data: ", oldData.data);
        if (!oldData || !oldData.data) return oldData;
        return { ...oldData, data: [...oldData.data, data.data.dataValues] };
      });
      onClose();
      form.resetFields();
      setRadioValues({});
    } catch (error) {
      console.error("Ошибка при создании записи:", error);

      message.error("Не удалось создать запись. Попробуйте снова."); // Уведомление об ошибке
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
      onCancel={onClose}
      title="Создать парк"
      footer={null}
      width="75vw"
      maskClosable={false}
      closeIcon={false}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="title"
              label="Название парка"
              rules={[
                {
                  required: true,
                  message: "Пожалуйста, укажите название парка!",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="cityIds"
              label="Города"
              rules={[{ required: true, message: "Выберите город!" }]}
            >
              <Select
                placeholder="Выберите город"
                mode="multiple"
                maxTagCount={1}
              >
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
              name="email"
              label="Email"
              rules={[{ required: false, type: "email" }]}
            >
              <Input type="email" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="parkCommission"
              label="Комиссия парка %"
              rules={[
                {
                  required: true,
                  message: "Пожалуйста, укажите комиссию парка!",
                },
                () => ({
                  validator(_, value) {
                    if (value > 0) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Комиссию парка должна быть больше 0!")
                    );
                  },
                }),
              ]}
            >
              <InputNumber min={0} max={100} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="commissionWithdraw" label="Комиссия за вывод %">
              <InputNumber min={0} max={100} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="averageCheck"
              label="Средний чек"
              rules={[
                {
                  required: true,
                  message: "Пожалуйста, укажите средний чек!",
                },
                () => ({
                  validator(_, value) {
                    if (value > 0) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Средний чек должен быть больше 0!")
                    );
                  },
                }),
              ]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="rating" label="Рейтинг">
              <Rate allowHalf />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="yandexGasStation" label="Яндекс Заправка">
              <Radio.Group value={radioValues.yandexGasStation}>
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
          <Col span={8}>
            <Form.Item
              name="isPartner"
              label="Партнер"
              rules={[{ required: true }]}
            >
              <Radio.Group value={radioValues.isPartner}>
                <Radio
                  onClick={() => toggleRadioValue("isPartner", true)}
                  value={true}
                >
                  Да
                </Radio>
                <Radio
                  onClick={() => toggleRadioValue("isPartner", false)}
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
              <Radio.Group value={radioValues.parkEntrepreneurSupport}>
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
            <Form.Item name="entrepreneurSupport" label="Парковое ИП">
              <Radio.Group value={radioValues.entrepreneurSupport}>
                <Radio
                  onClick={() => toggleRadioValue("entrepreneurSupport", true)}
                  value={true}
                >
                  Да
                </Radio>
                <Radio
                  onClick={() => toggleRadioValue("entrepreneurSupport", false)}
                  value={false}
                >
                  Нет
                </Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="accountantSupport" label="Бухгалтерская поддержка">
              <Radio.Group value={radioValues.accountantSupport}>
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
              <Radio.Group value={radioValues.supportAlwaysAvailable}>
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
          <Col span={8}>
            <Form.Item name="parkPromotions" label="Акции и бонусы">
              <Select
                maxTagCount={1}
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
          <Col span={8}>
            <Form.Item name="carRentals" label="Аренда машин от парка">
              <Radio.Group value={radioValues.carRentals}>
                <Radio
                  onClick={() => toggleRadioValue("carRentals", true)}
                  value={true}
                >
                  Да
                </Radio>
                <Radio
                  onClick={() => toggleRadioValue("carRentals", false)}
                  value={false}
                >
                  Нет
                </Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          {form && form?.getFieldValue("supportAlwaysAvailable") === false && (
            <Col span={8}>
              <Form.Item
                name="supportWorkTime"
                label="Рабочее время поддержки"
                rules={[{ required: true, message: "Выберите рабочее время!" }]}
              >
                <RangePicker
                  format={"HH:mm"}
                  minuteStep={15}
                  placeholder={["Начало", "Конец"]}
                />
              </Form.Item>
            </Col>
          )}
          <Col span={8}>
            <Form.Item name="additionalInfo" label="Доп. информация">
              <TextArea
                placeholder="Дополнительна информация"
                autoSize={{
                  minRows: 2,
                  maxRows: 6,
                }}
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Коммисия за перевод">
              <Form.List name="commissionRates">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <Row gutter={16} key={key} align="middle">
                        <Col span={10}>
                          <Form.Item
                            {...restField}
                            name={[name, "amount"]}
                            label={
                              index === 0 ? "До суммы (тг)" : "От суммы (тг)"
                            }
                            rules={[
                              { required: true, message: "Введите сумму" },
                            ]}
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              min={0}
                              placeholder={
                                index === 0
                                  ? "До какой суммы"
                                  : "От какой суммы"
                              }
                            />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, "percent"]}
                            label="Процент (%)"
                            rules={[
                              { required: true, message: "Введите процент" },
                            ]}
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              min={0}
                              max={100}
                              placeholder="%"
                            />
                          </Form.Item>
                        </Col>
                        {index > 0 && ( // Кнопка удаления только для "От" записей
                          <Col>
                            <MinusCircleOutlined
                              onClick={() => remove(name)}
                              style={{ color: "red", marginTop: 8 }}
                            />
                          </Col>
                        )}
                      </Row>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Добавить уровень комиссии
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Form.Item>
          </Col>
        </Row>
        <Flex gap={12}>
          <Button type="primary" htmlType="submit" loading={loading}>
            Создать
          </Button>
          <Button type="primary" danger loading={loading} onClick={onClose}>
            Закрыть
          </Button>
        </Flex>
      </Form>
    </Modal>
  );
};

export default CreateParkModal;
