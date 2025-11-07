# Next.js Learning Notes - Tổng Hợp Kiến Thức

## 📚 Giới Thiệu

Dự án này là một bộ sưu tập kiến thức và bài học thực hành về **Next.js 14** với App Router. Mỗi thư mục đại diện cho một chủ đề riêng biệt, được thiết kế để giúp bạn nắm vững từng khái niệm một cách có hệ thống.

## 🎯 Mục Tiêu

- Học và thực hành các khái niệm cơ bản đến nâng cao của Next.js App Router
- Hiểu rõ cách hoạt động của Server Components, Client Components, và Server Actions
- Nắm vững các kỹ thuật routing, data fetching, và caching trong Next.js
- Xây dựng các ứng dụng thực tế với best practices

## 📖 Mục Lục

### [1. Next.js App Router - Tổng Hợp Kiến Thức](./01-Foodies-NextJS-Essential/README.md)

**Chủ đề:** Các khái niệm cơ bản và nền tảng của Next.js App Router

**Nội dung bao gồm:**

- File-Based Routing với App Router
- Dynamic Routes (`[slug]`)
- Server Components vs Client Components
- Data Fetching trong Server Components
- Server Actions
- Form Handling với `useFormState`
- Suspense cho Loading States
- Caching và `revalidatePath`
- Metadata (Static và Dynamic)

**Dự án thực hành:** Ứng dụng chia sẻ món ăn "NextLevel Food"

---

### [2. Routing Deep Dive - Routing & Page Rendering](./02-Routing-PageRedering-DeepDive/README.md)

**Chủ đề:** Các khái niệm nâng cao về Routing trong Next.js App Router

**Nội dung bao gồm:**

- Route Groups `(name)` - Tổ chức routes không ảnh hưởng URL
- Parallel Routes `@slot` - Render nhiều trang song song
- Catch-All Routes `[[...param]]` - Route bắt tất cả segments
- Intercepting Routes `(.)path` - Chặn navigation để hiển thị modal
- File `default.js` - Fallback cho Parallel Routes
- Error Handling với `error.js`
- Middleware

**Dự án thực hành:** Ứng dụng tin tức với modal và archive navigation

---

### [3. Data Fetching trong Next.js](./03-Data-Fetching/README.md)

**Chủ đề:** Các phương pháp fetch data trong Next.js

**Nội dung bao gồm:**

- Client-side fetching với `useEffect` và `useState`
- Server-side fetching trực tiếp trong Server Components
- Database integration với SQLite tích hợp trong Next.js
- Loading States với `loading.js`
- Error Handling với `error.js` và `not-found.js`
- Suspense Boundaries
- Parallel Loading với Parallel Routes

**Dự án thực hành:** Ứng dụng tin tức với nhiều phương pháp fetch data khác nhau

---

### [4. Mutating Data - Server Actions & Form Handling](./04-Mutating-Data/README.md)

**Chủ đề:** Xử lý mutations và form handling trong Next.js

**Nội dung bao gồm:**

- Server Actions - Gọi functions từ client
- Form Actions với `useFormState` - Validation và error handling
- `useFormStatus` - Kiểm soát trạng thái form (pending, submitting)
- `useOptimistic` - Optimistic UI updates
- Caching và Revalidation
- `revalidatePath()` và `revalidateTag()`
- Image upload với Cloudinary

**Dự án thực hành:** Ứng dụng chia sẻ bài viết với like button và optimistic updates

---

### [5. Understanding & Configuring Caching](./05-Understanding-Configurating_Caching/README.md)

**Chủ đề:** Hiểu và cấu hình caching trong Next.js

**Nội dung bao gồm:**

- Request Memoization - Tránh duplicate requests
- Data Caching - Cache response từ `fetch()`
- Full Route Cache - Cache toàn bộ page đã render
- Time-based Revalidation - `next: { revalidate: seconds }`
- On-Demand Revalidation - `revalidatePath()` và `revalidateTag()`
- Custom Data Source Caching - `cache()` và `unstable_cache()`
- `noStore()` - Tắt cache cho component cụ thể

**Dự án thực hành:** Ứng dụng messages với các cấu hình cache khác nhau

---

### [6. Optimizations - Image & Metadata](./06-Optimizations/README.md)

**Chủ đề:** Tối ưu hóa hình ảnh và metadata trong Next.js

**Nội dung bao gồm:**

- Image Optimization với `next/image` - Tối ưu hóa hình ảnh tự động
- Local Images vs Remote Images
- Custom Image Loader cho Cloudinary
- Image Transformations (resize, quality, format conversion)
- Priority loading và lazy loading
- Static Metadata - Metadata tĩnh trong layout và page
- Dynamic Metadata với `generateMetadata()`
- Metadata kế thừa và override
- Open Graph và Twitter Cards
- SEO optimization với metadata

**Dự án thực hành:** Ứng dụng chia sẻ bài viết với image optimization và metadata tối ưu

---

## 🛠️ Công Nghệ Sử Dụng

- **Next.js 14+** với App Router
- **React 18+** với Server Components
- **better-sqlite3** cho database
- **Cloudinary** cho image upload và optimization (dự án 4, 6)
- **Express.js** cho backend server (dự án 2, 3, 5)

## 🚀 Cách Sử Dụng

Mỗi thư mục là một dự án độc lập. Để chạy một dự án cụ thể:

```bash
# Di chuyển vào thư mục dự án
cd 01-Foodies-NextJS-Essential

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

## 📝 Cấu Trúc Dự Án

```
03_Next.js_Notes/
├── 01-Foodies-NextJS-Essential/      # App Router cơ bản
├── 02-Routing-PageRedering-DeepDive/  # Routing nâng cao
├── 03-Data-Fetching/                  # Data Fetching
├── 04-Mutating-Data/                  # Server Actions & Forms
├── 05-Understanding-Configurating_Caching/ # Caching
├── 06-Optimizations/                  # Image & Metadata Optimization
└── README.md                          # File này
```

## 📚 Tài Liệu Tham Khảo

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Next.js Routing](https://nextjs.org/docs/app/building-your-application/routing)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/data-fetching/caching)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Next.js Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023)

---

_Đây là bộ sưu tập kiến thức được tạo ra để học tập và thực hành Next.js App Router một cách có hệ thống và hiệu quả._
