# Component Export Barrels (Optional)

Create these files to simplify imports:

## src/components/features/upload/index.ts

```typescript
export { UploadForm } from './UploadForm';
```

## src/components/features/meetings/index.ts

```typescript
export { MeetingList } from './MeetingList';
export { MeetingCard } from './MeetingCard';
```

## src/components/features/transcript/index.ts

```typescript
export { TranscriptViewer } from './TranscriptViewer';
export { SearchBar } from './SearchBar';
```

## src/components/features/entities/index.ts

```typescript
export { EntityPanel } from './EntityPanel';
```

## Benefits

Instead of:
```typescript
import { UploadForm } from '@/components/features/upload/UploadForm';
import { MeetingList } from '@/components/features/meetings/MeetingList';
```

You can write:
```typescript
import { UploadForm } from '@/components/features/upload';
import { MeetingList } from '@/components/features/meetings';
```

## Usage in Pages

Then update your page imports to use the barrels for cleaner code!