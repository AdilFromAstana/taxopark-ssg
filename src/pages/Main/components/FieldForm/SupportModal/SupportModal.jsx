import React, { useEffect, useState } from "react";
import { Modal, Button, Input, message } from "antd";
import "react-phone-input-2/lib/style.css";

const ApplicationModal = ({
  isOpen,
  onClose,
  phone,
  setPhone,
  setStep,
  step,
}) => {
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(60); // Таймер для повторной отправки OTP
  const [otp, setOtp] = useState("1234"); // Замоканный OTP
  const [inputOtp, setInputOtp] = useState("");

  const sendOtp = () => {
    if (!phone || phone.length < 11) {
      message.error("Введите корректный номер телефона.");
      return;
    }
    setOtpSent(true);
    setTimer(60); // Сброс таймера
    message.success("OTP отправлен!");
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          setOtpSent(false);
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpVerification = () => {
    if (inputOtp === otp) {
      message.success("Заявка успешно отправлена!");
      setStep(3); // Переход на шаг 3
    } else {
      message.error("Неправильный OTP-код. Попробуйте снова.");
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"; // Отключаем прокрутку при открытом модальном окне
    } else {
      document.body.style.overflow = ""; // Включаем прокрутку
    }
    return () => {
      document.body.style.overflow = ""; // Сбрасываем стиль при размонтировании
    };
  }, [isOpen]);

  return (
    <Modal
      title={
        isOpen && step === 2
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
        <>
          <p>Введите код из SMS для подтверждения заявки:</p>
          <Input.OTP
            style={{ width: "100%", height: "50px" }}
            length={4}
            type="tel"
            value={inputOtp}
            onChange={(e) => setInputOtp(e)}
            placeholder="Введите OTP-код"
          />
          <Button
            type="primary"
            size="large"
            block
            style={{ marginTop: "10px" }}
            onClick={handleOtpVerification}
          >
            Подтвердить
          </Button>
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center", // Центровка по горизонтали
              justifyContent: "center", // Центровка по вертикали
            }}
          >
            <Button
              type="link"
              onClick={() => {
                setStep(1); // Вернуться на шаг 1 для смены номера
                setInputOtp(""); // Очистить введенный OTP
                onClose();
              }}
            >
              Сменить номер
            </Button>
            {otpSent ? (
              <p style={{ textAlign: "center" }}>
                Повторная отправка SMS будет доступна через {timer} секунд
              </p>
            ) : (
              <Button type="link" onClick={sendOtp}>
                Отправить OTP снова
              </Button>
            )}
          </div>
        </>
      )}

      {step === 3 && (
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "18px", marginBottom: "20px" }}>
            Заявка успешно отправлена!
          </p>
          <p>Ожидайте звонка в ближайшее время.</p>
          <Button
            type="primary"
            size="large"
            style={{ marginTop: "20px" }}
            onClick={() => {
              setStep(1);
              setInputOtp("");
              onClose();
            }}
          >
            Закрыть
          </Button>
        </div>
      )}
    </Modal>
  );
};
export default ApplicationModal;
