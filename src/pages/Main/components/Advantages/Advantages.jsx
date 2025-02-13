import React, { useEffect, useRef, useState } from "react";
import "./Advantages.css";

const advantages = [
  {
    title: "Прозрачные условия",
    description: "Вся информация о комиссиях и бонусах на одной платформе.",
    icon: "⚖️",
  },
  {
    title: "Надежные таксопарки",
    description: "Только проверенные партнеры, работающие с Яндексом.",
    icon: "🛡️",
  },
  {
    title: "Моментальные выплаты",
    description: "Найдите парки с выплатами без задержек.",
    icon: "💵",
  },
  {
    title: "Поддержка 24/7",
    description: "Выбирайте парки с круглосуточной поддержкой.",
    icon: "📞",
  },
  {
    title: "Акции и бонусы",
    description: "Получайте лучшие предложения и участвуйте в розыгрышах.",
    icon: "🎁",
  },
];

const Advantages = () => {
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
      ref={sectionRef}
      className={`advantages ${isVisible ? "visible" : ""}`}
    >
      <div className="container">
        <h2 className="advantages-title">Почему выбирают нас?</h2>
        <p className="advantages-description">
          С нами вы легко найдете идеальные условия для работы: прозрачные
          комиссии, моментальные выплаты, акции и бонусы — всё для вашего
          удобства.
        </p>
        <div className="advantages-row">
          {advantages.map((adv, index) => (
            <div key={index} className="advantage-item">
              <div className="advantage-icon">{adv.icon}</div>
              <h3 className="advantage-title">{adv.title}</h3>
              <p className="advantage-description">{adv.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Advantages;