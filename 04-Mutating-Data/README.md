# Next.js Mutating Data - Deep Dive

Dự án này được thiết kế để luyện tập và nắm vững các khái niệm quan trọng về **Mutating Data** trong Next.js 14, bao gồm Server Actions, Form Actions, và các kỹ thuật kiểm soát trạng thái.

## 📁 Cấu Trúc Dự Án

```
04-Mutating-Data/
├── actions/
│   └── post.js              # Server Actions
├── app/
│   ├── feed/
│   │   ├── error.js          # Error boundary
│   │   ├── loading.js       # Loading UI
│   │   └── page.js          # Feed page
│   ├── new-post/
│   │   ├── error.js
│   │   └── page.js          # New post page
│   ├── layout.js
│   ├── page.js              # Home page
│   └── globals.css
├── components/
│   ├── form-submit.js       # useFormStatus hook
│   ├── header.js
│   ├── like-icon.js
│   ├── post-form.js         # useFormState hook
│   └── posts.js             # useOptimistic hook
├── lib/
│   ├── cloudinary.js        # Image upload
│   ├── format.js
│   └── posts.js             # Database operations
├── posts.db                 # SQLite database
└── package.json
```

### Phân Loại Components

| File              | Loại   | Hooks Sử Dụng                |
| ----------------- | ------ | ---------------------------- |
| `post-form.js`    | Client | `useFormState`               |
| `form-submit.js`  | Client | `useFormStatus`              |
| `posts.js`        | Client | `useOptimistic`              |
| `app/page.js`     | Server | Suspense                     |
| `actions/post.js` | Server | `revalidatePath`, `redirect` |

---

## 🔧 Server Actions

### Khái Niệm

**Server Actions** là các hàm chạy trên server, được gọi từ client component. Chúng giúp bạn thực hiện các thao tác như tạo, đọc, sửa, xóa dữ liệu mà không cần tạo API routes riêng.

### Cú Pháp Cơ Bản

```javascript
"use server";

export async function myServerAction(formData) {
  // Code chạy trên server
  return { success: true };
}
```

### Ví Dụ Trong Dự Án

**File: `actions/post.js`**

```9:46:actions/post.js
export async function createPost(prevState, formData) {
  const title = formData.get("title");
  const image = formData.get("image");
  const content = formData.get("content");

  let errors = [];

  if (!title || title.trim().length === 0) {
    errors.push("Title is required");
  }
  if (!content || content.trim().length === 0) {
    errors.push("Content is required");
  }
  if (!image || image.size === 0) {
    errors.push("Image is required");
  }

  if (errors.length > 0) {
    return { errors: errors };
  }

  let imageUrl = "";
  try {
    imageUrl = await uploadImage(image);
  } catch (error) {
    throw new Error("Failed to upload image");
  }

  await storePost({
    imageUrl: imageUrl,
    title: title,
    content: content,
    userId: 1,
  });

  revalidatePath("/feed");
  redirect("/feed");
}
```

### Đặc Điểm Quan Trọng

1. **Directive "use server"**: Đánh dấu file là Server Actions
2. **Không cần API routes**: Gọi trực tiếp từ client
3. **Type-safe**: Tự động validate với TypeScript
4. **Tự động serialize**: Next.js tự động serialize arguments

### Server Action cho Like Post

```48:51:actions/post.js
export async function likePost(postId) {
  await updatePostLikeStatus(postId, 2);
  revalidatePath("/feed");
}
```

**Lưu ý**:

- `postId` được bind ở client: `action.bind(null, postId)`
- `revalidatePath("/feed")` để invalidate cache sau khi like

---

## 📝 Form Actions & useFormState

### useFormState Hook

**useFormState** là hook của React để quản lý state của form, đặc biệt hữu ích cho validation.

**Lưu ý**: Dự án này sử dụng React 18 nên sử dụng useFormState thay vì useActionState. Sử dụng useActionState trả về 3 params: state, formAction, isPending, vì thế có thể bỏ useFormStatus trong components/form-submit.js.

```javascript
const [state, formAction] = useFormState(action, initialState);
```

### Ví Dụ Trong Dự Án

**File: `components/post-form.js`**

```1:44:components/post-form.js
"use client";

import { useFormState } from "react-dom";

import FormSubmit from "./form-submit";

export default function PostForm({ action }) {
  const [state, formAction] = useFormState(action, {});
  return (
    <>
      <h1>Create a new post</h1>
      <form action={formAction}>
        <p className="form-control">
          <label htmlFor="title">Title</label>
          <input type="text" id="title" name="title" required />
        </p>
        <p className="form-control">
          <label htmlFor="image">Image</label>
          <input
            type="file"
            accept="image/png, image/jpeg"
            id="image"
            name="image"
            required
          />
        </p>
        <p className="form-control">
          <label htmlFor="content">Content</label>
          <textarea id="content" name="content" rows="5" required />
        </p>
        <p className="form-actions">
          <FormSubmit />
        </p>
        {state.errors && (
          <ul className="form-errors">
            {state.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}
      </form>
    </>
  );
}
```

### Luồng Hoạt Động

1. **Submit form** → Server Action được gọi với `formData`
2. **Server Action validate** → Trả về `{ errors: [...] }` nếu lỗi
3. **useFormState cập nhật** → `state` chứa errors
4. **Render lại form** → Hiển thị errors dưới form

### Cấu Trúc Server Action cho useFormState

```javascript
// Nhận 2 params: prevState và formData
export async function createPost(prevState, formData) {
  // Validate
  if (invalid) {
    return { errors: ["Error message"] };
  }

  // Success: revalidate và redirect
  revalidatePath("/feed");
  redirect("/feed");
}
```

---

## ⏱️ useFormStatus - Kiểm Soát Trạng Thái

### Mục Đích

**useFormStatus** giúp bạn biết form đang trong trạng thái gì (pending, submitting, success, error).

### Cú Pháp

```javascript
const { pending, data, method, action } = useFormStatus();
```

### Ví Dụ Trong Dự Án

**File: `components/form-submit.js`**

```1:18:components/form-submit.js
"use client";

import { useFormStatus } from "react-dom";

export default function FormSubmit() {
  const { pending } = useFormStatus();

  if (pending) {
    return <p>Creating post...</p>;
  }

  return (
    <>
      <button type="reset">Reset</button>
      <button>Create Post</button>
    </>
  );
}
```

### Đặc Điểm

- **Chỉ dùng trong form**: Phải là con của `<form>`
- **pending = true**: Khi form đang được submit
- **Hiển thị loading state**: Không cho user submit lần nữa

### Lưu Ý Quan Trọng

```javascript
// ✅ ĐÚNG - Component con của form
<form>
  <FormSubmit /> {/* useFormStatus ở đây */}
</form>

// ❌ SAI - useFormStatus phải ở bên trong form
<FormSubmit />
<form>...</form>
```

---

## 🚀 Optimistic Updates với useOptimistic

### Khái Niệm

**Optimistic UI** là kỹ thuật cập nhật UI ngay lập tức, giả định action sẽ thành công, tạo cảm giác nhanh chóng và mượt mà.

### Ví Dụ: Like Button

**File: `components/posts.js`**

```41:62:components/posts.js
export default function Posts({ posts }) {
  const [optimisticPosts, updateOptimisticPosts] = useOptimistic(
    posts,
    (prevPosts, updatedPostId) => {
      const updatedPostsIndex = prevPosts.findIndex(
        (post) => post.id === updatedPostId
      );

      if (updatedPostsIndex === -1) {
        return prevPosts;
      }

      const updatedPost = { ...prevPosts[updatedPostsIndex] };

      updatedPost.likes = updatedPost.likes + (updatedPost.isLiked ? -1 : 1);
      updatedPost.isLiked = !updatedPost.isLiked;

      const newPosts = [...prevPosts];
      newPosts[updatedPostsIndex] = updatedPost;
      return newPosts;
    }
  );
```

### Cú Pháp useOptimistic

```javascript
const [optimisticState, updateOptimisticState] = useOptimistic(
  currentState,
  (prevState, optimisticValue) => {
    // Cập nhật state
    return newState;
  }
);
```

### Luồng Hoạt Động

```68:71:components/posts.js
async function updatePostLikeStatus(postId) {
  updateOptimisticPosts(postId);
  await likePost(postId);
}
```

1. **User click like** → `updateOptimisticPosts(postId)` (UI cập nhật ngay)
2. **Gọi server action** → `await likePost(postId)`
3. **Server xử lý** → Cập nhật database
4. **Revalidate** → UI cập nhật theo dữ liệu thực

### Lợi Ích

- ⚡ UI phản hồi ngay lập tức
- 🎯 Better UX - không có delay
- 🔄 Tự động rollback nếu lỗi

---

## 🔄 Caching và Revalidation

### Caching trong Next.js

Next.js tự động cache các Server Components và data fetching calls.

### getPosts() - Mặc Định Cached

```50:68:lib/posts.js
export async function getPosts(maxNumber) {
  let limitClause = '';

  if (maxNumber) {
    limitClause = 'LIMIT ?';
  }

  const stmt = db.prepare(`
    SELECT posts.id, image_url AS image, title, content, created_at AS createdAt, first_name AS userFirstName, last_name AS userLastName, COUNT(likes.post_id) AS likes, EXISTS(SELECT * FROM likes WHERE likes.post_id = posts.id and likes.user_id = 2) AS isLiked
    FROM posts
    INNER JOIN users ON posts.user_id = users.id
    LEFT JOIN likes ON posts.id = likes.post_id
    GROUP BY posts.id
    ORDER BY createdAt DESC
    ${limitClause}`);

  await new Promise((resolve) => setTimeout(resolve, 1000));
  return maxNumber ? stmt.all(maxNumber) : stmt.all();
}
```

**Lưu ý**: Không có `{ cache: 'no-store' }` → Mặc định cached

### Revalidation

Khi mutate data, cần **invalidate cache**:

```javascript
// actions/post.js
revalidatePath("/feed"); // Invalidate /feed route
revalidatePath("/"); // Invalidate home page
```

### Các Phương Thức Revalidation

1. **revalidatePath(path)**: Invalidate một route cụ thể
2. **revalidateTag(tag)**: Invalidate theo tag
3. **redirect()**: Tự động revalidate

### Ví Dụ Tổng Hợp

```javascript
// Tạo post mới
export async function createPost(prevState, formData) {
  // ... validate & save

  revalidatePath("/feed"); // Cache /feed bị invalidate
  redirect("/feed"); // Redirect sau khi tạo
}

// Like post
export async function likePost(postId) {
  await updatePostLikeStatus(postId, 2);
  revalidatePath("/feed"); // Cache /feed bị invalidate (không redirect)
}
```

---

## 📚 Tóm Tắt Kiến Thức

### Server Actions

```javascript
"use server";

export async function action(params) {
  // Server-side code
  revalidatePath("/path");
  redirect("/path");
}
```

### useFormState - Validation

```javascript
const [state, formAction] = useFormState(action, initialState);

// Render errors
{
  state.errors && state.errors.map((error) => <li>{error}</li>);
}
```

### useFormStatus - Loading State

```javascript
const { pending } = useFormStatus();

if (pending) return <p>Loading...</p>;
return <button>Submit</button>;
```

### useOptimistic - Optimistic UI

```javascript
const [optimisticState, updateOptimisticState] = useOptimistic(
  currentState,
  (prev, newValue) => updatedState
);
```

### Revalidation

```javascript
import { revalidatePath, revalidateTag } from "next/cache";

revalidatePath("/feed"); // Invalidate route
revalidateTag("posts"); // Invalidate by tag
```

---

## 🚀 Chạy Dự Án

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Đường Dẫn Quan Trọng

- **Home**: `http://localhost:3000`
- **New Post**: `http://localhost:3000/new-post`
- **Feed**: `http://localhost:3000/feed`

---

## 📖 Tài Liệu Tham Khảo

- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [React useFormState](https://react.dev/reference/react-dom/hooks/useFormState)
- [React useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus)
- [React useOptimistic](https://react.dev/reference/react/useOptimistic)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/data-fetching/caching)

---
