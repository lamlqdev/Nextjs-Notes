# Next.js User Authentication với Lucia Auth

Dự án này được thiết kế để học và thực hành **User Authentication** trong Next.js 14 với App Router, sử dụng thư viện **Lucia Auth** để quản lý authentication và session.

## 📁 Cấu Trúc Dự Án

```
07-User-Authentication/
├── actions/
│   └── auth-actions.js      # Server Actions: signup, login, logout
├── app/
│   ├── (auth)/
│   │   ├── layout.js        # Layout cho routes được bảo vệ
│   │   └── training/
│   │       └── page.js      # Trang được bảo vệ
│   ├── page.js              # Trang login/signup (public)
│   ├── layout.js
│   └── globals.css
├── components/
│   └── auth-form.js         # Form đăng nhập/đăng ký (Client Component)
├── lib/
│   ├── auth.js              # Cấu hình Lucia Auth và helper functions
│   ├── db.js                # Cấu hình SQLite và tạo tables
│   ├── hash.js              # Hash và verify mật khẩu
│   ├── user.js              # CRUD operations cho users
│   └── training.js          # Database operations cho trainings
└── package.json
```

### Phân Loại Files

| File              | Loại   | Chức năng                               |
| ----------------- | ------ | --------------------------------------- |
| `auth-actions.js` | Server | Server Actions cho authentication       |
| `auth-form.js`    | Client | Form component với `useFormState`       |
| `auth.js`         | Server | Lucia Auth config và session management |
| `hash.js`         | Server | Password hashing và verification        |
| `db.js`           | Server | Database setup và table creation        |

---

## Phần 1: Tổng Quan về Authentication

### Khái Niệm

**Authentication (Xác thực)** là quá trình xác minh danh tính của người dùng trong ứng dụng web. Một hệ thống authentication hoàn chỉnh bao gồm:

1. **Đăng ký (Signup)**: User tạo tài khoản mới với email và password
2. **Đăng nhập (Login)**: User xác minh danh tính bằng credentials
3. **Session Management**: Lưu trữ trạng thái đăng nhập của user
4. **Đăng xuất (Logout)**: Kết thúc session của user

### Hai Thành Phần Chính

1. **Credentials (Thông tin xác thực)**

   - Email và password
   - Được lưu trữ an toàn trong database (password được hash)

2. **Session (Phiên làm việc)**
   - Session token/ID được lưu trong HTTP-only cookie
   - Được sử dụng để xác minh user đã đăng nhập

### Tại Sao Sử Dụng Lucia Auth?

**Lucia Auth** là một thư viện authentication hiện đại được thiết kế cho Next.js:

- ✅ Hoạt động tốt với Next.js App Router
- ✅ Đơn giản và dễ sử dụng
- ✅ Hỗ trợ nhiều database (SQLite, PostgreSQL, MySQL, etc.)
- ✅ Bảo mật cao với session management tự động
- ✅ Type-safe (hỗ trợ TypeScript)

---

## Phần 2: Cài Đặt và Thiết Lập

### Cài Đặt Dependencies

```bash
npm install lucia @lucia-auth/adapter-sqlite better-sqlite3
```

**Giải thích:**

- `lucia`: Thư viện authentication chính
- `@lucia-auth/adapter-sqlite`: Adapter để kết nối Lucia với SQLite
- `better-sqlite3`: Database SQLite

### Thiết Lập Database

**File: `lib/db.js`**

```1:18:lib/db.js
import sql from 'better-sqlite3';

const db = sql('training.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT
  );
`);

db.exec(`CREATE TABLE IF NOT EXISTS sessions (
  id TEXT NOT NULL PRIMARY KEY,
  expires_at INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
)`);
```

**Giải thích:**

- Bảng `users`: Lưu thông tin user (id, email, password đã hash)
- Bảng `sessions`: Lưu session tokens (Lucia tự động quản lý)
- `FOREIGN KEY`: Đảm bảo referential integrity

### Cấu Hình Lucia Auth

**File: `lib/auth.js`**

```1:19:lib/auth.js
import { cookies } from 'next/headers';
import { Lucia } from 'lucia';
import { BetterSqlite3Adapter } from '@lucia-auth/adapter-sqlite';

import db from './db';

const adapter = new BetterSqlite3Adapter(db, {
  user: 'users',
  session: 'sessions',
});

const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
});
```

**Giải thích:**

- `BetterSqlite3Adapter`: Kết nối Lucia với SQLite database
- `sessionCookie`: Cấu hình session cookie
  - `expires: false`: Session không hết hạn (hoặc có thể set thời gian)
  - `secure: true` trong production: Chỉ gửi cookie qua HTTPS

---

## Phần 3: Bảo Mật Mật Khẩu

### Tại Sao Phải Hash Mật Khẩu?

**KHÔNG BAO GIỜ** lưu mật khẩu dạng plain text! Mật khẩu phải được hash và salt trước khi lưu vào database để bảo vệ user nếu database bị leak.

### Hash và Verify Mật Khẩu

**File: `lib/hash.js`**

```1:16:lib/hash.js
import crypto from 'node:crypto';

export function hashUserPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');

  const hashedPassword = crypto.scryptSync(password, salt, 64);
  return hashedPassword.toString('hex') + ':' + salt;
}

export function verifyPassword(storedPassword, suppliedPassword) {
  const [hashedPassword, salt] = storedPassword.split(':');
  const hashedPasswordBuf = Buffer.from(hashedPassword, 'hex');
  const suppliedPasswordBuf = crypto.scryptSync(suppliedPassword, salt, 64);
  return crypto.timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
}
```

**Giải thích:**

- `scryptSync`: Thuật toán hash an toàn, kháng brute-force attacks
- `salt`: Giá trị ngẫu nhiên để mỗi mật khẩu có hash khác nhau (tránh rainbow table attacks)
- `timingSafeEqual`: So sánh an toàn, tránh timing attacks
- **Format lưu trữ:** `hashedPassword:salt` (lưu cả hash và salt để verify sau)

---

## Phần 4: Flow Đăng Ký (Signup)

### Tạo User trong Database

**File: `lib/user.js`**

```1:8:lib/user.js
import db from './db';

export function createUser(email, password) {
  const result = db
    .prepare('INSERT INTO users (email, password) VALUES (?, ?)')
    .run(email, password);
  return result.lastInsertRowid;
}
```

**Giải thích:**

- Sử dụng prepared statement để tránh SQL injection
- `lastInsertRowid`: Trả về ID của user vừa tạo

### Server Action cho Signup

**File: `actions/auth-actions.js`**

```8:44:actions/auth-actions.js
export async function signup(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  let errors = {};

  if (!email.includes('@')) {
    errors.email = 'Please enter a valid email address.';
  }

  if (password.trim().length < 8) {
    errors.password = 'Password must be at least 8 characters long.';
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
    };
  }

  const hashedPassword = hashUserPassword(password);
  try {
    const id = createUser(email, hashedPassword);
    await createAuthSession(id);
    redirect('/training');
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return {
        errors: {
          email:
            'It seems like an account for the chosen email already exists.',
        },
      };
    }
    throw error;
  }
}
```

**Giải thích:**

1. **Validation**: Kiểm tra email format và password length
2. **Hash password**: Hash password với salt trước khi lưu
3. **Tạo user**: Lưu user vào database
4. **Tạo session**: Tự động đăng nhập sau khi đăng ký
5. **Error handling**: Xử lý lỗi email trùng lặp

### Tạo Session

**File: `lib/auth.js`**

```21:29:lib/auth.js
export async function createAuthSession(userId) {
  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
}
```

**Giải thích:**

- `lucia.createSession()`: Tạo session trong database
- `lucia.createSessionCookie()`: Tạo session cookie
- `cookies().set()`: Lưu cookie vào response (Next.js 14)

**Quy trình Signup:**

```
User → AuthForm → signup() → hashPassword() → createUser()
  → createAuthSession() → Set Cookie → Redirect to /training
```

---

## Phần 5: Flow Đăng Nhập (Login)

### Server Action cho Login

**File: `actions/auth-actions.js`**

```46:72:actions/auth-actions.js
export async function login(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  const existingUser = getUserByEmail(email);

  if (!existingUser) {
    return {
      errors: {
        email: 'Could not authenticate user, please check your credentials.',
      },
    };
  }

  const isValidPassword = verifyPassword(existingUser.password, password);

  if (!isValidPassword) {
    return {
      errors: {
        password: 'Could not authenticate user, please check your credentials.',
      },
    };
  }

  await createAuthSession(existingUser.id);
  redirect('/training');
}
```

**Giải thích:**

1. **Tìm user**: Tìm user trong database theo email
2. **Verify password**: So sánh password với hash đã lưu
3. **Tạo session**: Nếu đúng, tạo session và redirect
4. **Error handling**: Hiển thị lỗi chung (không tiết lộ user có tồn tại hay không)

### Helper Function: Lấy User theo Email

**File: `lib/user.js`**

```10:12:lib/user.js
export function getUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email)
}
```

**Quy trình Login:**

```
User → AuthForm → login() → getUserByEmail() → verifyPassword()
  → createAuthSession() → Set Cookie → Redirect to /training
```

---

## Phần 6: Flow Đăng Xuất (Logout)

### Server Action cho Logout

**File: `actions/auth-actions.js`**

```81:84:actions/auth-actions.js
export async function logout() {
  await destroySession();
  redirect('/');
}
```

### Destroy Session

**File: `lib/auth.js`**

```74:90:lib/auth.js
export async function destroySession() {
  const { session } = await verifyAuth();
  if (!session) {
    return {
      error: 'Unauthorized!',
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
}
```

**Giải thích:**

- `lucia.invalidateSession()`: Xóa session khỏi database
- `lucia.createBlankSessionCookie()`: Tạo blank cookie để xóa session cookie
- `cookies().set()`: Cập nhật cookie (xóa session)

**Quy trình Logout:**

```
User → logout() → destroySession() → Invalidate Session
  → Clear Cookie → Redirect to /
```

---

## Phần 7: Bảo Vệ Routes

### Verify Authentication

**File: `lib/auth.js`**

```31:72:lib/auth.js
export async function verifyAuth() {
  const sessionCookie = cookies().get(lucia.sessionCookieName);

  if (!sessionCookie) {
    return {
      user: null,
      session: null,
    };
  }

  const sessionId = sessionCookie.value;

  if (!sessionId) {
    return {
      user: null,
      session: null,
    };
  }

  const result = await lucia.validateSession(sessionId);

  try {
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
  } catch {}

  return result;
}
```

**Giải thích:**

- Lấy session cookie từ request
- Validate session với Lucia
- Refresh session cookie nếu cần (khi session fresh)
- Xóa cookie nếu session không hợp lệ
- Trả về `{ user, session }` hoặc `{ user: null, session: null }`

### Bảo Vệ Route trong Server Component

**File: `app/(auth)/training/page.js`**

```1:31:app/(auth)/training/page.js
import { redirect } from 'next/navigation';

import { verifyAuth } from '@/lib/auth';
import { getTrainings } from '@/lib/training';

export default async function TrainingPage() {
  const result = await verifyAuth();

  if (!result.user) {
    return redirect('/');
  }

  const trainingSessions = getTrainings();

  return (
    <main>
      <h1>Find your favorite activity</h1>
      <ul id="training-sessions">
        {trainingSessions.map((training) => (
          <li key={training.id}>
            <img src={`/trainings/${training.image}`} alt={training.title} />
            <div>
              <h2>{training.title}</h2>
              <p>{training.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

**Giải thích:**

- Gọi `verifyAuth()` trong Server Component
- Kiểm tra `result.user`
- Nếu `null`: Redirect về trang login (`/`)
- Nếu có user: Render nội dung được bảo vệ

### Bảo Vệ bằng Route Group

Sử dụng Route Groups `(auth)` để nhóm các routes cần authentication:

```
app/
  (auth)/
    layout.js      # Layout với header có nút logout
    training/
      page.js      # Trang được bảo vệ
  page.js          # Trang login/signup (public)
```

**File: `app/(auth)/layout.js`**

```1:21:app/(auth)/layout.js
import { logout } from '@/actions/auth-actions';
import '../globals.css';

export const metadata = {
  title: 'Next Auth',
  description: 'Next.js Authentication',
};

export default function AuthRootLayout({ children }) {
  return (
    <>
      <header id="auth-header">
        <p>Welcome back!</p>
        <form action={logout}>
          <button>Logout</button>
        </form>
      </header>
      {children}
    </>
  );
}
```

**Giải thích:**

- Route Groups `(auth)` không ảnh hưởng URL (vẫn là `/training`)
- Layout này áp dụng cho tất cả routes trong `(auth)`
- Header có nút logout để user có thể đăng xuất

**Quy trình Bảo Vệ Route:**

```
Page Load → verifyAuth() → Check Cookie → Validate Session
  → Return User → Render Content (or Redirect if no user)
```

---

## Phần 8: UI Components

### Auth Form Component

**File: `components/auth-form.js`**

```1:45:components/auth-form.js
'use client';
import Link from 'next/link';
import { useFormState } from 'react-dom';

import { auth } from '@/actions/auth-actions';

export default function AuthForm({ mode }) {
  const [formState, formAction] = useFormState(auth.bind(null, mode), {});
  return (
    <form id="auth-form" action={formAction}>
      <div>
        <img src="/images/auth-icon.jpg" alt="A lock icon" />
      </div>
      <p>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" />
      </p>
      <p>
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
      </p>
      {formState.errors && (
        <ul id="form-errors">
          {Object.keys(formState.errors).map((error) => (
            <li key={error}>{formState.errors[error]}</li>
          ))}
        </ul>
      )}
      <p>
        <button type="submit">
          {mode === 'login' ? 'Login' : 'Create Account'}
        </button>
      </p>
      <p>
        {mode === 'login' && (
          <Link href="/?mode=signup">Create an account.</Link>
        )}
        {mode === 'signup' && (
          <Link href="/?mode=login">Login with existing account.</Link>
        )}
      </p>
    </form>
  );
}
```

**Giải thích:**

- `useFormState`: Hook để quản lý form state và validation errors
- `auth.bind(null, mode)`: Bind mode (login/signup) vào Server Action
- Hiển thị errors từ Server Action
- Link để chuyển đổi giữa login và signup

### Universal Auth Action

**File: `actions/auth-actions.js`**

```74:79:actions/auth-actions.js
export async function auth(mode, prevState, formData) {
  if (mode === 'login') {
    return login(prevState, formData);
  }
  return signup(prevState, formData);
}
```

**Giải thích:**

- Universal action để xử lý cả login và signup
- Nhận `mode` parameter để phân biệt

---

## 📚 Tóm Tắt Kiến Thức

### Authentication Flow

**Signup:**

```javascript
signup() → hashPassword() → createUser() → createAuthSession() → redirect()
```

**Login:**

```javascript
login() → getUserByEmail() → verifyPassword() → createAuthSession() → redirect()
```

**Logout:**

```javascript
logout() → destroySession() → invalidateSession() → clearCookie() → redirect()
```

**Protected Route:**

```javascript
verifyAuth() → validateSession() → checkUser() → render() || redirect()
```

### Các File Quan Trọng

| File                      | Chức năng                             |
| ------------------------- | ------------------------------------- |
| `lib/auth.js`             | Lucia Auth config, session management |
| `lib/hash.js`             | Password hashing và verification      |
| `lib/user.js`             | User CRUD operations                  |
| `lib/db.js`               | Database setup                        |
| `actions/auth-actions.js` | Server Actions cho authentication     |
| `components/auth-form.js` | Form component (Client)               |

### Best Practices

1. **Bảo mật mật khẩu**: Luôn hash với salt, không lưu plain text
2. **Session management**: Sử dụng HTTP-only cookies, secure trong production
3. **Validation**: Validate input phía server, không tin tưởng client
4. **Error handling**: Hiển thị lỗi chung, không tiết lộ thông tin nhạy cảm
5. **Route protection**: Verify authentication trong Server Components

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

- **Home (Login/Signup)**: `http://localhost:3000`
- **Training (Protected)**: `http://localhost:3000/training`

---

## 📖 Tài Liệu Tham Khảo

- [Lucia Auth Documentation](https://lucia-auth.com/)
- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---
