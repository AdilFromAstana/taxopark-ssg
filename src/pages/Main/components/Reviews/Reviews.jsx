import { useEffect, useRef, useState } from "react";
import "./Reviews.css";

const reviews = [
  {
    id: 4,
    photo:
      "https://www.eg.ru/wp-content/uploads/2024/07/tyuremnye-sroki-lyubov-so-zvezdoy-doma-2-i-jizn-v-rossii-chto-stalo-so-zvezdoy-taksi-sami-naseri.jpg",
    name: "Сергей П.",
    text: "Быстро и качественно. Спасибо за работу!",
  },
  {
    id: 1,
    photo:
      "https://www.eg.ru/wp-content/uploads/2024/07/tyuremnye-sroki-lyubov-so-zvezdoy-doma-2-i-jizn-v-rossii-chto-stalo-so-zvezdoy-taksi-sami-naseri.jpg",
    name: "Иван И.",
    text: "Отличный сервис! Очень доволен качеством.",
  },
  {
    id: 2,
    photo:
      "https://www.eg.ru/wp-content/uploads/2024/07/tyuremnye-sroki-lyubov-so-zvezdoy-doma-2-i-jizn-v-rossii-chto-stalo-so-zvezdoy-taksi-sami-naseri.jpg",
    name: "Анна К.",
    text: "Рекомендую всем, кто ищет надежность и профессионализм.",
  },
  {
    id: 3,
    photo:
      "https://www.eg.ru/wp-content/uploads/2024/07/tyuremnye-sroki-lyubov-so-zvezdoy-doma-2-i-jizn-v-rossii-chto-stalo-so-zvezdoy-taksi-sami-naseri.jpg",
    name: "Сергей П.",
    text: "Быстро и качественно. Спасибо за работу!",
  },
];

const Reviews = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Отслеживаем только первый раз
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
      className={`reviews ${isVisible ? "visible" : ""}`}
      ref={sectionRef}
    >
      <div className="container">
        <h2 className="reviews-title">Отзывы</h2>
        <div className="review-cards">
          {reviews.map((review) => (
            <div className="review-card" key={review.id}>
              <img
                src={review.photo}
                alt={review.name}
                className="review-photo"
              />
              <h3 className="review-name">{review.name}</h3>
              <p className="review-text">{review.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
