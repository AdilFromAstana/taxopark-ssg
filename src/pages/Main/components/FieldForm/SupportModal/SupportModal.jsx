/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
import { memo, useEffect, useState } from "react";
import { Modal, Button, Input, message } from "antd";
import "react-phone-input-2/lib/style.css";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const ApplicationModal = memo(
  ({
    formId,
    handleSendOtp,
    isOpen,
    onClose,
    phone,
    setStep,
    step,
    timer,
    setTimer,
    otpSent,
    setOtpSent,
    form,
  }) => {
    const [inputOtp, setInputOtp] = useState("");

    useEffect(() => {
      document.body.style.overflow = isOpen ? "hidden" : "";
      return () => {
        document.body.style.overflow = "";
      };
    }, [isOpen]);

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

    const handleVerifyOtp = async () => {
      try {
        const response = await axios.post(`${API_URL}/smsCodes/verifyOtp`, {
          formId,
          otpCode: inputOtp,
        });

        message.success(response.data.message);
        setStep(3); // Переход на следующий шаг
      } catch (error) {
        message.error(
          error.response?.data?.message || "Ошибка при подтверждении OTP"
        );
      }
    };

    const handleClose = () => {
      form.resetFields();
      setStep(2);
      setInputOtp("");
      setOtpSent(false);
      setTimer(180);
      onClose();
    };

    return (
      <Modal
        maskClosable={false}
        open={isOpen}
        onCancel={handleClose}
        footer={null}
        title={step === 2 ? "Подтверждение OTP" : "Успех!"}
        centered
      >
        {step === 2 && (
          <StepTwo
            inputOtp={inputOtp}
            phone={phone}
            setStep={setStep}
            onClose={onClose}
            handleSendOtp={handleSendOtp}
            otpSent={otpSent}
            timer={timer}
            setInputOtp={setInputOtp}
            handleVerifyOtp={handleVerifyOtp}
          />
        )}
        {step === 3 && <StepThree handleClose={handleClose} />}
      </Modal>
    );
  }
);

const StepTwo = ({
  inputOtp,
  setInputOtp,
  handleVerifyOtp,
  handleSendOtp,
  otpSent,
  timer,
}) => {
  const minutes = String(Math.floor(timer / 60)).padStart(2, "0");
  const seconds = String(timer % 60).padStart(2, "0");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      <p>Введите код из SMS для подтверждения заявки:</p>
      <Input.OTP
        type="text"
        length={4}
        value={inputOtp}
        onChange={(e) => setInputOtp(e)}
        placeholder="Введите OTP-код"
      />
      <Button type="primary" block onClick={handleVerifyOtp} className="mt-3">
        Подтвердить
      </Button>
      <Button
        type="link"
        disabled={otpSent}
        onClick={handleSendOtp}
        className="mt-2"
      >
        {otpSent
          ? `Запросить код повторно через ${minutes}:${seconds}`
          : "Запросить новый код"}
      </Button>
    </div>
  );
};

const StepThree = ({ handleClose }) => {
  return (
    <div className="text-center">
      <p>Заявка успешно отправлена!</p>
      <Button type="primary" block onClick={handleClose}>
        Хорошо
      </Button>
    </div>
  );
};

ApplicationModal.displayName = "ApplicationModal";
export default ApplicationModal;
