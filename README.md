# 📝 Notes SaaS - Multi-Tenant Notes Application

A complete multi-tenant SaaS application built with Next.js, featuring modern UI/UX design, subscription management, and role-based access control.

## 🚀 Features

### ✨ Multi-Tenancy
- **Shared Schema Approach**: Single database with `tenant_id` column isolation
- **Two Tenants**: Acme Corp and Globex Inc with complete data separation
- **Zero Data Leakage**: Strict tenant isolation at database and API level

### 🔐 Authentication & Authorization
- **JWT-based Authentication** with secure token handling
- **Role-based Access Control**: Admin and Member roles
- **Tenant Context**: User sessions include tenant information

### 💳 Subscription Management
- **Free Plan**: Maximum 3 notes per tenant
- **Pro Plan**: Unlimited notes
- **Admin-only Upgrades**: Only administrators can upgrade tenant plans
- **Real-time Enforcement**: Note limits enforced immediately

### 📋 Complete CRUD Operations
- **Create**: Add new notes with validation
- **Read**: View all tenant notes with filtering
- **Update**: Edit existing notes with inline form
- **Delete**: Remove notes with confirmation

### 🎨 Modern UI/UX Design
- **Split-screen Login**: Professional login with branding
- **3-column Dashboard**: Organized layout with sticky form
- **Consistent Branding**: "📝 Notes SaaS" navbar throughout
- **Smooth Animations**: CSS keyframes and transitions
- **Responsive Design**: Works on all screen sizes

## 🏗️ Architecture

### Database Schema
```sql
tenants: id, slug, name, plan
users: id, email, password, role, tenant_id
notes: id, title, content, tenant_id, user_id, created_at
```

### Technology Stack
- **Frontend**: Next.js, React, CSS-in-JS
- **Backend**: Next.js API Routes
- **Database**: In-memory SQLite-compatible store
- **Authentication**: JWT tokens
- **Deployment**: Vercel-optimized

## 🧪 Test Accounts

All accounts use password: `password`

### Acme Corp Tenant
- `admin@acme.test` - Administrator (can upgrade plans)
- `user@acme.test` - Member (notes only)

### Globex Inc Tenant
- `admin@globex.test` - Administrator (can upgrade plans)
- `user@globex.test` - Member (notes only)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication

### Notes Management
- `GET /api/notes` - List tenant notes
- `POST /api/notes` - Create note (with plan limits)
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Tenant Management
- `POST /api/tenants/:slug/upgrade` - Upgrade tenant (admin only)

### System
- `GET /health` - Health check

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

### Production Deployment
```bash
# Deploy to Vercel
npm install
vercel --prod
```

## 🎯 Testing the Application

### 1. Login & Authentication
1. Visit the application URL
2. Use any of the test accounts listed above
3. Verify tenant isolation by switching between accounts

### 2. Free Plan Limits
1. Login as any user
2. Create 3 notes (should work)
3. Try creating a 4th note (should be blocked)
4. Login as admin and upgrade to Pro
5. Create unlimited notes

### 3. Role-based Access
1. Login as member - no upgrade button visible
2. Login as admin - upgrade button available
3. Test API directly - members get 403 on upgrade endpoint

### 4. Tenant Isolation
1. Create notes as Acme user
2. Login as Globex user
3. Verify no Acme notes are visible

## 🏢 Multi-Tenancy Implementation

### Why Shared Schema?
- **Cost Efficiency**: Single database reduces infrastructure costs
- **Maintenance**: Easier backups, updates, and monitoring
- **Scalability**: Simple horizontal scaling
- **Performance**: Optimized queries with proper indexing

### Security Measures
- **Application-level Filtering**: All queries include `tenant_id`
- **JWT Token Validation**: Every API request authenticated
- **Role-based Permissions**: Admin/Member access control
- **Input Validation**: Sanitized user inputs

## 📁 Project Structure

```
├── lib/
│   ├── auth.js          # Authentication middleware
│   └── db.js            # Database abstraction layer
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   │   └── login.js # Authentication endpoint
│   │   ├── notes/       # Notes CRUD endpoints
│   │   ├── tenants/     # Tenant management
│   │   └── health.js    # Health check
│   └── index.js         # Main application UI
├── next.config.js       # Next.js configuration
├── vercel.json          # Deployment configuration
└── README.md           # This file
```

## 🔧 Configuration

### Environment Variables
```bash
JWT_SECRET=your-secret-key  # Optional, defaults to demo key
```

### CORS Configuration
The application includes CORS headers for API access:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS`
- `Access-Control-Allow-Headers: Content-Type,Authorization`

## 🎨 UI/UX Features

### Login Page
- Split-screen design with branding
- Floating animations and smooth transitions
- Test account information displayed
- Professional gradient backgrounds

### Dashboard
- 3-column responsive layout
- Sticky note creation form (center)
- User info and plan status (left)
- Notes list with cards (right)
- Consistent "📝 Notes SaaS" branding

### Interactive Elements
- Hover effects on all buttons and cards
- Smooth animations (fadeIn, slideIn, bounce)
- Visual feedback for form states
- Plan-specific UI elements

## 🚀 Production Considerations

### Security Enhancements
- Replace simple passwords with bcrypt hashing
- Use environment variables for JWT secrets
- Implement rate limiting
- Add input sanitization

### Database Migration
- Replace in-memory store with PostgreSQL/MySQL
- Add proper indexing on `tenant_id` columns
- Implement database migrations
- Add connection pooling

### Monitoring & Analytics
- Add application logging
- Implement error tracking
- Monitor tenant usage metrics
- Set up performance monitoring

## 📄 License

This project is for demonstration purposes. Feel free to use as a starting point for your own multi-tenant SaaS applications.

---

**Built with ❤️ using Next.js, React, and modern web technologies.**