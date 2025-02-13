import { Modal, Form, Input, Button } from "antd";
import axios from "axios";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const EditParkModal = ({ open, onClose, record, refreshData }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (values) => {
        try {
            setLoading(true);
            await axios.put(`${API_URL}/parks/${record.id}`, values);
            refreshData();
            onClose();
        } catch (error) {
            console.error("Ошибка при обновлении:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onCancel={onClose} title="Редактировать запись" footer={null}>
            <Form form={form} layout="vertical" initialValues={record} onFinish={handleUpdate}>
                <Form.Item name="name" label="ФИО">
                    <Input />
                </Form.Item>
                <Form.Item name="phoneNumber" label="Номер">
                    <Input />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Сохранить
                </Button>
            </Form>
        </Modal>
    );
};

export default EditParkModal;
