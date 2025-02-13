import { useEffect, useRef, useState } from "react";

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
      className={`py-10 px-5 text-center transform transition-all duration-700 ease-in-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
    >
      <div className="mx-auto max-w-[1400px]">
        <h2 className="text-3xl font-bold text-gray-800">
          Почему выбирают нас?
        </h2>
        <p className="text-lg text-gray-600 mt-4 mb-8">
          С нами вы легко найдете идеальные условия для работы: прозрачные
          комиссии, моментальные выплаты, акции и бонусы — всё для вашего
          удобства.
        </p>
        <div className="flex flex-wrap justify-center gap-5">
          {advantages.map((adv, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg shadow-md p-6 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33%-40px)] lg:aspect-[1.6/1] aspect-[2.4/1] transition-transform transform hover:translate-y-[-5px] hover:shadow-lg"
            >
              <div className="text-5xl mb-4 text-orange-500">{adv.icon}</div>
              <h3 className="text-xl font-semibold text-gray-700">
                {adv.title}
              </h3>
              <p className="text-gray-600 mt-2">{adv.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Advantages;
