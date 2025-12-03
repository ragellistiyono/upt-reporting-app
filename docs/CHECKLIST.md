# 📋 UPT Reporting System - Implementation Checklist

## ✅ Phase 1: Project Initialization (COMPLETED)

- [x] Create Next.js project with TypeScript and App Router
- [x] Install Appwrite Web SDK
- [x] Install Appwrite Node.js Server SDK
- [x] Configure Appwrite client (`src/lib/appwrite.ts`)
- [x] Create environment configuration files
- [x] Create database setup script
- [x] Create user creation script
- [x] Write comprehensive documentation
- [x] Create TypeScript type definitions
- [x] Create constants file

**Completion Date**: November 17, 2025

---

## 🔧 Phase 2: Appwrite Backend Setup (TO DO)

### 2.1 Appwrite Project Setup
- [ ] Create Appwrite project at cloud.appwrite.io
- [ ] Copy Project ID
- [ ] Add web platform (hostname: localhost)
- [ ] Generate API Key with proper scopes
- [ ] Update `.env.local` with credentials

### 2.2 Database Configuration
- [ ] Run `node scripts/setup-appwrite.js`
- [ ] Verify database `db_kinerja_upt` exists
- [ ] Verify collection `submissions` exists
- [ ] Verify all 8 attributes are created

### 2.3 Permissions Configuration
- [ ] Open Appwrite Console → Databases → submissions
- [ ] Enable Document Security
- [ ] Set Read permission: `label:admin`
- [ ] Set Create permission: `label:upt_user`
- [ ] Set Update permission: `label:admin`
- [ ] Set Delete permission: `label:admin`

### 2.4 User Creation
- [ ] Run `node scripts/create-users.js`
- [ ] Create admin user (email: admin@pln.com)
- [ ] Add `admin` label to admin user
- [ ] Create UPT users (6 total)
- [ ] Add `upt_user` label to each UPT user
- [ ] Add UPT name to preferences for each UPT user

### 2.5 Testing
- [ ] Verify users exist in Appwrite Console
- [ ] Verify labels are correctly assigned
- [ ] Verify UPT users have `upt_name` in preferences
- [ ] Test login with admin credentials
- [ ] Test login with UPT user credentials

**Estimated Time**: 30-45 minutes

---

## 🎨 Phase 3: Frontend - Authentication (WEEK 1)

### 3.1 Authentication Context
- [ ] Create `src/contexts/AuthContext.tsx`
- [ ] Implement user state management
- [ ] Add login function
- [ ] Add logout function
- [ ] Add session persistence
- [ ] Handle authentication errors

### 3.2 Login Page
- [ ] Create `src/app/login/page.tsx`
- [ ] Build login form UI
- [ ] Add email/password inputs
- [ ] Implement form validation
- [ ] Connect to Appwrite authentication
- [ ] Add loading states
- [ ] Add error messages
- [ ] Redirect to dashboard after login

### 3.3 Protected Routes
- [ ] Create `src/components/ProtectedRoute.tsx`
- [ ] Check authentication status
- [ ] Redirect to login if not authenticated
- [ ] Check user role for admin routes

### 3.4 Layout & Navigation
- [ ] Update `src/app/layout.tsx`
- [ ] Create navigation component
- [ ] Add user menu (with logout)
- [ ] Show user info (name, role, UPT)
- [ ] Make navigation responsive

**Estimated Time**: 2-3 days

---

## 📝 Phase 4: Frontend - UPT User Features (WEEK 2)

### 4.1 Submission Form
- [ ] Create `src/app/submit/page.tsx`
- [ ] Create form component
- [ ] Add indicator type dropdown
- [ ] Add conditional sub-category field
  - [ ] Show only when "INFLUENCER DAN SMR" is selected
- [ ] Add date picker for submission date
- [ ] Add title input
- [ ] Add narasi textarea (max 5000 chars)
- [ ] Add documentation link input
- [ ] Implement form validation
- [ ] Auto-populate UPT name from user prefs
- [ ] Submit to Appwrite with proper permissions
- [ ] Show success/error messages
- [ ] Reset form after successful submission

### 4.2 UPT Dashboard
- [ ] Create `src/app/dashboard/page.tsx`
- [ ] Fetch user's own submissions
- [ ] Display submissions in a table
- [ ] Show: date, indicator type, title, status
- [ ] Add "New Submission" button
- [ ] Add empty state (no submissions yet)
- [ ] Add loading state
- [ ] Add error handling

### 4.3 Testing
- [ ] Test form validation
- [ ] Test submission creation
- [ ] Test that UPT user only sees own submissions
- [ ] Test sub-category conditional display
- [ ] Test all indicator types
- [ ] Test date picker
- [ ] Test URL validation

**Estimated Time**: 3-4 days

---

## 👨‍💼 Phase 5: Frontend - Admin Features (WEEK 3)

### 5.1 Admin Dashboard
- [ ] Create `src/app/admin/page.tsx`
- [ ] Fetch all submissions from all UPTs
- [ ] Display in a comprehensive table
- [ ] Show: UPT, date, indicator, title, status
- [ ] Add sorting functionality
- [ ] Add pagination (10 items per page)
- [ ] Restrict access to admin role only

### 5.2 Filtering System
- [ ] Create filter panel component
- [ ] Add UPT filter (dropdown)
- [ ] Add indicator type filter (dropdown)
- [ ] Add date range filter (from/to)
- [ ] Add search box (title/narasi)
- [ ] Implement filter logic
- [ ] Show active filter count
- [ ] Add "Clear Filters" button

### 5.3 Excel Export
- [ ] Install xlsx library (`npm install xlsx`)
- [ ] Create export utility function
- [ ] Add "Export to Excel" button
- [ ] Export filtered data (respect current filters)
- [ ] Format columns properly
- [ ] Include all relevant fields
- [ ] Generate filename with timestamp

### 5.4 CRUD Operations (Admin Only)
- [ ] Add "View Details" modal
- [ ] Add "Edit" functionality (optional)
- [ ] Add "Delete" button
- [ ] Add delete confirmation dialog
- [ ] Update permissions check

### 5.5 Testing
- [ ] Test that admin sees all submissions
- [ ] Test UPT filter
- [ ] Test indicator filter
- [ ] Test date range filter
- [ ] Test search functionality
- [ ] Test Excel export
- [ ] Test delete functionality
- [ ] Test that non-admin cannot access

**Estimated Time**: 4-5 days

---

## 🎨 Phase 6: UI/UX Polish (WEEK 4)

### 6.1 UI Components
- [ ] Create reusable button component
- [ ] Create input field component
- [ ] Create select/dropdown component
- [ ] Create card component
- [ ] Create modal component
- [ ] Create loading spinner component
- [ ] Create toast notification component

### 6.2 Styling
- [ ] Apply consistent color scheme
- [ ] Add PLN branding colors
- [ ] Ensure responsive design (mobile-friendly)
- [ ] Add hover/focus states
- [ ] Improve form layouts
- [ ] Add icons (consider Heroicons or Lucide)
- [ ] Add empty states with illustrations

### 6.3 User Experience
- [ ] Add loading states for all async operations
- [ ] Add error boundaries
- [ ] Add 404 page
- [ ] Add success notifications
- [ ] Add error notifications
- [ ] Add form auto-save (draft functionality)
- [ ] Add keyboard shortcuts (optional)

### 6.4 Performance
- [ ] Optimize images
- [ ] Add lazy loading for dashboard
- [ ] Implement debounce for search
- [ ] Add request caching where appropriate
- [ ] Test page load times

### 6.5 Accessibility
- [ ] Add proper ARIA labels
- [ ] Ensure keyboard navigation works
- [ ] Test with screen readers
- [ ] Check color contrast ratios
- [ ] Add skip to content link

**Estimated Time**: 3-4 days

---

## 🧪 Phase 7: Testing & QA

### 7.1 Functional Testing
- [ ] Test all user flows (admin and UPT user)
- [ ] Test form validation edge cases
- [ ] Test permission boundaries
- [ ] Test error handling
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices

### 7.2 Security Testing
- [ ] Verify permissions are enforced
- [ ] Test that UPT users cannot access admin routes
- [ ] Test that UPT users cannot see other UPT data
- [ ] Verify API keys are not exposed
- [ ] Test XSS prevention
- [ ] Test CSRF protection

### 7.3 Performance Testing
- [ ] Test with large datasets (100+ submissions)
- [ ] Check page load times
- [ ] Check filter performance
- [ ] Test export with large datasets

**Estimated Time**: 2-3 days

---

## 🚀 Phase 8: Deployment

### 8.1 Pre-Deployment
- [ ] Run production build locally
- [ ] Fix any build warnings/errors
- [ ] Update environment variables for production
- [ ] Add production domain to Appwrite platforms
- [ ] Test production build locally

### 8.2 Deploy to Vercel
- [ ] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Configure environment variables in Vercel
- [ ] Deploy
- [ ] Verify deployment works
- [ ] Test production URL

### 8.3 Post-Deployment
- [ ] Update Appwrite platform with production URL
- [ ] Test authentication on production
- [ ] Test submission creation on production
- [ ] Test admin dashboard on production
- [ ] Test Excel export on production
- [ ] Monitor for errors

### 8.4 Documentation
- [ ] Update README with production URL
- [ ] Create user manual for UPT users
- [ ] Create admin manual
- [ ] Document deployment process
- [ ] Create troubleshooting guide

**Estimated Time**: 1-2 days

---

## 📊 Progress Summary

| Phase | Status | Estimated Time | Actual Time |
|-------|--------|----------------|-------------|
| 1. Project Init | ✅ Complete | 2-3 hours | ✅ |
| 2. Appwrite Setup | ⏳ Pending | 30-45 min | - |
| 3. Authentication | ⏳ Pending | 2-3 days | - |
| 4. UPT Features | ⏳ Pending | 3-4 days | - |
| 5. Admin Features | ⏳ Pending | 4-5 days | - |
| 6. UI/UX Polish | ⏳ Pending | 3-4 days | - |
| 7. Testing | ⏳ Pending | 2-3 days | - |
| 8. Deployment | ⏳ Pending | 1-2 days | - |

**Total Estimated Time**: 3-4 weeks

---

## 🎯 Next Action Items

1. **Immediate** (Today):
   - [ ] Complete Appwrite backend setup (Phase 2)
   - [ ] Test user login manually

2. **This Week**:
   - [ ] Build authentication system (Phase 3)
   - [ ] Start submission form (Phase 4)

3. **Next Week**:
   - [ ] Complete UPT features
   - [ ] Start admin dashboard

---

## 📞 Support Resources

- [Quick Start Guide](./QUICKSTART.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [Permissions Guide](./PERMISSIONS.md)
- [Project Summary](./PROJECT_SUMMARY.md)
- [Appwrite Docs](https://appwrite.io/docs)
- [Next.js Docs](https://nextjs.org/docs)

---

**Last Updated**: November 17, 2025
