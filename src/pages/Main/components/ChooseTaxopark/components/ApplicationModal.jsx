/* eslint-disable react/prop-types */
import { Modal, Form, Input, Button, message } from "antd";
import axios from "axios";
import { useEffect, useState, memo } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const API_URL = import.meta.env.VITE_API_URL;

const ApplicationModal = memo(
  ({ isOpen, onClose, formType = "taxiPark", parkId }) => {
    const [form] = Form.useForm();
    const [step, setStep] = useState(1);
    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(60);
    const [otpCode] = useState("1234");
    const [inputOtp, setInputOtp] = useState("");

    const name = Form.useWatch("name", form);
    const phoneNumber = Form.useWatch("phoneNumber", form);

    useEffect(() => {
      if (otpSent && timer > 0) {
        const interval = setInterval(() => {
          setTimer((prev) => {
            if (prev === 1) {
              clearInterval(interval);
              setOtpSent(false);
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(interval);
      }
    }, [otpSent, timer]);

    const handleSendOtp = async () => {
      try {
        const values = await form.validateFields();
        await axios.post(`${API_URL}/forms`, { ...values, formType, parkId });

        message.success("OTP-код отправлен!");
        setStep(2);
        setOtpSent(true);
        setTimer(60);
      } catch (error) {
        message.error("Ошибка при отправке заявки");
        console.error("Ошибка:", error);
      }
    };

    const handleVerifyOtp = () => {
      if (inputOtp === otpCode) {
        message.success("Заявка успешно отправлена!");
        setStep(3);
      } else {
        message.error("Неверный OTP-код. Попробуйте снова.");
      }
    };

    const handleClose = () => {
      form.resetFields();
      setStep(1);
      setInputOtp("");
      setOtpSent(false);
      setTimer(60);
      onClose();
    };

    return (
      <Modal
        maskClosable={false}
        open={isOpen}
        onCancel={handleClose}
        footer={null}
        title={
          step === 1
            ? "Отправить заявку"
            : step === 2
            ? "Подтверждение OTP"
            : "Успех!"
        }
        centered
      >
        <Form form={form} layout="vertical">
          {step === 1 && (
            <>
              <Form.Item
                name="name"
                label="ФИО"
                rules={[{ required: true, message: "Введите ФИО" }]}
              >
                <Input placeholder="Введите ФИО" />
              </Form.Item>

              <Form.Item
                name="phoneNumber"
                label="Телефон"
                rules={[{ required: true, message: "Введите телефон" }]}
              >
                <PhoneInput
                  country="kz"
                  onlyCountries={["kz"]}
                  inputStyle={{ width: "100%" }}
                />
              </Form.Item>

              <Button
                type="primary"
                disabled={!name || phoneNumber?.length !== 11}
                block
                onClick={handleSendOtp}
              >
                Отправить заявку
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <p>Введите код из SMS для подтверждения заявки:</p>
              <Input.OTP
                type="text"
                length={4}
                value={inputOtp}
                onChange={(e) => setInputOtp(e)}
                placeholder="Введите OTP-код"
              />
              <Button
                type="primary"
                block
                onClick={handleVerifyOtp}
                className="mt-3"
              >
                Подтвердить
              </Button>
              <Button
                type="link"
                disabled={otpSent}
                onClick={handleSendOtp}
                className="mt-2"
              >
                {otpSent
                  ? `Запросить код повторно через ${timer} сек.`
                  : "Запросить новый код"}
              </Button>
            </>
          )}

          {step === 3 && (
            <div className="text-center">
              <p>Заявка успешно отправлена!</p>
              <Button type="primary" block onClick={handleClose}>
                Хорошо
              </Button>
            </div>
          )}
        </Form>
      </Modal>
    );
  }
);

ApplicationModal.displayName = "ApplicationModal";

export default ApplicationModal;
