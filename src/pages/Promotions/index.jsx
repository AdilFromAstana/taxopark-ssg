import { useState } from "react";
import { Input, Card, Button, Modal } from "antd";
import "./style.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import moment from "moment";

const API_URL = import.meta.env.VITE_API_URL;

const fetchPromotions = async ({ queryKey }) => {
  const [, params] = queryKey;
  const response = await axios.get(`${API_URL}/promotions`, { params });
  return response.data;
};

export default function PromotionsPage() {
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState(null);
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
            hoverable
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
            <Card.Meta title={promo.title} description={promo.company} />
            <p className="promotion-description">{promo.description}</p>
            {promo.expires && (
              <p className="promotion-expiry">
                Действует до {moment(promo.expires).format("DD.MM.YYYY")}
              </p>
            )}
          </Card>
        ))}
      </div>

      <Modal
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
              Таксопарк: {selectedPromo.company}
            </p>
            <p className="promotion-description">{selectedPromo.description}</p>
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
