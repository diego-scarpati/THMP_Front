# API Implementation Status

This document tracks the implementation status of all backend API endpoints according to `API_REFERENCE.md`.

## Summary

- ✅ = Fully implemented
- ⚠️ = Implemented but needs update (see TO UPDATE comments in code)
- ❌ = Not yet implemented
- 📝 = Has comment explaining the issue

---

## Jobs API (`/api/jobs`)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/getAll` | GET | ✅ | Paginated job search with query params |
| `/getJobById/{id}` | GET | ✅ | Fetch single job |
| `/getJobsByCompanyName/{companyName}` | GET | ✅ | Search by company |
| `/getAllApplied` | GET | ✅ | Jobs flagged as applied |
| `/getAllRejected` | GET | ✅ | Jobs flagged as rejected |
| `/searchAndCreate` | POST | ⚠️📝 | **TO UPDATE**: Should use query params (keywords, location, datePosted, sort) and return plain text with responseType: "text" |
| `/searchAndCreateWithAllKeywords` | POST | ⚠️📝 | **TO UPDATE**: Should use query params (location, datePosted, sort) + optional body { keywords: string[] }, return plain text |
| `/approveByGPT` | PATCH | ⚠️📝 | **TO UPDATE**: Should return plain text with responseType: "text" |
| `/approveByFormula` | PATCH | ⚠️📝 | **TO UPDATE**: Should return plain text with responseType: "text" |
| `/updateApprovedByDate` | PATCH | ⚠️📝 | **TO UPDATE**: Should return number (count of updated jobs), not string |
| `/updateUserJobsApprovalByFormula` | PATCH | ✅ | Reset per-user approval flags to pending |
| `/seek` | POST | ✅ | Run SEEK scraper with keywords array |
| `/seekAllKeywords` | POST | ✅ | Run SEEK scraper for stored keywords |
| `/approveByLLM` | PATCH | ✅ | Run local LLM approval on pending jobs |

### Hooks Created
- ✅ `useJobs` - Paginated job list
- ✅ `useJob` - Single job by ID
- ✅ `useJobsByCompany` - Jobs by company name
- ✅ `useJobsByAcceptance` - Filter by acceptance status
- ✅ `useAppliedJobs` - Applied jobs
- ✅ `useRejectedJobs` - Rejected jobs
- ✅ `useCreateJob` - Create new job
- ✅ `useUpdateJob` - Update job
- ✅ `useDeleteJob` - Delete job
- ✅ `useBulkCreateJobs` - Bulk create jobs
- ✅ `useSearchAndCreateJobs` - LinkedIn search & create
- ✅ `useSearchAndCreateWithAllKeywords` - LinkedIn search multiple keywords
- ✅ `useApproveJobByFormula` - Approve by formula
- ✅ `useApproveJobByGPT` - Approve by GPT
- ✅ `useUpdateApprovedByDate` - Reject stale jobs
- ✅ `useUpdateUserJobsApprovalByFormula` - Reset user job approvals
- ✅ `useSeekSearch` - SEEK search
- ✅ `useSeekAllKeywords` - SEEK search all keywords
- ✅ `useApproveJobByLLM` - Approve by local LLM

---

## Job Descriptions API (`/api/jobDescriptions`)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/getAll` | GET | ✅ | Retrieve all job descriptions |
| `/getById/{id}` | GET | ✅ | Fetch description by job ID |
| `/create` | POST | ⚠️📝 | **TO UPDATE**: Body should wrap in `{ "jobDescription": JobDescription }` |

### Hooks Created
- ✅ `useJobDescriptions` (if exists)
- ✅ `useJobDescription` (if exists)
- ✅ `useCreateJobDescription` (if exists)

---

## Keywords API (`/api/keywords`)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/getAll` | GET | ✅ | Fetch all keywords |
| `/getAllUserKeywords` | GET | ✅ | Fetch user's keywords |
| `/getById/{id}` | GET | ✅ | Fetch keyword by ID |
| `/create` | POST | ✅ | Create keyword with `{ keyword: string }` |

### Hooks Created
- ✅ `useKeywords` - All keywords
- ✅ `useUserKeywords` - User's keywords
- ✅ `useKeyword` - Single keyword by ID
- ✅ `useCreateKeyword` - Create keyword
- ✅ `useUpdateKeyword` - Update keyword
- ✅ `useDeleteKeyword` - Delete keyword

---

## Inclusions API (`/api/inclusions`)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `GET /` | GET | ✅ | Fetch inclusions for configured user |
| `POST /` | POST | ✅ | Body: `{ inclusions: string[] }` |
| `DELETE /` | DELETE | ⚠️📝 | **TO UPDATE**: Should use query param `?inclusion=term`, returns 204 |

### Hooks Created
- ✅ `useInclusions` - All inclusions
- ✅ `useUserInclusions` - User's inclusions
- ✅ `useCreateInclusion` - Create inclusions
- ✅ `useDeleteInclusion` - Delete inclusion

---

## Exclusions API (`/api/exclusions`)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `GET /` | GET | ✅ | Fetch exclusions for configured user |
| `POST /` | POST | ✅ | Body: `{ exclusions: string[] }` |

### Hooks Created
- ✅ `useExclusions` - All exclusions
- ✅ `useUserExclusions` - User's exclusions
- ✅ `useCreateExclusion` - Create exclusions
- ✅ `useDeleteExclusion` - Delete exclusion

---

## Users API (`/api/users`)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `POST /createUser` | POST | ✅ | Register user |
| `POST /loginUser` | POST | ✅ | Authenticate user |
| `GET /keywords` | GET | ✅ | Get keywords for USER_UUID |

### Hooks Created
- ✅ `useUser` - Get user by ID
- ✅ `useCurrentUser` - Get current user
- ✅ `useCreateUser` - Register user
- ✅ `useUpdateUser` - Update user
- ✅ `useDeleteUser` - Delete user
- ✅ `useLoginUser` - Login
- ✅ `useLogoutUser` - Logout (client-side cache clear)
- ✅ `useUserKeywords` - Get user keywords

---

## Types & Interfaces

### Job Interface
⚠️📝 **TO UPDATE**: Job interface is missing `approved_by_formula` and `approved_by_gpt` fields
```typescript
// Current: missing approval fields on Job
// Should add:
// approved_by_formula: "yes" | "no" | "pending";
// approved_by_gpt: "yes" | "no" | "pending";
```

### JobQueryParams
⚠️📝 **TO UPDATE**: Uses `jobDescriptions` (camelCase), API uses `job_descriptions` (snake_case)
```typescript
// Current: jobDescriptions?: boolean;
// Should be: job_descriptions?: boolean;
```

### SearchAndCreateJobsRequest
⚠️📝 **TO UPDATE**: Should use query params instead of body
```typescript
// Current: body with keywords, locationId
// Should be: query params { keywords: string; location?: string; datePosted?: string; sort?: string; }
```

### SearchAndCreateJobsMultipleKeywordsRequest
⚠️📝 **TO UPDATE**: Should support query params + optional body
```typescript
// Current: body with keywords, locationId
// Should be: query params (location, datePosted, sort) + optional body { keywords?: string[] }
```

### CreateJobDescriptionRequest
⚠️📝 **TO UPDATE**: Should wrap in jobDescription object
```typescript
// Current: flat fields
// Should be: { jobDescription: { id, state, description, ... } }
```

---

## New Types Added

✅ **SeekSearchRequest**
```typescript
interface SeekSearchRequest {
  keywords: string[];
  location?: string; // defaults to 'sydney'
}
```

✅ **SeekAllKeywordsRequest**
```typescript
interface SeekAllKeywordsRequest {
  keywordArray?: string[];
  location?: string;
}
```

✅ **ApprovalResponse**
```typescript
interface ApprovalResponse {
  jobsProcessed: number;
}
```

✅ **UpdateUserJobsApprovalResponse**
```typescript
interface UpdateUserJobsApprovalResponse {
  updatedRows: number;
}
```

✅ **DeleteInclusionRequest**
```typescript
interface DeleteInclusionRequest {
  inclusion: string; // query param
}
```

---

## Action Items

### High Priority (Breaking Changes)
1. ⚠️ Update `Job` interface to include `approved_by_formula` and `approved_by_gpt`
2. ⚠️ Update search endpoints to use query params and `responseType: "text"` for plain text responses
3. ⚠️ Update `JobQueryParams` to use `job_descriptions` instead of `jobDescriptions`
4. ⚠️ Update `CreateJobDescriptionRequest` to wrap in `jobDescription` object
5. ⚠️ Update `updateApprovedByDate` to return `number` instead of `string`
6. ⚠️ Update inclusion DELETE to use query param `?inclusion=term`

### Medium Priority (Improvements)
1. Add `responseType: "text"` to approve endpoints (approveByGPT, approveByFormula)
2. Consider adding error handling for plain text responses

### Low Priority (Documentation)
1. Add JSDoc comments to all hooks explaining their purpose
2. Add usage examples for complex mutations
3. Document response types for plain text endpoints

---

## React Query Best Practices Applied

✅ **Query Keys**
- Hierarchical query key structure in `query-keys.ts`
- Includes pagination params in keys for proper caching
- Separate mutation keys for consistency

✅ **Cache Invalidation**
- Mutations invalidate relevant queries on success
- Specific invalidation patterns (lists vs details)
- Optimistic updates where appropriate

✅ **Type Safety**
- Full TypeScript coverage
- Proper generic usage in responses
- Type-safe query/mutation functions

✅ **Error Handling**
- Consistent error response structure
- ApiErrorResponse interface defined

---

## Usage Examples

### Searching LinkedIn Jobs
```typescript
const searchJobs = useSearchAndCreateJobs();

// Current implementation (body-based)
searchJobs.mutate({ keywords: "React Developer", locationId: 123 });

// TO UPDATE: Should use query params
// searchJobs.mutate({ keywords: "React Developer", location: "New York", datePosted: "pastWeek", sort: "mostRecent" });
```

### Searching SEEK Jobs (New)
```typescript
const seekSearch = useSeekSearch();

seekSearch.mutate({ 
  keywords: ["React", "TypeScript"], 
  location: "sydney" 
});
```

### Getting User Keywords (New)
```typescript
const { data: keywords } = useUserKeywords();
// Returns string[] of user's keywords
```

### Approving Jobs by LLM (New)
```typescript
const approveByLLM = useApproveJobByLLM();

approveByLLM.mutate();
// Returns { jobsProcessed: number }
```

---

## Notes

- All "TO UPDATE" comments are preserved in the source code for easy finding
- Existing implementations continue to work; updates are additive where possible
- Plain text responses need `responseType: "text"` in axios config
- Some endpoints return different types than currently typed (marked with ⚠️)
