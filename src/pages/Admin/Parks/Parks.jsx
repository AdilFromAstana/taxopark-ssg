import { Table, Input, Button, DatePicker, Select, Tag, Modal } from "antd";
import axios from "axios";
import { useState, useCallback, memo } from "react";
import CreateParkModal from "./CreateParkModal";
import EditParkModal from "./EditParkModal";
import moment from "moment";
import ExcelJS from "exceljs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SortableList from "../../../components/SortableList/SortableList";

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

const handleDownloadExcel = async ({ sorter, searchFilters }) => {
  const { data: allParksData } = await fetchParks({
    page: 1,
    pageSize: 1000,
    sortField: sorter.field,
    sortOrder: sorter.order,
    filters: searchFilters,
  });

  if (!allParksData || allParksData.length === 0) {
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Parks");

  const col = [
    { key: "title", width: 50, header: "Название" },
    { key: "City", width: 50, header: "Город" },
    { key: "averageCheck", width: 50, header: "Средний чек" },
    { key: "parkEntrepreneurSupport", width: 50, header: "ИП таксопарка" },
    { key: "entrepreneurSupport", width: 50, header: "Поддержка ИП" },
    { key: "commissionWithdraw", width: 50, header: "Комиссия за снятия" },
    {
      key: "transferPaymentCommission",
      width: 50,
      header: "Комиссия за перевод",
    },
    { key: "accountantSupport", width: 50, header: "Поддержка Бухгалтерии" },
    { key: "yandexGasStation", width: 50, header: "Яндекс Заправки" },
    {
      key: "supportAlwaysAvailable",
      width: 50,
      header: "Тех.Поддержка 24/7",
    },
    {
      key: "supportStartWorkTime",
      width: 50,
      header: "Начала работы тех.под",
    },
    { key: "supportEndWorkTime", width: 50, header: "Конец работы тех.под" },
    { key: "parkCommission", width: 50, header: "Комиссия парка" },
    { key: "parkPromotions", width: 50, header: "Акции" },
    { key: "paymentType", width: 50, header: "Тип оплаты" },
    { key: "active", width: 50, header: "Статус" },
    { key: "rating", width: 50, header: "Рейтинг" },
    { key: "createdAt", width: 50, header: "Создано" },
  ];

  worksheet.columns = col;
  worksheet.addRows(
    allParksData.map((parkData) => {
      return {
        title: parkData?.title,
        City: parkData?.City?.title || "-",
        averageCheck: parkData?.averageCheck || "-",
        parkEntrepreneurSupport:
          typeof parkData?.parkEntrepreneurSupport === "boolean"
            ? parkData?.parkEntrepreneurSupport
              ? "Да"
              : "Нет"
            : "-",
        entrepreneurSupport:
          typeof parkData?.entrepreneurSupport === "boolean"
            ? parkData?.entrepreneurSupport
              ? "Да"
              : "Нет"
            : "-",
        commissionWithdraw: parkData?.commissionWithdraw || "-",
        transferPaymentCommission: parkData?.transferPaymentCommission || "-",
        accountantSupport:
          typeof parkData?.accountantSupport === "boolean"
            ? parkData?.accountantSupport
              ? "Да"
              : "Нет"
            : "-",
        yandexGasStation:
          typeof parkData?.yandexGasStation === "boolean"
            ? parkData?.yandexGasStation
              ? "Да"
              : "Нет"
            : "-",
        supportAlwaysAvailable:
          typeof parkData?.supportAlwaysAvailable === "boolean"
            ? parkData?.supportAlwaysAvailable
              ? "Да"
              : "Нет"
            : "-",
        supportStartWorkTime: parkData?.supportStartWorkTime
          ? moment(parkData?.supportStartWorkTime).format("HH:mm")
          : "-",
        supportEndWorkTime: parkData?.supportEndWorkTime
          ? moment(parkData?.supportEndWorkTime).format("HH:mm")
          : "-",
        parkCommission: parkData?.parkCommission || "-",
        parkPromotions: parkData?.parkPromotions,
        paymentType: parkData?.paymentType || "-",
        active: parkData?.active ? "Активен" : "Архивирован",
        rating: parkData?.rating || "-",
        createdAt: moment(parkData?.createdAt).format("DD.MM.YYYY HH:mm"),
      };
    })
  );

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "parks_data.xlsx";
  link.click();
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
    cityIds: [],
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);

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

  const { data: citiesData = [] } = useQuery({
    queryKey: ["cities", {}],
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
    queryClient.invalidateQueries(["parks"]);
  };

  const handleSearchDebounced = useCallback(
    debounce((key, value) => {
      setSearchFilters((prev) => ({ ...prev, [key]: value }));
      queryClient.invalidateQueries(["parks"]);
    }, 700),
    []
  );

  const handleCityFilterChange = (value) => {
    setSearchFilters((prev) => ({
      ...prev,
      cityIds: Array.isArray(value) ? value : [value], // Всегда массив
    }));

    queryClient.invalidateQueries(["parks"], {
      filters: searchFilters,
    });
  };

  const handleDateRangeChange = (value) => {
    setSearchFilters((prev) => ({ ...prev, dateRange: value || [] }));
    queryClient.invalidateQueries(["parks"]);
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
      title: "Тех.поддержка 24/7",
      dataIndex: "supportAlwaysAvailable",
      key: "supportAlwaysAvailable",
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
                supportAlwaysAvailable: value,
              }));
              confirm();
            }}
            allowClear
            onClear={clearFilters}
          >
            <Select.Option value={true}>Да</Select.Option>
            <Select.Option value={false}>Нет</Select.Option>
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
      width: 200,
    },
    {
      title: "Город",
      dataIndex: "averageCheckPerCity",
      key: "averageCheckPerCity",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Select
            allowClear
            showSearch
            mode="multiple"
            style={{ width: 200, marginBottom: 8 }}
            placeholder="Выберите город"
            value={selectedKeys}
            onChange={(value) => setSelectedKeys(value)}
          >
            {citiesData?.data?.map((city) => (
              <Select.Option key={city.id} value={city.id}>
                {city.title}
              </Select.Option>
            ))}
          </Select>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              type="primary"
              onClick={() => {
                handleCityFilterChange(selectedKeys); // Обновляем `searchFilters` и отправляем запрос
                confirm(); // Закрываем фильтр и применяем
              }}
              size="small"
            >
              Применить
            </Button>
            <Button
              onClick={() => {
                clearFilters();
                handleCityFilterChange([]); // Очищаем фильтры
                confirm();
              }}
              size="small"
            >
              Сбросить
            </Button>
          </div>
        </div>
      ),
      render: (_, record) => {
        if (!record.averageCheckPerCity?.length) return "—";

        // Получаем список городов из массива объектов
        const cityTitles = record.averageCheckPerCity
          .map(
            ({ cityId }) =>
              citiesData?.data?.find((city) => city.id === cityId)?.title
          )
          .filter(Boolean);

        if (!cityTitles.length) return "—";

        const visibleCities = cityTitles.slice(0, 3);
        const remainingCount = cityTitles.length - visibleCities.length;

        return (
          <>
            {visibleCities.map((title) => (
              <Tag color="blue" key={title}>
                {title}
              </Tag>
            ))}
            {remainingCount > 0 && (
              <Tag color="blue" key="remaining">
                +{remainingCount}
              </Tag>
            )}
          </>
        );
      },
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
        <div style={{ display: "flex", gap: "10px" }}>
          <h2 style={{ margin: 0 }}>Таксопарки</h2>
          <Button type="primary" onClick={() => setIsCreateModalOpen(true)}>
            Добавить запись
          </Button>
          <Button onClick={() => setIsPriorityModalOpen(true)}>
            Указать приоритет
          </Button>
        </div>
        <Button
          type="primary"
          onClick={() => handleDownloadExcel({ searchFilters, sorter })}
        >
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

      <CreateParkModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        cities={citiesData?.data || []}
        queryData={{
          page: pagination.current,
          pageSize: pagination.pageSize,
          sortField: sorter.field,
          sortOrder: sorter.order,
          filters: searchFilters,
        }}
        queryClient={queryClient}
      />
      {selectedRecord && (
        <EditParkModal
          queryData={{
            page: pagination.current,
            pageSize: pagination.pageSize,
            sortField: sorter.field,
            sortOrder: sorter.order,
            filters: searchFilters,
          }}
          queryClient={queryClient}
          setSelectedRecord={setSelectedRecord}
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          record={selectedRecord}
          cities={citiesData?.data || []}
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
          fetchKey="allParks"
          fetchMethod={fetchParks}
          readKey="title"
          updateEndpoint="parks/updatePriorities"
        />
      </Modal>
    </div>
  );
});

Parks.displayName = "Parks";

export default Parks;
