import {
  Button,
  DatePicker,
  Image,
  Input,
  List,
  Table,
  Upload,
  message,
} from "antd";
import { DeleteOutlined, InboxOutlined } from "@ant-design/icons";
import axios from "axios";
import { useState, memo } from "react";
import CreateBannerModal from "./CreateBannerModal";
import EditBannerModal from "./EditBannerModal";
import moment from "moment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import "./style.css";

const { RangePicker } = DatePicker;
const { Dragger } = Upload;
const API_URL = import.meta.env.VITE_API_URL;

const fetchBanners = async ({ page, pageSize, filters }) => {
  const response = await axios.get(`${API_URL}/banners`, {
    params: { page, limit: pageSize, ...filters },
  });
  return response.data;
};

const Banners = memo(() => {
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchFilters, setSearchFilters] = useState({
    title: "",
  });
  const [sorter, setSorter] = useState({
    field: null,
    order: null,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { data: banners, isLoading } = useQuery({
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

  const handleTableChange = (pagination, _filters, sorter) => {
    setPagination({ ...pagination });
    setSorter({
      field: sorter.field || null,
      order:
        sorter.order === "ascend"
          ? "asc"
          : sorter.order === "descend"
          ? "desc"
          : null,
    });
    queryClient.invalidateQueries("users");
  };

  const columns = [
    {
      title: "Заголовок",
      dataIndex: "title",
      key: "title",
      sorter: true,
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Поиск по заголовку"
            defaultValue={searchFilters.title}
            onChange={(e) => handleSearchDebounced("title", e.target.value)}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
        </div>
      ),
      width: 200,
    },
    {
      title: "Ссылка",
      dataIndex: "link",
      key: "link",
      sorter: true,
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Поиск по ссылке"
            defaultValue={searchFilters.link}
            onChange={(e) => handleSearchDebounced("link", e.target.value)}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
        </div>
      ),
      width: 200,
    },
    {
      title: "Создано",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (record) => moment(record).format("DD.MM.YYYY HH:mm:ss"),
      sorter: true,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 12, minWidth: 250 }}>
          <RangePicker
            value={
              selectedKeys[0]
                ? [moment(selectedKeys[0][0]), moment(selectedKeys[0][1])]
                : []
            }
            onChange={(dates) =>
              setSelectedKeys(
                dates
                  ? [
                      [
                        dates[0].format("YYYY-MM-DD"),
                        dates[1].format("YYYY-MM-DD"),
                      ],
                    ]
                  : []
              )
            }
            style={{ marginBottom: 8 }}
          />
          <div style={{ display: "flex", gap: 5 }}>
            <Button
              type="primary"
              onClick={() => {
                confirm();
                handleDateRangeChange(selectedKeys[0]);
              }}
              size="small"
            >
              Применить
            </Button>
            <Button
              onClick={() => {
                clearFilters();
                handleDateRangeChange([]);
                confirm();
              }}
              size="small"
            >
              Сбросить
            </Button>
          </div>
        </div>
      ),
      onFilter: (value, record) => {
        const recordDate = moment(record.createdAt).format("YYYY-MM-DD");
        return moment(recordDate).isBetween(
          value[0],
          value[1],
          undefined,
          "[]"
        );
      },
      width: 200,
    },
  ];

  return (
    <div style={{ padding: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
          <h2 style={{ margin: 0 }}>Баннеры</h2>
          <Button type="primary" onClick={() => setIsCreateModalOpen(true)}>
            Добавить запись
          </Button>
          <Button onClick={() => setIsPriorityModalOpen(true)}>
            Указать приоритет
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={banners?.data || []}
        loading={isLoading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
        }}
        onRow={(record) => ({
          onClick: () => {
            setSelectedRecord(record);
            setIsEditModalOpen(true);
          },
        })}
        onChange={handleTableChange}
      />

      <CreateBannerModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      {selectedRecord && (
        <EditBannerModal
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

Banners.displayName = "Banners";
export default Banners;
