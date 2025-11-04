# Next.js App Router - Tổng Hợp Kiến Thức

## 📚 Tổng Quan

Dự án này là một ứng dụng Next.js sử dụng **App Router** - một cách tiếp cận mới để tổ chức và quản lý routing trong Next.js. Đây là một ứng dụng chia sẻ món ăn với tên "NextLevel Food".

## 🏗️ Cấu Trúc Dự Án

```
app/
├── layout.js          # Root layout với metadata
├── page.js            # Trang chủ
├── not-found.js       # Trang 404
├── globals.css        # CSS toàn cục
├── meals/
│   ├── page.js        # Danh sách món ăn
│   ├── [slug]/
│   │   └── page.js     # Chi tiết món ăn (dynamic route)
│   └── shares/
│       └── page.js     # Chia sẻ món ăn mới
└── community/
    └── page.js        # Trang cộng đồng

components/
├── main-header/        # Header chính
├── meals/             # Components cho món ăn
└── images/            # Components hình ảnh

lib/
├── meal.js            # Database operations
└── action.js          # Server Actions
```

## 🎯 Các Khái Niệm Chính Đã Học

### 1. **File-Based Routing với App Router**

Next.js App Router sử dụng hệ thống routing dựa trên file system thay vì cấu hình thủ công:

- **`page.js`**: Tạo route cho trang
- **`layout.js`**: Layout wrapper cho các trang con
- **`not-found.js`**: Xử lý trang 404
- **`loading.js`**: Hiển thị loading state (không sử dụng trong dự án này)

```12:14:app/layout.js
export const metadata = {
  title: "NextLevel Food",
  description: "Delicious meals, shared by a food-loving community.",
};
```

### 2. **Dynamic Routes**

Sử dụng cú pháp `[slug]` để tạo dynamic routes:

```18:24:app/meals/[slug]/page.js
export default function MealDetailPage({ params }) {
  const meal = getMeal(params.slug);

  if (!meal) {
    notFound();
  }
```

### 3. **Server Components vs Client Components**

#### Server Components (Mặc định)

- Chạy trên server
- Có thể fetch data trực tiếp
- Không thể sử dụng hooks như `useState`, `useEffect`

```14:17:app/meals/page.js
async function Meals() {
  const meals = await getMeals();
  return <MealGrid meals={meals} />;
}
```

#### Client Components

- Chạy trên client
- Có thể sử dụng hooks và event handlers
- Cần khai báo `"use client"` ở đầu file

```1:2:app/meals/shares/page.js
"use client";

import { useFormState } from "react-dom";
```

### 4. **Data Fetching trong Server Components**

Không cần `useEffect` hay API calls riêng biệt. Fetch data trực tiếp trong component:

```9:13:lib/meal.js
export async function getMeals() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  // throw new Error("Failed to fetch meals");
  return db.prepare("SELECT * FROM meals").all();
}
```

### 5. **Server Actions**

Server Actions là các async functions có thể được gọi từ client, mục đích chính là để xử lý các hành động như tạo, cập nhật, xóa dữ liệu trên server.

```1:2:lib/action.js
"use server";

import { redirect } from "next/navigation";
```

```12:37:lib/action.js
export async function shareMeal(formData) {
  const meal = {
    title: formData.get("title"),
    summary: formData.get("summary"),
    instructions: formData.get("instructions"),
    image: formData.get("image"),
    creator: formData.get("name"),
    creator_email: formData.get("email"),
  };

  if (
    isInvalidText(meal.title) ||
    isInvalidText(meal.summary) ||
    isInvalidText(meal.instructions) ||
    isInvalidText(meal.creator) ||
    !meal.creator_email.includes("@") ||
    !meal.image ||
    !meal.image.size === 0
  ) {
    return { message: "Invalid input" };
  }

  await saveMeal(meal);
  revalidatePath("/meals");
  redirect("/meals");
}
```

### 6. **Form Handling với useFormState**

Sử dụng `useFormState` để xử lý response từ Server Actions:

```11:12:app/meals/shares/page.js
const [state, formAction] = useFormState(shareMeal, { message: null });
```

```23:23:app/meals/shares/page.js
<form className={classes.form} action={formAction}>
```

### 7. **Suspense cho Loading States**

Sử dụng Suspense để hiển thị loading state:

```35:39:app/meals/page.js
<Suspense
  fallback={<p className={classes.loading}>Fetching Meals...</p>}
>
  <Meals />
</Suspense>
```

### 8. **Caching và revalidatePath**

Next.js có caching mạnh mẽ. Cần `revalidatePath` khi data thay đổi:

```35:35:lib/action.js
revalidatePath("/meals");
```

### 9. **Metadata**

#### Static Metadata:

```5:8:app/layout.js
export const metadata = {
  title: "NextLevel Food",
  description: "Delicious meals, shared by a food-loving community.",
};
```

#### Dynamic Metadata:

```7:16:app/meals/[slug]/page.js
export function generateMetadata({ params }) {
  const meal = getMeal(params.slug);
  if (!meal) {
    notFound();
  }
  return {
    title: meal.title,
    description: meal.summary,
  };
}
```

## 🔧 Công Nghệ Sử Dụng

- **Next.js 14.0.3** với App Router
- **React 18** với Server Components
- **better-sqlite3** cho database
- **slugify** để tạo URL-friendly slugs
- **xss** để sanitize HTML content

## 🚀 Scripts

```bash
npm run dev     # Chạy development server
npm run build   # Build production
npm run start   # Chạy production server
npm run lint    # Lint code
```

## 📝 Bài Học Quan Trọng

1. **Server Components** là mặc định và rất mạnh mẽ cho data fetching
2. **Client Components** chỉ dùng khi cần interactivity
3. **Server Actions** thay thế API routes cho form handling
4. **Caching** là tính năng mạnh mẽ nhưng cần hiểu để tránh bugs
5. **Metadata** có thể static hoặc dynamic
6. **File-based routing** đơn giản hóa việc tổ chức code
7. **Suspense** cung cấp control tốt hơn cho loading states

## ⚠️ Lưu Ý Quan Trọng

- Luôn test ứng dụng ở **production mode** vì caching behavior khác với development
- Sử dụng `revalidatePath` sau khi thay đổi data
- Server Components không thể sử dụng browser APIs
- Client Components có thể làm tăng bundle size

---

_Dự án này minh họa các khái niệm cơ bản và nâng cao của Next.js App Router, từ routing đơn giản đến Server Actions phức tạp._
