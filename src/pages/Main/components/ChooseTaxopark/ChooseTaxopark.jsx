import { memo, useEffect, useState } from "react";
// import Carousel from "./components/Carousel";
import Filters from "./components/Filters";
import Carousel from "./components/Carousel";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ChooseTaxopark = memo(() => {
  const [filteredItems, setFilteredItems] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cities, setCities] = useState([]);

  const getCities = async () => {
    try {
      const response = await axios.get(`${API_URL}/cities`);
      setCities(response.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getCities();
  }, []);

  return (
    <section className="flex flex-col items-center mt-10 mx-auto">
      <div className="text-center mb-6 w-full lg:w-[70vw]">
        <h1 className="text-2xl lg:text-4xl font-bold">
          Выберите лучший таксопарк
        </h1>
        <span className="text-base lg:text-lg text-gray-700">
          Сравните комиссии, скорость выплат и бонусы разных таксопарков
        </span>
      </div>
      <div className="hidden lg:flex w-full lg:w-[70vw] mb-4">
        <Filters
          setFilteredItems={setFilteredItems}
          setTotalRecords={setTotalRecords}
          setIsLoading={setIsLoading}
          cities={cities}
        />
      </div>
      <div className="flex justify-between items-center w-full md:w-auto lg:w-[70vw] mb-6">
        <h3 className="text-lg font-semibold">
          Найдено таксопарков: {totalRecords}
        </h3>
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          onClick={() => setIsDrawerOpen(true)}
        >
          Расчитать доход
        </button>
      </div>
      <Carousel items={filteredItems} isLoading={isLoading} />
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <Filters
              setFilteredItems={setFilteredItems}
              setTotalRecords={setTotalRecords}
              setIsLoading={setIsLoading}
              cities={cities}
            />
            <button
              className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              onClick={() => setIsDrawerOpen(false)}
            >
              Применить
            </button>
          </div>
        </div>
      )}
    </section>
  );
});
ChooseTaxopark.displayName = "ChooseTaxopark";

export default ChooseTaxopark;
