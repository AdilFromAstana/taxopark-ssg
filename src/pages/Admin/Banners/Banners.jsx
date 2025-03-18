import { Button, DatePicker, Input, Modal, Select, Table, Tag } from "antd";
import axios from "axios";
import { useState, memo } from "react";
import CreateBannerModal from "./CreateBannerModal";
import EditBannerModal from "./EditBannerModal";
import moment from "moment";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import "./style.css";
import SortableList from "../../../components/SortableList/SortableList";

const { RangePicker } = DatePicker;
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
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
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

  const handleDateRangeChange = (value) => {
    setSearchFilters((prev) => ({ ...prev, dateRange: value || [] }));
    queryClient.invalidateQueries(["banners"]);
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
      title: "Приоритет",
      dataIndex: "priority",
      key: "priority",
      sorter: true,
      width: 10,
      render: (record) => record || "Не указан",
    },
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
      width: 200,
    },
    {
      title: "Статус",
      dataIndex: "active",
      key: "active",
      render: (record) => {
        return (
          <Tag color={record ? "green" : "red"}>
            {record ? "Активный" : "Архивирован"}
          </Tag>
        );
      },
      sorter: true,
      filterDropdown: ({ selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Select
            style={{ width: 200 }}
            placeholder="Выберите статус"
            value={selectedKeys[0] ?? undefined} // Устанавливаем выбранное значение
            onChange={(value) => {
              setSearchFilters((prev) => ({
                ...prev,
                active: value,
              }));
              confirm();
            }}
            allowClear
            onClear={clearFilters}
          >
            <Select.Option value={true}>Активный</Select.Option>
            <Select.Option value={false}>Архивирован</Select.Option>
          </Select>
        </div>
      ),
      onFilter: (value, record) => {
        return record.active === value;
      },
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
        queryData={{
          page: pagination.current,
          pageSize: pagination.pageSize,
          sortField: sorter.field,
          sortOrder: sorter.order,
          filters: searchFilters,
        }}
        queryClient={queryClient}
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
      <Modal
        width="75vw"
        open={isPriorityModalOpen}
        footer={null}
        onCancel={() => setIsPriorityModalOpen(false)}
        maskClosable={false}
        closeIcon={false}
      >
        <SortableList
          setIsPriorityModalOpen={setIsPriorityModalOpen}
          fetchKey="allBanners"
          fetchMethod={fetchBanners}
          readKey="title"
          updateEndpoint="banners/updatePriorities"
        />
      </Modal>
    </div>
  );
});

Banners.displayName = "Banners";
export default Banners;
