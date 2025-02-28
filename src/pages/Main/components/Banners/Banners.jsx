import React, { useState, useEffect } from "react";
import { Carousel, Spin } from "antd";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const fetchBanners = async ({ page, pageSize, filters }) => {
  const response = await axios.get(`${API_URL}/banners`, {
    params: { page, limit: pageSize, ...filters },
  });
  return response.data;
};

const Banners = () => {
  const [bannerWidth, setBannerWidth] = useState("75vw");

  useEffect(() => {
    const updateBannerWidth = () => {
      setBannerWidth(window.innerWidth < 768 ? "95vw" : "75vw");
    };

    updateBannerWidth(); // Устанавливаем начальное значение
    window.addEventListener("resize", updateBannerWidth);

    return () => {
      window.removeEventListener("resize", updateBannerWidth);
    };
  }, []);

  const {
    data: items,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["banners"],
    queryFn: fetchBanners,
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <p style={{ textAlign: "center", color: "red" }}>
        Ошибка загрузки баннеров
      </p>
    );
  }

  return (
    <div style={{ width: bannerWidth, margin: "0 auto" }}>
      <Carousel
        autoplay
        dots
        slidesToShow={1}
        slidesToScroll={1}
        draggable
      >
        {items?.data?.map((item) => (
          <div key={item.id} style={{ position: "relative", width: "100%" }}>
            <div
              style={{
                width: "100%",
                aspectRatio: bannerWidth === "75vw" ? "16 / 6" : "16 / 8",
                overflow: "hidden",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <img
                src={`${API_URL}/uploads/${item.bannerUrl}`}
                alt={`Slide ${item.id}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover", // Заполнение без искажений
                }}
              />
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default Banners;
