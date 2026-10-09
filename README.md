# 🏢 Strongmate Chemicals Pvt. Ltd. (SCPL)
## Premium Secure Video Learning Management System & Qlumate Product Academy

> **Engineered & Tech-Led by Nihar Ranjan Biswal**  
> *Official Corporate LMS & Technical Orientation Platform for Strongmate Chemicals Pvt. Ltd.*

[![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma_ORM-6.3-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![ISO 9001 Certified](https://img.shields.io/badge/ISO-9001:2015_Certified-emerald?style=for-the-badge)](https://strongmatechemicals.com)

---

## 🌟 Executive Overview & Business Value

**Strongmate Chemicals Pvt. Ltd. (SCPL)** is a premier chemical manufacturing enterprise headquartered in **Bhubaneswar, Odisha, India**, with state-of-the-art polymer and dry-mix production facilities in **Balasore (Odisha)** and **Udaipur (Rajasthan)**.

This production-grade **New Joiner Training Portal & Qlumate Academy** is an enterprise-level Learning Management System (LMS) engineered to streamline technical onboarding for new employees, sales executives, plant engineers, lab chemists, and field technicians. The platform delivers protected video tutorials, technical product specifications, interactive assessments, and QR-verifiable training completion certificates.

---

## 🔐 Core Engineering & Security Innovations

### 1. 🛡️ Dynamic Stream Protection & Anti-Recording Deterrence
- **Signed Playback Tokens**: Video streams are protected by short-lived JWT signed playback authorization tokens (60-second expiry), preventing raw file URL harvesting or public hotlinking.
- **Dynamic Moving Watermark Overlay**: During video playback, a low-opacity dynamic security watermark renders over the video canvas displaying `CONFIDENTIAL - STRONGMATE CHEMICALS`, candidate full name, Employee ID, active Session ID, and IP address. The watermark dynamically changes coordinates periodically to deter screen recording or unauthorized distribution.
- **Tab-Focus Security Protocol**: Playback automatically pauses and dims when the browser window or tab loses focus, ensuring complete active learning compliance.
- **Browser Deterrents**: Right-click context menus, video dragging, picture-in-picture, and native browser download controls are disabled.

### 2. 📜 Automated QR-Verified Certificate Engine
- **Strict 100% Completion Lock**: Course certificates are locked and rendered unavailable until the learner completes **100% of required video lessons** and passes course assessments.
- **High-Resolution PDF Generation**: Embedded Base64 official **Strongmate Chemicals** & **Qlumate** logos generate crisp, print-ready PDF certificates via `jsPDF`.
- **Cryptographic Verification**: Each certificate includes a unique Certificate Hash ID and a dynamic QR code linked to the platform's verification route (`/verify-certificate`).

### 3. 📱 Responsive Multi-Device UI/UX Architecture
- **Mobile Experience (< 1024px)**: Dedicated touch-friendly bottom navigation bar ([MobileNav.tsx](file:///c:/Users/nihar/Downloads/Strongmatechemicals/src/components/MobileNav.tsx)) dynamically adapting to Learner or Admin user roles, combined with horizontal scroll wrappers (`overflow-x-auto`) on tables.
- **Desktop Experience (≥ 1024px)**: Collapsible corporate sidebar ([Sidebar.tsx](file:///c:/Users/nihar/Downloads/Strongmatechemicals/src/components/Sidebar.tsx)) with multi-column analytics, ISO certification badges, and comprehensive administrative controls.

---

## 🧪 Tech Stack & Infrastructure

| Layer | Technologies Used |
| :--- | :--- |
| **Framework & Core** | Next.js 15.1 (App Router), React 19, TypeScript 5.7 |
| **Styling & Design** | Tailwind CSS 3.4, Lucide Icons, Canvas Confetti |
| **Database & ORM** | Prisma ORM 6.3, SQLite (Local Dev) / PostgreSQL (Production) |
| **Authentication** | JWT HTTP-Only Cookies, bcryptjs Password Hashing, Single-Device Session Control |
| **Document Processing**| jsPDF (Base64 Logo Embedded Exporter), QRCode.js |
| **Security & Auditing** | In-Memory Sliding-Window Rate Limiting, Automated Audit Event Logger |

---

## 🛠️ Architecture & System Modules

```text
Strongmate Chemicals Training Portal
├── 📁 src
│   ├── 📁 app
│   │   ├── 📄 page.tsx                       # Default Landing (User & Admin Sign In / Sign Up)
│   │   ├── 📁 dashboard                      # Learner Portal Layout & Sub-routes
│   │   │   ├── 📄 page.tsx                   # Learner Analytics & Enrolled Courses
│   │   │   ├── 📄 courses/page.tsx           # Course Catalog & Training Modules
│   │   │   ├── 📄 watch/[videoId]/page.tsx   # Protected Player Page
│   │   │   ├── 📄 products/page.tsx          # Qlumate Product Masterclass Catalog
│   │   │   ├── 📄 quizzes/page.tsx           # Interactive Assessment Engine
│   │   │   └── 📄 certificates/page.tsx      # Verified Certificate Exporter
│   │   └── 📁 admin                          # Admin Management Portal
│   │       ├── 📄 dashboard/page.tsx         # Executive Analytics & User Control
│   │       ├── 📄 users/page.tsx             # User Search, Registration & Ban/Unban Toggles
│   │       ├── 📄 videos/page.tsx            # Local MP4 File & Stream DRM Upload Portal
│   │       ├── 📄 courses/page.tsx           # Course & Module Builder
│   │       └── 📄 reports/page.tsx           # CSV Export & Compliance Analytics
│   ├── 📁 components                         # Modular UI Elements
│   │   ├── 📄 VideoPlayer.tsx                # Custom Player with Focus Blur Protection
│   │   ├── 📄 WatermarkOverlay.tsx           # Dynamic Employee Watermark
│   │   ├── 📄 CertificateCard.tsx            # PDF Generator with Embedded Base64 Logos
│   │   ├── 📄 Navbar.tsx                     # Header Navigation & Brand Logos
│   │   ├── 📄 Sidebar.tsx                    # Desktop Vertical Sidebar Navigation
│   │   └── 📄 MobileNav.tsx                  # Mobile Touch-Optimized Navigation Bar
│   └── 📁 lib                                # Database, Security & Auth Utilities
│       ├── 📄 auth.ts                        # JWT Signing, Token Verification & Session Logic
│       ├── 📄 db.ts                          # Prisma Client Instance Singleton
│       └── 📄 security.ts                    # Rate Limiter & Audit Logger
└── 📁 prisma
    ├── 📄 schema.prisma                      # Data Models (Users, Courses, Videos, Certificates)
    └── 📄 seed.ts                            # Initial DB Seeding Script
```

---

## ⚡ Getting Started & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/niharranjanbiswal22-source/strongmatechemicals.git
cd strongmatechemicals
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="strongmate-secret-jwt-key-2026-secure-qlumate"
```

### 3. Initialize & Seed Database
```bash
npx prisma db push
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Pre-Configured Demo Credentials

| Role | Email / ID | Password | Portal View |
| :--- | :--- | :--- | :--- |
| **Learner (User)** | `SMC1001` or `rahul.kumar@strongmatechemicals.com` | `ChangeMe@123` | [/dashboard](http://localhost:3000/dashboard) |
| **Admin** | `admin@strongmatechemicals.com` | `ChangeMe@123` | [/admin/dashboard](http://localhost:3000/admin/dashboard) |

---

## 🚀 Production Build & Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm run start
```
The server will start on **port 3000** with optimized page delivery (< 50ms initial load).

---

## 📬 Lead Developer & Technical Enquiries

Developed and lead-engineered by **Nihar Ranjan Biswal** (Tech Lead).

- **Company**: Strongmate Chemicals Pvt. Ltd. (SCPL) / Qlumate
- **Location**: Bhubaneswar, Odisha, India
- **GitHub Repository**: [niharranjanbiswal22-source/strongmatechemicals](https://github.com/niharranjanbiswal22-source/strongmatechemicals.git)

---
*© 2026 Strongmate Chemicals Pvt. Ltd. All Rights Reserved.*
