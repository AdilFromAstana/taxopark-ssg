import { Table, Input, Button, DatePicker, Select, Tag } from "antd";
import axios from "axios";
import { useState, useCallback, memo } from "react";
import CreateCityModal from "./CreateCityModal";
import EditCityModal from "./EditCityModal";
import moment from "moment";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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

const fetchCities = async ({
  page,
  pageSize,
  sortField,
  sortOrder,
  filters,
}) => {
  const response = await axios.get(`${API_URL}/cities`, {
    params: { page, limit: pageSize, sortField, sortOrder, ...filters },
  });
  return response.data;
};

const Cities = memo(() => {
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
    active: null,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: citiesData, isLoading } = useQuery({
    queryKey: [
      "cities",
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

      const cachedData = queryClient.getQueryData(["cities", params]);
      if (cachedData) {
        return cachedData;
      }

      return fetchCities(params);
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
    queryClient.invalidateQueries("cities");
  };

  const handleDateRangeChange = (value) => {
    setSearchFilters((prev) => ({ ...prev, dateRange: value || [] }));
    queryClient.invalidateQueries("cities");
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
      title: "Название",
      dataIndex: "title",
      key: "title",
      sorter: true,
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Поиск по названию"
            defaultValue={searchFilters.title}
            onChange={(e) => handleSearchDebounced("title", e.target.value)}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
        </div>
      ),
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
      <div style={{ display: "flex", gap: "10px" }}>
        <h2 style={{ margin: 0 }}>Города</h2>
        <Button type="primary" onClick={() => setIsCreateModalOpen(true)}>
          Добавить запись
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={citiesData?.data || []}
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

      <CreateCityModal
        refreshData={{
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
        <EditCityModal
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
    </div>
  );
});

Cities.displayName = "Cities";

export default Cities;
