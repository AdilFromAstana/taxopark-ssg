import { useState } from "react";
import { Input, Card, Button, Modal } from "antd";
import "./style.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import moment from "moment";

const { TextArea } = Input;

const API_URL = import.meta.env.VITE_API_URL;

const fetchPromotions = async ({ queryKey }) => {
  const [, params] = queryKey;
  const response = await axios.get(`${API_URL}/promotions`, { params });
  return response.data;
};

export default function PromotionsPage() {
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState({ highPriority: true });
  const [sortOrder, setSortOrder] = useState(null);

  const { data: promotionsData } = useQuery({
    queryFn: fetchPromotions,
    queryKey: [
      "promotions",
      { searchQuery, sortField, sortOrder, active: true },
    ],
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  return (
    <div className="promotions-container">
      <h1 className="promotions-title">Акции и бонусы от таксопарков</h1>
      <p className="promotions-description">
        Следите за актуальными предложениями, участвуйте в розыгрышах, получайте
        бонусы и скидки!
      </p>

      <Input
        placeholder="Поиск по акциям..."
        className="promotions-search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="promotions-list">
        {promotionsData?.data?.map((promo) => (
          <Card
            key={promo.id}
            className={`promotion-card ${
              !promo.active ||
              (promo.expires && new Date(promo.expires) < new Date())
                ? "promotion-inactive"
                : ""
            }`}
            cover={
              <img
                src={`${API_URL}/uploads/${promo?.imageUrl}`}
                alt={promo.title}
                className="promotion-image"
              />
            }
            onClick={() => setSelectedPromo(promo)}
          >
            <Card.Meta title={promo.title} style={{ whiteSpace: "normal" }} />
            {promo.expires && (
              <p className="promotion-expiry">
                Действует до {moment(promo.expires).format("DD.MM.YYYY")}
              </p>
            )}
          </Card>
        ))}
      </div>

      <Modal
        width="75vw"
        title={selectedPromo?.title}
        open={!!selectedPromo}
        onCancel={() => setSelectedPromo(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedPromo(null)}>
            Закрыть
          </Button>,
        ]}
      >
        {selectedPromo && (
          <>
            <p className="promotion-company">
              Таксопарк: <b>{selectedPromo.Park.title}</b>
            </p>
            <TextArea
              className="promotion-textarea"
              value={selectedPromo.description}
              rows={20}
              readOnly
              autoSize={{
                minRows: 2,
                maxRows: 20,
              }}
            />
            {selectedPromo.expires && (
              <p className="promotion-expiry">
                Действует до{" "}
                {moment(selectedPromo.expires).format("DD.MM.YYYY")}
              </p>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
