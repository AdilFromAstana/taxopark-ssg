/* eslint-disable react/prop-types */
import { memo, useEffect, useState } from "react";
import { MdOutlineCalendarToday } from "react-icons/md";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { LuClock3, LuGift } from "react-icons/lu";
import { FiHeadphones } from "react-icons/fi";
import { FaCarSide } from "react-icons/fa6";
import { FaLocationDot } from "react-icons/fa6";
import { Card, Checkbox, Col, Row, Select, Slider, Tooltip } from "antd";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const allParkPromotions = [
  { label: "Гарантированные бонусы", value: 1 },
  { label: "Приветственные бонусы", value: 2 },
  { label: "Розыгрыш", value: 3 },
  { label: "Бонус за активность", value: 4 },
  { label: "Приведи друга", value: 5 },
];

const API_URL = import.meta.env.VITE_API_URL;

const fetchCommission = async () => {
  const response = await axios.get(`${API_URL}/commissions/yandex`);
  return response.data;
};

const fetchParks = async (filters) => {
  const response = await axios.get(`${API_URL}/parks`, { params: filters });
  return response.data;
};

const Filters = memo(({ setItems, setIsLoading, cities, setItemsCount }) => {
  const [supportTimeFilters, setSupportTimeFilters] = useState({
    allDay: false,
    limited: false,
  });
  const handleSupportTimeFilters = (filterType) => {
    setSupportTimeFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: !prevFilters[filterType],
    }));
  };

  const [workDays, setWorkDays] = useState(10);
  const [orderPerDay, setOrderPerDay] = useState(10);
  // const yandexCommission = 7;
  const [parkPromotions, setParkPromotions] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState([]);
  const [isPaymentWithCommission, setIsPaymentWithCommission] = useState(false);

  const { data: yandexCommission = { sum: 7 } } = useQuery({
    queryKey: [
      "yandexCommission",
      {
        code: "yandex",
      },
    ],
    queryFn: () =>
      fetchCommission({
        code: "yandex",
      }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  const { data, isLoading } = useQuery({
    queryKey: [
      "parks",
      {
        selectedCityId,
        parkPromotions,
        isPaymentWithCommission,
        supportTimeFilters,
      },
    ],
    queryFn: () =>
      fetchParks({
        limit: 1000,
        cityIds: selectedCityId,
        parkPromotions: parkPromotions.join(","),
        isPaymentWithCommission,
        supportAllDay: supportTimeFilters.allDay,
        supportLimited: supportTimeFilters.limited,
        active: true,
        sortField: "priority",
        sortOrder: "asc",
      }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (selectedCityId.length === 0 && cities.length > 0) {
      const almatyCity = cities.find((city) => city.title === "Алматы");
      if (almatyCity) {
        setSelectedCityId(almatyCity.id); // Устанавливаем ID "Алматы"
      }
    }
  }, [cities]);

  useEffect(() => {
    if (data) {
      const updatedParks = data?.data.map((park) => {
        const cityAverageCheck =
          park.averageCheckPerCity?.find(
            (item) => item.cityId === selectedCityId
          )?.averageCheck || 0;
        const approximateIncome =
          workDays * orderPerDay * Number(cityAverageCheck) -
          (yandexCommission?.sum + Number(park.parkCommission)) *
            ((workDays * orderPerDay * Number(cityAverageCheck)) / 100);

        return {
          ...park,
          approximateIncome,
          selectedCityId,
        };
      });

      setItemsCount(data?.total);
      setItems(updatedParks);
    }
    setIsLoading(isLoading);
  }, [workDays, orderPerDay, data, selectedCityId, cities]);

  return (
    <Card className="filters-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 className="filters-title">Выбрать таксопарк</h2>
        <div className="filters-info">
          <span style={{ fontSize: 14 }}>Расчет, указанный на сайте...</span>
          <Tooltip title="Расчет, указанный на сайте, является ориентировочным. Итоговая сумма может отличаться в зависимости от условий конкретного таксопарка и текущего спроса на такси.">
            <AiOutlineInfoCircle style={{ fontSize: 16, color: "#1677ff" }} />
          </Tooltip>
        </div>
      </div>
      <Row className="filters-grid">
        <Col>
          <h4 className="filter-label">
            Кол-во дней в парке <MdOutlineCalendarToday fontSize="20px" />
          </h4>
          <Slider min={0} max={30} value={workDays} onChange={setWorkDays} />
          <span className="filter-value">{workDays}</span>
        </Col>

        <Col>
          <h4 className="filter-label">
            Выплаты <LuClock3 fontSize="20px" />
          </h4>
          <div className="filter-checkbox-group">
            <Checkbox
              checked={isPaymentWithCommission}
              onChange={() => setIsPaymentWithCommission(true)}
            >
              С комиссией
            </Checkbox>
            <Checkbox
              checked={!isPaymentWithCommission}
              onChange={() => setIsPaymentWithCommission(false)}
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
              checked={supportTimeFilters.allDay}
              onChange={() => handleSupportTimeFilters("allDay")}
            >
              Круглосуточно
            </Checkbox>
            <Checkbox
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
          />
          <span className="filter-value">{orderPerDay}</span>
        </Col>

        <Col>
          <h4 className="filter-label">
            Город <FaLocationDot fontSize="20px" />
          </h4>
          <Select
            style={{ width: "100%" }}
            placeholder="Выберите город"
            options={cities.map((city) => ({
              value: city.id,
              label: city.title,
              key: city.id,
            }))}
            onChange={setSelectedCityId}
            value={selectedCityId}
          />
        </Col>

        <Col>
          <h4 className="filter-label">
            Акции и бонусы <LuGift fontSize="20px" />
          </h4>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            allowClear
            placeholder="Выберите город"
            options={allParkPromotions}
            onChange={setParkPromotions}
            value={parkPromotions}
            maxTagCount={1}
          />
        </Col>
      </Row>
    </Card>
  );
});

Filters.displayName = "Filters";

export default Filters;
