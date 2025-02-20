import { Table, Input, Button, DatePicker, Tag, Select } from "antd";
import axios from "axios";
import { useState, useCallback } from "react";
import EditFormModal from "./EditFormModal";
import moment from "moment";
import { useQuery, useQueryClient } from "react-query";
import ExcelJS from "exceljs";

const { RangePicker } = DatePicker;
const API_URL = import.meta.env.VITE_API_URL;

const tagColor = {
  taxiPark: "green",
  consultation: "blue",
};
const tagTitle = {
  taxiPark: "Таксопарк",
  consultation: "Консультация",
};

const fetchForms = async ({
  page,
  pageSize,
  sortField,
  sortOrder,
  filters,
}) => {
  const response = await axios.get(`${API_URL}/forms`, {
    params: { page, limit: pageSize, sortField, sortOrder, ...filters },
  });
  return response.data;
};

const fetchParks = async () => {
  const response = await axios.get(`${API_URL}/parks?page=1&limit=1000`);
  return response.data.data;
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

function formatPhoneNumber(phoneNumber) {
  const cleaned = phoneNumber.replace(/\D/g, "");

  if (cleaned.length !== 11 || cleaned[0] !== "7") {
    throw new Error(
      "Некорректный номер телефона. Убедитесь, что номер начинается с +7 и состоит из 11 цифр."
    );
  }

  const formatted = `+7-(${cleaned.slice(1, 4)})-${cleaned.slice(
    4,
    7
  )}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
  return formatted;
}

const Forms = () => {
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
    name: "",
    phoneNumber: "",
    formType: "",
  });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: formsData, isLoading } = useQuery({
    queryKey: [
      "forms",
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

      const cachedData = queryClient.getQueryData(["forms", params]);
      if (cachedData) {
        return cachedData;
      }

      return fetchForms(params);
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  const { data: parks = [] } = useQuery({
    queryKey: ["parks"],
    queryFn: fetchParks,
    staleTime: 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });

  const handleSearchDebounced = useCallback(
    debounce((key, value) => {
      setSearchFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
      queryClient.invalidateQueries("forms");
    }, 500),
    [pagination.pageSize, sorter.field, sorter.order, searchFilters]
  );

  const handleTableChange = (pagination, filters, sorter) => {
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
    queryClient.invalidateQueries("forms");
  };

  const handleDateRangeChange = (dates) => {
    setSearchFilters((prev) => ({
      ...prev,
      createdAtRange: dates
        ? dates.map((date) => date.format("YYYY-MM-DD"))
        : [],
    }));
  };

  const handleDownloadExcel = async () => {
    const { data: allFormsData } = await fetchForms({
      page: 1,
      pageSize: 1000,
      sortField: sorter.field,
      sortOrder: sorter.order,
      filters: searchFilters,
    });

    if (!allFormsData || allFormsData.length === 0) {
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Parks");

    const col = [
      { key: "name", width: 50, header: "ФИО" },
      { key: "Park", width: 50, header: "Таксопарк" },
      { key: "statusCode", width: 50, header: "Статус" },
      { key: "formType", width: 50, header: "Тип заявки" },
      { key: "phoneNumber", width: 50, header: "Номеп телефона" },
      { key: "createdAt", width: 50, header: "Создано" },
    ];

    worksheet.columns = col;
    worksheet.addRows(
      allFormsData.map((formData) => {
        return {
          name: formData?.name || "-",
          Park: formData?.Park?.title || "-",
          statusCode: formData?.statusCode || "-",
          formType: formData?.formType || "-",
          phoneNumber: formData?.phoneNumber || "-",
          createdAt: moment(formData?.createdAt).format("DD.MM.YYYY HH:mm"),
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

  const columns = [
    {
      title: "ФИО",
      dataIndex: "name",
      key: "name",
      sorter: true,
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Поиск по ФИО"
            defaultValue={searchFilters.name}
            onChange={(e) => handleSearchDebounced("name", e.target.value)}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
        </div>
      ),
    },
    {
      title: "Тип заявки",
      dataIndex: "formType",
      key: "formType",
      sorter: true,
      filterDropdown: ({ selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Select
            style={{ width: 200 }}
            placeholder="Выберите тип заявки"
            value={selectedKeys[0] ?? undefined} // Устанавливаем выбранное значение
            onChange={(value) => {
              setSearchFilters((prev) => ({
                ...prev,
                formType: value,
              }));
              confirm();
            }}
            allowClear
            onClear={clearFilters}
          >
            <Select.Option value="consultation">
              {tagTitle["consultation"]}
            </Select.Option>
            <Select.Option value="taxiPark">
              {tagTitle["taxiPark"]}
            </Select.Option>
          </Select>
        </div>
      ),
      onFilter: (value, record) => {
        if (value === null) return record.supportAlwaysAvailable === null; // Фильтр по "Не указано"
        return record.supportAlwaysAvailable === value; // Фильтр по true/false
      },
      render: (record) => {
        const title = tagTitle[record];
        return <Tag color={tagColor[record]}>{title}</Tag>;
      },
    },
    {
      title: "Таксопарк",
      dataIndex: "parkId",
      key: "parkId",
      render: (_, record) => record.Park?.title || "—",
      sorter: true,
      filterDropdown: ({ selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Select
            allowClear
            showSearch
            style={{ width: 200 }}
            placeholder="Выберите таксопарк"
            value={selectedKeys[0] ?? undefined}
            onClear={clearFilters}
            onChange={(value) => {
              setSearchFilters((prev) => ({
                ...prev,
                parkId: value,
              }));
              confirm();
            }}
          >
            {parks?.map((park) => (
              <Select.Option key={park.id} value={park.id}>
                {park.title}
              </Select.Option>
            ))}
          </Select>
        </div>
      ),
      onFilter: (value, record) => record.cityId === value,
    },
    {
      title: "Номер",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      sorter: true,
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Поиск по номеру"
            defaultValue={searchFilters.phoneNumber}
            onChange={(e) =>
              handleSearchDebounced("phoneNumber", e.target.value)
            }
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
        </div>
      ),
      render: (record) => formatPhoneNumber(record),
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
    <div style={{ padding: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
          <h2 style={{ margin: 0 }}>Заявки</h2>
        </div>
        <Button type="primary" onClick={handleDownloadExcel}>
          Скачать в Excel
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={formsData?.data}
        loading={isLoading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: formsData?.total,
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

      {selectedRecord && (
        <EditFormModal
          parks={parks}
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          record={{
            ...selectedRecord,
            phoneNumber: formatPhoneNumber(selectedRecord?.phoneNumber || ""),
            formType: tagTitle[selectedRecord?.formType] || "",
          }}
        />
      )}
    </div>
  );
};

export default Forms;
