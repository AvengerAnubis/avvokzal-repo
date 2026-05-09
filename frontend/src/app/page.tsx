'use client';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import Link from 'next/link';

const reviews = [
  {
    name: 'Анна К.',
    text: 'Отличный сервис! Брала билеты на Москву — всё быстро и удобно.',
    rating: 5,
  },
  {
    name: 'Игорь П.',
    text: 'Удобное приложение, всегда знаю где мой автобус. Рекомендую!',
    rating: 5,
  },
  {
    name: 'Мария С.',
    text: 'Давно пользуюсь, ни разу не подвели. Билеты всегда вовремя.',
    rating: 5,
  },
];

const services = [
  {
    icon: 'pi pi-car',
    title: 'Междугородние рейсы',
    description: 'Более 50 направлений по всей России. Удобные автобусы с кондиционером.',
  },
  {
    icon: 'pi pi-ticket',
    title: 'Онлайн-бронирование',
    description: 'Купите билет не выходя из дома. Электронный билет на телефон.',
  },
  {
    icon: 'pi pi-shield',
    title: 'Страхование',
    description: 'Каждый пассажир застрахован. Полная безопасность в пути.',
  },
];

const whyUs = [
  { icon: 'pi pi-car', title: 'Комфорт', description: 'Современные автобусы с удобными сиденьями и кондиционером.' },
  { icon: 'pi pi-clock', title: 'Точность', description: 'Работаем по расписанию. Вовремя — это про нас.' },
  { icon: 'pi pi-shield', title: 'Безопасность', description: 'Полная страховка пассажиров на весь маршрут.' },
  { icon: 'pi pi-headphones', title: '24/7 Поддержка', description: 'Всегда на связи. Поможем в любое время суток.' },
];

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero секция (уже завершена) */}
      <div className='h-[calc(100vh-6rem)] flex justify-center xl:grid items-center scroll-mx-0'>
        <div className="col-start-1 row-start-1 text-center xl:text-left w-1/2 md:min-w-full m-8 ">
          <h1 className=" mb-4 text-6xl font-bold ">АВ-Вокзал</h1>
          <p className="mb-6 text-4xl font-semibold">Забронируйте междугородние билеты легко и быстро!</p>
          <div className="flex justify-center xl:justify-start gap-4">
            <Link href="/routes">
              <Button label="Найти рейс" icon="pi pi-search" className="p-button-success p-button-outlined" />
            </Link>
          </div>
        </div>
        <div className='col-start-1 row-start-1'>
          <img src="images/bus.png" className='h-auto max-w-[90vw] relative left-1/2 hidden xl:block' />
        </div>
      </div>

      {/* О компании */}
      <section className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">О компании</h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          АВ-Вокзал — современный сервис для бронирования междугородних автобусных билетов. 
          Мы делаем путешествия удобными и доступными для всех. Наша цель — чтобы каждый пассажир 
          мог легко добраться до места назначения с комфортом и без лишних хлопот.
        </p>
      </section>

      {/* Наши услуги */}
      <section>
        <h2 className="text-3xl font-bold mb-8 text-center">Наши услуги</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="text-center">
              <i className={`${service.icon} text-4xl mb-4 text-primary`}></i>
              <h3 className="text-xl font-bold mb-2">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Почему выбирают нас */}
      <section>
        <h2 className="text-3xl font-bold mb-8 text-center">Почему выбирают нас</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyUs.map((item, index) => (
            <Card key={index} className="text-center">
              <i className={`${item.icon} text-3xl mb-3 text-primary`}></i>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Отзывы клиентов */}
      <section>
        <h2 className="text-3xl font-bold mb-8 text-center">Отзывы клиентов</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <Card key={index} className="text-center">
              <div className="flex justify-center mb-3">
                {[...Array(review.rating)].map((_, i) => (
                  <i key={i} className="pi pi-star-fill text-yellow-400 mr-1"></i>
                ))}
              </div>
              <p className="text-gray-600 italic mb-4">"{review.text}"</p>
              <p className="font-bold">{review.name}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA секция */}
      <section className="text-center bg-primary-100 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Готовы отправиться в путь?</h2>
        <p className="text-gray-600 mb-6">Выберите маршрут и забронируйте билет прямо сейчас</p>
        <Link href="/routes">
          <Button label="Посмотреть маршруты" icon="pi pi-arrow-right" className="p-button-lg" />
        </Link>
      </section>
    </div>
  );
}