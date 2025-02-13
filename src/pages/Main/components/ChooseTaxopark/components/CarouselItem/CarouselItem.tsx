"use client";

import React, { memo, useState } from "react";
import ApplicationModal from "../ApplicationModal";
import { ParkInCarousel } from "@/app/interfaces/interfaces";
import BackSide from "./BackSide";
import FrontSide from "./FrontSide";

const CarouselItem: React.FC<{
  item: ParkInCarousel;
  setCarouselDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  slidesToShow: number;
}> = memo(({ item, setCarouselDisabled, slidesToShow }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const openModal = (event: any) => {
    event.stopPropagation();
    setCarouselDisabled(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setCarouselDisabled(false);
    setIsModalOpen(false);
  };

  const toggleFlip = () => setFlipped(!flipped);

  return (
    <div
      style={{
        width: `${100 / slidesToShow}%`,
      }}
      className="flex-shrink-0 h-[650px] flex items-center justify-center p-2"
    >
      <div
        className="relative w-full h-full transform transition-transform duration-500 shadow-lg rounded-2xl"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "",
          perspective: "1000px",
        }}
      >
        <FrontSide item={item} toggleFlip={toggleFlip} openModal={openModal} />

        <BackSide item={item} toggleFlip={toggleFlip} openModal={openModal} />
      </div>
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        formType="taxiPark"
        parkId={item.id}
      />
    </div>
  );
});

CarouselItem.displayName = "CarouselItem";

export default CarouselItem;
