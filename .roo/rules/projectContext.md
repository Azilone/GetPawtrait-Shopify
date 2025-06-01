# ProjectContext.md

 Important Note:
I am a complete beginner in Shopify, Remix, and Prisma technologies. For this project, the AI has full control and decision-making authority as the technical operations manager. All architectural decisions, coding standards, and implementation approaches will be guided by the AI's expertise. When in doubt about any technical aspect, I will defer to AI recommendations.

## **Project Overview**

GetPawtrait.com is an innovative e-commerce platform that transforms pet photos into stylized artwork using AI, then applies these designs to personalized physical products (mugs, t-shirts, cushions, etc.). The platform addresses critical market pain points: long design wait times (2-3 days), limited style options, poor mobile experiences, and lack of transparency in the ordering process.

Our core innovation is providing **instant AI-generated pet portraits** with a seamless mobile-first experience, targeting Millennials and Gen Z pet owners (25-40 years) who value personalized products and social sharing.

The platform consists of three integrated components:

1. **Shopify** - E-commerce storefront and checkout
2. **Custom Remix Application** - AI transformation and personalization engine
3. **Printify** - Print-on-demand production and fulfillment

## **Technical Architecture**

### **Three-Component System**

```
[Customer] → [Shopify Store] → [Custom App Embed] → [AI Service]
                    ↓               ↓                    ↑
                [Checkout] ← [Product Preview] ← [Cloud Storage]
                    ↓
                [Printify] → [Production] → [Shipping]
```

### **Component Responsibilities**

1. **Shopify (Commercial Frontend)**
   - Product catalog and browsing experience
   - Shopping cart and secure checkout
   - Payment processing and customer accounts
   - Order management and email notifications
   - Mobile-optimized storefront using Dawn 2.0 theme
   - Integration with Custom App via Theme App Extension (app block)

2. **Custom Remix Application (Creative Core)**
   - Built with TypeScript, Remix, and Prisma (SQLite)
   - Embedded seamlessly within Shopify product pages
   - Photo upload with mobile optimization and quality guidelines
   - Style library management (initially 5-10 artistic styles)
   - AI image transformation integration
   - Get Product mockup from Printify
   - Cloud storage management for processed images
   - Permanent URL generation for Shopify/Printify integration

3. **Printify (Production and Logistics)**
   - Print-on-demand manufacturing
   - Quality control and packaging
   - Global shipping and fulfillment
   - Order tracking and status updates
   - Product catalog integration (mugs, t-shirts, cushions, etc.)

### **Data Flow Process**

1. **Discovery**: Customer navigates Shopify storefront and selects product
2. **Customization**: Customer clicks "Customize" → launches embedded Remix app
3. **Upload**: Customer uploads pet photo with guided quality requirements
4. **Style Selection**: Customer chooses from curated artistic style library
5. **AI Processing**: App sends image + style parameters to AI transformation service
6. **Preview**: App generates realistic product mockup with stylized image
7. **Approval**: Customer reviews and approves final design
8. **Storage**: App saves final image to cloud storage with permanent URL
9. **Cart Integration**: App passes image URL back to Shopify, adding personalized product
10. **Checkout**: Customer completes purchase through Shopify's secure checkout
11. **Production**: Shopify sends order + image URL to Printify for manufacturing
12. **Fulfillment**: Printify produces and ships directly to customer

## **MVP Scope and Features**

### **Core Functionality**
- **Mobile-First Photo Upload**: Optimized interface with quality guidelines and cropping tools
- **Style Library**: 5-10 carefully curated artistic styles (watercolor, sketch, pop art, etc.)
- **AI Integration**: Seamless connection to image transformation service
- **Product Mockups**: Realistic previews showing final product appearance
- **Cloud Storage**: Reliable image hosting with permanent URLs
- **Shopify Integration**: Smooth handoff to cart without leaving store experience
- **Multi-Product Support**: Initial focus on 3-5 high-demand products


## **Technical Stack**

### **Frontend & Backend**
- **Framework**: Remix (React-based with server-side rendering)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Shopify Integration**: GraphQL API and App Bridge 4.0
- **Image Processing**: External AI API service integration (Replicate)
- **Storage**: Cloudflare R2


## **Project Structure**
get-pawtrait/
├── shopify.app.toml          # Root app manifest – lists extension(s), OAuth scopes, webhooks
├── package.json              # Root scripts ("dev", "build", etc.)
├── .env                      # Never committed – runtime secrets (Shop, Printify, R2, AI)
├── README.md
├── .gitignore
│
├── apps/                     # 1 app = 1 runtime, 1 deploy target
│   ├── remix-admin/          # Embedded Admin + API (Node on Fly/Itty) – Remix 3.x
│   │   ├── app/
│   │   │   ├── components/   # Shared React components (admin + storefront JSON)
│   │   │   ├── routes/
│   │   │   │   ├── admin/    # /app – dashboard, orders, styles
│   │   │   │   ├── storefront/   # /storefront/* JSON endpoints hit by the theme extension
│   │   │   │   ├── api/      # /api/*   – App‑Proxy‑exposed endpoints (upload, transform)
│   │   │   │   ├── webhooks/ # /webhooks/* – Shopify webhooks (orders/paid, app/uninstall)
│   │   │   │   └── auth.$.tsx
│   │   │   ├── services/     # Server‑only modules (shopify, printify, ai, storage)
│   │   │   ├── utils/        # Validation, helpers, error handlers
│   │   │   ├── types/        # Shared TS types (Order, Image, Style)
│   │   │   └── entry.*       # entry.server.tsx / entry.client.tsx
│   │   ├── prisma/
│   │   │   ├── schema.prisma # Models: User, Shop, Style, Generation, Order
│   │   │   ├── migrations/
│   │   │   └── seed.ts       # Initial style library seed
│   │   ├── public/
│   │   │   └── styles/       # Tailwind → compiled CSS
│   │   ├── tests/            # Vitest + Playwright e2e
│   │   ├── remix.config.js
│   │   └── package.json
│   │
│   ├── theme-extension/      # Theme App Extension (acts inside Dawn/Lunaris etc.)
│   │   ├── blocks/
│   │   │   └── pawtrait-customizer.liquid  # <app-block> rendered on product.liquid
│   │   ├── assets/
│   │   │   ├── index.jsx     # React hydration entry (esbuild → assets/app.js)
│   │   │   └── styles.css    # Tailwind compiled for storefront
│   │   ├── snippets/         # Optional snippet inserts (line‑item‑property output)
│   │   ├── locales/
│   │   │   └── en.default.json
│   │   ├── config/
│   │   │   └── settings_schema.json  # Merchant‑editable settings
│   │   ├── shopify.extension.toml    # Extension manifest (blocks, metafields, etc.)
│   │   ├── tailwind.config.js
│   │   ├── postcss.config.js
│   │   └── package.json
│   │
│   └── edge-worker/          # Cloudflare Worker (D1 + R2) for signed‑URL & AI proxy
│       ├── src/
│       │   ├── index.ts      # Hono router
│       │   ├── ai-transform.ts
│       │   ├── storage.ts
│       │   └── utils.ts
│       ├── wrangler.toml     # Deploy config
│       └── package.json
│
├── packages/                 # Shared libraries – versioned together
│   ├── ui-kit/               # Design system (Tailwind + Shadcn + Lucide)
│   │   ├── src/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Dropzone.tsx
│   │   │   └── ...           # Form & skeleton components
│   │   ├── tailwind.config.js
│   │   └── package.json
│   │
│   ├── shopify-sdk/          # Typed GraphQL helpers (admin & storefront APIs)
│   │   └── src/index.ts
│   ├── printify-client/
│   │   └── src/index.ts      # Wrapper around Printify REST endpoints (order, mockup)

│
├── scripts/                  # Executable node scripts (ts-node)
│   ├── migrate.ts            # prisma migrate deploy
│   ├── seed.ts               # seed DB / style library
│

```

## **Risk Mitigation**

### **Technical Risks**
- **AI Service Reliability**: Implement fallback options and error handling
- **Image Quality**: Establish quality thresholds and user guidelines
- **Performance**: Optimize image processing and implement caching strategies
- **Integration Complexity**: Thorough testing of Shopify-App-Printify flow

### **Business Risks**
- **Market Validation**: Launch MVP quickly to gather real user feedback
- **Competition**: Focus on unique value proposition (instant AI, mobile-first)
- **Scalability**: Design architecture to handle growth without major rewrites
# ProjectContext.md

 Important Note:
I am a complete beginner in Shopify, Remix, and Prisma technologies. For this project, the AI has full control and decision-making authority as the technical operations manager. All architectural decisions, coding standards, and implementation approaches will be guided by the AI's expertise. When in doubt about any technical aspect, I will defer to AI recommendations.

## **Project Overview**

GetPawtrait.com is an innovative e-commerce platform that transforms pet photos into stylized artwork using AI, then applies these designs to personalized physical products (mugs, t-shirts, cushions, etc.). The platform addresses critical market pain points: long design wait times (2-3 days), limited style options, poor mobile experiences, and lack of transparency in the ordering process.

Our core innovation is providing **instant AI-generated pet portraits** with a seamless mobile-first experience, targeting Millennials and Gen Z pet owners (25-40 years) who value personalized products and social sharing.

The platform consists of three integrated components:

1. **Shopify** - E-commerce storefront and checkout
2. **Custom Remix Application** - AI transformation and personalization engine
3. **Printify** - Print-on-demand production and fulfillment

## **Technical Architecture**

### **Three-Component System**

```
[Customer] → [Shopify Store] → [Custom App Embed] → [AI Service]
                    ↓               ↓                    ↑
                [Checkout] ← [Product Preview] ← [Cloud Storage]
                    ↓
                [Printify] → [Production] → [Shipping]
```

### **Component Responsibilities**

1. **Shopify (Commercial Frontend)**
   - Product catalog and browsing experience
   - Shopping cart and secure checkout
   - Payment processing and customer accounts
   - Order management and email notifications
   - Mobile-optimized storefront using Dawn 2.0 theme
   - Integration with Custom App via Theme App Extension (app block)

2. **Custom Remix Application (Creative Core)**
   - Built with TypeScript, Remix, and Prisma (SQLite)
   - Embedded seamlessly within Shopify product pages
   - Photo upload with mobile optimization and quality guidelines
   - Style library management (initially 5-10 artistic styles)
   - AI image transformation integration
   - Get Product mockup from Printify
   - Cloud storage management for processed images
   - Permanent URL generation for Shopify/Printify integration

3. **Printify (Production and Logistics)**
   - Print-on-demand manufacturing
   - Quality control and packaging
   - Global shipping and fulfillment
   - Order tracking and status updates
   - Product catalog integration (mugs, t-shirts, cushions, etc.)

### **Data Flow Process**

1. **Discovery**: Customer navigates Shopify storefront and selects product
2. **Customization**: Customer clicks "Customize" → launches embedded Remix app
3. **Upload**: Customer uploads pet photo with guided quality requirements
4. **Style Selection**: Customer chooses from curated artistic style library
5. **AI Processing**: App sends image + style parameters to AI transformation service
6. **Preview**: App generates realistic product mockup with stylized image
7. **Approval**: Customer reviews and approves final design
8. **Storage**: App saves final image to cloud storage with permanent URL
9. **Cart Integration**: App passes image URL back to Shopify, adding personalized product
10. **Checkout**: Customer completes purchase through Shopify's secure checkout
11. **Production**: Shopify sends order + image URL to Printify for manufacturing
12. **Fulfillment**: Printify produces and ships directly to customer

## **MVP Scope and Features**

### **Core Functionality**
- **Mobile-First Photo Upload**: Optimized interface with quality guidelines and cropping tools
- **Style Library**: 5-10 carefully curated artistic styles (watercolor, sketch, pop art, etc.)
- **AI Integration**: Seamless connection to image transformation service
- **Product Mockups**: Realistic previews showing final product appearance
- **Cloud Storage**: Reliable image hosting with permanent URLs
- **Shopify Integration**: Smooth handoff to cart without leaving store experience
- **Multi-Product Support**: Initial focus on 3-5 high-demand products


## **Technical Stack**

### **Frontend & Backend**
- **Framework**: Remix (React-based with server-side rendering)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Shopify Integration**: GraphQL API and App Bridge 4.0
- **Image Processing**: External AI API service integration (Replicate)
- **Storage**: Cloudflare R2


## **Project Structure**
get-pawtrait/
├── shopify.app.toml          # Root app manifest – lists extension(s), OAuth scopes, webhooks
├── package.json              # Root scripts ("dev", "build", etc.)
├── .env                      # Never committed – runtime secrets (Shop, Printify, R2, AI)
├── README.md
├── .gitignore
│
├── apps/                     # 1 app = 1 runtime, 1 deploy target
│   ├── remix-admin/          # Embedded Admin + API (Node on Fly/Itty) – Remix 3.x
│   │   ├── app/
│   │   │   ├── components/   # Shared React components (admin + storefront JSON)
│   │   │   ├── routes/
│   │   │   │   ├── admin/    # /app – dashboard, orders, styles
│   │   │   │   ├── storefront/   # /storefront/* JSON endpoints hit by the theme extension
│   │   │   │   ├── api/      # /api/*   – App‑Proxy‑exposed endpoints (upload, transform)
│   │   │   │   ├── webhooks/ # /webhooks/* – Shopify webhooks (orders/paid, app/uninstall)
│   │   │   │   └── auth.$.tsx
│   │   │   ├── services/     # Server‑only modules (shopify, printify, ai, storage)
│   │   │   ├── utils/        # Validation, helpers, error handlers
│   │   │   ├── types/        # Shared TS types (Order, Image, Style)
│   │   │   └── entry.*       # entry.server.tsx / entry.client.tsx
│   │   ├── prisma/
│   │   │   ├── schema.prisma # Models: User, Shop, Style, Generation, Order
│   │   │   ├── migrations/
│   │   │   └── seed.ts       # Initial style library seed
│   │   ├── public/
│   │   │   └── styles/       # Tailwind → compiled CSS
│   │   ├── tests/            # Vitest + Playwright e2e
│   │   ├── remix.config.js
│   │   └── package.json
│   │
│   ├── theme-extension/      # Theme App Extension (acts inside Dawn/Lunaris etc.)
│   │   ├── blocks/
│   │   │   └── pawtrait-customizer.liquid  # <app-block> rendered on product.liquid
│   │   ├── assets/
│   │   │   ├── index.jsx     # React hydration entry (esbuild → assets/app.js)
│   │   │   └── styles.css    # Tailwind compiled for storefront
│   │   ├── snippets/         # Optional snippet inserts (line‑item‑property output)
│   │   ├── locales/
│   │   │   └── en.default.json
│   │   ├── config/
│   │   │   └── settings_schema.json  # Merchant‑editable settings
│   │   ├── shopify.extension.toml    # Extension manifest (blocks, metafields, etc.)
│   │   ├── tailwind.config.js
│   │   ├── postcss.config.js
│   │   └── package.json
│   │
│   └── edge-worker/          # Cloudflare Worker (D1 + R2) for signed‑URL & AI proxy
│       ├── src/
│       │   ├── index.ts      # Hono router
│       │   ├── ai-transform.ts
│       │   ├── storage.ts
│       │   └── utils.ts
│       ├── wrangler.toml     # Deploy config
│       └── package.json
│
├── packages/                 # Shared libraries – versioned together
│   ├── ui-kit/               # Design system (Tailwind + Shadcn + Lucide)
│   │   ├── src/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Dropzone.tsx
│   │   │   └── ...           # Form & skeleton components
│   │   ├── tailwind.config.js
│   │   └── package.json
│   │
│   ├── shopify-sdk/          # Typed GraphQL helpers (admin & storefront APIs)
│   │   └── src/index.ts
│   ├── printify-client/
│   │   └── src/index.ts      # Wrapper around Printify REST endpoints (order, mockup)

│
├── scripts/                  # Executable node scripts (ts-node)
│   ├── migrate.ts            # prisma migrate deploy
│   ├── seed.ts               # seed DB / style library
│

```

## **Risk Mitigation**

### **Technical Risks**
- **AI Service Reliability**: Implement fallback options and error handling
- **Image Quality**: Establish quality thresholds and user guidelines
- **Performance**: Optimize image processing and implement caching strategies
- **Integration Complexity**: Thorough testing of Shopify-App-Printify flow

### **Business Risks**
- **Market Validation**: Launch MVP quickly to gather real user feedback
- **Competition**: Focus on unique value proposition (instant AI, mobile-first)
- **Scalability**: Design architecture to handle growth without major rewrites
