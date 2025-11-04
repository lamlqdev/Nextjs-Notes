# Data Fetching trong Next.js - Tổng Hợp Kiến Thức

Dự án này minh họa các phương pháp khác nhau để fetch data trong Next.js, từ việc sử dụng external API đến việc tích hợp database trực tiếp vào ứng dụng Next.js.

## 📁 Cấu Trúc Dự Án

```
03-Data-Fetching/
├── app/
│   ├── (content)/
│   │   ├── news/
│   │   │   ├── [slug]/
│   │   │   │   ├── page.js          # Server Component với database
│   │   │   │   ├── loading.js       # Loading UI
│   │   │   │   ├── not-found.js     # Error UI
│   │   │   │   └── image/
│   │   │   │       └── page.js
│   │   │   ├── page.js              # News list page
│   │   │   └── loading.js
│   │   ├── archive/
│   │   │   ├── @latest/
│   │   │   │   └── default.js       # Parallel route
│   │   │   ├── @archive/
│   │   │   │   └── [[...filter]]/
│   │   │   │       ├── page.js
│   │   │   │       └── error.js     # Error boundary
│   │   │   ├── layout.js            # Parallel routes layout
│   │   │   └── loading.js
│   │   └── layout.js
│   ├── api/
│   │   └── route.js                 # API routes
│   └── globals.css
├── backend/
│   ├── app.js                       # Express server
│   └── package.json
├── components/
│   ├── news-list.js                 # Reusable component
│   └── ...
├── lib/
│   └── news.js                      # Database functions
├── data.db                          # SQLite database
└── package.json
```

## 🎯 Tổng Quan

Dự án này trình bày 3 phương pháp chính để fetch data trong Next.js:

1. **Client-side fetching** với `useEffect` và `useState`
2. **Server-side fetching** trực tiếp trong Server Components
3. **Database integration** với SQLite tích hợp trong Next.js

## 🔗 Phương Pháp 1: Fetch từ External API

### Backend Server (Express.js)

```javascript
// backend/app.js
import express from "express";
import sqlite from "better-sqlite3";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/news", (req, res) => {
  const news = db.prepare("SELECT * FROM news").all();
  res.json(news);
});

app.listen(8080);
```

### Client Component với useEffect

```javascript
"use client";

import { useState, useEffect } from "react";

export default function NewsList() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8080/news");
        if (!response.ok) {
          throw new Error("Failed to fetch news");
        }
        const data = await response.json();
        setNews(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <ul>
      {news.map((item) => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  );
}
```

### Ưu điểm:

- Kiểm soát hoàn toàn loading và error states
- Có thể thực hiện re-fetch khi cần
- Phù hợp cho interactive components

### Nhược điểm:

- Phải quản lý state phức tạp
- SEO không tốt (client-side rendering)
- Waterfall loading (HTML → JS → Data)

## ⚡ Phương Pháp 2: Fetch trực tiếp trong Server Component

### Server Component

```javascript
// app/news/page.js
import NewsList from "@/components/news-list";

export default async function NewsPage() {
  // Fetch trực tiếp trong Server Component
  const response = await fetch("http://localhost:8080/news");
  const news = await response.json();

  return (
    <>
      <h1>News Page</h1>
      <NewsList news={news} />
    </>
  );
}
```

### Ưu điểm:

- Đơn giản, không cần quản lý state
- SEO tốt (server-side rendering)
- Faster initial page load

### Nhược điểm:

- Không có loading UI cho user
- Không thể handle errors một cách interactive
- Mỗi request phải chờ server response

## 🗄️ Phương Pháp 3: Database tích hợp trong Next.js

### Database Functions

```javascript
// lib/news.js
import sql from "better-sqlite3";

const db = sql("data.db");

export async function getAllNews() {
  const news = db.prepare("SELECT * FROM news").all();
  // Simulate delay để test loading states
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return news;
}

export async function getNewsItem(slug) {
  const newsItem = db.prepare("SELECT * FROM news WHERE slug = ?").get(slug);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return newsItem;
}
```

### Server Component sử dụng Database

```javascript
// app/news/page.js
import NewsList from "@/components/news-list";
import { getAllNews } from "@/lib/news";

export default async function NewsPage() {
  const news = await getAllNews(); // Trực tiếp từ database

  return (
    <>
      <h1>News Page</h1>
      <NewsList news={news} />
    </>
  );
}
```

### Ưu điểm:

- Performance tốt nhất (không có network request)
- Type safety với TypeScript
- Có thể cache và optimize queries
- Không cần external API server

### Nhược điểm:

- Database phải được deploy cùng với Next.js app
- Khó scale với multiple instances
- Tight coupling giữa app và database

## ⏳ Xử Lý Loading States

### 1. Loading UI với file `loading.js`

```javascript
// app/news/loading.js
export default function NewsLoading() {
  return <p>Loading...</p>;
}

// app/news/[slug]/loading.js
export default function LoadingNewsItem() {
  return <p>Loading news item...</p>;
}
```

### 2. Suspense Boundaries

```javascript
import { Suspense } from "react";

export default function Layout({ children }) {
  return (
    <div>
      <Suspense fallback={<p>Loading...</p>}>{children}</Suspense>
    </div>
  );
}
```

### 3. Parallel Loading với Parallel Routes

```javascript
// app/archive/layout.js
export default function ArchiveLayout({ children, latest, archive }) {
  return (
    <div>
      <h1>Archive</h1>
      <div className="grid">
        <div className="latest">
          <Suspense fallback={<p>Loading latest...</p>}>{latest}</Suspense>
        </div>
        <div className="archive">
          <Suspense fallback={<p>Loading archive...</p>}>{archive}</Suspense>
        </div>
      </div>
      {children}
    </div>
  );
}
```

## ❌ Error Handling

### 1. Error Boundaries với file `error.js`

```javascript
// app/archive/@archive/[[...filter]]/error.js
"use client";

export default function FilterError({ error }) {
  return (
    <div id="error">
      <h2>An error occurred!</h2>
      <p>{error.message}</p>
    </div>
  );
}
```

### 2. Not Found Pages

```javascript
// app/news/[slug]/not-found.js
import Link from "next/link";

export default function NewsNotFoundPage() {
  return (
    <div>
      <h2>News not found!</h2>
      <p>Could not find the requested news item.</p>
      <Link href="/news">Back to all news</Link>
    </div>
  );
}
```

### 3. Programmatic Error Handling

```javascript
// app/news/[slug]/page.js
import { notFound } from "next/navigation";
import { getNewsItem } from "@/lib/news";

export default async function NewsDetailPage({ params }) {
  const newsItem = await getNewsItem(params.slug);

  if (!newsItem) {
    notFound(); // Triggers not-found.js
  }

  return (
    <article>
      <h1>{newsItem.title}</h1>
      <p>{newsItem.content}</p>
    </article>
  );
}
```

## 🚀 Cách Chạy Dự Án

### 1. Chạy Backend Server (Phương pháp 1 & 2)

```bash
cd backend
npm install
npm start
# Server chạy trên port 8080
```

### 2. Chạy Next.js App

```bash
npm install
npm run dev
# App chạy trên port 3000
```

### 3. Test các phương pháp

- **Phương pháp 1**: Sử dụng client components với useEffect
- **Phương pháp 2**: Sử dụng server components với fetch
- **Phương pháp 3**: Sử dụng database tích hợp (không cần backend server)

## 📚 Tóm Tắt Kiến Thức

### Khi nào sử dụng phương pháp nào?

1. **Client-side fetching (`useEffect`)**:

   - Khi cần interactive loading states
   - Khi cần re-fetch data
   - Khi làm việc với external APIs

2. **Server-side fetching**:

   - Khi muốn SEO tốt
   - Khi không cần interactive loading
   - Khi làm việc với static data

3. **Database integration**:
   - Khi có control hoàn toàn về data
   - Khi muốn performance tốt nhất
   - Khi làm việc với internal data

### Best Practices

- Sử dụng `loading.js` cho loading states
- Sử dụng `error.js` cho error boundaries
- Sử dụng `not-found.js` cho 404 pages
- Sử dụng Parallel Routes cho independent loading
- Sử dụng Suspense cho fine-grained loading control

---

_Dự án này minh họa các phương pháp data fetching trong Next.js từ cơ bản đến nâng cao, giúp hiểu rõ khi nào nên sử dụng phương pháp nào._
