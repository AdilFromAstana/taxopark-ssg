import { useState } from "react";
import { Form, Input, Button } from "antd";
import PhoneInput from "react-phone-input-2";
import "./FieldForm.css";
import SupportModal from "./SupportModal/SupportModal";

function FieldForm() {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            <Form
              layout="vertical"
              onFinish={() => {
                setIsModalOpen(true);
                setStep(2); // Перейти на второй шаг
              }}
            >
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
                  disableDropdown={true} // Отключение смены флага
                  masks={{ kz: "(...) ...-..-.." }} // Маска для Казахстана
                />
              </Form.Item>
              <Button type="primary" size="large" htmlType="submit" block>
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
      />
    </div>
  );
}

export default FieldForm;
