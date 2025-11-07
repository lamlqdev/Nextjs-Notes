# NextJS - Optimizations

## Phần 1: Image Optimization

### Tổng quan

**Image Optimization** là một tính năng quan trọng trong Next.js giúp tối ưu hóa việc hiển thị hình ảnh trên web. Nó giúp giảm kích thước file hình ảnh, tăng tốc độ tải trang và cải thiện trải nghiệm người dùng.

### Cách hoạt động

Next.js sử dụng thư viện `next/image` để tối ưu hóa hình ảnh. Khi bạn sử dụng thẻ `<Image />`, Next.js sẽ tự động tải hình ảnh từ Cloudinary và tối ưu hóa kích thước hình ảnh.

### Cách sử dụng

```javascript
<Image src={image} alt={alt} width={width} height={height} />
```

### Các tham số có thể sử dụng

- `src`: URL của hình ảnh
- `alt`: Alt text cho hình ảnh
- `width`: Chiều rộng của hình ảnh
- `height`: Chiều cao của hình ảnh
- `quality`: Chất lượng của hình ảnh (1-100)
- `loader`: Hàm loader để tải hình ảnh
- `priority`: Đánh dấu hình ảnh là priority (preload)
- `loading`: Chế độ loading của hình ảnh (`lazy` hoặc `eager`)
- `sizes`: Kích thước của hình ảnh cho responsive design
- `fill`: Để hình ảnh fill container (cần parent có position relative)

### Thực hành trong dự án

#### 1. Sử dụng Image cơ bản với Local Image (header.js)

Trong file `components/header.js`, chúng ta sử dụng Image với local image:

```javascript
import Image from "next/image";
import logo from "@/assets/logo.png";

<Image src={logo} alt="Mobile phone with posts feed on it" priority />;
```

**Giải thích:**

- Import image trực tiếp từ assets folder
- Sử dụng `priority` để preload hình ảnh logo (quan trọng cho LCP - Largest Contentful Paint)
- Next.js tự động tối ưu hóa hình ảnh local

#### 2. Sử dụng Image với Cloudinary và Custom Loader (posts.js)

Trong file `components/posts.js`, chúng ta sử dụng Image với Cloudinary và custom loader:

```javascript
function imageLoader(config) {
  const urlStart = config.src.split("upload/")[0];
  const urlEnd = config.src.split("upload/")[1];
  const transformations = `w_200,q_${config.quality}`;
  return `${urlStart}upload/${transformations}/${urlEnd}`;
}

<Image
  src={post.image}
  alt={post.title}
  fill
  loader={imageLoader}
  quality={50}
/>;
```

**Giải thích:**

- **Custom Loader**: Tạo hàm `imageLoader` để tùy chỉnh URL hình ảnh từ Cloudinary
- **Cloudinary Transformations**: Sử dụng transformations `w_200,q_50` để:
  - `w_200`: Resize width về 200px
  - `q_50`: Set quality = 50%
- **Fill prop**: Sử dụng `fill` để hình ảnh tự động fill container (cần parent có `position: relative`)
- **Quality prop**: Set quality = 50 để giảm kích thước file

#### 3. Cấu hình Remote Patterns (next.config.mjs)

Để sử dụng hình ảnh từ domain ngoài, cần cấu hình trong `next.config.mjs`:

```javascript
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "res.cloudinary.com" }],
  },
};
```

**Giải thích:**

- Cho phép Next.js tối ưu hóa hình ảnh từ domain `res.cloudinary.com`
- Bảo mật: Chỉ cho phép các domain được cấu hình

### Lợi ích của Image Optimization

1. **Tự động format conversion**: Chuyển đổi sang WebP/AVIF nếu browser hỗ trợ
2. **Lazy loading**: Tự động lazy load hình ảnh không priority
3. **Responsive images**: Tự động tạo nhiều kích thước cho responsive
4. **Giảm kích thước**: Tối ưu hóa kích thước file hình ảnh
5. **Improved Core Web Vitals**: Cải thiện LCP và CLS

---

## Phần 2: Metadata Optimization

### Tổng quan

**Metadata** trong Next.js giúp cải thiện SEO và social sharing bằng cách cung cấp thông tin về trang web cho search engines và social media platforms.

### Các loại Metadata

#### 1. Static Metadata (Metadata tĩnh)

Metadata được định nghĩa tĩnh, không thay đổi theo request.

**Cách sử dụng:**

```javascript
export const metadata = {
  title: "Latest Posts",
  description: "Browse and share amazing posts.",
};
```

**Thực hành trong dự án:**

**File `app/page.js`:**

```javascript
export const metadata = {
  title: "Latest Posts",
  description: "Browse and share amazing posts.",
};
```

**File `app/layout.js` (Root Layout):**

```javascript
export const metadata = {
  title: "NextPosts",
  description: "Browse and share amazing posts.",
};
```

**Giải thích:**

- Metadata trong `layout.js` sẽ áp dụng cho tất cả các trang con
- Metadata trong `page.js` sẽ override metadata từ layout cho trang đó
- Metadata tĩnh phù hợp cho các trang có nội dung không thay đổi

#### 2. Dynamic Metadata (Metadata động)

Metadata được tạo động dựa trên dữ liệu từ database hoặc API.

**Cách sử dụng:**

```javascript
export async function generateMetadata({ params, searchParams }) {
  // Fetch data
  const data = await fetchData();

  return {
    title: `Dynamic Title - ${data.count}`,
    description: "Dynamic description based on data",
  };
}
```

**Thực hành trong dự án:**

**File `app/feed/page.js`:**

```javascript
export async function generateMetadata() {
  const posts = await getPosts();
  return {
    title: `${posts.length} posts by all users`,
    description: "Browse and share amazing posts.",
  };
}
```

**Giải thích:**

- `generateMetadata` là async function, cho phép fetch data
- Metadata được tạo dựa trên số lượng posts thực tế
- Dynamic metadata phù hợp cho các trang có nội dung thay đổi theo data

**Ví dụ với params:**

```javascript
export async function generateMetadata({ params }) {
  const post = await getPost(params.id);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}
```

#### 3. Layout Metadata (Metadata trong Layout)

Metadata được định nghĩa trong layout sẽ được kế thừa bởi các trang con.

**Cấu trúc metadata kế thừa:**

```
Root Layout (app/layout.js)
├── Metadata: title: "NextPosts"
│
├── Page (app/page.js)
│   └── Metadata: title: "Latest Posts" (overrides)
│
└── Feed Page (app/feed/page.js)
    └── Metadata: title: "X posts by all users" (overrides)
```

**Thực hành trong dự án:**

**File `app/layout.js`:**

```javascript
export const metadata = {
  title: "NextPosts",
  description: "Browse and share amazing posts.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

**Giải thích:**

- Metadata trong layout là default cho tất cả các trang
- Các trang con có thể override bằng metadata riêng
- Title sẽ được merge: `"Latest Posts | NextPosts"` (nếu có titleTemplate)

### Các thuộc tính Metadata phổ biến

```javascript
export const metadata = {
  title: "Page Title",
  description: "Page description",

  // Open Graph (Facebook, LinkedIn)
  openGraph: {
    title: "OG Title",
    description: "OG Description",
    url: "https://example.com",
    siteName: "Site Name",
    images: [
      {
        url: "https://example.com/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Twitter Title",
    description: "Twitter Description",
    images: ["https://example.com/twitter-image.jpg"],
  },

  // SEO
  keywords: ["keyword1", "keyword2"],
  authors: [{ name: "Author Name" }],
  creator: "Creator Name",
  publisher: "Publisher Name",

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
```

### Best Practices

1. **Luôn có metadata trong root layout**: Đảm bảo mọi trang đều có metadata cơ bản
2. **Sử dụng dynamic metadata cho dynamic content**: Fetch data để tạo metadata chính xác
3. **Override metadata ở page level**: Thêm metadata cụ thể cho từng trang
4. **Sử dụng Open Graph và Twitter Cards**: Cải thiện social sharing
5. **Unique titles và descriptions**: Mỗi trang nên có metadata unique
