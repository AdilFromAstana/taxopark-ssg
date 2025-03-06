/* eslint-disable react/prop-types */
import { memo, useState } from "react";
import { Card, Button, Tag, Modal } from "antd";
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

const API_URL = import.meta.env.VITE_API_URL;

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

const CarouselItem = memo(({ item, index, carouselItemWidth, cities }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCitiesModalOpen, setIsCitiesModalOpen] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const parkImage = item?.imageUrl
    ? `${API_URL}/uploads/${item?.imageUrl}`
    : "https://www.shbarcelona.ru/blog/ru/wp-content/uploads/2020/01/oli-woodman-fwYZ3B_QQco-unsplash.jpg";

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

  const closeNewModal = () => setIsCitiesModalOpen(false);

  const toggleFlip = () => {
    setFlipped(!flipped);
  };

  const openNewModal = (event) => {
    event.stopPropagation(); // Останавливаем всплытие клика
    setIsCitiesModalOpen(true);
  };

  const currentCity = cities.find(
    (city) => city.id === item.selectedCityId
  )?.title;

  const cityTitles = item.averageCheckPerCity
    .map(({ cityId }) => cities.find((city) => city.id === cityId)?.title)
    .filter(Boolean);

  const visibleCities = cityTitles.slice(0, 1);
  const remainingCount = cityTitles.length - visibleCities.length;

  return (
    <div
      className={`flip-card-inner ${flipped ? "flipped" : ""}`}
      style={{ width: `${carouselItemWidth}px` }}
    >
      <Card
        className="carousel-card flip-card-front"
        key={index}
        onClick={toggleFlip}
      >
        <img className="carousel-card-image" src={parkImage} alt={item.title} />
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
              <BiMoneyWithdraw className="carousel-card-icon" />
              <span>Выплаты:</span>{" "}
              {item.transferPaymentCommission
                ? item.transferPaymentCommission
                : "Нет"}
            </div>
            <div className="carousel-card-detail">
              <MdPercent className="carousel-card-icon" />
              <span>Комиссия парка: {item.parkCommission}%</span>
            </div>
            {item.commissionWithdraw && (
              <div className="carousel-card-detail">
                <LuClock3 className="carousel-card-icon" />
                {/* <span>{item.paymentType}</span> */}
                <span>Моментальные выплаты: {item.commissionWithdraw}%</span>
              </div>
            )}
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "20px 1fr",
                gap: 10,
              }}
            >
              <FaLocationDot className="carousel-card-icon" />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <Tag
                  color="yellow-inverse"
                  style={{ color: "black", margin: 0 }}
                >
                  {currentCity}
                </Tag>
                <Tag
                  color="yellow-inverse"
                  style={{ color: "black", margin: 0, cursor: "pointer" }}
                  onClick={openNewModal}
                >
                  +{remainingCount} городов
                </Tag>
              </div>
            </div>
            <div className="carousel-card-bonuses">
              <LuGift className="carousel-card-icon" />
              <div className="carousel-card-bonus-list">
                {item.parkPromotions.map((bonus, idx) => (
                  <Tag
                    color="yellow-inverse"
                    style={{ color: "black" }}
                    key={idx}
                  >
                    {getPromotionLabel(bonus)}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
              width: "100%",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Подробнее...
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

      <Card
        className="carousel-card flip-card-back"
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
              <span>Выплаты:</span>{" "}
              {item.transferPaymentCommission
                ? item.transferPaymentCommission
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
                  <Tag
                    color="yellow-inverse"
                    style={{ color: "black" }}
                    key={idx}
                  >
                    {getPromotionLabel(bonus)}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
              width: "100%",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Подробнее...
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
      <Modal
        open={isCitiesModalOpen}
        onCancel={closeNewModal}
        footer={null}
        title={`Доступные города – ${item.title}`}
        maskClosable={false}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {cityTitles
            .slice()
            .sort((a, b) => a.localeCompare(b))
            .map((city, idx) => (
              <Tag
                key={idx}
                color="yellow-inverse"
                style={{ color: "black", margin: 0, cursor: "pointer" }}
              >
                {city}
              </Tag>
            ))}
        </div>
      </Modal>
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
