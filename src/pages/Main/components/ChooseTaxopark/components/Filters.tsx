"use clinet";

import React, { memo, useEffect, useRef, useState } from "react";
import { MdOutlineCalendarToday } from "react-icons/md";
import { LuClock3, LuGift } from "react-icons/lu";
import { FiHeadphones } from "react-icons/fi";
import { FaCarSide } from "react-icons/fa6";
import { FaLocationDot } from "react-icons/fa6";
import { City, GetParks } from "@/app/interfaces/interfaces";

const allParkPromotions = [
  { label: "Гарантированные бонусы", value: 1 },
  { label: "Приветственные бонусы", value: 2 },
  { label: "Розыгрыш", value: 3 },
  { label: "Бонус за активность", value: 4 },
  { label: "Приведи друга", value: 5 },
];

interface FiltersProps {
  setFilteredItems: React.Dispatch<React.SetStateAction<unknown[]>>;
  setTotalRecords: React.Dispatch<React.SetStateAction<number>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  cities: City[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Filters: React.FC<FiltersProps> = memo(
  ({ setFilteredItems, setIsLoading, setTotalRecords, cities }) => {
    const [supportTimeFilters, setSupportTimeFilters] = useState<{
      allDay: boolean;
      limited: boolean;
    }>({
      allDay: false,
      limited: false,
    });

    const handleSupportTimeFilters = (
      filterType: keyof typeof supportTimeFilters
    ) => {
      setSupportTimeFilters((prevFilters) => ({
        ...prevFilters,
        [filterType]: !prevFilters[filterType],
      }));
    };

    const [workDays, setWorkDays] = useState(10);
    const [orderPerDay, setOrderPerDay] = useState(10);
    const yandexCommission = 7;

    const [parkPromotions, setParkPromotions] = useState<number[]>([]);
    const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
    const [isPaymentWithCommission, setIsPaymentWithCommission] =
      useState(false);

    const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${API_URL}/parks?page=1&limit=1000&cityId=${selectedCityId}&parkPromotions=${parkPromotions}`
        );
        const result: GetParks = await response.json();
        const updatedParks = result.parks.map((park) => {
          return {
            ...park,
            approximateIncome:
              workDays * orderPerDay * Number(park.averageCheck) -
              (yandexCommission + Number(park.parkCommission)) *
                ((workDays * orderPerDay * Number(park.averageCheck)) / 100),
            // (yandexCommission + park.parkCommission)
          };
        });
        setFilteredItems(updatedParks);
        setTotalRecords(result.total);
      } catch (error) {
        console.error("Ошибка при загрузке данных: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debouncedFilter = () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current); // Очистить предыдущий таймер
      }
      debounceTimeout.current = setTimeout(() => {
        fetchData();
      }, 700);
    };

    useEffect(() => {
      debouncedFilter();
      return () => {
        if (debounceTimeout.current) {
          clearTimeout(debounceTimeout.current);
        }
      };
    }, [
      workDays,
      orderPerDay,
      parkPromotions,
      isPaymentWithCommission,
      selectedCityId,
      supportTimeFilters,
    ]);

    return (
      <div className="bg-white w-full">
        <div>
          <h2 className="text-lg font-bold mb-4">Расчитать доход</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full">
          <div>
            <label className="flex items-center gap-2 mb-2 font-bold">
              Кол-во дней в парке
              <MdOutlineCalendarToday />
            </label>
            <input
              type="range"
              min={0}
              max={30}
              value={workDays}
              onChange={(e) => setWorkDays(Number(e.target.value))}
              className="w-full"
            />
            <span className="block mt-2 font-bold">{workDays}</span>
          </div>

          <div>
            <label className="flex items-center gap-2 mb-2 font-bold">
              Выплаты <LuClock3 />
            </label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isPaymentWithCommission}
                  onChange={() => setIsPaymentWithCommission(true)}
                  className="mr-2"
                />
                С комиссией
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={!isPaymentWithCommission}
                  onChange={() => setIsPaymentWithCommission(false)}
                  className="mr-2"
                />
                Без комиссии
              </label>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 mb-2 font-bold">
              Техподдержка <FiHeadphones />
            </label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={supportTimeFilters.allDay}
                  onChange={() => handleSupportTimeFilters("allDay")}
                  className="mr-2"
                />
                Круглосуточно
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={supportTimeFilters.limited}
                  onChange={() => handleSupportTimeFilters("limited")}
                  className="mr-2"
                />
                Ограниченное время
              </label>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 mb-2 font-bold">
              Кол-во заказов в день <FaCarSide />
            </label>
            <input
              type="range"
              min={0}
              max={50}
              value={orderPerDay}
              onChange={(e) => setOrderPerDay(Number(e.target.value))}
              className="w-full"
            />
            <span className="block mt-2 font-bold">{orderPerDay}</span>
          </div>

          <div>
            <label className="flex items-center gap-2 mb-2 font-bold">
              Акции парка <LuGift />
            </label>
            <div className="flex flex-col flex-wrap gap-2">
              {allParkPromotions.map((promotion) => (
                <label key={promotion.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={parkPromotions.includes(promotion.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setParkPromotions([...parkPromotions, promotion.value]);
                      } else {
                        setParkPromotions(
                          parkPromotions.filter(
                            (item) => item !== promotion.value
                          )
                        );
                      }
                    }}
                    className="mr-2"
                  />
                  {promotion.label}
                </label>
              ))}
            </div>
          </div>

          {/* Город */}
          <div>
            <label className="flex items-center gap-2 mb-2">
              Город <FaLocationDot />
            </label>
            <select
              value={selectedCityId || ""}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
            >
              <option value="">Выберите город</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }
);

Filters.displayName = "Filters";

export default Filters;
