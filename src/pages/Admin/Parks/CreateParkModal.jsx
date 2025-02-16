import { Modal, Form, Input, Button, InputNumber, Row, Col, TimePicker, Rate, Radio, Select, Flex } from "antd";
import axios from "axios";
import { useState } from "react";
const { RangePicker } = TimePicker;
const API_URL = import.meta.env.VITE_API_URL;

const CreateParkModal = ({ open, onClose, cities = [] }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [radioValues, setRadioValues] = useState({});

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            await axios.post(`${API_URL}/parks`, values);
            onClose();
            form.resetFields();
            setRadioValues({});
        } catch (error) {
            console.error("Ошибка при создании записи:", error);
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
        <Modal open={open} onCancel={onClose} title="Создать парк" footer={null} width="75vw" maskClosable={false} closeIcon={false}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="title" label="Название парка" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="cityId" label="Город" rules={[{ required: true, message: "Выберите город!" }]}>
                            <Select placeholder="Выберите город">
                                {cities.map((city) => (
                                    <Select.Option key={city.id} value={city.id}>{city.title}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="parkCommission" label="Комиссия парка %" rules={[{ required: true }]}>
                            <InputNumber min={0} max={100} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="commissionWithdraw" label="Комиссия за вывод %">
                            <InputNumber min={0} max={100} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="transferPaymentCommission" label="Комиссия за перевод %">
                            <InputNumber min={0} max={100} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="paymentType" label="Тип оплаты">
                            <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="averageCheck" label="Средний чек" rules={[{ required: true }]}>
                            <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="rating" label="Рейтинг">
                            <Rate allowHalf />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="yandexGasStation"
                            label="Яндекс Заправка"
                        >
                            <Radio.Group value={radioValues.yandexGasStation}>
                                <Radio onClick={() => toggleRadioValue("yandexGasStation", true)} value={true}>Да</Radio>
                                <Radio onClick={() => toggleRadioValue("yandexGasStation", false)} value={false}>Нет</Radio>
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
                                <Radio value={true} onClick={() => toggleRadioValue("parkEntrepreneurSupport", true)}>Да</Radio>
                                <Radio value={false} onClick={() => toggleRadioValue("parkEntrepreneurSupport", false)}>Нет</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="entrepreneurSupport"
                            label="Общая поддержка предпринимателей"
                        >
                            <Radio.Group value={radioValues.entrepreneurSupport}>
                                <Radio onClick={() => toggleRadioValue("entrepreneurSupport", true)} value={true}>Да</Radio>
                                <Radio onClick={() => toggleRadioValue("entrepreneurSupport", false)} value={false}>Нет</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="accountantSupport"
                            label="Бухгалтерская поддержка"
                        >
                            <Radio.Group value={radioValues.accountantSupport}>
                                <Radio onClick={() => toggleRadioValue("accountantSupport", true)} value={true}>Да</Radio>
                                <Radio onClick={() => toggleRadioValue("accountantSupport", false)} value={false}>Нет</Radio>
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
                            >
                                <Radio onClick={() => toggleRadioValue("supportAlwaysAvailable", true)} value={true}>Да</Radio>
                                <Radio onClick={() => toggleRadioValue("supportAlwaysAvailable", false)} value={false}>Нет</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                    {form && form?.getFieldValue('supportAlwaysAvailable') === false &&
                        <Col span={8}>
                            <Form.Item name="supportWorkTime" label="Рабочее время поддержки">
                                <RangePicker
                                    format={"HH:mm"}
                                    minuteStep={15}
                                    placeholder={["Начало", "Конец"]}
                                />
                            </Form.Item>
                        </Col>
                    }
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
