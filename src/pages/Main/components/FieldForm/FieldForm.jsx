import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import PhoneInput from "react-phone-input-2";
import "./FieldForm.css";
import SupportModal from "./SupportModal/SupportModal";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function FieldForm() {
  const [form] = Form.useForm();
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(180);
  const [formId, setFormId] = useState("");

  const handleSendOtp = async () => {
    try {
      const values = await form.validateFields();
      const formData = await axios.post(`${API_URL}/forms`, {
        ...values,
        formType: "consultation",
      });
      setFormId(formData.data.id);
      message.success("OTP-код отправлен!");
      setStep(2);
      setOtpSent(true);
      setTimer(180);
      setIsModalOpen(true);
    } catch (error) {
      message.error("Ошибка при отправке заявки");
      console.error("Ошибка:", error);
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
            <Form layout="vertical" form={form}>
              <Form.Item
                label="ФИО"
                name="name"
                rules={[{ required: true, message: "Пожалуйста, введите ФИО" }]}
              >
                <Input placeholder="Введите ФИО" />
              </Form.Item>
              <Form.Item
                label="Телефон"
                name="phoneNumber"
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
              <Button type="primary" size="large" onClick={handleSendOtp} block>
                Отправить
              </Button>
            </Form>
          </div>
        </div>
      </div>

      <SupportModal
        form={form}
        handleSendOtp={handleSendOtp}
        formId={formId}
        setOtpSent={setOtpSent}
        otpSent={otpSent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        phone={phone}
        setPhone={setPhone}
        setStep={setStep}
        step={step}
        setTimer={setTimer}
        timer={timer}
      />
    </div>
  );
}

export default FieldForm;
