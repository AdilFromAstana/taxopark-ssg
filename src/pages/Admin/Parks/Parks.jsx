import { Table, Input, Button, DatePicker, Select } from "antd";
import axios from "axios";
import { useState, useCallback, memo } from "react";
import CreateFormModal from "./CreateParkModal";
import EditParkModal from "./EditParkModal";
import moment from "moment";
import { useQuery, useQueryClient } from "react-query";

const API_URL = import.meta.env.VITE_API_URL;
const { RangePicker } = DatePicker;

const fetchParks = async ({
  page,
  pageSize,
  sortField,
  sortOrder,
  filters,
}) => {
  const response = await axios.get(`${API_URL}/parks`, {
    params: { page, limit: pageSize, sortField, sortOrder, ...filters },
  });
  return response.data;
};

const fetchCities = async () => {
  const response = await axios.get(`${API_URL}/cities?page=1&limit=1000`);
  return response.data;
};

const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const Parks = memo(() => {
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
    cityId: null,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  console.log("selectedRecord: ", selectedRecord);

  const { data: parksData, isLoading } = useQuery({
    queryKey: [
      "parks",
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

      const cachedData = queryClient.getQueryData(["parks", params]);
      if (cachedData) {
        return cachedData;
      }

      return fetchParks(params);
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: fetchCities,
    staleTime: 60 * 1000,
    cacheTime: 5 * 60 * 1000,
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
    queryClient.invalidateQueries("parks");
  };

  const handleSearchDebounced = useCallback(
    debounce((key, value) => {
      setSearchFilters((prev) => ({ ...prev, [key]: value }));
      queryClient.invalidateQueries("parks");
    }, 700),
    []
  );

  const handleCityFilterChange = (value) => {
    setSearchFilters((prev) => ({ ...prev, cityId: value }));
    queryClient.invalidateQueries("parks");
  };

  const handleDateRangeChange = (value) => {
    setSearchFilters((prev) => ({ ...prev, dateRange: value || [] }));
    queryClient.invalidateQueries("parks");
  };

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
    },
    {
      title: "Тех.поддержка 24/7",
      dataIndex: "supportAlwaysAvailable",
      key: "supportAlwaysAvailable",
      sorter: true,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Select
            style={{ width: 200 }}
            placeholder="Выберите статус"
            value={selectedKeys[0] ?? undefined} // Устанавливаем выбранное значение
            onChange={(value) => {
              setSelectedKeys(value !== undefined ? [value] : []); // Устанавливаем ключ
              handleSearchDebounced("supportAlwaysAvailable", value); // Запускаем фильтр
              confirm(); // Подтверждаем выбор
            }}
            allowClear
            onClear={clearFilters}
          >
            <Select.Option value={true}>Да</Select.Option>
            <Select.Option value={false}>Нет</Select.Option>
            <Select.Option value={null}>Не указано</Select.Option>
          </Select>
        </div>
      ),
      onFilter: (value, record) => {
        if (value === null) return record.supportAlwaysAvailable === null; // Фильтр по "Не указано"
        return record.supportAlwaysAvailable === value; // Фильтр по true/false
      },
      render: (value) => {
        if (value === true) return "Да";
        if (value === false) return "Нет";
        return "Не указано"; // Отображение в таблице
      },
    },
    {
      title: "Город",
      dataIndex: "cityId",
      key: "cityId",
      render: (_, record) => record.City?.title || "—",
      sorter: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Select
            allowClear
            showSearch
            style={{ width: 200 }}
            placeholder="Выберите город"
            value={selectedKeys[0]}
            onChange={(value) => {
              setSelectedKeys(value ? [value] : []);
              handleCityFilterChange(value);
              confirm();
            }}
          >
            {cities?.map((city) => (
              <Select.Option key={city.id} value={city.id}>
                {city.title}
              </Select.Option>
            ))}
          </Select>
        </div>
      ),
      onFilter: (value, record) => record.cityId === value,
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
    <div
      style={{
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
          <h2 style={{ margin: 0 }}>Таксопарки</h2>
          <Button type="primary" onClick={() => setIsCreateModalOpen(true)}>
            Добавить запись
          </Button>
        </div>
        <Button type="primary" onClick={() => setIsCreateModalOpen(true)}>
          Скачать в Excel
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={parksData?.data || []}
        loading={isLoading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: parksData?.total,
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

      <CreateFormModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        cities={cities}
      />
      {selectedRecord && (
        <EditParkModal
          queryClient={queryClient}
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          record={selectedRecord}
          cities={cities}
        />
      )}
    </div>
  );
});

Parks.displayName = "Parks";

export default Parks;
