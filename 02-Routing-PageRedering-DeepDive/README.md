# Next.js Routing Deep Dive - Tổng Hợp Kiến Thức

## 📚 Tổng Quan

Dự án này là một bài học sâu về **Routing** trong Next.js App Router, bao gồm các khái niệm nâng cao như Parallel Routes, Intercepting Routes, Route Groups, và Middleware.

## 🗂️ Cấu Trúc Dự Án

```
app/
├── (marketing)/          # Route Group - Marketing pages
│   ├── layout.js
│   └── page.js          # Trang chủ
├── (content)/           # Route Group - Content pages
│   ├── layout.js
│   ├── news/
│   │   ├── page.js
│   │   └── [slug]/
│   │       ├── @modal/          # Parallel Route
│   │       │   ├── (.)image/    # Intercepting Route
│   │       │   └── default.js
│   │       ├── image/
│   │       ├── layout.js
│   │       ├── page.js
│   │       └── not-found.js
│   └── archive/
│       ├── @archive/            # Parallel Route
│       │   └── [[...filter]]/   # Catch-all Route
│       │       ├── page.js
│       │       └── error.js
│       ├── @latest/             # Parallel Route
│       │   └── default.js
│       └── layout.js
├── api/
│   └── route.js         # API Route
└── globals.css
```

---

## 🎯 1. Route Groups - Nhóm Route

### Lý Thuyết

Route Groups cho phép tổ chức các route mà không ảnh hưởng đến URL structure. Sử dụng dấu ngoặc đơn `()` để tạo group.

### Thực Hành

```javascript
// app/(marketing)/page.js - Trang chủ
export default function HomePage() {
  return (
    <div id="home">
      <img src={logo.src} alt="A newspaper" />
      <h1>A News Site For The Next Generation</h1>
      {/* ... */}
    </div>
  );
}
```

```javascript
// app/(content)/layout.js - Layout cho content pages
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MainHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

### Lợi Ích

- **Tổ chức code**: Phân chia rõ ràng giữa marketing và content
- **Layout riêng biệt**: Mỗi group có thể có layout khác nhau
- **URL không thay đổi**: `(marketing)` và `(content)` không xuất hiện trong URL

---

## 🔄 2. Parallel Routes - Route Song Song

### Lý Thuyết

Parallel Routes cho phép render nhiều trang cùng lúc trong cùng một layout. Sử dụng ký hiệu `@` để định nghĩa slot.

### Thực Hành - Archive Section

#### Cấu Trúc

```
archive/
├── @archive/[[...filter]]/    # Slot 1: Filter content
├── @latest/                   # Slot 2: Latest news
└── layout.js                  # Layout nhận cả 2 slots
```

#### Layout Component

```javascript
// app/(content)/archive/layout.js
export default function ArchiveLayout({ archive, latest }) {
  return (
    <div>
      <h1>News Archive</h1>
      <section id="archive-filter">{archive}</section>
      <section id="archive-latest">{latest}</section>
    </div>
  );
}
```

#### Archive Slot

```javascript
// app/(content)/archive/@archive/[[...filter]]/page.js
export default function ArchiveYearPage({ params }) {
  const { filter } = params;
  const selectedYear = filter?.[0];
  const selectedMonth = filter?.[1];

  // Logic xử lý filter...

  return (
    <>
      <header id="archive-header">
        <nav>{/* Navigation links */}</nav>
      </header>
      {newsContent}
    </>
  );
}
```

#### Latest Slot

```javascript
// app/(content)/archive/@latest/default.js
export default function LatestNewsArchivePage() {
  const latestNews = getLatestNews();

  return (
    <>
      <h2>Latest News Archive Page</h2>
      <NewsList news={latestNews} />
    </>
  );
}
```

---

### File `default.js` - Fallback cho Parallel Routes

#### Tại Sao Cần `default.js`?

File `default.js` là **bắt buộc** trong Parallel Routes để xử lý các trường hợp:

1. **Initial load** (tải trang lần đầu)
2. **Full-page reload** (refresh trang)
3. **Unmatched slots** (slot không có route phù hợp)

#### Ví Dụ Minh Họa

Giả sử có cấu trúc sau:

```
dashboard/
├── @team/
│   └── settings/
│       └── page.js        # Có route /settings
├── @analytics/
│   └── default.js         # KHÔNG có route /settings
└── layout.js
```

#### Scenario 1: Navigation (Client-side)

```
User navigate từ /dashboard → /dashboard/settings

✅ @team slot: Render /settings page
✅ @analytics slot: Giữ nguyên trang hiện tại (không reload)
```

#### Scenario 2: Refresh Page

```
User refresh tại /dashboard/settings

✅ @team slot: Render /settings page
❌ @analytics slot: KHÔNG có route /settings
→ Next.js tìm default.js cho @analytics
→ Nếu không có default.js → 404 Error
```

#### Code Ví Dụ Chi Tiết

```javascript
// File: app/dashboard/@analytics/default.js
export default function AnalyticsDefault() {
  return (
    <div className="analytics-default">
      <h3>📊 Analytics Dashboard</h3>
      <p>Default analytics view - no specific route matched</p>
      <div className="stats">
        <div>Total Users: 1,234</div>
        <div>Page Views: 5,678</div>
        <div>Bounce Rate: 45%</div>
      </div>
    </div>
  );
}
```

#### Children Slot cũng cần `default.js`

Vì `children` là một implicit slot, bạn cũng cần tạo `default.js` cho children:

```javascript
// File: app/dashboard/default.js (cho children slot)
export default function DashboardDefault() {
  return (
    <div className="dashboard-default">
      <h2>🏠 Dashboard Home</h2>
      <p>Welcome to your dashboard!</p>
      <div className="quick-actions">
        <button>View Reports</button>
        <button>Manage Team</button>
        <button>Settings</button>
      </div>
    </div>
  );
}
```

#### Layout với Multiple Slots

```javascript
// File: app/dashboard/layout.js
export default function DashboardLayout({
  children, // Implicit slot
  team, // @team slot
  analytics, // @analytics slot
}) {
  return (
    <div className="dashboard-layout">
      <header>
        <h1>Dashboard</h1>
      </header>

      <div className="dashboard-content">
        <aside className="team-panel">
          {team} {/* @team slot */}
        </aside>

        <main className="main-content">
          {children} {/* Implicit children slot */}
        </main>

        <aside className="analytics-panel">
          {analytics} {/* @analytics slot */}
        </aside>
      </div>
    </div>
  );
}
```

#### Flow Diagram Chi Tiết

```
┌─────────────────────────────────────────────────────────────┐
│ User truy cập: /dashboard/settings                           │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ Next.js tìm routes cho từng slot:                           │
│                                                             │
│ @team slot: /dashboard/@team/settings/page.js ✅            │
│ @analytics slot: /dashboard/@analytics/settings/page.js ❌ │
│ children slot: /dashboard/settings/page.js ✅               │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ Render Strategy:                                             │
│                                                             │
│ ✅ @team: Render settings page                              │
│ ✅ @analytics: Render default.js (fallback)                │
│ ✅ children: Render settings page                           │
└─────────────────────────────────────────────────────────────┘
```

#### Best Practices cho `default.js`

✅ **Nên:**

```javascript
// Tạo default.js cho mọi parallel slot
export default function SlotDefault() {
  return (
    <div className="slot-default">
      <h3>Default Content</h3>
      <p>This slot has no specific route matched</p>
    </div>
  );
}
```

❌ **Không Nên:**

```javascript
// Đừng để slot trống
export default function EmptySlot() {
  return null; // Sẽ gây layout shift
}

// Đừng throw error
export default function ErrorSlot() {
  throw new Error("No route matched"); // Sẽ crash app
}
```

#### Lợi Ích của `default.js`

- **Tránh 404**: Slot luôn có nội dung để hiển thị
- **UX tốt**: Không có layout shift khi refresh
- **Consistent**: Layout luôn đầy đủ các slot
- **Fallback**: Có nội dung mặc định khi không match route

---

### Lợi Ích

- **Render song song**: Hiển thị nhiều nội dung cùng lúc
- **Tải nhanh**: Các slot có thể load độc lập
- **UX tốt hơn**: Người dùng thấy nhiều thông tin cùng lúc
- **Fallback handling**: `default.js` đảm bảo không có slot trống

---

## 🎯 3. Catch-All Routes - Route Bắt Tất Cả

### Lý Thuyết

**Catch-all routes** là một tính năng mạnh mẽ cho phép route có thể match với bất kỳ số lượng segments nào trong URL.

#### Các Loại Catch-All Routes:

1. **Catch-all Required** `[...param]`: Bắt buộc phải có ít nhất 1 segment
2. **Catch-all Optional** `[[...param]]`: Có thể bắt cả khi không có segment nào

#### So Sánh:

| Ký Hiệu        | Tên Folder    | URL Match                | params                                            |
| -------------- | ------------- | ------------------------ | ------------------------------------------------- |
| `[param]`      | `[slug]`      | `/news/hello`            | `{ slug: 'hello' }`                               |
| `[...param]`   | `[...slug]`   | `/news/a/b/c`            | `{ slug: ['a', 'b', 'c'] }`                       |
| `[[...param]]` | `[[...slug]]` | `/news` hoặc `/news/a/b` | `{ slug: undefined }` hoặc `{ slug: ['a', 'b'] }` |

---

### Thực Hành Chi Tiết

#### Trường Hợp 1: URL Mapping

```javascript
// File: app/(content)/archive/@archive/[[...filter]]/page.js
export default function ArchiveYearPage({ params }) {
  const { filter } = params;

  console.log("Filter params:", filter);

  // Case 1: User truy cập /archive
  // → filter = undefined

  // Case 2: User truy cập /archive/2023
  // → filter = ['2023']

  // Case 3: User truy cập /archive/2023/12
  // → filter = ['2023', '12']

  // Case 4: User truy cập /archive/2023/12/15
  // → filter = ['2023', '12', '15']

  const selectedYear = filter?.[0]; // Lấy năm
  const selectedMonth = filter?.[1]; // Lấy tháng
  const selectedDay = filter?.[2]; // Lấy ngày (nếu có)

  // Logic xử lý dựa trên số lượng segments
  let news = [];
  let links = [];

  if (!selectedYear && !selectedMonth) {
    // Không có filter → hiển thị danh sách năm
    links = getAvailableNewsYears();
  } else if (selectedYear && !selectedMonth) {
    // Có năm → hiển thị danh sách tháng
    news = getNewsForYear(selectedYear);
    links = getAvailableNewsMonths(selectedYear);
  } else if (selectedYear && selectedMonth) {
    // Có năm và tháng → hiển thị news theo tháng
    news = getNewsForYearAndMonth(selectedYear, selectedMonth);
    links = [];
  }

  return (
    <>
      <header>
        <nav>
          {links.map((link) => (
            <Link href={`/archive/${selectedYear}/${link}`}>{link}</Link>
          ))}
        </nav>
      </header>
      {news.length > 0 ? <NewsList news={news} /> : <p>No news found</p>}
    </>
  );
}
```

#### Ví Dụ Cụ Thể với URL:

```
🌐 URL: /archive
   params.filter = undefined
   → Hiển thị: Danh sách các năm (2021, 2022, 2023)

🌐 URL: /archive/2023
   params.filter = ['2023']
   → Hiển thị: Danh sách các tháng (01, 02, 03...)

🌐 URL: /archive/2023/12
   params.filter = ['2023', '12']
   → Hiển thị: Tất cả news tháng 12/2023

🌐 URL: /archive/2023/12/15
   params.filter = ['2023', '12', '15']
   → Hiển thị: News ngày 15/12/2023
```

#### Code Hoàn Chỉnh:

```javascript
import Link from "next/link";
import {
  getAvailableNewsMonths,
  getAvailableNewsYears,
  getNewsForYear,
  getNewsForYearAndMonth,
} from "@/lib/news";
import NewsList from "@/components/news-list";

export default function ArchiveYearPage({ params }) {
  const { filter } = params;
  const selectedYear = filter?.[0];
  const selectedMonth = filter?.[1];

  let news;
  let links = getAvailableNewsYears();
  let newsContent = <p>No news selected in this archive.</p>;

  // Logic điều hướng dựa trên số lượng segments
  if (selectedYear && !selectedMonth) {
    news = getNewsForYear(selectedYear);
    links = getAvailableNewsMonths(selectedYear);
  }

  if (selectedYear && selectedMonth) {
    news = getNewsForYearAndMonth(selectedYear, selectedMonth);
    links = [];
  }

  if (news && news.length > 0) {
    newsContent = <NewsList news={news} />;
  }

  // Validation - kiểm tra tính hợp lệ của params
  if (
    (selectedYear && !getAvailableNewsYears().includes(+selectedYear)) ||
    (selectedMonth &&
      !getAvailableNewsMonths(selectedYear).includes(+selectedMonth))
  ) {
    throw new Error("Invalid year or month");
  }

  return (
    <>
      <header id="archive-header">
        <nav>
          <ul>
            {links.map((year) => {
              const href = selectedYear
                ? `/archive/${selectedYear}/${year}`
                : `/archive/${year}`;
              return (
                <li key={year}>
                  <Link href={href}>{year}</Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>
      {newsContent}
    </>
  );
}
```

---

### Error Handling - Xử Lý Lỗi

#### Tại Sao Cần Error Handling?

Khi user nhập URL không hợp lệ như `/archive/9999` (năm không tồn tại), chúng ta cần bắt lỗi.

```javascript
// File: app/(content)/archive/@archive/[[...filter]]/error.js
"use client";

export default function FilterErrorPage({ error, reset }) {
  return (
    <div className="error">
      <h1>❌ Error</h1>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

---

### Default File - Trường Hợp Không Match

Khi parallel route không tìm thấy route phù hợp, nó sẽ render `default.js`:

```javascript
// File: app/(content)/archive/@latest/default.js
export default function LatestNewsArchivePage() {
  // Luôn hiển thị latest news bất kể URL là gì
  const latestNews = getLatestNews();

  return (
    <>
      <h2>Latest News Archive Page</h2>
      <NewsList news={latestNews} />
    </>
  );
}
```

---

### Khi Nào Nên Sử Dụng Catch-All Routes?

✅ **Sử Dụng Khi:**

- Tạo trang filter/search động
- Breadcrumbs navigation
- Nested categories (ví dụ: /category/subcategory/subsubcategory)
- API routing phức tạp

❌ **Không Nên Dùng Khi:**

- Route đơn giản, biết trước số segments
- SEO quan trọng (khó predict URL)
- Cần route chính xác (dùng dynamic route `[param]` thay vì)

---

## 🚀 4. Intercepting Routes - Route Chặn

### Lý Thuyết

**Intercepting Routes** cho phép bạn "chặn" navigation và hiển thị route trong modal hoặc overlay mà **KHÔNG thay đổi URL**. Đây là tính năng giúp tạo trải nghiệm người dùng mượt mà như Instagram, Twitter.

#### Ký Hiệu Intercepting Routes:

| Ký Hiệu        | Mục Đích                | Ví Dụ                                        |
| -------------- | ----------------------- | -------------------------------------------- |
| `(.)path`      | Intercept ở cùng level  | Từ `/news/abc` → intercept `/news/abc/image` |
| `(..)path`     | Intercept ở level cha   | Từ `/news` → intercept `/image`              |
| `(..)(..)path` | Intercept ở 2 level cha | Từ `/news/abc` → intercept `/image`          |
| `(...)path`    | Intercept từ root       | Từ bất kỳ đâu → intercept `/image`           |

---

### Cách Hoạt Động - Flow Diagram

#### Scenario: User Click vào Hình Ảnh

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User đang ở: /news/ai-revolution-in-2024                 │
│    (trang chi tiết tin tức)                                 │
└─────────────────────────────────────────────────────────────┘
                        ↓ Click vào image
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. User click vào Link href="/news/ai-revolution-in-2024/  │
│    image"                                                   │
└─────────────────────────────────────────────────────────────┘
                        ↓ Next.js tìm route
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Next.js tìm thấy:                                        │
│    - Regular route: /news/[slug]/image/page.js              │
│    - Intercepting route: /news/[slug]/@modal/(.)image/     │
│                                                            │
│    ✅ Intercepting route được ưu tiên (gần với current)    │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Hiển thị: Modal với hình ảnh lớn                         │
│    URL KHÔNG thay đổi: /news/ai-revolution-in-2024         │
│    (người dùng vẫn thấy URL cũ)                             │
└─────────────────────────────────────────────────────────────┘
```

#### Scenario: Refresh Page hoặc Direct Access

```
┌─────────────────────────────────────────────────────────────┐
│ User truy cập trực tiếp: /news/ai-revolution-in-2024/image  │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ Next.js không thấy Intercepting Route (không có parent)      │
│ → Sử dụng Regular Route                                     │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ Hiển thị: Full page image                                   │
│ URL: /news/ai-revolution-in-2024/image                      │
└─────────────────────────────────────────────────────────────┘
```

---

### Thực Hành Chi Tiết - News Image Modal

#### Cấu Trúc File

```
news/[slug]/
├── @modal/                    # Parallel Route Slot
│   ├── (.)image/              # Intercepting Route
│   │   └── page.js            # Modal component
│   └── default.js             # Khi không có modal nào được trigger
├── image/                      # Regular Route
│   └── page.js                # Full page image
├── layout.js                  # Layout nhận modal slot
├── page.js                    # Trang chi tiết news
└── not-found.js               # Trang 404
```

---

#### Step 1: Tạo Regular Route (Full Page Image)

```javascript
// File: app/(content)/news/[slug]/image/page.js
import { notFound } from "next/navigation";
import { DUMMY_NEWS } from "@/dummy-news";

export default function ImagePage({ params }) {
  const newsItemSlug = params.slug;
  const newsItem = DUMMY_NEWS.find(
    (newsItem) => newsItem.slug === newsItemSlug
  );

  if (!newsItem) {
    notFound();
  }

  // Hiển thị full page image (dùng khi refresh hoặc direct access)
  return (
    <div className="fullscreen-image">
      <img src={`/images/news/${newsItem.image}`} alt={newsItem.title} />
    </div>
  );
}
```

**URL khi hiển thị:** `/news/ai-revolution-in-2024/image`

---

#### Step 2: Tạo Intercepting Route (Modal)

```javascript
// File: app/(content)/news/[slug]/@modal/(.)image/page.js
"use client";

import { notFound, useRouter } from "next/navigation";
import { DUMMY_NEWS } from "@/dummy-news";

export default function InterceptedImagePage({ params }) {
  const router = useRouter();
  const newsItemSlug = params.slug;
  const newsItem = DUMMY_NEWS.find(
    (newsItem) => newsItem.slug === newsItemSlug
  );

  if (!newsItem) {
    notFound();
  }

  // Xử lý khi user click vào backdrop
  const handleBackdropClick = () => {
    router.back(); // Quay lại trang trước
  };

  return (
    <>
      {/* Backdrop - màn hình mờ phía sau */}
      <div
        className="modal-backdrop"
        onClick={handleBackdropClick}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          zIndex: 1000,
          cursor: "pointer",
        }}
      />

      {/* Modal - hiển thị ảnh lớn */}
      <dialog
        className="modal"
        open
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1001,
          border: "none",
          backgroundColor: "transparent",
        }}
      >
        <div>
          <img
            src={`/images/news/${newsItem.image}`}
            alt={newsItem.title}
            style={{ maxWidth: "90vw", maxHeight: "90vh" }}
          />
        </div>
      </dialog>
    </>
  );
}
```

**URL khi hiển thị:** vẫn là `/news/ai-revolution-in-2024` (không đổi)

---

#### Step 3: Tạo Default File

File `default.js` được render khi không có modal nào được trigger:

```javascript
// File: app/(content)/news/[slug]/@modal/default.js
export default function ModalDefaultPage() {
  // Return null khi không có modal nào
  // → chỉ render main content
  return null;
}
```

---

#### Step 4: Tạo Layout Nhận Modal Slot

```javascript
// File: app/(content)/news/[slug]/layout.js
export default function NewsLayout({ children, modal }) {
  return (
    <>
      {/* Render modal nếu có (khi click vào image) */}
      {modal} {/* Intercepting route component */}
      {/* Render main content (trang chi tiết news) */}
      {children} {/* Regular page component */}
    </>
  );
}
```

---

#### Step 5: Tạo Trang Chi Tiết News

```javascript
// File: app/(content)/news/[slug]/page.js
import { notFound } from "next/navigation";
import Link from "next/link";
import { DUMMY_NEWS } from "@/dummy-news";

export default function NewsDetailPage({ params }) {
  const { slug } = params;
  const newsItem = DUMMY_NEWS.find((newsItem) => newsItem.slug === slug);

  if (!newsItem) {
    notFound();
  }

  return (
    <article className="news-article">
      <header>
        {/* Link đến image - sẽ trigger intercepting route */}
        <Link href={`/news/${newsItem.slug}/image`}>
          <img
            src={`/images/news/${newsItem.image}`}
            alt={newsItem.title}
            style={{ width: "100%", cursor: "pointer" }}
          />
        </Link>
        <h1>{newsItem.title}</h1>
        <time dateTime={newsItem.date}>{newsItem.date}</time>
      </header>
      <p>{newsItem.content}</p>
    </article>
  );
}
```

---

### So Sánh Regular Route vs Intercepting Route

| Aspect       | Regular Route       | Intercepting Route    |
| ------------ | ------------------- | --------------------- |
| **Trigger**  | Refresh, direct URL | Navigate từ page khác |
| **URL**      | Thay đổi            | **KHÔNG thay đổi**    |
| **Hiển thị** | Full page           | Modal/Overlay         |
| **Use Case** | SEO, share link     | Modal, quick preview  |
| **UX**       | Trang mới           | Smooth transition     |

---

### CSS Styling (Tham Khảo)

```css
/* File: app/globals.css */

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 1000;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  border: none;
  background: transparent;
}

.modal img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
}

.fullscreen-image {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
```

---

### Best Practices

✅ **Nên:**

- Sử dụng `default.js` để tránh lỗi khi không có modal
- Sử dụng client component cho intercepting route (cần event handlers)
- Tạo backdrop clickable để close modal
- Giữ URL không đổi để UX tốt hơn

❌ **Không Nên:**

- Sử dụng intercepting route cho SEO content
- Quên tạo regular route (sẽ lỗi khi refresh)
- Mix server và client components không đúng cách

---

## 🔗 5. Kết Hợp Parallel Routes với Intercepting Routes

### Thực Hành

Trong dự án, chúng ta kết hợp:

- **Parallel Route** (`@modal`) để tạo slot cho modal
- **Intercepting Route** (`(.)image`) để chặn navigation

### Kết Quả

- Modal hiển thị khi navigate từ trang news
- Full page hiển thị khi refresh hoặc direct access
- UX mượt mà với animation và backdrop

---

## 🛠️ 6. API Routes và Middleware

### API Route

```javascript
// app/api/route.js
export async function GET(request) {
  console.log(request);
  return new Response("Hello, world!");
}
```

### Middleware

```javascript
// middleware.js
import { NextResponse } from "next/server";

export default function middleware(request) {
  console.log(request);
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*" | "/news/:path*",
};
```

### Chức Năng Middleware

- **Logging**: Ghi log tất cả request đến API và news routes
- **Authentication**: Có thể thêm logic xác thực
- **Redirect**: Có thể redirect hoặc rewrite URL
- **Headers**: Thêm hoặc sửa đổi headers

---

## 📝 Tóm Tắt Các Khái Niệm

| Khái Niệm       | Ký Hiệu      | Mục Đích            | Ví Dụ                      |
| --------------- | ------------ | ------------------- | -------------------------- |
| Route Groups    | `(name)`     | Tổ chức routes      | `(marketing)`, `(content)` |
| Parallel Routes | `@slot`      | Render song song    | `@archive`, `@modal`       |
| Catch-all       | `[...param]` | Bắt tất cả segments | `[[...filter]]`            |
| Intercepting    | `(.)path`    | Chặn navigation     | `(.)image`                 |
| Dynamic         | `[param]`    | Route động          | `[slug]`                   |

---

## 🎯 Best Practices

### 1. Tổ Chức File

- Sử dụng Route Groups để phân chia logic
- Đặt `default.js` cho parallel routes
- Sử dụng `not-found.js` cho error handling

### 2. Performance

- Parallel routes giúp tải nhanh hơn
- Intercepting routes cải thiện UX
- Middleware giúp xử lý request hiệu quả

### 3. UX/UI

- Modal với intercepting routes
- Loading states cho parallel routes
- Error boundaries cho catch-all routes

---

## 🚀 Cách Chạy Dự Án

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Truy cập các routes:
# - / (trang chủ)
# - /news (danh sách tin tức)
# - /news/[slug] (chi tiết tin tức)
# - /news/[slug]/image (hình ảnh full page)
# - /archive (lưu trữ tin tức)
# - /api (API endpoint)
```

---

## 📚 Tài Liệu Tham Khảo

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Parallel Routes](https://nextjs.org/docs/app/building-your-application/routing/parallel-routes)
- [Intercepting Routes](https://nextjs.org/docs/app/building-your-application/routing/intercepting-routes)
- [Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

_Dự án này được tạo ra để học tập và thực hành các khái niệm nâng cao về Routing trong Next.js App Router._
