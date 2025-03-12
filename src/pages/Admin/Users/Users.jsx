import { Table, Input, Button, DatePicker, Select, Tag } from "antd";
import axios from "axios";
import { useState, useCallback, memo } from "react";
import CreateUserModal from "./CreateUserModal";
import EditUserModal from "./EditUserModal";
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

const fetchUsers = async ({
  page,
  pageSize,
  sortField,
  sortOrder,
  filters,
}) => {
  const response = await axios.get(`${API_URL}/users/getUsers`, {
    params: { page, limit: pageSize, sortField, sortOrder, ...filters },
  });
  return response.data;
};

const roles = [
  { id: "admin", title: "Админ" },
  { id: "manager", title: "Менеджер" },
];

const Users = memo(() => {
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
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: usersData, isLoading } = useQuery({
    queryKey: [
      "users",
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

      const cachedData = queryClient.getQueryData(["users", params]);
      if (cachedData) {
        return cachedData;
      }

      return fetchUsers(params);
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
    queryClient.invalidateQueries("users");
  };

  const handleDateRangeChange = (value) => {
    setSearchFilters((prev) => ({ ...prev, dateRange: value || [] }));
    queryClient.invalidateQueries("users");
  };

  const handleCityFilterChange = (value) => {
    setSearchFilters((prev) => ({
      ...prev,
      roles: Array.isArray(value) ? value : [value], // Всегда массив
    }));

    queryClient.invalidateQueries(["users"], {
      filters: searchFilters,
    });
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
      width: 200,
    },
    {
      title: "Ник",
      dataIndex: "userName",
      key: "userName",
      sorter: true,
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Поиск по нику"
            defaultValue={searchFilters.userName}
            onChange={(e) => handleSearchDebounced("userName", e.target.value)}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
        </div>
      ),
      width: 200,
    },
    {
      title: "Роли",
      dataIndex: "roles",
      key: "roles",
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
            placeholder="Выберите роль"
            value={selectedKeys}
            onChange={(value) => setSelectedKeys(value)}
          >
            {roles?.map((role) => (
              <Select.Option key={role.id} value={role.id}>
                {role.title}
              </Select.Option>
            ))}
          </Select>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              type="primary"
              onClick={() => {
                handleCityFilterChange(selectedKeys);
                confirm();
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
        const userRoles = record.roles
          .map((id) => roles.find((role) => id === role.id)?.title)
          .filter(Boolean);

        return (
          <>
            {userRoles.map((title) => (
              <Tag color="blue" key={title}>
                {title}
              </Tag>
            ))}
          </>
        );
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
        <h2 style={{ margin: 0 }}>Пользователи</h2>
        <Button type="primary" onClick={() => setIsCreateModalOpen(true)}>
          Добавить запись
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={usersData || []}
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

      <CreateUserModal
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
        <EditUserModal
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

Users.displayName = "Users";

export default Users;
