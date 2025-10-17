# Haslab AI Studio - Changelog

## Recent Updates

### ✨ New Features

#### 🖼️ Image Upload in Chat
- **Vision Model Support**: Chat interface now supports image uploads for vision-capable models
- **Smart Detection**: Automatically detects if the current model supports vision (Gemini 2.0 Flash, GPT-4 Vision, Claude 3)
- **Error Handling**: User-friendly alerts when attempting to upload images with non-vision models
- **File Validation**: Validates file size (max 5MB) and type (images only)
- **UI Enhancements**:
  - Image icon button in chat input area
  - Image preview with remove button before sending
  - Images displayed in message history
  - Warning badge when non-vision model is selected with image uploaded

#### 🎨 Enhanced Media Generation Components
Created reusable, professional media generation components:

1. **StylePicker** (`src/components/media/StylePicker.tsx`)
   - Categorized style selector: Photography, Artistic, Character, Scene
   - Collapsible categories with visual color indicators
   - 20+ predefined styles with prompt enhancements

2. **ThemePicker** (`src/components/media/ThemePicker.tsx`)
   - Visual color theme selector with gradient previews
   - 6 themes: Soft Light, Dark Film, Cool Tone, Warm Glow, Monochrome, Vivid Pop
   - Preview chips showing gradient samples

3. **LightingPicker** (`src/components/media/LightingPicker.tsx`)
   - Lighting mood selector with icons
   - 6 options: Studio, Ambient, Natural, Golden Hour, Cinematic, Backlit
   - Color-coded icons for each lighting type

4. **TransformationMode** (`src/components/media/TransformationMode.tsx`)
   - Mode selector: Generate / Enhance / Restyle
   - 8 restyle options: Formal Portrait, Anime, Cartoon, Artistic, Cinematic, 3D Realistic, Sketch, Fantasy
   - Visual mode indicators with descriptions

5. **MediaHistory** (`src/components/media/MediaHistory.tsx`)
   - History panel with thumbnail grid
   - Filters: type (image/video), date (all/today/week/month)
   - Actions: view, download, regenerate, delete
   - Usage cost tracking per generation

#### 🗄️ Repository/Adapter Pattern (IndexedDB)
Implemented a clean data persistence architecture:

- **Storage Adapter Interface** (`src/lib/repository/types.ts`)
  - Abstract interface for storage operations
  - Supports get, getAll, put, delete, query, clear operations

- **IndexedDB Adapter** (`src/lib/repository/indexeddb-adapter.ts`)
  - Local offline-capable storage
  - 4 object stores: projects, media_generations, usage_records, conversations
  - Indexed fields for efficient querying

- **Repository Pattern**:
  - **ProjectRepository**: CRUD operations for build projects
  - **MediaRepository**: CRUD for media generations with filters
  - **UsageRepository**: Usage tracking and analytics
  
- **Easy to Swap**: Can replace IndexedDB with PostgreSQL, REST API, or any backend without changing business logic

#### 📝 Code Block Enhancements
- **Smart Truncation**: Code blocks show first 20 lines by default
- **Expand/Collapse**: Toggle button to show/hide full code
- **Language Headers**: Display language with copy button
- **Copy Feedback**: Shows "Copied" confirmation
- **Text Preservation**: Only truncates code blocks, not regular text responses

### 🔧 Improvements

#### Chat Interface
- **New Chat**: Now properly clears ALL state (messages, input, images, loading states, abort controllers)
- **Better Error Messages**: Specific guidance for API key issues and model limitations
- **Vision API Integration**: Direct API calls for vision models (instead of LangChain) to support multimodal content

#### Sidebar
- **Simplified Footer**: Temporarily hidden "Get API key", "View status", and "Settings" as per requirements
- **Clean Layout**: Removed unused imports and fixed TypeScript warnings

### 🏗️ Architecture

```
src/
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx (✨ Image upload support)
│   │   └── MarkdownMessage.tsx (✨ Code truncation)
│   ├── media/ (✨ NEW)
│   │   ├── StylePicker.tsx
│   │   ├── ThemePicker.tsx
│   │   ├── LightingPicker.tsx
│   │   ├── TransformationMode.tsx
│   │   └── MediaHistory.tsx
│   └── layout/
│       └── Sidebar.tsx (🔧 Simplified)
├── lib/
│   └── repository/ (✨ NEW)
│       ├── types.ts
│       ├── indexeddb-adapter.ts
│       ├── project-repository.ts
│       ├── media-repository.ts
│       ├── usage-repository.ts
│       └── index.ts
└── main.tsx (🔧 Initialize repositories)
```

### 🎯 Vision-Capable Models

The following models support image uploads:
- `google/gemini-2.0-flash-exp:free`
- `google/gemini-pro-vision`
- `openai/gpt-4-vision-preview`
- `anthropic/claude-3-opus`
- `anthropic/claude-3-sonnet`
- `anthropic/claude-3-haiku`

### 🚀 Next Steps

Ready for integration:
1. **Media Route Enhancement**: Integrate new media components into `/media` route
2. **Project Dashboard**: Connect ProjectRepository to `/project` route for real persistence
3. **Usage Analytics**: Connect UsageRepository to `/usage` route for tracking
4. **History Persistence**: Save media generations to IndexedDB via MediaRepository
5. **Build Integration**: Connect ProjectRepository to WebContainer build workflow

### 📦 Dependencies

No new dependencies added. Uses existing:
- React 19
- TanStack Router, Query, Store
- Tailwind CSS 4
- shadcn/ui components
- IndexedDB (native browser API)

### 🔐 Security

- File size validation (5MB max)
- File type validation (images only)
- Base64 encoding for image data
- No sensitive data in localStorage (only IndexedDB)

### ♿ Accessibility

- Proper ARIA labels on image upload buttons
- Keyboard navigation support
- Visual feedback for all interactions
- Clear error messages

---

## Breaking Changes

None. All changes are backward compatible.

## Bug Fixes

- Fixed: New chat button not clearing uploaded images
- Fixed: Code blocks not properly styled in markdown
- Fixed: Memory leak with abort controllers not being cleaned up

## Performance

- Lazy initialization of IndexedDB
- Efficient image preview with FileReader API
- Proper cleanup of blob URLs and event listeners

---

**Version**: Development Build  
**Date**: 2025-10-17  
**Branch**: `feat-haslab-studio-ui-ux-system-upgrade-media-chat-build`
