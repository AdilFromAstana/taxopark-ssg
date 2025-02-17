import { useState } from "react";
import { Input, Checkbox, Card, Button, Modal } from "antd";
import "./style.css";
import { useQuery, useQueryClient } from "react-query";
import axios from "axios";
import moment from "moment";

const API_URL = import.meta.env.VITE_API_URL;

const fetchPromotions = async () => {
  const response = await axios.get(`${API_URL}/promotions`);
  return response.data;
};

export default function PromotionsPage() {
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const queryClient = useQueryClient();

  const { data: promotionsData } = useQuery({
    queryKey: ["promotions"],
    queryFn: async ({ queryKey }) => {
      const [, params] = queryKey;

      const cachedData = queryClient.getQueryData(["promotions", params]);
      if (cachedData) {
        return cachedData;
      }

      return fetchPromotions(params);
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  const filteredPromotions =
    promotionsData?.data ||
    []
      .filter(
        (promo) =>
          promo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          promo.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          promo.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter((promo) =>
        showActiveOnly
          ? promo.active &&
            (!promo.expires || new Date(promo.expires) > new Date())
          : true
      )
      .sort(
        (a, b) =>
          (b.expires ? new Date(b.expires).getTime() : Infinity) -
          (a.expires ? new Date(a.expires).getTime() : Infinity)
      );

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

      <Checkbox
        checked={showActiveOnly}
        onChange={() => setShowActiveOnly(!showActiveOnly)}
        className="promotions-checkbox"
      >
        Показывать только активные акции
      </Checkbox>

      <div className="promotions-list">
        {filteredPromotions.map((promo) => (
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
                src={promo.image}
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
          // <Button
          //   key="apply"
          //   type="primary"
          //   onClick={() => alert("Заявка отправлена")}
          // >
          //   Оставить заявку
          // </Button>,
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
