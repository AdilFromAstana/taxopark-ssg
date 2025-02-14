import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import PhoneInput from "react-phone-input-2";
import "./FieldForm.css";
import SupportModal from "./SupportModal/SupportModal";
import axios from "axios";
import moment from "moment"; // Подключаем moment.js

const API_URL = import.meta.env.VITE_API_URL;

function FieldForm() {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resendTime, setResendTime] = useState(null); // Время, когда можно повторно отправить OTP

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/forms`, {
        name: values.name,
        phoneNumber: phone,
        formType: "consultation",
      });

      if (response.status === 201) {
        message.success("OTP отправлен!");
        setStep(2);
        setIsModalOpen(true);

        // 📌 Берем время `createdAt`, добавляем 1 минуту
        const createdAt = response.data.createdAt;
        const nextResendTime = moment(createdAt).add(1, "minute"); // +1 минута
        setResendTime(nextResendTime);
      } else {
        message.error("Ошибка при отправке OTP.");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      message.error("Ошибка при подключении к серверу.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="field-form">
      <div className="field-form-header">
        <div className="field-form-content">
          <div className="field-form-left">
            <h1 className="field-form-title">Выбирай лучший ТаксоПарк!</h1>
            <p className="field-form-description">
              Сравнивайте и выбирайте лучшие условия для работы!
            </p>
          </div>

          <div className="field-form-right">
            <h2 className="field-form-form-title">Бесплатная консультация!</h2>
            <Form layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                label="ФИО"
                name="name"
                rules={[{ required: true, message: "Пожалуйста, введите ФИО" }]}
              >
                <Input placeholder="Введите ФИО" />
              </Form.Item>
              <Form.Item
                label="Телефон"
                name="phone"
                rules={[
                  {
                    required: true,
                    message: "Пожалуйста, введите номер телефона",
                  },
                ]}
              >
                <PhoneInput
                  country="kz"
                  onlyCountries={["kz"]}
                  value={phone}
                  onChange={(value) => setPhone(value)}
                  placeholder="+7-777-77-77-77"
                  disableDropdown={true}
                  masks={{ kz: "(...) ...-..-.." }}
                />
              </Form.Item>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                block
                loading={loading}
              >
                Отправить
              </Button>
            </Form>
          </div>
        </div>
      </div>

      <SupportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        phone={phone}
        setPhone={setPhone}
        setStep={setStep}
        step={step}
        resendTime={resendTime} // Передаем время повторной отправки
      />
    </div>
  );
}

export default FieldForm;
