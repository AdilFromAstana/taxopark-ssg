import { useState } from 'react';
import { Input, Checkbox, Card, Button, Modal } from 'antd';
import './style.css';

const promotions = [
    {
        id: 1,
        title: 'Розыгрыш iPhone 15',
        company: 'Boom Taxi',
        description: 'Выполните 30 заказов за неделю и участвуйте в розыгрыше нового iPhone 15!',
        image: 'https://i.imgur.com/EaFeqfz.jpg',
        expires: '31 марта 2025',
        active: true,
    },
    {
        id: 2,
        title: 'Скидка 50% на первый заказ',
        company: 'FastCab',
        description: 'Сделайте первый заказ и получите скидку 50%!',
        image: 'https://i.imgur.com/EaFeqfz.jpg',
        expires: null,
        active: true,
    },
    {
        id: 3,
        title: 'Бонус за каждые 10 поездок',
        company: 'SpeedyTaxi',
        description: 'Совершите 10 поездок и получите 2000 тг бонусов на счёт!',
        image: 'https://i.imgur.com/EaFeqfz.jpg',
        expires: '15 февраля 2025',
        active: true,
    }
];

export default function PromotionsPage() {
    const [selectedPromo, setSelectedPromo] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showActiveOnly, setShowActiveOnly] = useState(false);

    const filteredPromotions = promotions
        .filter((promo) =>
            promo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            promo.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            promo.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .filter((promo) => (showActiveOnly ? promo.active && (!promo.expires || new Date(promo.expires) > new Date()) : true))
        .sort((a, b) => (b.expires ? new Date(b.expires).getTime() : Infinity) - (a.expires ? new Date(a.expires).getTime() : Infinity));

    return (
        <div className="promotions-container">
            <h1 className="promotions-title">Акции и бонусы от таксопарков</h1>
            <p className="promotions-description">Следите за актуальными предложениями, участвуйте в розыгрышах, получайте бонусы и скидки!</p>

            <Input
                placeholder="Поиск по акциям..."
                className="promotions-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Checkbox checked={showActiveOnly} onChange={() => setShowActiveOnly(!showActiveOnly)} className="promotions-checkbox">
                Показывать только активные акции
            </Checkbox>

            <div className="promotions-list">
                {filteredPromotions.map((promo) => (
                    <Card
                        key={promo.id}
                        hoverable
                        className={`promotion-card ${!promo.active || (promo.expires && new Date(promo.expires) < new Date()) ? 'promotion-inactive' : ''}`}
                        cover={<img src={promo.image} alt={promo.title} className="promotion-image" />}
                        onClick={() => setSelectedPromo(promo)}
                    >
                        <Card.Meta title={promo.title} description={promo.company} />
                        <p className="promotion-description">{promo.description}</p>
                        {promo.expires && <p className="promotion-expiry">Действует до {promo.expires}</p>}
                    </Card>
                ))}
            </div>

            <Modal
                title={selectedPromo?.title}
                visible={!!selectedPromo}
                onCancel={() => setSelectedPromo(null)}
                footer={[
                    <Button key="close" onClick={() => setSelectedPromo(null)}>Закрыть</Button>,
                    <Button key="apply" type="primary" onClick={() => alert('Заявка отправлена')}>Оставить заявку</Button>
                ]}
            >
                {selectedPromo && (
                    <>
                        <p className="promotion-company">Таксопарк: {selectedPromo.company}</p>
                        <p className="promotion-description">{selectedPromo.description}</p>
                        {selectedPromo.expires && <p className="promotion-expiry">Действует до {selectedPromo.expires}</p>}
                    </>
                )}
            </Modal>
        </div>
    );
}
