import ChooseTaxopark from "./components/ChooseTaxopark/ChooseTaxopark";
import Reviews from "./components/Reviews/Reviews";
import HowItWorks from "./components/HowItWorks/HowItWorks";
import Advantages from "./components/Advantages/Advantages";
import FieldForm from "./components/FieldForm/FieldForm";
import Banners from "./components/Banners/Banners";

const Main = () => {
  return (
    <>
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
