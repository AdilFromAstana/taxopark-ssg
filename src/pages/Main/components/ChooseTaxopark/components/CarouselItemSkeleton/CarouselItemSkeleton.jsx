const CarouselItemSkeleton = ({ slidesToShow }) => {
  return (
    <div className="flex-shrink-0 relative h-[650px] p-2"
      style={{
        width: `${100 / slidesToShow}%`
      }}
    >
      <div className="relative w-full h-full transform transition-transform duration-500">
        <div className="z-[1] absolute w-full h-full bg-gray-200 animate-pulse rounded-2xl shadow-md flex flex-col items-center p-6">
          <div className="w-full h-44 bg-gray-300 rounded-t-lg"></div>
          <div className="flex flex-col items-start gap-2 p-4 flex-grow w-full">
            <div className="h-6 bg-gray-300 w-3/4 rounded"></div>
            <div className="h-5 bg-gray-300 w-1/2 rounded"></div>
            <div className="h-4 bg-gray-300 w-1/4 rounded"></div>
            <div className="h-4 bg-gray-300 w-1/3 rounded"></div>
            <div className="h-4 bg-gray-300 w-1/2 rounded"></div>
            <div className="h-4 bg-gray-300 w-2/3 rounded"></div>
            <div className="flex flex-wrap gap-1 mt-4 w-full">
              <div className="h-6 bg-gray-300 w-1/4 rounded"></div>
              <div className="h-6 bg-gray-300 w-1/4 rounded"></div>
            </div>
            <div className="mt-4 w-full h-10 bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CarouselItemSkeleton;
