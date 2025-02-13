"use client";

import axios from "axios";
import React, { memo, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ApplicationModal = memo(
  ({
    isOpen,
    onClose,
    formType = "consultation",
    parkId,
  }: {
    isOpen: boolean;
    onClose: () => void;
    formType: "taxiPark" | "consultation";
    parkId?: string;
  }) => {
    const [step, setStep] = useState(1);
    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(60);
    const [isAnimating, setIsAnimating] = useState(false); // Для анимации закрытия
    const otp = "1234";
    const [inputOtp, setInputOtp] = useState("");
    const [phone, setPhone] = useState<string>("");
    const [name, setName] = useState<string>("");

    console.log(otpSent);
    console.log(timer);

    const createForm = async () => {
      try {
        const response = await axios.post(
          `${API_URL}/forms`,
          { phoneNumber: phone, name, formType, parkId },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        return response.data;
      } catch (error: any) {
        console.error(
          "Ошибка при создании формы:",
          error.response?.data || error.message
        );
        throw error;
      }
    };

    useEffect(() => {
      if (isOpen) {
        setIsAnimating(true);
        document.body.style.overflow = "hidden"; // Отключаем прокрутку
      } else if (isAnimating) {
        // Завершаем анимацию закрытия перед удалением
        setTimeout(() => {
          document.body.style.overflow = ""; // Включаем прокрутку
          setIsAnimating(false);
        }, 300); // Длительность анимации совпадает с CSS
      }
    }, [isOpen]);

    const sendOtp = () => {
      if (!phone || phone.length < 11) {
        alert("Введите корректный номер телефона.");
        return;
      }
      setStep(2);
      setOtpSent(true);
      setTimer(60);
      alert("OTP отправлен!");
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setOtpSent(false);
          }
          return prev - 1;
        });
      }, 1000);
      createForm();
    };

    const handleOtpVerification = () => {
      if (inputOtp === otp) {
        alert("Заявка успешно отправлена!");
        setStep(3);
      } else {
        alert("Неверный SMS-код. Попробуйте снова.");
      }
    };

    if (!isOpen && !isAnimating) return null;

    return ReactDOM.createPortal(
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        style={{
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        <div
          className={`bg-white rounded-lg shadow-lg w-full max-w-md p-6 transform transition-transform duration-300 ${
            isOpen ? "scale-100" : "scale-90"
          }`}
        >
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            onClick={onClose}
          >
            ✖
          </button>

          <h2 className="text-center text-xl font-bold mb-4">
            {step === 1
              ? "Отправить заявку"
              : step === 2
              ? "Код подтверждения"
              : "Успешно отправлено"}
          </h2>

          {step === 1 && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                sendOtp();
              }}
            >
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="name"
                >
                  ФИО
                </label>
                <input
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                  placeholder="Введите ФИО"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="phone"
                >
                  Телефон
                </label>
                <PhoneInput
                  country="kz"
                  onlyCountries={["kz"]}
                  value={phone}
                  onChange={(value: string) => setPhone(value)}
                  placeholder="+7-777-77-77-77"
                  disableDropdown={true}
                  inputStyle={{ width: "100%" }}
                  inputClass="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
              >
                Отправить
              </button>
            </form>
          )}

          {step === 2 && (
            <>
              <p className="mb-4">
                Введите код из SMS для подтверждения заявки:
              </p>
              <input
                type="text"
                maxLength={4}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300 text-center"
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value)}
                placeholder="Введите OTP-код"
              />
              <button
                className="w-full bg-blue-500 text-white py-2 rounded mt-4 hover:bg-blue-600 transition"
                onClick={handleOtpVerification}
              >
                Подтвердить
              </button>
            </>
          )}

          {step === 3 && (
            <div className="text-center">
              <p className="text-lg font-medium">Заявка успешно отправлена!</p>
              <button
                className="mt-6 bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 transition"
                onClick={() => {
                  setStep(1);
                  setInputOtp("");
                  onClose();
                }}
              >
                Хорошо
              </button>
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  }
);

ApplicationModal.displayName = "ApplicationModal";

export default ApplicationModal;
