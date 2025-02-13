import { Modal, Form, Input, Button } from "antd";
import axios from "axios";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const CreateFormModal = ({ open, onClose, refreshData }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            await axios.post(`${API_URL}/forms`, values);
            refreshData();
            onClose();
            form.resetFields();
        } catch (error) {
            console.error("Ошибка при создании записи:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onCancel={onClose} title="Создать запись" footer={null}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item name="name" label="ФИО" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="phoneNumber" label="Номер" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Создать
                </Button>
            </Form>
        </Modal>
    );
};

export default CreateFormModal;
