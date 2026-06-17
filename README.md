# batz-manual

Такси-приложение BATZ для Telegram WebApp.

## Установка

```bash
npm install
```

## Запуск

```bash
npm run dev
```

## Структура проекта

```
/workspace
├── components/
│   ├── Map.js              # Компонент карты
│   └── ui/                 # Переиспользуемые UI компоненты
│       ├── Header.js
│       ├── AddressInput.js
│       ├── TariffSelector.js
│       ├── PaymentSelector.js
│       └── OrderHistory.js
├── lib/
│   ├── i18n.js             # Интернационализация
│   ├── supabase.js         # Supabase клиент
│   └── geocode.js          # Геокодинг
├── pages/
│   └── index.js            # Главная страница
├── styles/
│   └── Map.module.css      # Стили карты
├── .env.local              # Переменные окружения (не коммитить!)
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── next.config.js
└── package.json
```

## Улучшения

### Безопасность
- ✅ Ключи Supabase вынесены в `.env.local`
- ✅ Добавлен `.gitignore` для защиты секретов

### Код
- ✅ Рефакторинг: разделение на переиспользуемые компоненты
- ✅ Добавлена обработка ошибок
- ✅ Debounce для поиска адресов
- ✅ Защита от повторной отправки форм

### Инструменты
- ✅ ESLint и Prettier настроены
- ✅ Конкретные версии зависимостей

## Следующие шаги

1. Добавить тесты (Jest, React Testing Library)
2. Добавить кэширование геокодинга
3. Улучшить обработку оффлайн-режима
4. Расширить README с инструкциями по деплою