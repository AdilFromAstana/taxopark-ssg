/* eslint-disable react/prop-types */
import { memo, useState } from "react";
import { Card, Button } from "antd";
import { IoIosStar } from "react-icons/io";
import {
  MdPercent,
  MdCarRental,
  MdHeadsetMic,
  MdBusinessCenter,
} from "react-icons/md";
import { BiMoneyWithdraw } from "react-icons/bi";
import { LuClock3, LuGift } from "react-icons/lu";
import { FaLocationDot, FaGasPump } from "react-icons/fa6";
import { PiWallet } from "react-icons/pi";
import { FaCheck, FaHandshake } from "react-icons/fa";
import { TbCashRegister } from "react-icons/tb";
import { TfiClose } from "react-icons/tfi";
import { GoCreditCard } from "react-icons/go";
import "./CarouselItem.css";
import ApplicationModal from "../../ApplicationModal";

function formatNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const allParkPromotions = [
  { label: "Гарантированные бонусы", value: 1 },
  { label: "Приветственные бонусы", value: 2 },
  { label: "Розыгрыш", value: 3 },
  { label: "Бонус за активность", value: 4 },
  { label: "Приведи друга", value: 5 },
];

const getPromotionLabel = (id) => {
  const promotion = allParkPromotions.find((promo) => promo.value === id);
  return promotion ? promotion.label : "Неизвестная акция";
};

const CarouselItem = memo(({ item, index, carouselItemWidth }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const openModal = (event) => {
    event.stopPropagation();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const toggleFlip = () => {
    setFlipped(!flipped);
  };

  return (
    <div
      className="related-carousel-item"
      style={{ width: `${carouselItemWidth}px` }}
    >
      <div className="flip-card">
        <div className={`flip-card-inner ${flipped ? "flipped" : ""}`}>
          <div className="flip-card-front">
            <Card className="carousel-card" key={index} onClick={toggleFlip}>
              <img
                className="carousel-card-image"
                src="https://www.shbarcelona.ru/blog/ru/wp-content/uploads/2020/01/oli-woodman-fwYZ3B_QQco-unsplash.jpg"
                alt={item.title}
              />
              <div className="carousel-card-info">
                <div
                  className="approximate-income-value"
                  style={{ alignSelf: "center", fontWeight: 700 }}
                >
                  {formatNumber(item.approximateIncome)} ₸
                </div>
                <div className="carousel-card-details">

                  <h3 className="carousel-card-title">{item.title}</h3>
                  <div className="carousel-card-rating">
                    <IoIosStar className="carousel-card-icon star" />
                    <span>4.8</span>
                  </div>
                  <div className="carousel-card-detail">
                    <MdPercent className="carousel-card-icon" />
                    <span>Комиссия {item.commission}%</span>
                  </div>
                  <div className="carousel-card-detail">
                    <LuClock3 className="carousel-card-icon" />
                    {/* <span>{item.paymentType}</span> */}
                    <span>Моментальные выплаты</span>
                  </div>
                  <div className="carousel-card-detail">
                    <MdHeadsetMic className="carousel-card-icon" />
                    <span>{item.supportWorkTime}</span>
                  </div>
                  <div className="carousel-card-detail">
                    <PiWallet className="carousel-card-icon" />
                    {/* <span>{item.commissionWithdraw}</span> */}
                    <span>Парковое ИП</span>
                  </div>
                  <div className="carousel-card-detail">
                    <FaLocationDot className="carousel-card-icon" />
                    <span>{item.city}</span>
                  </div>
                  <div className="carousel-card-bonuses">
                    <LuGift className="carousel-card-icon" />
                    <div className="carousel-card-bonus-list">
                      {item.parkPromotions.map((bonus, idx) => (
                        <span className="carousel-card-bonus" key={idx}>
                          {getPromotionLabel(bonus)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  className="carousel-card-button"
                  size="large"
                  onClick={openModal}
                >
                  Оставить заявку
                </Button>
              </div>
            </Card>
          </div>

          <div className="flip-card-back">
            <Card
              className="carousel-card"
              key={`${index}-back`}
              onClick={toggleFlip}
            >
              <div className="carousel-card-info-backside carousel-card-info">
                <h3
                  className="carousel-card-title"
                  style={{ textAlign: "center", width: "100%" }}
                >
                  {item.title}
                </h3>
                <div className="carousel-card-details">
                  <div className="carousel-card-detail">
                    <MdPercent className="carousel-card-icon" />
                    <span>Комиссия парка:</span> {item.commission}%
                  </div>
                  <div className="carousel-card-detail">
                    <GoCreditCard className="carousel-card-icon" />
                    <span>Моментальные выплаты:</span>{" "}
                    {item.instantPayments ? (
                      `Да (${item.instantPaymentCommission}%)`
                    ) : (
                      <TfiClose
                        className="carousel-card-icon"
                        style={{ fontSize: "16px" }}
                      />
                    )}
                  </div>
                  <div className="carousel-card-detail">
                    <BiMoneyWithdraw className="carousel-card-icon" />
                    <span>Выплаты переводом:</span>{" "}
                    {item.transferPayments ? (
                      `Да (${item.transferPaymentCommission}%)`
                    ) : (
                      <TfiClose
                        className="carousel-card-icon"
                        style={{ fontSize: "16px" }}
                      />
                    )}
                  </div>
                  <div className="carousel-card-detail">
                    <MdHeadsetMic className="carousel-card-icon" />
                    <span>Техподдержка:</span>{" "}
                    {item.supportWorkTime === "Круглосуточно"
                      ? "Круглосуточно"
                      : "Ограниченно"}
                  </div>
                  <div className="carousel-card-detail">
                    <MdBusinessCenter className="carousel-card-icon" />
                    <span>Парковое ИП:</span>
                    {item.hasParkIP ? (
                      <FaCheck className="carousel-card-icon" />
                    ) : (
                      <TfiClose
                        className="carousel-card-icon"
                        style={{ fontSize: "16px" }}
                      />
                    )}
                  </div>
                  <div className="carousel-card-detail">
                    <FaHandshake className="carousel-card-icon" />
                    <span style={{ whiteSpace: "nowrap" }}>
                      Поддержка регистрации ИП:
                    </span>
                    {item.ipRegistrationSupport ? (
                      <FaCheck className="carousel-card-icon" />
                    ) : (
                      <TfiClose
                        className="carousel-card-icon"
                        style={{ fontSize: "16px" }}
                      />
                    )}
                  </div>
                  <div className="carousel-card-detail">
                    <TbCashRegister className="carousel-card-icon" />
                    <span>Ведение бухгалтерии:</span>{" "}
                    {item.accountingSupport ? (
                      <FaCheck className="carousel-card-icon" />
                    ) : (
                      <TfiClose
                        className="carousel-card-icon"
                        style={{ fontSize: "16px" }}
                      />
                    )}
                  </div>
                  <div className="carousel-card-detail">
                    <FaGasPump className="carousel-card-icon" />
                    <span>Яндекс Заправка:</span>{" "}
                    {item.yandexFuel ? (
                      <FaCheck className="carousel-card-icon" />
                    ) : (
                      <TfiClose
                        className="carousel-card-icon"
                        style={{ fontSize: "16px" }}
                      />
                    )}
                  </div>
                  <div
                    className="carousel-card-detail"
                    style={{ marginLeft: "-4px", gap: "6px" }}
                  >
                    <MdCarRental
                      className="carousel-card-icon"
                      style={{ fontSize: "30px" }}
                    />
                    <span>Аренда машин от парка:</span>
                    {item.carRentals ? (
                      <FaCheck className="carousel-card-icon" />
                    ) : (
                      <TfiClose
                        className="carousel-card-icon"
                        style={{ fontSize: "16px" }}
                      />
                    )}
                  </div>
                  <div className="carousel-card-bonuses">
                    <LuGift className="carousel-card-icon" />
                    <div className="carousel-card-bonus-list">
                      {item.parkPromotions.map((bonus, idx) => (
                        <span className="carousel-card-bonus" key={idx}>
                          {getPromotionLabel(bonus)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  className="carousel-card-button"
                  size="large"
                  onClick={openModal}
                >
                  Оставить заявку
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        parkId={item.id}
      />
    </div>
  );
});

CarouselItem.displayName = "CarouselItem";

export default CarouselItem;
