import { Table, Input, Button, DatePicker, Tag } from "antd";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import CreateFormModal from "./CreateFormModal";
import EditFormModal from "./EditFormModal";
import moment from "moment";

const { RangePicker } = DatePicker;
const API_URL = import.meta.env.VITE_API_URL;

const tagColor = {
    "taxiPark": "green",
    "consultation": "blue"
}
const tagTitle = {
    "taxiPark": "Таксопарк",
    "consultation": "Консультация"
}

const Forms = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
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
    });
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const getData = async (page = 1, pageSize = 10, sortField = null, sortOrder = null, filters = {}) => {
        console.log(page, pageSize, sortField, sortOrder, filters)
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/forms`, {
                params: {
                    page,
                    limit: pageSize,
                    sortField,
                    sortOrder,
                    filterStartDate: filters.createdAtRange?.[0] || null,
                    filterEndDate: filters.createdAtRange?.[1] || null,
                    selectedParks: filters.selectedParks?.length ? filters.selectedParks.join(",") : null, // ✅ Парки передаем в виде строки
                    filterName: filters.name || "",
                    ...filters,
                },
            });

            setData(response.data.data);
            setPagination((prev) => ({
                ...prev,
                current: page,
                pageSize,
                total: response.data.total || 0,
            }));
        } catch (error) {
            console.error("Ошибка при загрузке данных:", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        getData(pagination.current, pagination.pageSize, sorter.field, sorter.order, searchFilters);
    }, []);

    const debounce = (func, delay) => {
        let timer;
        return (...args) => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                func(...args);
            }, delay);
        };
    };

    const handleSearchDebounced = useCallback(
        debounce((key, value) => {
            setSearchFilters((prev) => ({
                ...prev,
                [key]: value,
            }));

            getData(1, pagination.pageSize, sorter.field, sorter.order, {
                ...searchFilters,
                [key]: value,
            });
        }, 500),
        [pagination.pageSize, sorter.field, sorter.order, searchFilters]
    );

    const handleTableChange = (pagination, filters, sorter) => {
        const sortField = sorter.field || null;
        const sortOrder = sorter.order === "ascend" ? "asc" : sorter.order === "descend" ? "desc" : null;

        setPagination({ ...pagination });
        setSorter({ field: sortField, order: sortOrder });

        getData(pagination.current, pagination.pageSize, sortField, sortOrder, searchFilters);
    };

    const handleDateRangeChange = (dates) => {
        setSearchFilters((prev) => ({
            ...prev,
            createdAtRange: dates ? dates.map((date) => date.format("YYYY-MM-DD")) : [],
        }));

        getData(1, pagination.pageSize, sorter.field, sorter.order, {
            ...searchFilters,
            createdAtRange: dates ? dates.map((date) => date.format("YYYY-MM-DD")) : [],
        });
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
            render: (record) => {
                const title = tagTitle[record]
                return <Tag color={tagColor[record]}>{title}</Tag>
            }
        },
        {
            title: "Таксопарк",
            dataIndex: "parkId",
            key: "parkId",
            sorter: true,
            render: (_, record) => {
                return record?.Park?.title ?? "-"
            }
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
                        value={searchFilters.phoneNumber}
                        onChange={(e) => getData(1, pagination.pageSize, sorter.field, sorter.order, { ...searchFilters, phoneNumber: e.target.value })}
                        style={{ width: 188, marginBottom: 8, display: "block" }}
                    />
                </div>
            ),
        },
        {
            title: "Создано",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (record) => moment(record).format('DD.MM.YYYY HH:mm:ss'),
            sorter: true,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 12, minWidth: 250 }}>
                    <RangePicker
                        value={selectedKeys[0] ? [moment(selectedKeys[0][0]), moment(selectedKeys[0][1])] : []}
                        onChange={(dates) => setSelectedKeys(dates ? [[dates[0].format("YYYY-MM-DD"), dates[1].format("YYYY-MM-DD")]] : [])}
                        style={{ marginBottom: 8 }}
                    />
                    <div style={{ display: "flex", gap: 5 }}>
                        <Button type="primary" onClick={() => { confirm(); handleDateRangeChange(selectedKeys[0]); }} size="small">
                            Применить
                        </Button>
                        <Button onClick={() => { clearFilters(); handleDateRangeChange([]); }} size="small">
                            Сбросить
                        </Button>
                    </div>
                </div>
            ),
            onFilter: (value, record) => {
                const recordDate = moment(record.createdAt).format("YYYY-MM-DD");
                return moment(recordDate).isBetween(value[0], value[1], undefined, "[]");
            }
        },
    ];

    return (
        <div style={{ padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                    <h2 style={{ margin: 0 }}>Заявки</h2>
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
                dataSource={data}
                loading={loading}
                pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total, showSizeChanger: true }}
                onRow={(record) => ({
                    onClick: () => {
                        console.log("record: ", record);
                        setSelectedRecord(record);
                        setIsEditModalOpen(true);
                    }
                })}
                onChange={handleTableChange}
            />

            <CreateFormModal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} refreshData={getData} />
            {
                selectedRecord && (
                    <EditFormModal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} record={selectedRecord} refreshData={getData} />
                )
            }
        </div >
    );
};

export default Forms;
