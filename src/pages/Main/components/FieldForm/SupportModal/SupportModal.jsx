/* eslint-disable react/prop-types */
import { memo, useEffect, useState } from "react";
import { Modal, Button, Input, message } from "antd";
import "react-phone-input-2/lib/style.css";
import moment from "moment";

const OTPInput = ({ value, onChange }) => (
  <Input.OTP
    style={{ width: "100%", height: "50px" }}
    length={4}
    type="tel"
    value={value}
    onChange={(e) => onChange(e)}
    placeholder="Введите OTP-код"
  />
);

const OtpVerification = ({ phone, setStep, onClose, resendTime }) => {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("1234");
  const [inputOtp, setInputOtp] = useState("");
  const now = moment();
  const isResendDisabled = resendTime && now.isBefore(resendTime);

  // Запуск таймера при отправке OTP
  useEffect(() => {
    let interval;
    if (otpSent) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setOtpSent(false);
            return 60; // Сброс таймера
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent]);

  const sendOtp = () => {
    if (!phone || phone.length < 11) {
      message.error("Введите корректный номер телефона.");
      return;
    }
    setOtpSent(true);
    setTimer(60);
    message.success("OTP отправлен!");
  };

  const handleOtpVerification = () => {
    if (inputOtp === otp) {
      message.success("Заявка успешно отправлена!");
      setStep(3);
    } else {
      message.error("Неправильный OTP-код. Попробуйте снова.");
    }
  };

  return (
    <>
      <p>Введите код из SMS для подтверждения заявки:</p>
      <OTPInput value={inputOtp} onChange={setInputOtp} />
      <Button
        type="primary"
        size="large"
        block
        style={{ marginTop: "10px" }}
        onClick={handleOtpVerification}
      >
        Подтвердить
      </Button>
      <div className="flex flex-col items-center mt-2">
        <Button type="link" onClick={() => setStep(1)}>
          Сменить номер
        </Button>
        <Button
          type="link"
          onClick={sendOtp}
          disabled={isResendDisabled} // Заблокирована до истечения времени
        >
          {isResendDisabled
            ? `Отправить OTP снова (${resendTime.diff(now, "seconds")} сек)`
            : "Отправить OTP снова"}
        </Button>
      </div>
    </>
  );
};

// 📌 Компонент успешного сообщения
const SuccessMessage = ({ setStep, onClose }) => (
  <div className="text-center">
    <p className="text-lg mb-4">Заявка успешно отправлена!</p>
    <p>Ожидайте звонка в ближайшее время.</p>
    <Button
      type="primary"
      size="large"
      className="mt-4"
      onClick={() => {
        setStep(1);
        onClose();
      }}
    >
      Закрыть
    </Button>
  </div>
);

// 📌 Основной компонент
const ApplicationModal = memo(
  ({ isOpen, onClose, phone, setStep, step, resendTime }) => {
    useEffect(() => {
      document.body.style.overflow = isOpen ? "hidden" : "";
      return () => {
        document.body.style.overflow = "";
      };
    }, [isOpen]);

    return (
      <Modal
        title={
          step === 2
            ? "Код подтверждения"
            : step === 3
            ? "Успешно отправлено"
            : ""
        }
        open={isOpen}
        onCancel={onClose}
        maskClosable={false}
        footer={null}
      >
        {step === 2 && (
          <OtpVerification phone={phone} setStep={setStep} onClose={onClose} />
        )}
        {step === 3 && <SuccessMessage setStep={setStep} onClose={onClose} />}
      </Modal>
    );
  }
);

ApplicationModal.displayName = "ApplicationModal";
export default ApplicationModal;
