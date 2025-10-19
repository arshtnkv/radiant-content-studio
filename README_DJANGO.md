# Инструкция по настройке Django backend

## Подготовка фронтенда

### 1. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```bash
cp .env.example .env
```

Отредактируйте `.env` и установите URL вашего Django API:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 2. Установка зависимостей и запуск

```bash
npm install
npm run dev
```

## Настройка Django backend

### 1. Документация API

Полная документация всех необходимых эндпоинтов находится в файле `API_DOCUMENTATION.md`.

Бэкендер должен реализовать все эндпоинты согласно этой документации.

### 2. Основные требования

- **База данных**: PostgreSQL
- **Аутентификация**: JWT токены (djangorestframework-simplejwt)
- **CORS**: Настроить django-cors-headers
- **Файлы**: Django Media files для загрузки изображений

### 3. Структура моделей

Все модели описаны в `API_DOCUMENTATION.md`, раздел "Структура моделей Django".

### 4. CORS настройки

Для разработки добавьте в Django settings:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",
]

CORS_ALLOW_CREDENTIALS = True
```

### 5. Тестирование

После запуска Django backend на `http://localhost:8000`, фронтенд будет автоматически обращаться к API.

Проверьте:
- Вход в систему (admin@admin.com)
- Создание/редактирование страниц
- Загрузку изображений
- Настройки сайта

## Отличия от Supabase версии

- Удалена зависимость от `@supabase/supabase-js`
- Создан новый API клиент (`src/lib/api-client.ts`)
- Все компоненты адаптированы для работы с REST API
- Аутентификация через JWT токены вместо Supabase Auth
- Загрузка файлов через Django Media вместо Supabase Storage

## Продакшен

Для продакшена:
1. Измените `VITE_API_BASE_URL` на URL вашего Django сервера
2. Соберите проект: `npm run build`
3. Разместите содержимое папки `dist` на вашем хостинге
