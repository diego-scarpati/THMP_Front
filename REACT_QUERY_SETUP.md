# React Query Setup Documentation

This project is configured with TanStack Query (React Query) for efficient data fetching and state management.

## 📁 Folder Structure

```
src/
├── lib/
│   ├── query-client.ts      # Query client configuration
│   ├── providers.tsx        # React Query provider wrapper
│   └── query-keys.ts        # Centralized query keys
├── services/
│   ├── api.ts              # Base API service with error handling
│   └── endpoints.ts        # API endpoint functions
├── hooks/
│   ├── use-users.ts        # User-related query hooks
│   ├── use-posts.ts        # Post-related query hooks
│   └── index.ts            # Hook exports
├── types/
│   └── api.ts              # TypeScript types for API
└── components/
    └── users-example.tsx   # Example component using React Query
```

## 🚀 Quick Start

### 1. Environment Variables
Make sure you have the backend URL configured in `.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8888
```

### 2. Using Query Hooks

```tsx
import { useUsers, useCreateUser } from '@/hooks'

function MyComponent() {
  const { data, isLoading, error } = useUsers({ page: 1, limit: 10 })
  const createUser = useCreateUser()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {data?.data.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}
```

### 3. Making Mutations

```tsx
import { useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks'

function UserActions() {
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()

  const handleCreate = () => {
    createUser.mutate({
      name: 'John Doe',
      email: 'john@example.com'
    })
  }

  const handleUpdate = (id: string) => {
    updateUser.mutate({
      id,
      userData: { name: 'Updated Name' }
    })
  }

  const handleDelete = (id: string) => {
    deleteUser.mutate(id)
  }

  return (
    <div>
      <button onClick={handleCreate}>Create User</button>
      {/* Add update and delete buttons */}
    </div>
  )
}
```

## 🛠 Configuration Features

### Query Client Configuration
- **Stale Time**: 5 minutes (data remains fresh)
- **GC Time**: 10 minutes (cache retention)
- **Retry Logic**: Smart retry for network errors, no retry for 4xx errors
- **Background Refetch**: Disabled on window focus, enabled on reconnect

### API Service Features
- **Error Handling**: Custom `ApiError` class with status codes
- **Type Safety**: Full TypeScript support
- **Request Methods**: GET, POST, PUT, DELETE, PATCH
- **Content Type**: Automatic JSON handling

### Query Keys
Centralized query key management for better cache control:
```tsx
import { queryKeys } from '@/lib/query-keys'

// Invalidate all user queries
queryClient.invalidateQueries({ queryKey: queryKeys.users.all })

// Invalidate specific user
queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) })
```

## 📝 Adding New Entities

### 1. Add Types
```tsx
// src/@types/api.ts
export interface NewEntity extends BaseEntity {
  name: string
  // ... other properties
}
```

### 2. Add API Functions
```tsx
// src/services/endpoints.ts
export const newEntityApi = {
  getAll: () => apiService.get<PaginatedResponse<NewEntity>>('/new-entities'),
  getById: (id: string) => apiService.get<ApiResponse<NewEntity>>(`/new-entities/${id}`),
  // ... other CRUD operations
}
```

### 3. Add Query Keys
```tsx
// src/lib/query-keys.ts
export const queryKeys = {
  // ... existing keys
  newEntities: {
    all: ['newEntities'] as const,
    lists: () => [...queryKeys.newEntities.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.newEntities.all, 'detail', id] as const,
  },
}
```

### 4. Create Hooks
```tsx
// src/hooks/use-new-entities.ts
export function useNewEntities() {
  return useQuery({
    queryKey: queryKeys.newEntities.lists(),
    queryFn: newEntityApi.getAll,
  })
}
```

## 🔧 Development Tools

- **React Query Devtools**: Available in development mode
- **Error Boundaries**: Recommended for production error handling
- **Loading States**: Built into all query hooks
- **Optimistic Updates**: Available for mutations

## 🌐 API Integration

The setup expects your backend to return responses in this format:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

For single entities:
```json
{
  "data": { "id": 1, "name": "Example" },
  "message": "Success",
  "status": "success"
}
```

## 🚨 Error Handling

Errors are automatically handled and include:
- Network errors
- HTTP status errors
- JSON parsing errors
- Custom API error messages

Access errors in components:
```tsx
const { error } = useUsers()
if (error) {
  console.log(error.message)  // User-friendly message
  console.log(error.status)   // HTTP status code (if ApiError)
}
```
