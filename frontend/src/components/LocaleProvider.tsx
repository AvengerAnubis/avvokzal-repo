'use client';

import { useEffect } from 'react';
import { addLocale, locale } from 'primereact/api';

export default function LocaleProvider() {
  useEffect(() => {
    addLocale('ru', {
      startsWith: 'Начинается с',
      contains: 'Содержит',
      notContains: 'Не содержит',
      endsWith: 'Заканчивается на',
      equals: 'Равно',
      notEquals: 'Не равно',
      noFilter: 'Нет фильтра',
      lt: 'Меньше чем',
      lte: 'Меньше или равно',
      gt: 'Больше чем',
      gte: 'Больше или равно',
      dateIs: 'Дата равна',
      dateIsNot: 'Дата не равна',
      dateBefore: 'Дата до',
      dateAfter: 'Дата после',
      custom: 'Пользовательский',
      clear: 'Очистить',
      apply: 'Применить',
      matchAll: 'Совпадают все',
      matchAny: 'Совпадает любой',
      addRule: 'Добавить правило',
      removeRule: 'Удалить правило',
      accept: 'Да',
      reject: 'Нет',
      choose: 'Выбрать',
      upload: 'Загрузить',
      cancel: 'Отмена',
      dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
      dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
      dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
      monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
      monthNamesShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
      today: 'Сегодня',
      now: 'Сейчас',
      am: 'AM',
      pm: 'PM',
      dateFormat: 'dd.mm.yy',
      firstDayOfWeek: 1,
      emptyMessage: 'Нет данных',
      emptyFilterMessage: 'Ничего не найдено',
    });

    locale('ru');
  }, []);

  return null;
}
