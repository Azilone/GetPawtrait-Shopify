 Important Note:
I am a complete beginner in Shopify, Remix, and Prisma technologies. For this project, the AI has full control and decision-making authority as the technical operations manager. All architectural decisions, coding standards, and implementation approaches will be guided by the AI's expertise. When in doubt about any technical aspect, I will defer to AI recommendations.




# productContext.md

## **Project Overview**

GetPawtrait.com is an e-commerce platform that transforms pet photos into stylized artwork using AI, then applies these designs to physical products (mugs, t-shirts, cushions, etc.). The platform addresses key market pain points: long wait times for designs, limited style options, poor mobile experiences, and lack of transparency.

Our core innovation is providing **instant AI-generated pet portraits** with a seamless mobile-first experience. The platform consists of three integrated components:

1. **Shopify** - E-commerce storefront
2. **Custom Application** - AI transformation and personalization
3. **Printify** - Production and fulfillment

## **Technical Architecture**

### **Three-Component System**

```
[Customer] → [Shopify Store] → [Custom App] → [AI Service]
                    ↓               ↓            ↑
                [Checkout] ← [Product Preview] ← [Image Storage]
                    ↓
                [Printify] → [Production] → [Shipping]
```

1. **Shopify (Commercial Frontend)**
   - Simple theme Dawn 2.0 for development
   - Handles product catalog, cart, checkout, payments
   - Manages customer accounts and order history
   - Provides storefront UI and product browsing experience
   - Communicates with Custom App via GraphQL API

2. **Custom Application (Creative Core)**
   - Built with Remix, TypeScript, and Prisma
   - Embedded within Shopify interface
   - Handles photo upload, style selection, and AI transformation
   - Generates product mockups with transformed images
   - Stores final images and creates permanent URLs
   - Passes image URLs back to Shopify cart

3. **Printify (Production and Logistics)**
   - Receives orders and image URLs from Shopify
   - Handles production of physical products
   - Manages packaging and shipping to customers
   - Provides order status updates

### **Data Flow**

1. Customer selects product on Shopify store
2. Customer clicks "Customize" button → launches embedded app
3. App receives product details (dimensions, printable areas)
4. Customer uploads pet photo and selects artistic style
5. App sends image + style to AI service for transformation
6. AI returns stylized image to app
7. App generates product mockup with stylized image
8. Customer approves design
9. App stores final image in cloud storage with permanent URL
10. App passes image URL back to Shopify, adding personalized product to cart
11. Customer completes checkout
12. Shopify sends order details + image URL to Printify
13. Printify produces and ships the product

## **MVP Scope**

### **Core Features**

- User-friendly photo upload interface with mobile optimization
- 5-10 initial artistic styles
- Integration with AI image transformation service
- Product mockup generation with transformed images
- Cloud storage for processed images with persistent URLs
- Seamless handoff to Shopify cart
- Support for 3-5 initial product types (mugs, t-shirts, cushions)


## **Technical Stack**

- **Frontend Framework**: Remix (React-based)
- **Language**: TypeScript
- **Database**: SQLite via Prisma ORM
- **Shopify Integration**: GraphQL API
- **Image Processing**: External AI API service
- **Image Storage**: Cloud storage solution (Cloudflare R2)
- **Deployment**: Shopify App infrastructure

### **Initial Project Structure**

Based on the Shopify CLI template:
```.
├── app
│   ├── db.server.ts
│   ├── entry.server.tsx
│   ├── globals.d.ts
│   ├── root.tsx
│   ├── routes
│   │   ├── _index
│   │   │   ├── route.tsx
│   │   │   └── styles.module.css
│   │   ├── app._index.tsx
│   │   ├── app.additional.tsx
│   │   ├── app.tsx
│   │   ├── auth.$.tsx
│   │   ├── auth.login
│   │   │   ├── error.server.tsx
│   │   │   └── route.tsx
│   │   ├── webhooks.app.scopes_update.tsx
│   │   └── webhooks.app.uninstalled.tsx
│   ├── routes.ts
│   └── shopify.server.ts
├── bun.lock
├── CHANGELOG.md
├── Dockerfile
├── env.d.ts
├── extensions
├── package.json
├── prisma
│   ├── dev.sqlite
│   ├── migrations
│   │   └── 20240530213853_create_session_table
│   │       └── migration.sql
│   └── schema.prisma
├── README.md
├── shopify.app.toml
├── shopify.web.toml
├── tsconfig.json
└── vite.config.ts
```

## **Implementation Plan**

1. **Setup and Configuration** (1-2 weeks)
   - Initialize Shopify app with CLI template
   - Configure Prisma and database schema
   - Set up development environment
   - Create initial app structure

2. **Core Functionality** (2-3 weeks)
   - Implement photo upload component
   - Integrate with AI transformation service
   - Build style selection interface
   - Develop product mockup generation

3. **Integration** (1-2 weeks)
   - Implement cloud storage for images
   - Create Shopify cart integration
   - Set up Printify connection
   - Develop order flow

4. **Testing and Optimization** (1-2 weeks)
   - End-to-end testing
   - Mobile responsiveness testing
   - Performance optimization
   - User experience refinement

5. **Launch Preparation** (1 week)
   - Final QA and testing
   - Documentation
   - Production deployment


## Final Result Expected

A Shopify Store that allow user to get a personalized pet Gift.


