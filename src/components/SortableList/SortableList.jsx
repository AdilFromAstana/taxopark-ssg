/* eslint-disable no-useless-catch */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { PlusOutlined, CloseOutlined } from "@ant-design/icons";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  MouseSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, message } from "antd";
import axios from "axios";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
const API_URL = import.meta.env.VITE_API_URL;

const useSavePriorities = () => {
  return useMutation({
    mutationFn: ({ updateEndpoint, priorityItems }) => {
      try {
        const payload = priorityItems.map((item, index) => ({
          id: item.id,
          priority: index + 1,
        }));
        const response = axios.put(`${API_URL}/${updateEndpoint}`, payload);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      message.success("Priorities saved successfully.");
    },
    onError: (error) => {
      console.error(error);
      message.error("Failed to save priorities. Please try again.");
    },
  });
};

const SortableItem = ({
  item,
  index,
  onRemove,
  onAdd,
  isPriority,
  isEditing,
  readKey,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id, disabled: !isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "10px",
    border: "1px solid #ddd",
    marginBottom: "5px",
    backgroundColor: "white",
    cursor: isEditing ? "grab" : "default",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    opacity: isEditing ? 1 : 0.6,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isEditing ? attributes : {})}
      {...(isEditing ? listeners : {})}
    >
      <span>
        {index + 1}. {item[readKey]}
      </span>
      <Button
        disabled={!isEditing}
        type={isPriority ? "primary" : "default"}
        danger={isPriority}
        icon={isPriority ? <CloseOutlined /> : <PlusOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          isPriority ? onRemove(item.id) : onAdd(item.id);
        }}
      />
    </div>
  );
};

const SortableList = ({
  setIsPriorityModalOpen,
  fetchKey,
  fetchMethod,
  readKey,
  updateEndpoint = "parks/updatePriorities",
}) => {
  const queryClient = useQueryClient();
  const [allItems, setAllItems] = useState([]);
  const [priorityItems, setPriorityItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const { mutate } = useSavePriorities();

  const { data } = useQuery({
    queryKey: [
      fetchKey,
      {
        pageSize: 1000,
      },
    ],
    queryFn: async ({ queryKey }) => {
      const [, params] = queryKey;

      const cachedData = queryClient.getQueryData([fetchKey, params]);
      if (cachedData) {
        return cachedData;
      }

      return fetchMethod(params);
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (data?.data) {
      const sortedData = data.data.reduce(
        (acc, item) => {
          if (item.priority && item.priority > 0) {
            acc.priorityItems.push(item);
          } else {
            acc.allItems.push(item);
          }
          return acc;
        },
        { priorityItems: [], allItems: [] }
      );

      console.log(
        "sortedData.priorityItems: ",
        sortedData.priorityItems.map((item) => {
          return `${item.title} ${item.priority}`;
        })
      );
      setPriorityItems(sortedData.priorityItems);
      setAllItems(sortedData.allItems);
    }
  }, [data]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const onDragEnd = (event, listSetter) => {
    if (!isEditing) return;
    const { active, over } = event;
    if (active.id !== over.id) {
      listSetter((prevItems) => {
        const oldIndex = prevItems.findIndex((item) => item.id === active.id);
        const newIndex = prevItems.findIndex((item) => item.id === over.id);
        return arrayMove(prevItems, oldIndex, newIndex);
      });
    }
  };

  const moveToPriority = (id) => {
    setAllItems((prev) => prev.filter((item) => item.id !== id));
    setPriorityItems((prev) => [
      ...prev,
      allItems.find((item) => item.id === id),
    ]);
  };

  const moveToAll = (id) => {
    const itemToMove = priorityItems.find((item) => item.id === id);
    if (itemToMove) {
      setPriorityItems((prev) => prev.filter((item) => item.id !== id));
      setAllItems((prev) => [...prev, itemToMove]);
    }
  };

  const savePriorityChanges = () => {
    mutate({ updateEndpoint, priorityItems });
    setIsPriorityModalOpen(false);
    setIsEditing(false);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "30px",
          maxHeight: "65vh",
          overflowY: "scroll",
        }}
      >
        <div>
          <h3>Приоритетные элементы</h3>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => onDragEnd(event, setPriorityItems)}
          >
            <SortableContext
              items={priorityItems.sort((a, b) => a.priority - b.priority)}
              strategy={verticalListSortingStrategy}
            >
              {priorityItems.map((item, index) => (
                <SortableItem
                  readKey={readKey}
                  key={item.id}
                  item={item}
                  index={index}
                  onRemove={moveToAll}
                  isPriority
                  isEditing={isEditing}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <div>
          <h3>Все элементы</h3>
          <DndContext sensors={sensors} collisionDetection={closestCenter}>
            <SortableContext
              items={allItems}
              strategy={verticalListSortingStrategy}
            >
              {allItems.map((item, index) => (
                <SortableItem
                  readKey={readKey}
                  isEditing={isEditing}
                  key={item.id}
                  item={item}
                  index={index}
                  onAdd={moveToPriority}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 10,
        }}
      >
        {isEditing ? (
          <>
            <Button type="primary" onClick={savePriorityChanges}>
              Сохранить
            </Button>
            <Button type="default" onClick={() => setIsEditing(false)}>
              Отмена
            </Button>
          </>
        ) : (
          <>
            <Button type="primary" onClick={() => setIsEditing(true)}>
              Изменить приоритет
            </Button>
            <Button
              type="default"
              onClick={() => setIsPriorityModalOpen(false)}
            >
              Закрыть
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default SortableList;
