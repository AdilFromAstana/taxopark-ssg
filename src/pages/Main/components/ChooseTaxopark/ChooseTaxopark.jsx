import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Filters from "./components/Filters";
import { Button, Drawer } from "antd";
import "./ChooseTaxopark.css";
import Carousel from "./components/Carousel/Carousel";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const fetchCities = async () => {
  const response = await axios.get(
    `${API_URL}/cities?page=1&limit=1000&active=true`
  );
  return response.data;
};

const ChooseTaxopark = () => {
  const queryClient = useQueryClient();
  const [items, setItems] = useState([]);
  const [itemsCount, setItemsCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: cities, isLoading: citiesLoading } = useQuery({
    queryKey: ["cities", { active: true }],
    queryFn: async ({ queryKey }) => {
      const [, params] = queryKey;

      const cachedData = queryClient.getQueryData(["cities", params]);
      if (cachedData) {
        return cachedData;
      }

      return fetchCities(params);
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  return (
    <div className="carousel-wrapper">
      <div className="choose-taxopark-title">
        <h1>Выберите лучший таксопарк</h1>
        <span>
          Сравните комиссии, скорость выплат и бонусы разных таксопарков
        </span>
      </div>
      <div className="desktop-filters">
        <Filters
          setItems={setItems}
          cities={cities?.data || []}
          setIsLoading={setIsLoading}
          setItemsCount={setItemsCount}
        />
      </div>
      <div className="carousel-header">
        <h3 className="carousel-count">Найдено таксопарков: {itemsCount}</h3>
        <Button
          className="carousel-filters-button"
          onClick={() => setIsDrawerOpen(true)}
          type="primary"
        >
          Расчитать доход
        </Button>
      </div>
      <Carousel
        items={items}
        isLoading={isLoading || citiesLoading}
        cities={cities?.data || []}
      />
      <Drawer
        open={isDrawerOpen}
        title="Расчитать доход"
        onClose={() => setIsDrawerOpen(false)}
        className="carousel-drawer"
      >
        <Filters
          setItems={setItems}
          cities={cities?.data || []}
          setIsLoading={setIsLoading}
          setItemsCount={setItemsCount}
        />
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
