---
description: General coding standards, best practices, security, and performance guidelines for all development work on GetPawtrait.com.
globs: *.tsx,*.ts
alwaysApply: false
---

# Development Guidelines: GetPawtrait.com (Shopify + Remix + Prisma)

> **Important Note:**  
> I am a complete beginner in Shopify, Remix, and Prisma technologies. For this project, the AI (Cline) has full control and decision-making authority as the technical operations manager. All architectural decisions, coding standards, and implementation approaches will be guided by the AI's expertise. When in doubt about any technical aspect, I will defer to Cline's recommendations.

## **0. Pre-Feature Checklist (MANDATORY)**

### Architecture
- [ ] **Route components are minimal** (max 10 lines, primarily data loading)
- [ ] **Client component created** for all UI logic
- [ ] **Layout separated** from content components
- [ ] **Sections identified** and extracted (Header, Content, Sidebar)
- [ ] **Each component ≤50 lines** JSX
- [ ] **Feature folder structure** complete
- [ ] **Types defined** in correct location

### Component Breakdown
- [ ] **No monolithic components** (everything decomposed)
- [ ] **Single responsibility** per component
- [ ] **Logic separated** from presentation
- [ ] **Reusable components** identified and extracted
- [ ] **Context providers or stores** used for shared state

### Code Quality
- [ ] **Imports organized** correctly
- [ ] **TypeScript types** complete
- [ ] **Error handling** implemented
- [ ] **Loading states** with appropriate UI feedback
- [ ] **No prop drilling** beyond one level

### Security & Performance
- [ ] **Zod validation** on server endpoints
- [ ] **Images optimized** before upload and storage
- [ ] **Code splitting** for heavy components
- [ ] **API credentials secured** in environment variables

### UX
- [ ] Mobile-first responsive design
- [ ] Smooth loading states
- [ ] Clear user error handling
- [ ] Intuitive navigation flow

## **1. Project Architecture**

### Folder Structure (MANDATORY)
```
app/
├── db.server.ts          # Prisma DB connection
├── entry.server.tsx      # Remix entry point
├── globals.d.ts          # Global type declarations
├── root.tsx              # Root layout component
├── routes/               # Remix route components
│   ├── _index/           # Main landing page
│   ├── app._index.tsx    # App home
│   ├── app.customize.$productId.tsx # Customization flow
│   ├── app.styles.tsx    # Style management
│   ├── auth.$.tsx        # Authentication routes
│   └── webhooks.*.tsx    # Webhook handlers
├── components/           # Reusable UI components
│   ├── ui/               # Basic UI components
│   ├── layout/           # Layout components
│   └── forms/            # Form components
├── features/             # Business logic by domain
│   ├── customization/    # Image customization feature
│   │   ├── components/   # Feature-specific components
│   │   ├── hooks/        # Custom hooks
│   │   ├── stores/       # State management
│   │   └── utils/        # Utilities
├── services/             # External API integrations
│   ├── ai.server.ts      # AI transformation service
│   ├── storage.server.ts # Cloud storage service
│   ├── cart.server.ts    # Shopify cart operations
│   └── printify.server.ts # Printify integration
├── models/               # Database operations
├── utils/                # Utility functions
└── shopify.server.ts     # Shopify API integration
```

### Naming Conventions (NON-NEGOTIABLE)
- Folders: kebab-case (e.g., `image-styles`, `user-uploads`)
- Components: PascalCase (e.g., `ImageUploader.tsx`, `StyleSelector.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useImageUpload.ts`)
- Stores: camelCase with `Store` suffix (e.g., `customizationStore.ts`)
- Types: PascalCase (e.g., `UserUpload`, `GeneratedImage`)
- Server modules: camelCase with `.server.ts` suffix (e.g., `ai.server.ts`)

## **2. Components: Strict Rules**

### Component Hierarchy
- **UI Components**: Basic building blocks (buttons, inputs, cards) with no business logic
- **Layout Components**: Structural components (containers, grids) for page organization
- **Feature Components**: Business logic components specific to a feature
- **Form Components**: Input collection and validation components

### Component Template (MANDATORY)
```tsx
/**
 * Clear description of the component's purpose and functionality.
 */
interface ComponentProps {
  // Define props here with clear types
  imageUrl?: string; // Optional URL of the image to display
  onSelect: (styleId: string) => void; // Callback when a style is selected
}

export function Component({ imageUrl, onSelect }: ComponentProps) {
  // 1. Hooks first
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // 2. Local state and derived values
  const hasImage = Boolean(imageUrl);
  
  // 3. Event handlers and utility functions
  const handleSelection = (id: string) => {
    setSelectedId(id);
    onSelect(id);
  };
  
  // 4. JSX (max 50 lines)
  if (!hasImage) {
    return <EmptyState message="Please upload an image first" />;
  }

  return (
    <div className="component-container">
      {/* Component content */}
    </div>
  );
}
```

### Composition Rules
- Max 50 lines of JSX per component
- If longer, split into subcomponents
- Max one level of prop drilling
- Use context or stores for deeply shared state
- Component should have a single responsibility

## **3. Route Component Architecture (STRICT RULES)**

### Route Components Must Be Minimal
```tsx
// app/routes/app.customize.$productId.tsx - CLEAN, minimal route component
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { CustomizationPageClient } from "~/features/customization/components/CustomizationPageClient";
import { getProductDetails } from "~/services/shopify.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const productId = params.productId;
  const productData = await getProductDetails(productId);
  
  if (!productData) {
    throw new Response("Product not found", { status: 404 });
  }
  
  return json({ productData });
}

export default function CustomizeRoute() {
  const data = useLoaderData<typeof loader>();
  return <CustomizationPageClient initialData={data} />;
}
```

### Route Decomposition Rules (NON-NEGOTIABLE)
- Route components: Max 10 lines of JSX, only data loading + client component
- Business logic in separate components or service files
- Break down into logical sections with dedicated components
- No UI logic in loader/action functions
- Each section: Separate component, max 50 lines JSX

## **4. Component Decomposition (MANDATORY)**

### Decomposition Strategy
Every component must follow this breakdown pattern:

1. **Layout Components**: Structure only, no business logic
2. **Section Components**: Group related functionality
3. **Feature Components**: Specific business logic
4. **UI Components**: Pure presentation

### Example: Customization Flow Decomposition
```tsx
// ❌ BAD - Monolithic component
export function CustomizationFlow() {
  // 150+ lines with upload, style selection, preview logic
}

// ✅ GOOD - Properly decomposed
export function CustomizationFlow() {
  return (
    <CustomizationLayout>
      <ImageUploadSection />
      <StyleSelectionSection />
      <PreviewSection />
      <ActionButtons />
    </CustomizationLayout>
  );
}

// Each section is its own component
export function ImageUploadSection() {
  const { uploadImage } = useCustomizationStore();
  
  return (
    <Section title="Upload Your Pet Photo">
      <ImageUploader onUpload={uploadImage} />
      <UploadGuidelines />
    </Section>
  );
}
```

### Decomposition Checklist
- Layout separated from content
- Sections identified and extracted
- Logic separated from presentation
- Each component has single responsibility
- No component exceeds 50 lines JSX
- State management handled through stores or context

## **5. Data Handling (STRICT RULES)**

### Database Operations
```tsx
// app/models/userUpload.server.ts
import { prisma } from "~/db.server";
import type { UserUpload } from "@prisma/client";

export async function createUserUpload(data: {
  shopId: string;
  originalUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}): Promise<UserUpload> {
  return prisma.userUpload.create({
    data,
  });
}

export async function getUserUploads(shopId: string): Promise<UserUpload[]> {
  return prisma.userUpload.findMany({
    where: { shopId },
    orderBy: { createdAt: "desc" },
  });
}
```

### External Service Calls
```tsx
// app/services/ai.server.ts
import { z } from "zod";

const responseSchema = z.object({
  imageUrl: z.string().url(),
  // Add other expected fields
});

export async function generateImage(imageUrl: string, styleId: string): Promise<{ imageUrl: string }> {
  try {
    const response = await fetch("https://api.aiservice.example/transform", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.AI_SERVICE_API_KEY}`,
      },
      body: JSON.stringify({ imageUrl, styleId }),
    });
    
    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`);
    }
    
    const data = await response.json();
    const validated = responseSchema.parse(data);
    return { imageUrl: validated.imageUrl };
  } catch (error) {
    console.error("AI transformation error:", error);
    throw new Error("Failed to generate image");
  }
}
```

## **6. File Organization (STRICT RULES)**

### Feature Structure Template
```
features/customization/
├── components/
│   ├── CustomizationPageClient.tsx  # Main client component
│   ├── CustomizationLayout.tsx      # Layout wrapper
│   ├── sections/                    # Section components
│   │   ├── ImageUploadSection.tsx   # Image upload section
│   │   └── StyleSelectionSection.tsx # Style selection section
├── hooks/
│   ├── useImageUpload.ts            # Image upload hook
│   └── useStyleSelection.ts         # Style selection hook
├── stores/
│   └── customizationStore.ts        # State management
└── utils/
    └── imageProcessing.ts           # Image utilities
```

### Import Organization
```tsx
// Order: React/Remix → Third-party → Internal
import { useState, useEffect } from "react";
import { useLoaderData, Form } from "@remix-run/react";
import { z } from "zod";

import { Button } from "~/components/ui/Button";
import { useCustomizationStore } from "~/features/customization/stores/customizationStore";
import { uploadImage } from "~/services/storage.server";
import type { UserUpload } from "~/types";
```

## **7. State Management: Strict Architecture**

### Zustand Stores per Domain
```tsx
// features/customization/stores/customizationStore.ts
import { create } from "zustand";
import type { UserUpload, GeneratedImage } from "~/types";

interface CustomizationState {
  // State
  uploadedImage: File | null;
  userUpload: UserUpload | null;
  selectedStyleId: string | null;
  generatedImage: GeneratedImage | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  uploadImage: (file: File) => Promise<void>;
  selectStyle: (styleId: string) => void;
  generateImage: () => Promise<void>;
  resetState: () => void;
}

export const useCustomizationStore = create<CustomizationState>((set, get) => ({
  // Initial state
  uploadedImage: null,
  userUpload: null,
  selectedStyleId: null,
  generatedImage: null,
  isLoading: false,
  error: null,
  
  // Actions
  uploadImage: async (file) => {
    set({ isLoading: true, error: null });
    try {
      // Implementation details
      set({ uploadedImage: file, isLoading: false });
    } catch (error) {
      set({ error: "Failed to upload image", isLoading: false });
    }
  },
  
  selectStyle: (styleId) => {
    set({ selectedStyleId: styleId });
  },
  
  generateImage: async () => {
    const { uploadedImage, selectedStyleId } = get();
    if (!uploadedImage || !selectedStyleId) {
      set({ error: "Image and style must be selected" });
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      // Implementation details
      set({ isLoading: false });
    } catch (error) {
      set({ error: "Failed to generate image", isLoading: false });
    }
  },
  
  resetState: () => {
    set({
      uploadedImage: null,
      userUpload: null,
      selectedStyleId: null,
      generatedImage: null,
      isLoading: false,
      error: null,
    });
  },
}));
```

### Store Organization Rules
- One store per feature domain (e.g., `customizationStore`, `cartStore`)
- Actions live in the store, not in components
- No global UI state in feature stores
- Persistence only for critical data (cart, user preferences)

### Component-Store Connection
```tsx
// Select only what you need from the store
export function StyleSelectionSection() {
  const selectedStyleId = useCustomizationStore(state => state.selectedStyleId);
  const selectStyle = useCustomizationStore(state => state.selectStyle);
  
  // Component logic...
}
```

## **8. Data Fetching: Mandatory Patterns**

### Server-Side Data Loading (Remix `loader`)
```tsx
// app/routes/app.styles.tsx
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getArtisticStyles } from "~/models/artisticStyle.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const styles = await getArtisticStyles();
  return json({ styles });
}

export default function StylesRoute() {
  const { styles } = useLoaderData<typeof loader>();
  return <StylesPageClient styles={styles} />;
}
```

### Client-Side Data Mutations
```tsx
// app/routes/app.api.generate-image.tsx
import { json, ActionFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { generateImage } from "~/services/ai.server";

const GenerateImageSchema = z.object({
  imageUrl: z.string().url(),
  styleId: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  // Parse and validate request body
  const body = await request.json();
  const result = GenerateImageSchema.safeParse(body);
  
  if (!result.success) {
    return json({ error: result.error.flatten() }, { status: 400 });
  }
  
  try {
    const { imageUrl, styleId } = result.data;
    const generatedImage = await generateImage(imageUrl, styleId);
    return json({ success: true, imageUrl: generatedImage.imageUrl });
  } catch (error) {
    return json({ error: "Failed to generate image" }, { status: 500 });
  }
}
```

## **9. Security: Non-Negotiable**

### Input Validation
```tsx
// app/routes/app.api.upload-image.tsx
import { ActionFunctionArgs, json, unstable_parseMultipartFormData, unstable_createFileUploadHandler } from "@remix-run/node";
import { z } from "zod";

// Define validation schema
const UploadSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size <= 5 * 1024 * 1024, "File too large (max 5MB)")
    .refine(file => ["image/jpeg", "image/png"].includes(file.type), "Only JPEG and PNG allowed"),
});

export async function action({ request }: ActionFunctionArgs) {
  // Parse multipart form data
  const uploadHandler = unstable_createFileUploadHandler({
    maxPartSize: 5_000_000, // 5MB
    file: ({ filename }) => filename,
  });
  
  const formData = await unstable_parseMultipartFormData(request, uploadHandler);
  const file = formData.get("file") as File | null;
  
  // Validate input
  const result = UploadSchema.safeParse({ file });
  if (!result.success) {
    return json({ error: result.error.flatten() }, { status: 400 });
  }
  
  // Process valid file
  try {
    // Implementation details
    return json({ success: true });
  } catch (error) {
    return json({ error: "Failed to upload image" }, { status: 500 });
  }
}
```

### API Security
- All API keys must be in environment variables
- Validate all API responses with Zod schemas
- Implement proper error handling for failed API calls
- Use HTTPS for all external requests
- Validate webhook signatures for Shopify and Printify

## **10. Performance: Strict Rules**

### Image Optimization
```tsx
// Client-side image resizing before upload
export function useImageProcessor() {
  const resizeImage = async (file: File, maxWidth = 1200): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create blob"));
              return;
            }
            const newFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(newFile);
          },
          file.type,
          0.9
        );
      };
      
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  };
  
  return { resizeImage };
}
```

### Code Splitting
Remix handles route-based code splitting automatically. For additional splitting:

```tsx
import { lazy, Suspense } from "react";

// For heavy components not needed immediately
const AdvancedEditor = lazy(() => import("~/features/customization/components/AdvancedEditor"));

export function CustomizationPage() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowAdvanced(true)}>Advanced Options</button>
      
      {showAdvanced && (
        <Suspense fallback={<div>Loading advanced editor...</div>}>
          <AdvancedEditor />
        </Suspense>
      )}
    </div>
  );
}
```

## **11. Shopify-Specific Guidelines**

### App Bridge Integration
- Use App Bridge components for consistent UI within Shopify admin
- Handle authentication through Shopify's OAuth flow
- Use App Bridge actions for navigation within the Shopify admin
- Follow Shopify's design guidelines for admin apps

### Shopify API Usage
- Use GraphQL API for most operations
- Batch queries when possible to reduce API calls
- Handle rate limiting appropriately
- Cache frequently used data to minimize API usage

### Webhook Handling
```tsx
// app/routes/webhooks.app.uninstalled.tsx
import { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

export async function action({ request }: ActionFunctionArgs) {
  const { topic, shop, session, payload } = await authenticate.webhook(request);
  
  if (!shop || !session) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  if (topic === "APP_UNINSTALLED") {
    // Clean up shop data
    // await deleteShopData(shop);
  }
  
  return new Response("Webhook processed", { status: 200 });
}
```

## **12. AI-Centric Development**

As a beginner in these technologies, I will:

- Consult with Cline (AI) before making any significant architectural decisions
- Request detailed guidance when implementing new features
- Ask for code reviews and refactoring suggestions
- Seek explanations when I don't understand certain patterns or approaches
- Document AI recommendations for future reference

The AI has final authority on:
- Code organization and structure
- Implementation approaches
- Technology choices
- Best practices and patterns
- Performance optimizations

## **13. Testing Strategy**

### Manual Testing Checklist
- Test all user flows on desktop and mobile devices
- Verify image uploads with various file types and sizes
- Test all style transformations with different images
- Confirm product mockups render correctly
- Validate the complete checkout process
- Test error scenarios and recovery paths

### Automated Testing (Future)
- Unit tests for utility functions and hooks
- Integration tests for critical user flows
- API mocks for external services
- End-to-end tests for complete user journeys

## **14. Documentation Requirements**

All code should include:
- Clear function/component descriptions
- Type definitions for all parameters
- Examples for complex functions
- References to external documentation when relevant

Project documentation should include:
- Setup instructions
- Environment configuration
- API integration details
- Deployment procedures

---

**Remember:**  
As a complete beginner in Remix, Shopify, and Prisma, I will rely on Cline (AI) as the technical operations manager for all architectural decisions and implementation guidance. These guidelines serve as our shared understanding of best practices and will evolve as the project progresses.