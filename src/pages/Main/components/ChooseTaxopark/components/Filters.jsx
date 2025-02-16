"use clinet";

import React, { memo, useEffect, useRef, useState } from "react";
import { MdOutlineCalendarToday } from "react-icons/md";
import { LuClock3, LuGift } from "react-icons/lu";
import { FiHeadphones } from "react-icons/fi";
import { FaCarSide } from "react-icons/fa6";
import { FaLocationDot } from "react-icons/fa6";
import { Card, Checkbox, Col, Row, Select, Slider } from "antd";

const allParkPromotions = [
  { label: "Гарантированные бонусы", value: 1 },
  { label: "Приветственные бонусы", value: 2 },
  { label: "Розыгрыш", value: 3 },
  { label: "Бонус за активность", value: 4 },
  { label: "Приведи друга", value: 5 },
];

const API_URL = import.meta.env.VITE_API_URL;

const Filters = memo(
  ({ setFilteredItems, setIsLoading, setTotalRecords, cities }) => {
    const [supportTimeFilters, setSupportTimeFilters] = useState({
      allDay: false,
      limited: false,
    });

    console.log("cities: ", cities)

    const handleSupportTimeFilters = (
      filterType
    ) => {
      setSupportTimeFilters((prevFilters) => ({
        ...prevFilters,
        [filterType]: !prevFilters[filterType],
      }));
    };

    const [workDays, setWorkDays] = useState(10);
    const [orderPerDay, setOrderPerDay] = useState(10);
    const yandexCommission = 7;

    const [parkPromotions, setParkPromotions] = useState([]);
    const [selectedCityId, setSelectedCityId] = useState(null);
    const [isPaymentWithCommission, setIsPaymentWithCommission] =
      useState(false);

    const debounceTimeout = useRef(null);

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${API_URL}/parks?page=1&limit=1000&cityId=${selectedCityId}&parkPromotions=${parkPromotions}`
        );
        const result = await response.json();
        const updatedParks = result.data.map((park) => {
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
      <Card className="filters-card">
        <h2 className="filters-title">Выбрать таксопарк</h2>
        <Row className="filters-grid">
          <Col>
            <h4 className="filter-label">
              Кол-во дней в парке
              <MdOutlineCalendarToday fontSize="20px" />
            </h4>
            <Slider
              min={0}
              max={30}
              value={workDays}
              onChange={setWorkDays}
              tooltip={{ formatter: (value) => value }}
            />
            <span className="filter-value">{workDays}</span>
          </Col>

          <Col>
            <h4 className="filter-label">
              Выплаты <LuClock3 fontSize="20px" />
            </h4>
            <div className="filter-checkbox-group">
              <Checkbox
                checked={isPaymentWithCommission}
                onChange={(e) => setIsPaymentWithCommission(true)}
              >
                С комиссией
              </Checkbox>
              <Checkbox
                checked={!isPaymentWithCommission}
                onChange={(e) => setIsPaymentWithCommission(false)}
              >
                Без комиссии
              </Checkbox>
            </div>
          </Col>

          <Col>
            <h4 className="filter-label">
              Техподдержка <FiHeadphones fontSize="20px" />
            </h4>
            <div className="filter-checkbox-group">
              <Checkbox
                type="checkbox"
                checked={supportTimeFilters.allDay}
                onChange={() => handleSupportTimeFilters("allDay")}
              >
                Круглосуточно
              </Checkbox>
              <Checkbox
                type="checkbox"
                checked={supportTimeFilters.limited}
                onChange={() => handleSupportTimeFilters("limited")}
              >
                Ограниченное время
              </Checkbox>
            </div>
          </Col>

          <Col>
            <h4 className="filter-label">
              Кол-во заказов в день <FaCarSide fontSize="20px" />
            </h4>
            <Slider
              min={0}
              max={50}
              value={orderPerDay}
              onChange={setOrderPerDay}
              tooltip={{ formatter: (value) => value }}
            />
            <span className="filter-value">{orderPerDay}</span>
          </Col>

          <Col>
            <h4 className="filter-label">
              Акции парка <LuGift fontSize="20px" />
            </h4>
            {/* <div className="filter-checkbox-group">
              {allParkPromotions.map((parkPromotion) => {
                return (
                  <Checkbox
                    key={parkPromotion}
                    checked={parkPromotions.includes(parkPromotion)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setParkPromotions((parkPromotions) => [
                          ...parkPromotions,
                          parkPromotion,
                        ]);
                      } else {
                        setParkPromotions((parkPromotions) =>
                          parkPromotions.filter((item) => item !== parkPromotion)
                        );
                      }
                    }}
                  >
                    {parkPromotion}
                  </Checkbox>
                );
              })}
            </div> */}
          </Col>

          <Col>
            <h4 className="filter-label">
              Город <FaLocationDot fontSize="20px" />
            </h4>
            <div className="filter-select">
              <Select
                style={{ width: "100%" }}
                allowClear
                placeholder="Выберите город"
                options={cities.map((city) => ({
                  value: city.id, // Значение для выбора
                  label: city.title, // Отображаемый текст
                  key: city.id, // Уникальный ключ (необязательно)
                }))}
                onChange={setSelectedCityId}
                value={selectedCityId}
              />
            </div>
          </Col>
        </Row>
      </Card>
    );
  }
);

Filters.displayName = "Filters";

export default Filters;
