# API Документация для Django Backend

## Базовый URL
Для разработки: `http://localhost:8000/api`
Для продакшена: `https://your-domain.com/api`

---

## Аутентификация

Все защищённые эндпоинты требуют токен аутентификации в заголовке:
```
Authorization: Bearer <access_token>
```

### 1. Вход в систему (Login)
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "admin@admin.com",
  "password": "your_password"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@admin.com"
  },
  "access_token": "jwt_token_here",
  "refresh_token": "refresh_token_here",
  "expires_in": 3600
}
```

**Response (401):**
```json
{
  "error": "Invalid login credentials"
}
```

---

### 2. Выход из системы (Logout)
**POST** `/auth/logout`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### 3. Обновление токена (Refresh Token)
**POST** `/auth/refresh`

**Request Body:**
```json
{
  "refresh_token": "refresh_token_here"
}
```

**Response (200):**
```json
{
  "access_token": "new_jwt_token",
  "expires_in": 3600
}
```

---

### 4. Получение текущего пользователя
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "admin@admin.com",
  "is_admin": true
}
```

---

## Страницы (Pages)

### 5. Получить все страницы
**GET** `/pages`

**Query Parameters:**
- `is_published` (optional): `true` | `false`
- `is_home` (optional): `true` | `false`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "title": "Главная страница",
    "slug": "home",
    "is_home": true,
    "is_published": true,
    "created_at": "2025-10-17T12:00:00Z",
    "updated_at": "2025-10-17T12:00:00Z"
  }
]
```

---

### 6. Получить страницу по slug
**GET** `/pages/:slug`

**Response (200):**
```json
{
  "id": "uuid",
  "title": "О нас",
  "slug": "about",
  "is_home": false,
  "is_published": true,
  "created_at": "2025-10-17T12:00:00Z",
  "updated_at": "2025-10-17T12:00:00Z"
}
```

**Response (404):**
```json
{
  "error": "Page not found"
}
```

---

### 7. Создать страницу (требует admin)
**POST** `/pages`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Новая страница",
  "slug": "new-page",
  "is_home": false,
  "is_published": true
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "title": "Новая страница",
  "slug": "new-page",
  "is_home": false,
  "is_published": true,
  "created_at": "2025-10-17T12:00:00Z",
  "updated_at": "2025-10-17T12:00:00Z"
}
```

---

### 8. Обновить страницу (требует admin)
**PUT** `/pages/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Обновлённое название",
  "slug": "updated-slug",
  "is_home": false,
  "is_published": true
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Обновлённое название",
  "slug": "updated-slug",
  "is_home": false,
  "is_published": true,
  "created_at": "2025-10-17T12:00:00Z",
  "updated_at": "2025-10-19T14:30:00Z"
}
```

---

### 9. Удалить страницу (требует admin)
**DELETE** `/pages/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (204):**
No content

---

## Контент-блоки (Content Blocks)

### 10. Получить блоки страницы
**GET** `/pages/:page_id/blocks`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "page_id": "uuid",
    "type": "text",
    "content": "<h1>Заголовок</h1><p>Текст...</p>",
    "image_url": null,
    "position": 0,
    "created_at": "2025-10-17T12:00:00Z",
    "updated_at": "2025-10-17T12:00:00Z"
  },
  {
    "id": "uuid",
    "page_id": "uuid",
    "type": "image",
    "content": null,
    "image_url": "https://your-domain.com/media/images/photo.jpg",
    "position": 1,
    "created_at": "2025-10-17T12:00:00Z",
    "updated_at": "2025-10-17T12:00:00Z"
  }
]
```

---

### 11. Создать/Обновить блоки (Upsert) (требует admin)
**POST** `/pages/:page_id/blocks/upsert`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
[
  {
    "id": "existing-uuid-or-null",
    "type": "text",
    "content": "<p>Новый текст</p>",
    "image_url": null,
    "position": 0
  },
  {
    "id": null,
    "type": "image",
    "content": null,
    "image_url": "https://your-domain.com/media/images/new.jpg",
    "position": 1
  }
]
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "page_id": "uuid",
    "type": "text",
    "content": "<p>Новый текст</p>",
    "image_url": null,
    "position": 0,
    "created_at": "2025-10-17T12:00:00Z",
    "updated_at": "2025-10-19T14:30:00Z"
  }
]
```

---

### 12. Удалить блок (требует admin)
**DELETE** `/blocks/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (204):**
No content

---

## Настройки сайта (Site Settings)

### 13. Получить настройки сайта
**GET** `/settings`

**Response (200):**
```json
{
  "id": "uuid",
  "site_name": "My Website",
  "logo_url": "https://your-domain.com/media/logos/logo.png",
  "updated_at": "2025-10-17T12:00:00Z"
}
```

---

### 14. Обновить настройки сайта (требует admin)
**PUT** `/settings`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "site_name": "Новое название",
  "logo_url": "https://your-domain.com/media/logos/new-logo.png"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "site_name": "Новое название",
  "logo_url": "https://your-domain.com/media/logos/new-logo.png",
  "updated_at": "2025-10-19T14:30:00Z"
}
```

---

## Загрузка файлов (File Upload)

### 15. Загрузить изображение (требует admin)
**POST** `/upload/image`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
file: <binary_file>
```

**Response (200):**
```json
{
  "url": "https://your-domain.com/media/images/filename.jpg",
  "filename": "filename.jpg",
  "size": 123456
}
```

**Response (400):**
```json
{
  "error": "Invalid file type. Only images allowed."
}
```

---

## Проверка роли администратора

### 16. Проверить роль пользователя
**GET** `/auth/check-admin`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "is_admin": true
}
```

---

## Коды ошибок

- **200** - Успешный запрос
- **201** - Ресурс успешно создан
- **204** - Успешно удалено (нет контента)
- **400** - Неверный запрос
- **401** - Не авторизован
- **403** - Доступ запрещён (не админ)
- **404** - Ресурс не найден
- **500** - Внутренняя ошибка сервера

---

## Примечания для Django разработчика

1. **База данных PostgreSQL** - рекомендуется использовать PostgreSQL для совместимости
2. **JWT токены** - используйте `djangorestframework-simplejwt` для аутентификации
3. **CORS** - настройте `django-cors-headers` для разрешения запросов с фронтенда
4. **File uploads** - используйте Django Media files для хранения изображений
5. **Admin check** - создайте поле `is_admin` в модели User или используйте Django groups/permissions

### Структура моделей Django:

```python
# models.py

from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    is_admin = models.BooleanField(default=False)

class Page(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    is_home = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ContentBlock(models.Model):
    TYPE_CHOICES = [
        ('text', 'Text'),
        ('image', 'Image'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name='blocks')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    content = models.TextField(null=True, blank=True)
    image_url = models.URLField(null=True, blank=True)
    position = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['position']

class SiteSettings(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    site_name = models.CharField(max_length=255, default='My Website')
    logo_url = models.URLField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Рекомендуемые пакеты:

```txt
Django>=4.2
djangorestframework>=3.14
djangorestframework-simplejwt>=5.3
django-cors-headers>=4.3
Pillow>=10.0
psycopg2-binary>=2.9
```
