# Pages Setup Guide

## ✅ What We Have

1. **Home Page** (`/`) - Upload + Meeting List
2. **Meeting Detail Page** (`/meetings/[id]`) - Transcript + Entities + Search

## 🚀 Implementation Steps

### Step 1: Install Missing Shadcn Component

```bash
cd frontend

# Add checkbox if not already added
npx shadcn@latest add checkbox
```

### Step 2: Create Page Files

Make sure you have these directories:

```bash
# Create meetings directory
New-Item -Path "src/app/meetings/[id]" -ItemType Directory -Force
```

### Step 3: Copy Files

Copy these files from artifacts:

**Layout:**
- `layout.tsx` → `src/app/layout.tsx` (replace existing)

**Pages:**
- `page.tsx` (Home) → `src/app/page.tsx`
- `page.tsx` (Meeting Detail) → `src/app/meetings/[id]/page.tsx`

### Step 4: Verify File Structure

Your structure should look like:

```
src/
├── app/
│   ├── layout.tsx          ✅ Updated with Toaster
│   ├── page.tsx            ✅ Home page
│   ├── providers.tsx       ✅ React Query provider
│   ├── globals.css
│   └── meetings/
│       └── [id]/
│           └── page.tsx    ✅ Meeting detail page
├── components/
│   ├── ui/                 ✅ Shadcn components
│   └── features/
│       ├── upload/
│       │   └── UploadForm.tsx
│       ├── meetings/
│       │   ├── MeetingList.tsx
│       │   └── MeetingCard.tsx
│       ├── transcript/
│       │   ├── TranscriptViewer.tsx
│       │   └── SearchBar.tsx
│       └── entities/
│           └── EntityPanel.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   └── meetings.ts
│   ├── hooks/
│   │   └── useMeetings.ts
│   └── utils/
│       ├── cn.ts
│       ├── formatters.ts
│       └── validation.ts
├── types/
│   └── index.ts
└── config/
    └── constants.ts
```

### Step 5: Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

### Step 6: Make Sure Backend is Running

In another terminal:

```bash
cd ../backend
python main.py
```

Backend should be at: http://localhost:8000

## 🎨 Page Features

### Home Page (`/`)

**Features:**
- ✅ Beautiful gradient header
- ✅ Upload form with drag & drop
- ✅ Meeting list with status indicators
- ✅ Responsive grid layout
- ✅ Auto-navigation after upload
- ✅ Loading states
- ✅ Empty states

**User Flow:**
1. User sees header + upload section
2. User uploads audio file
3. File is processed (mock)
4. User auto-navigates to meeting detail
5. User can see all meetings below

### Meeting Detail Page (`/meetings/[id]`)

**Features:**
- ✅ Back navigation
- ✅ Meeting metadata display
- ✅ Search bar with result count
- ✅ Real-time transcript search
- ✅ Transcript viewer with highlighting
- ✅ Entity panel (tasks + decisions)
- ✅ Timestamp navigation
- ✅ Copy to clipboard
- ✅ Loading states
- ✅ Error handling

**Layout:**
- **2/3 width:** Transcript viewer with search
- **1/3 width:** Entity panel (sticky)
- **Responsive:** Stacks on mobile

**User Flow:**
1. User clicks meeting from list
2. Page loads meeting data
3. User can search transcript
4. User can view extracted entities
5. User can click timestamps to jump
6. User can copy transcript segments

## 🔧 Customization

### Change Gradient Colors

**Home Page Header:**
```typescript
<h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
```

**Background:**
```typescript
<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
```

### Adjust Layout Widths

**Meeting Detail Page:**
```typescript
// Change from 2/3 + 1/3 to 1/2 + 1/2
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div className="lg:col-span-1">  // Transcript
  <div className="lg:col-span-1">  // Entities
```

### Add More Metadata

**Meeting Detail Header:**
```typescript
<div className="flex flex-wrap items-center gap-4">
  <span>Upload size: {formatFileSize(meeting.fileSize)}</span>
  <span>•</span>
  <span>Language: English/Urdu</span>
</div>
```

## 🧪 Testing Flow

### Test Home Page

1. **Visit** http://localhost:3000
2. **Upload** a sample audio file
3. **Verify** progress bar shows
4. **Check** toast notification appears
5. **Confirm** auto-navigation to detail page
6. **Go back** and verify meeting appears in list

### Test Meeting Detail

1. **Click** on a completed meeting
2. **Verify** all data loads
3. **Search** for text in transcript
4. **Check** highlighting works
5. **Click** timestamp buttons
6. **Copy** transcript segment
7. **Test** navigation back to home

### Test Error States

1. **Navigate** to invalid meeting ID: `/meetings/invalid-id`
2. **Verify** error message shows
3. **Click** "Back to Home" button
4. **Confirm** returns to home page

### Test Loading States

1. **Upload** file
2. **Observe** skeleton loaders
3. **Check** spinner animations
4. **Verify** smooth transitions

## 📱 Responsive Design

Both pages are fully responsive:

- **Desktop (lg+):** Full layout with sidebar
- **Tablet (md):** Stacked layout
- **Mobile (sm):** Single column, full width

Test at different breakpoints:
- **1920px** - Desktop
- **1280px** - Laptop
- **768px** - Tablet
- **375px** - Mobile

## 🎯 Next Steps

Now that pages are working:

1. **Test End-to-End**
   - Upload → Process → View → Search

2. **Add Polish**
   - Page transitions
   - Loading animations
   - Skeleton screens

3. **Integrate Real ASR**
   - Replace mock processing
   - Add real transcription
   - Add real entity extraction

4. **Add Features**
   - Audio playback
   - Export functionality
   - Share meetings
   - Meeting analytics

5. **Optimize Performance**
   - Image optimization
   - Code splitting
   - Lazy loading
   - Caching strategies

## ✅ Checklist

- [ ] Shadcn components installed
- [ ] All feature components created
- [ ] Hooks updated
- [ ] Pages created (Home + Detail)
- [ ] Layout updated with Toaster
- [ ] Backend running on :8000
- [ ] Frontend running on :3000
- [ ] File upload working
- [ ] Meeting list displaying
- [ ] Meeting detail loading
- [ ] Search working
- [ ] Entity panel showing
- [ ] Timestamps clickable
- [ ] Copy to clipboard working
- [ ] Navigation working
- [ ] Responsive on mobile

## 🐛 Troubleshooting

### "Cannot find module '@/components/ui/toaster'"

```bash
npx shadcn@latest add toast
```

### "useToast is not a function"

Make sure you have `use-toast.ts` in `components/ui/`:

```bash
npx shadcn@latest add toast
```

### Pages not loading

Check that:
1. Backend is running on port 8000
2. `.env.local` has correct API URL
3. All imports are correct
4. No TypeScript errors

### Meeting detail 404

Make sure:
1. Upload completed successfully
2. Meeting ID is valid
3. Meeting status is "complete"

## 🎉 You're Done!

Your MVP is now fully functional! You have:

✅ Beautiful, responsive UI
✅ File upload with progress
✅ Meeting list with status
✅ Full transcript viewer
✅ Search functionality
✅ Entity extraction display
✅ Professional error handling
✅ Loading states
✅ TypeScript safety
✅ Best practices architecture

Ready for real ASR integration! 🚀