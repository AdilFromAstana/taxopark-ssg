import { Table, Input, Button, Modal } from "antd";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import CreateFormModal from "./CreateParkModal";
import EditFormModal from "./EditParkModal";
import moment from "moment";

const API_URL = import.meta.env.VITE_API_URL;

const Parks = () => {
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
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/parks`, {
                params: {
                    page,
                    limit: pageSize,
                    sortField,
                    sortOrder,
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

    const columns = [
        {
            title: "Название",
            dataIndex: "title",
            key: "title",
            sorter: true,
            filterDropdown: () => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Поиск по ФИО"
                        defaultValue={searchFilters.name}
                        onChange={(e) => handleSearchDebounced("title", e.target.value)}
                        style={{ width: 188, marginBottom: 8, display: "block" }}
                    />
                </div>
            ),
        },
        {
            title: "Город",
            dataIndex: ["City", "title"],
            key: "cityId",
            sorter: true,
        },
        {
            title: "Создано",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (record) => moment(record.createdAt).format('DD.MM.YYYY HH:mm')
        },
    ];

    return (
        <div style={{ padding: "16px" }}>
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                <h2 style={{ margin: 0 }}>Таксопарки</h2>
                <Button type="primary" onClick={() => setIsCreateModalOpen(true)}>
                    Добавить запись
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total, showSizeChanger: true }}
                rowKey={(record) => record.id}
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

export default Parks;
