import { useState } from "react";
import { useQuery } from "react-query";
import Filters from "./components/Filters";
import { Button, Drawer } from "antd";
import "./ChooseTaxopark.css";
import TestCarousel from "./components/TestCarousel/TestCarousel";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const fetchCities = async () => {
  const response = await axios.get(`${API_URL}/cities?page=1&limit=1000`);
  return response.data;
};

const ChooseTaxopark = () => {
  const [items, setItems] = useState([]);
  const [itemsCount, setItemsCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: cities = [], isLoading: citiesLoading } = useQuery(
    "cities",
    fetchCities,
    { staleTime: 5 * 60 * 1000, cacheTime: 10 * 60 * 1000 }
  );

  return (
    <div className="carousel-wrapper">
      <div className="choose-taxopark-title">
        <h1>Выберите лучший таксопарк</h1>
        <span>
          Сравните комиссии, скорость выплат и бонусы разных таксопарков
        </span>
      </div>
      <div className="desktop-filters">
        <Filters setItems={setItems} cities={cities} setIsLoading={setIsLoading} setItemsCount={setItemsCount} />
      </div>
      <div className="carousel-header">
        <h3 className="carousel-count">
          Найдено таксопарков: {itemsCount}
        </h3>
        <Button
          className="carousel-filters-button"
          onClick={() => setIsDrawerOpen(true)}
          type="primary"
        >
          Расчитать доход
        </Button>
      </div>
      <TestCarousel items={items} isLoading={isLoading || citiesLoading} />
      <Drawer
        open={isDrawerOpen}
        title="Расчитать доход"
        onClose={() => setIsDrawerOpen(false)}
        className="carousel-drawer"
      >
        <Filters setItems={setItems} cities={cities} setIsLoading={setIsLoading} setItemsCount={setItemsCount} />
        <Button
          className="drawer-apply-button"
          size="large"
          type="primary"
          onClick={() => setIsDrawerOpen(false)}
        >
          Применить
        </Button>
      </Drawer>
    </div>
  );
};

export default ChooseTaxopark;
