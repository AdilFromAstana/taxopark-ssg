/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { FaCircleArrowLeft, FaCircleArrowRight } from "react-icons/fa6";
import CarouselItemSkeleton from "./CarouselItemSkeleton/CarouselItemSkeleton";
import CarouselItem from "./CarouselItem/CarouselItem";

const getCardCount = (width = 429) => {
  if (width <= 430) {
    return 1.1;
  } else if (width > 430 && width < 768) {
    return 1.5;
  } else if (width > 768 && width < 1024) {
    return 2;
  } else {
    return 3;
  }
};

const Carousel = ({ items, isLoading }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselItems, setCarouselItems] = useState([]);
  const carouselRef = useRef({ startX: null });
  const [carouselDisabled, setCarouselDisabled] = useState(false);
  const [slidesToShow, setSlidesToShow] = useState(getCardCount());

  console.log(carouselDisabled);

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      Math.min(prevIndex + 1, items.length - slidesToShow)
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    carouselRef.current.startX = touch.clientX;
  };

  const handleTouchMove = (e) => {
    if (carouselRef.current.startX === null) return;
    const touch = e.touches[0];
    const diffX = carouselRef.current.startX - touch.clientX;

    if (diffX > 50) {
      handleNext();
      carouselRef.current.startX = null;
    } else if (diffX < -50) {
      handlePrev();
      carouselRef.current.startX = null;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setSlidesToShow(getCardCount(window.innerWidth));
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    setCarouselItems(items);

    const carouselElement = carouselRef.current;
    if (!carouselElement) return;

    return () => {
      if (carouselRef.current) {
        carouselRef.current.startX = null;
      }
    };
  }, [items]);

  if (items && isLoading) {
    return (
      <div className="relative overflow-x-hidden overflow-y-visible w-[90vw] 2xl:w-[70vw] pb-4">
        <div className="flex transition-transform duration-300 bg-transparent w-[90vw] 2xl:w-[70vw]">
          {Array.from({ length: 3 }).map((_, index) => (
            <CarouselItemSkeleton key={index} slidesToShow={slidesToShow} />
          ))}
        </div>
      </div>
    );
  } else {
    return (
      <div className="relative mx-auto w-[90vw] 2xl:w-[70vw] overflow-y-visible">
        <div className="relative overflow-x-hidden overflow-y-visible w-[90vw] 2xl:w-[70vw] pb-4">
          <div
            ref={carouselRef}
            className="flex transition-transform duration-300 bg-transparent w-[90vw] 2xl:w-[70vw]"
            style={{
              transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)`,
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            {carouselItems.map((item) => (
              <CarouselItem
                key={item.id}
                slidesToShow={slidesToShow}
                item={item}
                setCarouselDisabled={setCarouselDisabled}
              />
            ))}
          </div>
        </div>

        <button
          className="absolute top-1/2 -left-4 lg:-left-4 transform -translate-y-1/2 lg:block hidden "
          onClick={handlePrev}
        >
          <FaCircleArrowLeft fontSize="lg:36px 20px" />
        </button>

        <button
          className="absolute top-1/2 -right-4 lg:-right-4 transform -translate-y-1/2 lg:block hidden "
          onClick={handleNext}
        >
          <FaCircleArrowRight fontSize="lg:36px 20px" />
        </button>
      </div>
    );
  }
};

export default Carousel;
