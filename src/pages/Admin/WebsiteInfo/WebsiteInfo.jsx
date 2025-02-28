import { Button, Image, List, Upload, message } from "antd";
import { DeleteOutlined, InboxOutlined } from "@ant-design/icons";
import axios from "axios";
import { useState, memo } from "react";
import CreateCityModal from "./CreateCityModal";
import EditCityModal from "./EditCityModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import "./style.css";

const { Dragger } = Upload;
const API_URL = import.meta.env.VITE_API_URL;

const fetchBanners = async ({ page, pageSize, filters }) => {
  const response = await axios.get(`${API_URL}/banners`, {
    params: { page, limit: pageSize, ...filters },
  });
  return response.data;
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
  const { data: banners } = useQuery({
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

  const deleteBanner = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${API_URL}/banners/${id}`);
    },
    onSuccess: (data, id) => {
      message.success("Баннер удален");
      queryClient.setQueryData(["banners"], (oldData) => {
        if (!oldData || !oldData.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.filter((banner) => banner.id !== id),
        };
      });
    },
    onError: () => {
      message.error("Не удалось удалить баннер");
    },
  });

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

      <List
        style={{ width: "50vw", margin: "auto" }}
        grid={{ gutter: 10, column: 3 }}
        dataSource={[{ id: "upload" }, ...(banners?.data ?? [])]}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}
          >
            {item.id === "upload" ? (
              <Dragger
                customRequest={handleUpload}
                showUploadList={false}
                style={{
                  width: "100%",
                  aspectRatio: "1/1",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "2px dashed #ccc",
                  borderRadius: "10px",
                }}
                accept="image/png, image/jpeg, image/webp"
                multiple={false}
              >
                <InboxOutlined style={{ fontSize: "48px", color: "blue" }} />
                <p>Нажмите или перетащите файл в эту область для загрузки</p>
                <p>Поддерживается загрузка одного файла.</p>
                <p>Запрещено загружать запрещенный контент.</p>
              </Dragger>
            ) : (
              <div style={{ position: "relative", width: "100%" }}>
                <Image
                  src={`${API_URL}/uploads/${item.bannerUrl}`}
                  alt={item.title}
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    objectFit: "cover",
                    borderRadius: "10px",
                    border: "1px solid black",
                  }}
                  preview={true}
                />
                <Button
                  type="primary"
                  danger
                  shape="circle"
                  icon={<DeleteOutlined />}
                  onClick={() => deleteBanner.mutate(item.bannerUrl)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "rgba(0, 0, 0, 0.6)",
                    border: "none",
                  }}
                />
              </div>
            )}
          </List.Item>
        )}
      />

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
