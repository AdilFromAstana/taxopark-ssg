import { useEffect, useRef, useState } from "react";
import "./Reviews.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const fetchReviews = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/reviews?page=1&limit=10&active=true&sortField=priority&sortOrder=asc`
    );
    return response.data;
  } catch (error) {
    console.error("Ошибка при загрузке отзывов:", error);
    throw new Error("Ошибка загрузки отзывов");
  }
};

const Reviews = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [carouselItemWidth, setCarouselItemWidth] = useState(0);
  const [disableLeft, setDisableLeft] = useState(true);
  const [disableRight, setDisableRight] = useState(false);

  const sectionRef = useRef(null);
  const carouselWrapperRef = useRef(null);
  const carouselListRef = useRef(null);

  const { data: reviews = { data: [] } } = useQuery({
    queryKey: ["reviews"],
    queryFn: fetchReviews,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  });

  const updateButtonsState = () => {
    if (!carouselListRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = carouselListRef.current;
    setDisableLeft(scrollLeft <= 0);
    setDisableRight(scrollLeft + clientWidth >= scrollWidth);
  };

  const scrollLeft = () => {
    if (carouselListRef.current) {
      carouselListRef.current.scrollBy({
        left: -carouselItemWidth, // Скроллим по 1 элементу
        behavior: "smooth",
      });
      setTimeout(updateButtonsState, 300);
    }
  };

  const scrollRight = () => {
    if (carouselListRef.current) {
      carouselListRef.current.scrollBy({
        left: carouselItemWidth, // Скроллим по 1 элементу
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
          cardWidth = carouselWidth / 3;
        } else {
          cardWidth = carouselWidth / 5;
        }
        setCarouselItemWidth(cardWidth - 20);
      }
    };

    updateItemWidth();
    updateButtonsState();

    window.addEventListener("resize", updateItemWidth);
    return () => window.removeEventListener("resize", updateItemWidth);
  }, [reviews]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (observer && sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      className={`reviews-section ${isVisible ? "reviews-visible" : ""}`}
      ref={sectionRef}
    >
      <div className="reviews-container">
        <h2 className="reviews-title">Отзывы</h2>

        {reviews.data.length > 0 && (
          <div ref={carouselWrapperRef} className="reviews-carousel-container">
            {window.innerWidth >= 768 && reviews.data.length > 5 && (
              <>
                <button
                  className="reviews-carousel-button reviews-carousel-button-left"
                  onClick={scrollLeft}
                  disabled={disableLeft}
                >
                  ❮
                </button>

                <button
                  className="reviews-carousel-button reviews-carousel-button-right"
                  onClick={scrollRight}
                  disabled={disableRight}
                >
                  ❯
                </button>
              </>
            )}

            <div ref={carouselListRef} className="reviews-carousel-list">
              {reviews.data.map((review) => {
                const reviewImage = review?.imageUrl
                  ? `${API_URL}/uploads/${review?.imageUrl}`
                  : "https://www.eg.ru/wp-content/uploads/2024/07/tyuremnye-sroki-lyubov-so-zvezdoy-doma-2-i-jizn-v-rossii-chto-stalo-so-zvezdoy-taksi-sami-naseri.jpg";

                return (
                  <div key={review.id}>
                    <div
                      style={{
                        width: carouselItemWidth,
                        margin: "10px",
                      }}
                      className="reviews-card"
                    >
                      <img
                        src={reviewImage}
                        alt={review.name}
                        className="reviews-photo"
                      />
                      <h3 className="reviews-name">{review.name}</h3>
                      <p className="reviews-text">{review.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {reviews.data.length === 0 && (
          <p className="reviews-no-reviews">Отзывов пока нет</p>
        )}
      </div>
    </section>
  );
};

export default Reviews;
