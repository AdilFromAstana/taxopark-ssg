/* eslint-disable react/prop-types */
import { Skeleton, Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { memo, useEffect, useRef, useState } from "react";
import "./Carousel.css";
import CarouselItem from "./CarouselItem/CarouselItem";

const Carousel = memo(({ items, isLoading = true, cities }) => {
  const [carouselItemWidth, setCarouselItemWidth] = useState(0);
  const carouselWrapperRef = useRef(null);
  const carouselListRef = useRef(null);
  const listRef = useRef(null);

  const scrollToStart = () => {
    if (listRef.current) {
      listRef.current.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    }
  };

  const scrollLeft = () => {
    if (carouselListRef.current) {
      carouselListRef.current.scrollBy({
        left: -carouselItemWidth,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (carouselListRef.current) {
      carouselListRef.current.scrollBy({
        left: carouselItemWidth,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const updateItemWidth = () => {
      if (carouselWrapperRef.current) {
        const pageWidth = window.innerWidth;
        const carouselWidth = carouselWrapperRef.current.offsetWidth;
        let cardWidth;
        if (pageWidth <= 449) {
          cardWidth = carouselWidth / 1.15;
        } else if (pageWidth <= 768) {
          cardWidth = carouselWidth / 1.5;
        } else if (pageWidth <= 1024) {
          cardWidth = carouselWidth / 2;
        } else {
          cardWidth = carouselWidth / 3;
        }
        setCarouselItemWidth(cardWidth);
      }
    };

    updateItemWidth();
    scrollToStart();

    window.addEventListener("resize", updateItemWidth);
    return () => window.removeEventListener("resize", updateItemWidth);
  }, []);

  return (
    <div
      ref={carouselWrapperRef}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        position: "relative",
      }}
    >
      {window.innerWidth >= 768 && (
        <>
          <Button
            className="related-carousel-button-left"
            onClick={scrollLeft}
            icon={<LeftOutlined />}
          />
          <Button
            className="related-carousel-button-right"
            onClick={scrollRight}
            icon={<RightOutlined />}
          />
        </>
      )}
      <div ref={listRef} className="horizontal-scroll-container">
        {/* {isLoading && ( */}
        <div
          ref={carouselListRef}
          className="ant-list-items"
          style={{ gap: 20 }}
        >
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton
              key={index}
              active
              className="flip-card"
              style={{ height: 650 }}
            />
          ))}
        </div>
        {/* )} */}
        {/* {items.length > 0 && (
          <div ref={carouselListRef} className="ant-list-items">
            {items.map((item) => {
              return (
                <CarouselItem
                  cities={cities}
                  key={item.id}
                  index={item.id}
                  item={item}
                  carouselItemWidth={carouselItemWidth}
                />
              );
            })}
          </div>
        )} */}
      </div>
    </div>
  );
});

Carousel.displayName = "Carousel";

export default Carousel;
