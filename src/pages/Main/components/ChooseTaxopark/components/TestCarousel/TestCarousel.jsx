import { List, Skeleton, Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { memo, useEffect, useRef, useState } from "react";
import "./TestCarousel.css";
import CarouselItem from "../Carousel/CarouselItem/CarouselItem";

const TestCarousel = memo(
    ({ products, isLoading = true }) => {
        const [carouselItemWidth, setCarouselItemWidth] = useState(0);
        const [carouselDisabled, setCarouselDisabled] = useState(false);
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
                style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}
            >
                {window.innerWidth >= 768 && (
                    <>
                        <Button className="related-carousel-button-left" onClick={scrollLeft} icon={<LeftOutlined />} />
                        <Button className="related-carousel-button-right" onClick={scrollRight} icon={<RightOutlined />} />
                    </>
                )}
                <div ref={listRef} className="horizontal-scroll-container">
                    {isLoading && (
                        <div
                            ref={carouselListRef}
                            className="ant-list-items"
                        >
                            {Array.from({ length: 3 }, (_, index) => <Skeleton active className="flip-card" />)}
                        </div>
                    )}
                    {products.length > 0 && (
                        <div
                            ref={carouselListRef}
                            className="ant-list-items"
                        >
                            {products.map((item) => {
                                return <CarouselItem index={item.id} item={item} setCarouselDisabled={setCarouselDisabled} carouselItemWidth={carouselItemWidth} />
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

export default TestCarousel;
