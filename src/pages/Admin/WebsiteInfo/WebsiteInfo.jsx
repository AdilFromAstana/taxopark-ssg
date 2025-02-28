import { Button, Carousel, Upload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import axios from "axios";
import { useState, memo } from "react";
import CreateCityModal from "./CreateCityModal";
import EditCityModal from "./EditCityModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import "./style.css";

const { Dragger } = Upload;
const API_URL = import.meta.env.VITE_API_URL;

const fetchBanners = async ({ page, pageSize, filters }) => {
  const response = await axios.get(`${API_URL}/banners`, {
    params: { page, limit: pageSize, ...filters },
  });
  return response.data;
};

const contentStyle = {
  margin: 0,
  height: "160px",
  color: "#fff",
  lineHeight: "160px",
  textAlign: "center",
  background: "#364d79",
};

const WebsiteInfo = memo(() => {
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchFilters, setSearchFilters] = useState({
    title: "",
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: [
      "banners",
      {
        page: pagination.current,
        pageSize: pagination.pageSize,
        filters: searchFilters,
      },
    ],
    queryFn: async ({ queryKey }) => {
      const [, params] = queryKey;
      return fetchBanners(params);
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  // Функция загрузки баннера
  const handleUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`${API_URL}/banners`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Баннер успешно загружен!");
      queryClient.invalidateQueries(["banners"]); // Обновляем список баннеров
    } catch (error) {
      message.error("Ошибка при загрузке баннера!");
    }
  };

  return (
    <div style={{ padding: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0 }}>Баннеры</h2>
      </div>

      <Carousel
        autoplay
        arrows
        infinite={false}
        style={{
          color: "black",
          width: "100%",
          maxWidth: "50vw",
          margin: "20px auto",
          border: "2px solid black",
          borderRadius: "10px",
        }}
        dots
      >
        {banners?.data?.map((banner) => (
          <div key={banner.id} style={contentStyle}>
            <img
              src={`${API_URL}/uploads/${banner.bannerUrl}`}
              alt={banner.title}
              style={{
                width: "100%",
                height: "auto",
                aspectRatio: "16/9",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          </div>
        ))}
        <Dragger
          customRequest={handleUpload}
          showUploadList={false}
          style={{
            height: "100%",
            borderRadius: "10px",
          }}
          accept="image/png, image/jpeg, image/webp"
          multiple={false}
        >
          <div style={{ height: "100%" }}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Кликните или перетащите файл в эту область для загрузки
            </p>
            <p className="ant-upload-hint">
              Поддерживается загрузка одного или нескольких файлов. Запрещено
              загружать запрещенный контент.
            </p>
          </div>
        </Dragger>
      </Carousel>

      <CreateCityModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      {selectedRecord && (
        <EditCityModal
          queryData={{
            page: pagination.current,
            pageSize: pagination.pageSize,
            filters: searchFilters,
          }}
          setSelectedRecord={setSelectedRecord}
          queryClient={queryClient}
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          record={selectedRecord}
        />
      )}
    </div>
  );
});

WebsiteInfo.displayName = "WebsiteInfo";
export default WebsiteInfo;
