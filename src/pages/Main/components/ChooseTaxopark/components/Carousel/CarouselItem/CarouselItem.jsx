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
import { FaLocationDot, FaGasPump, FaHandshake } from "react-icons/fa6";
import { PiWallet } from "react-icons/pi";
import { TbCashRegister } from "react-icons/tb";
import { GoCreditCard } from "react-icons/go";
import "./CarouselItem.css";
import ApplicationModal from "../../ApplicationModal";
import moment from "moment";

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

const formatTime = (time) => {
  return time ? moment(time).format("HH:mm") : "Не указано"; // Если null, пишем "Не указано"
};

const CarouselItem = memo(({ item, index, carouselItemWidth }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const getSupportTime = () => {
    if (typeof item.supportAlwaysAvailable === "boolean") {
      return item.supportAlwaysAvailable
        ? "24/7"
        : `${formatTime(item.supportStartWorkTime)} - ${formatTime(
            item.supportEndWorkTime
          )}`;
    }
    return null;
  };

  const supportTime = getSupportTime();

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
                    <span>{item.rating}</span>
                  </div>
                  <div className="carousel-card-detail">
                    <MdPercent className="carousel-card-icon" />
                    <span>Комиссия парка {item.parkCommission}%</span>
                  </div>
                  <div className="carousel-card-detail">
                    <LuClock3 className="carousel-card-icon" />
                    {/* <span>{item.paymentType}</span> */}
                    <span>Моментальные выплаты {item.commissionWithdraw}</span>
                  </div>
                  {supportTime && (
                    <div className="carousel-card-detail">
                      <MdHeadsetMic className="carousel-card-icon" />
                      <span>{supportTime}</span>
                    </div>
                  )}
                  {item.parkEntrepreneurSupport ? (
                    <div className="carousel-card-detail">
                      <PiWallet className="carousel-card-icon" />
                      <span>Парковое ИП</span>
                    </div>
                  ) : null}
                  <div className="carousel-card-detail">
                    <FaLocationDot className="carousel-card-icon" />
                    <span>{item.City.title}</span>
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
                    <span>Комиссия парка:</span> {item.parkCommission}%
                  </div>
                  <div className="carousel-card-detail">
                    <GoCreditCard className="carousel-card-icon" />
                    <span>Моментальные выплаты:</span>{" "}
                    {item.commissionWithdraw
                      ? `Да (${item.commissionWithdraw}%)`
                      : "Нет"}
                  </div>
                  <div className="carousel-card-detail">
                    <BiMoneyWithdraw className="carousel-card-icon" />
                    <span>Выплаты переводом:</span>{" "}
                    {item.transferPaymentCommission
                      ? `Да (${item.transferPaymentCommission}%)`
                      : "Нет"}
                  </div>
                  <div className="carousel-card-detail">
                    <MdHeadsetMic className="carousel-card-icon" />
                    <span>Техподдержка:</span> {getSupportTime() || "-"}
                  </div>
                  <div className="carousel-card-detail">
                    <MdBusinessCenter className="carousel-card-icon" />
                    <span>Парковое ИП:</span>
                    {item.parkEntrepreneurSupport ? "Да" : "Нет"}
                  </div>
                  <div className="carousel-card-detail">
                    <FaHandshake className="carousel-card-icon" />
                    <span style={{ whiteSpace: "nowrap" }}>
                      Поддержка регистрации ИП:
                    </span>
                    {item.entrepreneurSupport ? "Да" : "Нет"}
                  </div>
                  <div className="carousel-card-detail">
                    <TbCashRegister className="carousel-card-icon" />
                    <span>Ведение бухгалтерии:</span>
                    {item.accountantSupport ? "Да" : "Нет"}
                  </div>
                  <div className="carousel-card-detail">
                    <FaGasPump className="carousel-card-icon" />
                    <span>Яндекс Заправка:</span>{" "}
                    {item.yandexGasStation ? "Да" : "Нет"}
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
                    {item.carRentals ? "Да" : "Нет"}
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
