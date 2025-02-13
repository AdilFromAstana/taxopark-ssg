import { useState, useEffect, useRef } from "react";
import "./HowItWorks.css"; // Подключение стилей
import car from "../../../../images/howItWorks/car.png";
import loop from "../../../../images/howItWorks/loop.png";
import doc from "../../../../images/howItWorks/document.png";
import check from "../../../../images/howItWorks/check.png";

const steps = [
  {
    number: 1,
    title: "Сравните условия парков",
    description: "Сравните комиссии, бонусы и другие условия парков.",
    url: loop,
  },
  {
    number: 2,
    title: "Выберите лучший таксопарк",
    description: "Выберите парк, который подходит вам.",
    url: check,
  },
  {
    number: 3,
    title: "Оставьте заявку",
    description: "Заполните простую заявку — это быстро.",
    url: doc,
  },
  {
    number: 4,
    title: "Начните работать",
    description: "Пройдите регистрацию и приступайте к работе!",
    url: car,
  },
];

const HowItWorks = () => {
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
      className={`how-it-works ${isVisible ? "visible" : ""}`}
      ref={sectionRef}
    >
      <div className="container">
        <div className="how-it-works-header">
          <h2>Как это работает?</h2>
          <p>4 простых шага, чтобы начать зарабатывать!</p>
        </div>
        <div className="steps">
          {steps.map((step, index) => (
            <div key={index} className="step">
              <div className="step-number">{step.number}</div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              <img className="step-img" src={step.url} alt={step.title} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
