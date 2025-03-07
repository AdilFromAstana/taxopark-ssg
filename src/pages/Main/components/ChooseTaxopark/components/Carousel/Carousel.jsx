/* eslint-disable react/prop-types */
import { Skeleton, Button, Result } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { memo, useEffect, useRef, useState } from "react";
import "./Carousel.css";
import CarouselItem from "./CarouselItem/CarouselItem";

const Carousel = memo(({ items = [], isLoading = true, cities }) => {
  const [carouselItemWidth, setCarouselItemWidth] = useState(0);
  const [disableLeft, setDisableLeft] = useState(true);
  const [disableRight, setDisableRight] = useState(false);

  const carouselWrapperRef = useRef(null);
  const carouselListRef = useRef(null);
  const listRef = useRef(null);

  const updateButtonsState = () => {
    if (!carouselListRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = carouselListRef.current;
    setDisableLeft(scrollLeft <= 0);
    setDisableRight(scrollLeft + clientWidth >= scrollWidth);
  };

  const scrollToStart = () => {
    if (listRef.current) {
      listRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
    if (carouselListRef.current) {
      carouselListRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  const scrollLeft = () => {
    if (carouselListRef.current) {
      carouselListRef.current.scrollBy({
        left: -carouselItemWidth,
        behavior: "smooth",
      });
      setTimeout(updateButtonsState, 300);
    }
  };

  const scrollRight = () => {
    if (carouselListRef.current) {
      carouselListRef.current.scrollBy({
        left: carouselItemWidth,
        behavior: "smooth",
      });
      setTimeout(updateButtonsState, 300);
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
    updateButtonsState();

    window.addEventListener("resize", updateItemWidth);
    return () => window.removeEventListener("resize", updateItemWidth);
  }, [items]);

  useEffect(() => {
    const handleScroll = () => updateButtonsState();
    const list = carouselListRef.current;

    if (list) {
      list.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (list) {
        list.removeEventListener("scroll", handleScroll);
      }
    };
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
      {window.innerWidth >= 768 && items.length > 0 && (
        <>
          <Button
            className="related-carousel-button-left"
            onClick={scrollLeft}
            icon={<LeftOutlined />}
            disabled={disableLeft}
          />
          <Button
            className="related-carousel-button-right"
            onClick={scrollRight}
            icon={<RightOutlined />}
            disabled={disableRight}
          />
        </>
      )}
      <div ref={listRef} className="horizontal-scroll-container">
        {isLoading ? (
          <div className="ant-list-items">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index}>
                <Skeleton active style={{ width: carouselItemWidth }} />
                <Skeleton active style={{ width: carouselItemWidth }} />
                <Skeleton active style={{ width: carouselItemWidth }} />
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
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
        ) : (
          items.length === 0 && (
            <Result
              title="Таксопарки не найдены!"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 450,
                border: "1px solid #f0f0f0",
                borderRadius: 10,
                background: "rgb(247, 247, 247)",
              }}
            />
          )
        )}
      </div>
    </div>
  );
});

Carousel.displayName = "Carousel";

export default Carousel;
