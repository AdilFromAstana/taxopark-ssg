import { useEffect, useState } from "react";
import Carousel from "./components/Carousel/Carousel";
import Filters from "./components/Filters";
import { Button, Drawer } from "antd";
import "./ChooseTaxopark.css";
import TestCarousel from "./components/TestCarousel/TestCarousel";

const API_URL = import.meta.env.VITE_API_URL;

const ChooseTaxopark = () => {
  const [filteredItems, setFilteredItems] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState([]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/cities?page=1&limit=1000`);
      const result = await response.json();
      setCities(result);
    } catch (error) {
      console.error("Ошибка при загрузке данных: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  console.log("cities: ", cities);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="carousel-wrapper">
      <div className="choose-taxopark-title">
        <h1>Выберите лучший таксопарк</h1>
        <span>
          Сравните комиссии, скорость выплат и бонусы разных таксопарков
        </span>
      </div>
      <div className="desktop-filters">
        <Filters setFilteredItems={setFilteredItems} cities={cities} setIsLoading={setIsLoading} />
      </div>
      <div className="carousel-header">
        <h3 className="carousel-count">
          Найдено таксопарков: {filteredItems.length}
        </h3>
        <Button
          className="carousel-filters-button"
          onClick={() => setIsDrawerOpen(true)}
          type="primary"
        >
          Расчитать доход
        </Button>
      </div>
      {/* <Carousel items={filteredItems} isLoading={isLoading} /> */}
      <TestCarousel products={filteredItems} isLoading={isLoading} />
      <Drawer
        open={isDrawerOpen}
        title="Расчитать доход"
        onClose={() => setIsDrawerOpen(false)}
        className="carousel-drawer"
      >
        <Filters setFilteredItems={setFilteredItems} cities={cities} setIsLoading={setIsLoading} />
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
