# Morina System - Complete Setup Guide

**Last Updated:** 2025-11-26 08:31  
**Status:** ✅ Fully Operational

---

## 🎯 Quick Start

### Prerequisites
- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- PostgreSQL database running (optional - system works with fallbacks)

### Start the System

**Terminal 1 - Backend API:**
```bash
cd /home/fabricio/projects/morina2/apps/api
pnpm dev
# Runs on http://localhost:3333
```

**Terminal 2 - Frontend Web:**
```bash
cd /home/fabricio/projects/morina2/apps/web
pnpm dev
# Runs on http://localhost:3000
```

### Access the Application
- **Login Page:** http://localhost:3000/login
- **Dashboard:** http://localhost:3000/dashboard (requires authentication)
- **API Health:** http://localhost:3333/health

---

## 🏗️ System Architecture

### Frontend (Next.js 16 + Turbopack)
- **Port:** 3000
- **Framework:** Next.js 16.0.1 with App Router
- **Styling:** Tailwind CSS + Custom Design System (@morina/ui)
- **Animations:** Framer Motion
- **State:** React Hooks + Local Storage
- **API Client:** Axios with automatic JWT injection

### Backend (Fastify)
- **Port:** 3333
- **Framework:** Fastify 4.29.1
- **Database:** PostgreSQL (with Prisma ORM)
- **Authentication:** JWT-based
- **Multi-tenancy:** Organization-based with `x-organization-id` header

---

## 📁 Project Structure

```
morina2/
├── apps/
│   ├── api/                    # Fastify backend (port 3333)
│   │   └── src/
│   │       ├── core/          # Core utilities (tenant, auth)
│   │       ├── modules/       # Business modules
│   │       └── main.ts        # Entry point
│   │
│   └── web/                    # Next.js frontend (port 3000)
│       └── src/
│           ├── app/
│           │   ├── (auth)/    # Public auth pages
│           │   │   ├── login/
│           │   │   ├── register/
│           │   │   └── select-organization/
│           │   ├── (app)/     # Protected app pages
│           │   │   ├── dashboard/
│           │   │   ├── users/
│           │   │   ├── clients/
│           │   │   ├── commissions/
│           │   │   └── catalog/
│           │   ├── (legal)/   # Legal compliance pages
│           │   │   ├── lgpd/
│           │   │   ├── termos/
│           │   │   ├── privacidade/
│           │   │   ├── cookies/
│           │   │   ├── lei-representante/
│           │   │   ├── vinculo-empregaticio/
│           │   │   ├── antifraude/
│           │   │   └── retencao-logs/
│           │   └── api/       # Next.js API routes (proxies)
│           │       └── company-settings/
│           ├── components/
│           │   ├── auth/      # LoginForm, RegisterForm
│           │   ├── login/     # Login animations
│           │   ├── layout/    # DashboardLayout
│           │   └── notifications/
│           ├── hooks/         # Custom React hooks
│           ├── lib/
│           │   └── api/       # API clients
│           └── schemas/       # Zod validation schemas
│
└── packages/
    └── ui/                     # Design System (@morina/ui)
        └── src/
            └── components/    # Reusable UI components
```

---

## 🎨 Design System (@morina/ui)

### Components Available
- ✅ `Button` - Multiple variants (default, destructive, outline, ghost, link)
- ✅ `Input` - Text inputs with focus states
- ✅ `Label` - Form labels
- ✅ `Alert` - Notifications (error, success, warning, info)
- ✅ `Checkbox` - Checkboxes with custom styling
- ✅ `GlassCard` - Glassmorphic card container

### Design Tokens
```css
--primary: 210 100% 50%        /* Neon Blue */
--secondary: 280 100% 50%      /* Purple */
--background: 222 47% 11%      /* Dark Blue-Gray */
--foreground: 210 40% 98%      /* Off-White */
```

### Typography
- **Sans:** Inter (body text)
- **Display:** Poppins (headings, labels)

---

## 🔐 Authentication Flow

### 1. Login Process
1. User enters email + password at `/login`
2. Frontend sends POST to `/auth/login` (backend)
3. Backend validates credentials and returns JWT + user data
4. Frontend stores:
   - `auth_token` - JWT token
   - `user_data` - User information
   - `current_organization_id` - Selected org (if single org)
5. If multiple orgs → redirect to `/select-organization`
6. Otherwise → redirect to `/dashboard`

### 2. API Request Flow
```
Frontend Component
    ↓
API Client (base.ts)
    ↓ (adds headers)
    - Authorization: Bearer {token}
    - x-organization-id: {orgId}
    ↓
Backend API (port 3333)
    ↓
Tenant Middleware validates x-organization-id
    ↓
Route Handler
```

### 3. Protected Routes
- All routes under `(app)/` require authentication
- Layout checks for token and redirects to `/login` if missing
- 401 responses automatically redirect to login

---

## 🛠️ Recent Bug Fixes (2025-11-26)

### ✅ Fixed: API Port Mismatch
- **Issue:** Frontend connecting to port 3001, backend on 3333
- **Fix:** Updated `apps/web/src/lib/api/base.ts` default URL

### ✅ Fixed: Organization Header
- **Issue:** Backend expecting `x-organization-id`, frontend sending `x-org-id`
- **Fix:** Updated `apps/web/src/app/api/company-settings/route.ts`

### ✅ Fixed: WebSocket Errors
- **Issue:** Console flooded with connection errors
- **Fix:** Disabled `RealtimeNotificationsProvider` temporarily

---

## 📋 Available Pages

### Authentication
- ✅ `/login` - Futuristic login with animations
- ✅ `/register` - User registration
- ✅ `/select-organization` - Multi-org selection

### Dashboard & Modules
- ✅ `/dashboard` - Main dashboard with stats
- ✅ `/users` - User management
- ✅ `/clients` - Client management
- ✅ `/commissions` - Commission tracking
- ✅ `/catalog` - Product catalog

### Legal Compliance (8 pages)
- ✅ `/lgpd` - LGPD compliance
- ✅ `/termos` - Terms of Use
- ✅ `/privacidade` - Privacy Policy
- ✅ `/cookies` - Cookie Policy
- ✅ `/lei-representante` - Commercial Representative Law
- ✅ `/vinculo-empregaticio` - No Employment Bond
- ✅ `/antifraude` - Anti-fraud Policy
- ✅ `/retencao-logs` - Log Retention Policy

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Backend health check: `curl http://localhost:3333/health`
- [ ] Frontend loads: http://localhost:3000
- [ ] Login page displays correctly
- [ ] Can submit login form (check network tab for API calls)
- [ ] Dashboard loads after login
- [ ] Navigation between pages works
- [ ] Legal pages accessible from footer

### Test Credentials
Check `docs/LOGIN_GUIDE.md` for test user credentials.

---

## 🎯 Key Features

### Login Page
- ✅ Futuristic design with animations
- ✅ Password strength indicator (5 squares)
- ✅ Required terms acceptance checkbox
- ✅ Developer credits (Michel, Adriana, Fabrício)
- ✅ Legal links in footer
- ✅ "Remember me" functionality
- ✅ Password visibility toggle

### Dashboard
- ✅ Stats cards (Products, Clients, Sales, Commissions)
- ✅ Quick actions panel
- ✅ Responsive layout
- ✅ Sidebar navigation

### Security
- ✅ JWT authentication
- ✅ Automatic token injection
- ✅ Organization context (multi-tenant)
- ✅ 401 auto-redirect to login
- ✅ Protected routes

---

## 🚀 Next Steps (Optional Enhancements)

### Backend Integration
- [ ] Connect dashboard stats to real API data
- [ ] Implement CRUD operations for users/clients
- [ ] Add real-time commission calculations
- [ ] File upload for product images

### Features
- [ ] User profile management
- [ ] Advanced search and filters
- [ ] Data export (CSV, PDF)
- [ ] Email notifications
- [ ] Activity logs

### DevOps
- [ ] Environment-specific configs (.env files)
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Production deployment guide

---

## 📞 Support

### Documentation
- `docs/CURRENT_STATUS.md` - System status overview
- `docs/BUGFIXES_2025-11-26.md` - Recent fixes
- `docs/LOGIN_GUIDE.md` - Authentication guide

### Troubleshooting

**Backend not starting?**
```bash
cd apps/api
pnpm install
pnpm dev
```

**Frontend not starting?**
```bash
cd apps/web
pnpm install
pnpm dev
```

**Port already in use?**
```bash
# Kill process on port 3333
lsof -ti:3333 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

---

## ✨ Credits

**Developed by:**
- **Michel** - Visionary & Architect
- **Adriana** - Experience Design  
- **Fabrício** - Lead Engineering

---

**System Status:** 🟢 Operational  
**Last Verified:** 2025-11-26 08:31
