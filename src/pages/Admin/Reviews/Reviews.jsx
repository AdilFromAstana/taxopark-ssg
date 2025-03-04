import { Table, Input, Button, DatePicker, Tag, Select, Modal } from "antd";
import axios from "axios";
import { useState, useCallback, memo } from "react";
import CreateReviewModal from "./CreateReviewModal";
import EditReviewModal from "./EditReviewModal";
import moment from "moment";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SortableList from "../../../components/SortableList/SortableList";

const { RangePicker } = DatePicker;

const API_URL = import.meta.env.VITE_API_URL;

const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const fetchReviews = async ({
  page,
  pageSize,
  sortField,
  sortOrder,
  filters,
}) => {
  const response = await axios.get(`${API_URL}/reviews`, {
    params: { page, limit: pageSize, sortField, sortOrder, ...filters },
  });
  return response.data;
};

const Reviews = memo(() => {
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [sorter, setSorter] = useState({
    field: null,
    order: null,
  });
  const [searchFilters, setSearchFilters] = useState({
    title: "",
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: [
      "reviews",
      {
        page: pagination.current,
        pageSize: pagination.pageSize,
        sortField: sorter.field,
        sortOrder: sorter.order,
        filters: searchFilters,
      },
    ],
    queryFn: async ({ queryKey }) => {
      const [, params] = queryKey;

      const cachedData = queryClient.getQueryData(["reviews", params]);
      if (cachedData) {
        return cachedData;
      }

      return fetchReviews(params);
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

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
    queryClient.invalidateQueries("reviews");
  };

  const handleDateRangeChange = (value) => {
    setSearchFilters((prev) => ({ ...prev, dateRange: value || [] }));
    queryClient.invalidateQueries("reviews");
  };

  const handleSearchDebounced = useCallback(
    debounce((key, value) => {
      setSearchFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    }, 500),
    [pagination.pageSize, sorter.field, sorter.order, searchFilters]
  );

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
      width: 200,
      title: "ФИО",
      dataIndex: "name",
      key: "name",
      sorter: true,
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Поиск по названию"
            defaultValue={searchFilters.name}
            onChange={(e) => handleSearchDebounced("name", e.target.value)}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
        </div>
      ),
    },
    {
      width: 200,
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
    },
    {
      width: 200,
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
    },
  ];

  return (
    <div style={{ padding: "16px" }}>
      <div style={{ display: "flex", gap: "10px", marginBottom: 10 }}>
        <h2 style={{ margin: 0 }}>Отзыв</h2>
        <Button type="primary" onClick={() => setIsCreateModalOpen(true)}>
          Добавить запись
        </Button>
        <Button onClick={() => setIsPriorityModalOpen(true)}>
          Указать приоритет
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={reviewsData?.data || []}
        loading={isLoading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: reviewsData?.total,
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

      <CreateReviewModal
        queryClient={queryClient}
        queryData={{
          page: pagination.current,
          pageSize: pagination.pageSize,
          sortField: sorter.field,
          sortOrder: sorter.order,
          filters: searchFilters,
        }}
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      {selectedRecord && (
        <EditReviewModal
          queryData={{
            page: pagination.current,
            pageSize: pagination.pageSize,
            sortField: sorter.field,
            sortOrder: sorter.order,
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
      >
        <SortableList
          setIsPriorityModalOpen={setIsPriorityModalOpen}
          fetchKey="allReviews"
          fetchMethod={fetchReviews}
          readKey="name"
          updateEndpoint="reviews/updatePriorities"
        />
      </Modal>
    </div>
  );
});

Reviews.displayName = "Reviews";

export default Reviews;
