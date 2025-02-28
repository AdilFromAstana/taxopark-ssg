import ChooseTaxopark from "./components/ChooseTaxopark/ChooseTaxopark";
import Reviews from "./components/Reviews/Reviews";
import HowItWorks from "./components/HowItWorks/HowItWorks";
import Advantages from "./components/Advantages/Advantages";
import FieldForm from "./components/FieldForm/FieldForm";
import { Helmet } from "react-helmet-async";
import Banners from "./components/Banners/Banners";

const Main = () => {
  return (
    <>
      <Helmet>
        {/* Заголовок страницы */}
        <title>Выберите лучший таксопарк</title>

        {/* Мета-теги для SEO */}
        <meta
          name="description"
          content="Выбери свой таксопарк и начинай зарабатывать уже сегодня! Сравни условия, выбери лучший для себя таксопарк и начни зарабатывать больше на выгодных условиях."
        />
        <meta
          name="keywords"
          content="таксопарк, такси, выбрать таксопарк, сотрудничество"
        />

        {/* Open Graph (OG) теги для социальных сетей */}
        <meta property="og:title" content="Главная страница - Ваш сайт" />
        <meta
          property="og:description"
          content="Лучшие таксопарки и условия для сотрудничества. Узнайте, как легко заказать такси или стать партнером."
        />
        <meta property="og:image" content="https://example.com/og-image.jpg" />
        <meta property="og:url" content="https://example.com" />
        <meta property="og:type" content="website" />

        {/* Twitter Card теги */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Главная страница - Ваш сайт" />
        <meta
          name="twitter:description"
          content="Лучшие таксопарки и условия для сотрудничества. Узнайте, как легко заказать такси или стать партнером."
        />
        <meta
          name="twitter:image"
          content="https://example.com/twitter-image.jpg"
        />

        {/* Canonical ссылка */}
        <link rel="canonical" href="https://example.com" />
      </Helmet>
      <Banners />
      <ChooseTaxopark />
      <Reviews />
      <HowItWorks />
      <Advantages />
      <FieldForm />
    </>
  );
};
export default Main;
