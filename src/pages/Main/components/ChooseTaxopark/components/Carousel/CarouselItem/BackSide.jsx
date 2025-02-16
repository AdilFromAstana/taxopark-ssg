import { memo } from "react";
import { BiMoneyWithdraw } from "react-icons/bi";
import { FaGasPump, FaHandshake } from "react-icons/fa6";
import { GoCreditCard } from "react-icons/go";
import { LuGift } from "react-icons/lu";
import {
  MdBusinessCenter,
  MdCarRental,
  MdHeadsetMic,
  MdPercent,
} from "react-icons/md";
import { TbCashRegister } from "react-icons/tb";
// import { TfiClose } from "react-icons/tfi";

const allParkPromotions = [
  { label: "Гарантированные бонусы", value: 1 },
  { label: "Приветственные бонусы", value: 2 },
  { label: "Розыгрыш", value: 3 },
  { label: "Бонус за активность", value: 4 },
  { label: "Приведи друга", value: 5 },
];

const BackSide = memo(
  ({ item, toggleFlip, openModal }) => {
    const details = [
      {
        icon: MdPercent,
        label: "Комиссия парка:",
        value: `${item.parkCommission}%`,
      },
      {
        icon: GoCreditCard,
        label: "Моментальные выплаты:",
        value: item.transferPaymentCommission,
      },
      {
        icon: BiMoneyWithdraw,
        label: "Выплаты переводом:",
        value: item.supportWorkTime,
      },
      {
        icon: MdHeadsetMic,
        label: "Техподдержка:",
        value:
          item.supportWorkTime === "Круглосуточно"
            ? "Круглосуточно"
            : "Ограниченно",
      },
      {
        icon: MdBusinessCenter,
        label: "Парковое ИП:",
        value: item.parkEntrepreneurSupport ? "Да" : "Нет",
      },
      {
        icon: FaHandshake,
        label: "Поддержка регистрации ИП:",
        value: item.entrepreneurSupport ? "Да" : "Нет",
      },
      {
        icon: TbCashRegister,
        label: "Ведение бухгалтерии:",
        value: item.accountantSupport ? "Да" : "Нет",
      },
      {
        icon: FaGasPump,
        label: "Яндекс Заправка:",
        value: item.yandexGasStation ? "Да" : "Нет",
      },
      {
        icon: MdCarRental,
        label: "Аренды машины от парка:",
        value: item.yandexGasStation ? "Да" : "Нет",
        customIconClass: true,
      },
    ];

    return (
      <div
        className="z-[2] absolute w-full h-full bg-white flex flex-col items-start cursor-pointer rounded-2xl rotate-y-180 p-4"
        onClick={toggleFlip}
        style={{
          transform: "rotateY(180deg)",
          backfaceVisibility: "hidden",
        }}
      >
        <h3 className="font-semibold text-lg mb-4">{item.title}</h3>
        <div className="flex flex-col gap-3">
          {details.map(({ icon: Icon, label, value, customIconClass }, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-6 flex items-start">
                <Icon
                  className={customIconClass ? "-ml-1 text-2xl" : "text-xl"}
                />
              </div>
              <span className="text-sm">{label}</span>
              <span className="text-sm">{value}</span>
            </div>
          ))}
          {item.parkPromotions && item.parkPromotions.length > 0 && (
            <div className="flex items-start gap-3">
              <div className="w-6 flex items-start">
                <LuGift className="text-xl" />
              </div>
              <div className="flex flex-wrap gap-2">
                {item.parkPromotions.map((bonus) => {
                  const promotion = allParkPromotions.find(
                    (promo) => promo.value === bonus
                  );
                  if (promotion) {
                    return (
                      <span
                        key={bonus}
                        className="bg-yellow-200 px-2 py-1 rounded-md text-sm"
                      >
                        {promotion.label}
                      </span>
                    );
                  }
                })}
              </div>
            </div>
          )}
        </div>
        <button
          className="mt-auto w-full bg-black text-white py-2 rounded-lg"
          onClick={openModal}
        >
          Оставить заявку
        </button>
      </div>
    );
  }
);

BackSide.displayName = "BackSide";

export default BackSide;
