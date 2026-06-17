const translations = {
  ru: {
    order_taxi: 'Заказать БАЦ',
    confirm_order: 'Подтвердить',
    cancel: 'Отмена',
    contact_driver: 'Связаться',
    fill_addresses: 'Заполните адреса',
    outside_zone: 'Упс... в данном регионе БАЦ пока недоступен',
    from: 'Откуда',
    to: 'Куда',
    enter_from: 'Введите адрес отправления',
    enter_to: 'Введите адрес назначения',
    total: 'Итого'
  },
  kk: {
    order_taxi: 'БАЦ тапсырыс беру',
    confirm_order: 'Растау',
    cancel: 'Бас тарту',
    contact_driver: 'Жүргізушіге хабарласу',
    fill_addresses: 'Мекенжайларды толтырыңыз',
    outside_zone: 'Ап... бұл аймақта БАЦ қолжетімсіз',
    from: 'Қайдан',
    to: 'Қайда',
    enter_from: 'Жөнелту мекенжайын енгізіңіз',
    enter_to: 'Мақсатты мекенжайды енгізіңіз',
    total: 'Барлығы'
  },
  en: {
    order_taxi: 'Order BATZ',
    confirm_order: 'Confirm',
    cancel: 'Cancel',
    contact_driver: 'Contact Driver',
    fill_addresses: 'Fill addresses',
    outside_zone: 'Oops... BATZ not available here',
    from: 'From',
    to: 'To',
    enter_from: 'Enter pickup address',
    enter_to: 'Enter destination',
    total: 'Total'
  }
};

export function t(key, lang = 'ru') {
  return translations[lang]?.[key] || translations['ru'][key] || key;
}

// Заглушка, так как язык хранится в стейте React компонента
export function setLanguage(lang) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('batz_lang', lang);
  }
}
