import React, { useState } from "react";
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
import { Button } from "antd";
import axios from "axios";

const SortableItem = ({
  item,
  index,
  onRemove,
  onAdd,
  isPriority,
  isEditing,
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
        {index + 1}. {item.label}
      </span>
      <Button
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
  data = [
    { id: "1", label: "Элемент 1" },
    { id: "2", label: "Элемент 2" },
    { id: "3", label: "Элемент 3" },
    { id: "4", label: "Элемент 4" },
  ],
  endpoint = "/",
}) => {
  const [allItems, setAllItems] = useState(data);
  const [priorityItems, setPriorityItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

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

  const savePriorities = async () => {
    const payload = priorityItems.map((item, index) => ({
      id: item.id,
      priority: index + 1,
    }));

    try {
      await axios.post(endpoint, { priorities: payload });
      alert("Приоритеты успешно сохранены!");
      setIsEditing(false);
    } catch (error) {
      alert("Ошибка при сохранении приоритетов");
      console.error(error);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "30px",
        padding: "20px",
      }}
    >
      <div style={{ gridColumn: "span 2", textAlign: "center" }}>
        <Button type="default" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Завершить редактирование" : "Изменить приоритет"}
        </Button>
      </div>
      <div>
        <h3>Приоритетные элементы</h3>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => onDragEnd(event, setPriorityItems)}
        >
          <SortableContext
            items={priorityItems}
            strategy={verticalListSortingStrategy}
          >
            {priorityItems.map((item, index) => (
              <SortableItem
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
                key={item.id}
                item={item}
                index={index}
                onAdd={moveToPriority}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {isEditing && (
        <div style={{ gridColumn: "span 2", textAlign: "center" }}>
          <Button type="primary" onClick={savePriorities}>
            Сохранить приоритеты
          </Button>
        </div>
      )}
    </div>
  );
};

export default SortableList;
