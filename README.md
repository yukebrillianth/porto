# Next.js Starter Template

Production-ready Next.js 16 starter with TypeScript, Tailwind CSS 4, React Query, Auth Context, and opinionated project structure.

## Features

- **Next.js 16** with App Router and React 19
- **TypeScript** with strict mode
- **Tailwind CSS 4** with PostCSS
- **TanStack React Query** for server state management
- **Auth Context** with localStorage + token validation
- **Service Layer** pattern with typed `apiFetch` wrapper
- **Zod Schemas** for form validation
- **React Hook Form** with `@hookform/resolvers`
- **Error Handling** with structured `HttpError` class
- **Security Headers** (CSP, X-Frame-Options, etc.)
- **SEO** with sitemap, robots.txt, and metadata helpers
- **ESLint 9** with import sorting
- **Prettier** with Tailwind plugin
- **Husky + lint-staged** for pre-commit hooks
- **Commitlint** for conventional commits
- **Docker** multi-stage build ready
- **GitHub Actions** for Vercel deployment

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Use as Template

**Option 1: GitHub Template**

1. Click "Use this template" on GitHub
2. Create your new repository
3. Clone and start building

**Option 2: degit**

```bash
npx degit yukebrillianth/next-template my-project
cd my-project
pnpm install
```

**Option 3: Clone directly**

```bash
git clone https://github.com/yukebrillianth/next-template.git my-project
cd my-project
rm -rf .git && git init
pnpm install
```

**After cloning:**

1. Update `name` in `package.json`
2. Update site info in `constants/index.ts`
3. Copy `.env.example` to `.env.local`
4. Replace favicon and OG image in `public/`
5. Update `lib/env.ts` with your environment variables

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (providers)
│   ├── page.tsx            # Home page
│   ├── error.tsx           # Global error boundary
│   ├── not-found.tsx       # 404 page
│   ├── forbidden.tsx       # 403 page
│   ├── unauthorized.tsx    # 401 page
│   ├── robots.ts           # SEO robots.txt
│   ├── sitemap.ts          # SEO sitemap
│   └── sign-in/            # Example: page/container pattern
│       ├── page.tsx         # Server Component (metadata)
│       └── container.tsx    # Client Component (state & UI)
├── components/
│   ├── ui/                 # Atomic UI components
│   └── layouts/            # Layout wrappers
├── contexts/
│   └── AuthContext.tsx     # Auth state + ProtectedRoute
├── providers/
│   ├── QueryProvider.tsx   # TanStack Query config
│   └── ToastProvider.tsx   # react-hot-toast config
├── services/
│   └── auth.ts             # API service example
├── schemas/
│   └── auth.ts             # Zod validation schemas
├── hooks/
│   ├── index.ts            # Utility hooks (useDebounce, useMediaQuery, etc.)
│   └── use-api.ts          # React Query hooks template
├── lib/
│   ├── api.ts              # apiFetch wrapper (Next.js cache support)
│   ├── cn.ts               # clsx + tailwind-merge
│   ├── config.ts           # getApiBaseUrl, getAppUrl
│   ├── env.ts              # Type-safe env vars (@t3-oss/env)
│   ├── helpers.ts          # Utility functions
│   ├── http-error.ts       # HttpError class + getErrorMessage
│   ├── sanitize.ts         # HTML sanitizer (XSS protection)
│   └── seo.ts              # SEO metadata helpers
├── types/
│   ├── api.ts              # API response interfaces
│   └── index.ts            # Generic utility types
├── constants/
│   └── index.ts            # Site config + navigation
└── .github/workflows/      # Vercel deploy (merge + PR preview)
```

## Architecture Patterns

### Route Pattern: Page/Container (SSR + Client Separation)

Every route follows this strict pattern:

```
app/[route]/
├── page.tsx        → Server Component (exports Metadata, renders Container)
└── container.tsx   → Client Component ('use client', state, hooks, UI)
```

**Rules:**

- `page.tsx` is ALWAYS a Server Component (no `'use client'`)
- `page.tsx` ALWAYS exports `metadata` via `generateMetadata()`
- All interactive logic lives in `container.tsx`

```tsx
// page.tsx (Server)
export const metadata: Metadata = generateMetadata({ title: 'Sign In' });
export default function SignInPage() {
  return <SignInContainer />;
}

// container.tsx (Client)
('use client');
export default function SignInContainer() {
  /* forms, state, hooks */
}
```

### Service Layer + `apiFetch`

`lib/api.ts` exports `apiFetch()` — a typed fetch wrapper that supports Next.js caching (tags, ISR, force-cache, no-store) and structured error handling via `HttpError`.

Services are pure async functions that call `apiFetch()`. Each domain entity gets its own file. The first argument accepts either a path (auto-prepends `API_BASE_URL`) or a full URL.

```tsx
// services/auth.ts — client-side, no cache
export async function loginUser(
  data: LoginRequest
): Promise<ApiSuccess<LoginResponse>> {
  return apiFetch<ApiSuccess<LoginResponse>>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}
```

### Data Caching Strategies

`apiFetch` supports all Next.js caching strategies via standard fetch options:

```tsx
// 1. On-demand revalidation (cached until revalidateTag is called)
await apiFetch<ApiSuccess<Product[]>>('/products', {
  cache: 'force-cache',
  next: { tags: ['products'] },
});

// 2. ISR — time-based revalidation (revalidate every 60 seconds)
await apiFetch<ApiSuccess<Post[]>>('/posts', {
  next: { revalidate: 60 },
});

// 3. Always fresh — no caching (SSR on every request)
await apiFetch<ApiSuccess<Stats>>('/stats', {
  cache: 'no-store',
});

// 4. Default — no cache options (client-side calls, auth endpoints)
await apiFetch<ApiSuccess<User>>('/users/me', {
  headers: { Authorization: `Bearer ${token}` },
});
```

To invalidate cached data on-demand, use `revalidateTag()` or `revalidatePath()` in Server Actions or API Routes:

```tsx
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';

export async function POST(req: Request) {
  const { tag } = await req.json();
  revalidateTag(tag);
  return Response.json({ revalidated: true });
}
```

### React Query Hooks

Wrap services with React Query for caching, retries, and invalidation:

```tsx
// hooks/use-api.ts
export const queryKeys = {
  users: {
    all: ['users'] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
  },
};

export function useUsers() {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: () => getUsers(token!),
    enabled: !!token,
  });
}

export function useCreateUser() {
  const getToken = useRequiredToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserRequest) => createUser(data, getToken()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
```

### Auth Pattern

Client-side auth via React Context + localStorage:

```tsx
// In any client component:
const { user, token, isAuthenticated, login, logout } = useAuth();

// Protect a layout:
<ProtectedRoute allowedRoles={['admin']}>{children}</ProtectedRoute>;
```

**Auth flow:**

1. On mount: reads token from localStorage → validates via API → sets authenticated or clears
2. Login: calls service → fetches profile → stores in localStorage → redirects
3. Logout: clears local state optimistically → fire-and-forget API call → redirects

### Error Handling (3 Layers)

1. **Service layer:** `apiFetch()` throws structured `HttpError` with status, data, validationErrors
2. **React Query global:** `QueryProvider` configures smart retry (no retry for 4xx, limited for 5xx)
3. **Component level:** `getErrorMessage(error)` + `getValidationErrors(error)` for forms

```tsx
try {
  await login(data);
} catch (error) {
  const msg = getErrorMessage(error);
  toast.error(msg);

  const validationErrors = getValidationErrors(error);
  if (validationErrors) {
    Object.entries(validationErrors).forEach(([field, message]) => {
      setError(field as keyof FormValues, { type: 'server', message });
    });
  }
}
```

### Schema Validation

Zod schemas define form validation. Each schema exports its inferred type:

```tsx
// schemas/auth.ts
export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});
export type LoginRequest = z.infer<typeof loginSchema>;

// In form:
const { register, handleSubmit } = useForm<LoginRequest>({
  resolver: zodResolver(loginSchema),
});
```

### Provider Hierarchy

```
QueryProvider          → TanStack Query client
  └── AuthProvider     → Auth context + localStorage
        └── {children}
ToastProvider          → react-hot-toast (outside tree, portal)
```

## Scripts

| Command             | Description          |
| ------------------- | -------------------- |
| `pnpm dev`          | Start dev server     |
| `pnpm build`        | Production build     |
| `pnpm start`        | Start production     |
| `pnpm lint`         | Run ESLint           |
| `pnpm lint:fix`     | Fix lint issues      |
| `pnpm format`       | Format with Prettier |
| `pnpm format:check` | Check formatting     |

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable              | Description          |
| --------------------- | -------------------- |
| `NEXT_PUBLIC_APP_URL` | Your app URL         |
| `NEXT_PUBLIC_API_URL` | Your backend API URL |

Add more in `lib/env.ts` with type-safe Zod validation.

## Security

This template includes:

- **Content Security Policy** — restricts script/style/connect sources
- **X-Frame-Options: DENY** — prevents clickjacking
- **X-Content-Type-Options: nosniff** — prevents MIME sniffing
- **Referrer-Policy** — strict-origin-when-cross-origin
- **Permissions-Policy** — disables camera/microphone/geolocation
- **HTML Sanitizer** (`lib/sanitize.ts`) — XSS protection for user-generated content
- **Error Message Sanitization** — strips SQL, stack traces, server paths from error messages

## Deployment

### Vercel (Recommended)

GitHub Actions workflows are included:

- **Push to `main`** → deploys to production
- **Pull Request** → creates preview URL

Required GitHub Secrets:

- `VERCEL_TOKEN`
- `ORG_ID`
- `PROJECT_ID`

### Docker

1. Enable standalone output in `next.config.ts`:

   ```ts
   output: 'standalone',
   ```

2. Build and run:
   ```bash
   docker build -t my-app .
   docker run -p 3000:3000 my-app
   ```

## Adding a New Feature (Checklist)

1. Define types in `types/api.ts`
2. Create schema in `schemas/[feature].ts` (Zod + exported type)
3. Create service in `services/[feature].ts` (async functions using `apiFetch`)
4. Add query/mutation hooks in `hooks/use-api.ts` (with query keys)
5. Create route:
   - `app/[route]/page.tsx` — Server Component with metadata
   - `app/[route]/container.tsx` — Client Component with `'use client'`
6. Use `useForm` + `zodResolver` for forms
7. Handle errors with `getErrorMessage()` + `getValidationErrors()` + `toast.error()`

## License

MIT
