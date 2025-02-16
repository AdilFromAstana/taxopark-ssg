// import { formatNumber } from "@/app/common/common";
import { memo } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { IoIosStar } from "react-icons/io";
import { LuClock3, LuGift } from "react-icons/lu";
import { MdHeadsetMic, MdPercent } from "react-icons/md";

const allParkPromotions = [
  { label: "Гарантированные бонусы", value: 1 },
  { label: "Приветственные бонусы", value: 2 },
  { label: "Розыгрыш", value: 3 },
  { label: "Бонус за активность", value: 4 },
  { label: "Приведи друга", value: 5 },
];

const FrontSide = memo(({ item, toggleFlip, openModal }) => {
  const details = [
    {
      icon: IoIosStar,
      label: "4.8",
      customClass: "text-yellow-400",
    },
    {
      icon: MdPercent,
      label: `Комиссия парка ${item.parkCommission}%`,
    },
    {
      icon: LuClock3,
      label: "Моментальные выплаты",
    },
    {
      icon: MdHeadsetMic,
      label: item.supportWorkTime,
    },
    {
      icon: FaLocationDot,
      label: item.City.title,
    },
  ];

  return (
    <div
      className="z-[1] absolute w-full h-full bg-white flex flex-col items-center cursor-pointer rounded-2xl"
      style={{
        backfaceVisibility: "hidden",
      }}
      onClick={toggleFlip}
    >
      <img
        className="w-full h-44 object-cover rounded-t-2xl"
        height={2000}
        width={2000}
        src="https://www.shbarcelona.ru/blog/ru/wp-content/uploads/2020/01/oli-woodman-fwYZ3B_QQco-unsplash.jpg"
        alt={item.title}
      />
      <div className="flex flex-col items-start gap-2 p-4 flex-grow w-full rounded-lg">
        <div className="text-center font-bold w-full text-3xl p-3">
          {/* {formatNumber(item.approximateIncome)} ₸ */}
        </div>
        <h3 className="font-semibold text-lg">{item.title}</h3>
        {details.map(({ icon: Icon, label, customClass = "" }, idx) => (
          <div key={idx} className={`flex items-center gap-2 ${customClass}`}>
            <Icon className="text-xl" />
            <span>{label}</span>
          </div>
        ))}
        {item.parkPromotions && item.parkPromotions?.length > 0 && (
          <div className="flex items-start gap-2">
            <div className="w-5">
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
        <button
          className="mt-auto w-full bg-black text-white py-2 rounded-lg"
          onClick={openModal}
        >
          Оставить заявку
        </button>
      </div>
    </div>
  );
});
FrontSide.displayName = "FrontSide";

export default FrontSide;
