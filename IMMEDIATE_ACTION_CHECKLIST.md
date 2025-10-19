# ✅ IMMEDIATE ACTION CHECKLIST - BMS

**Priority**: Fix 2FA + Start CRM Frontend  
**Timeline**: This Week (5 days)

---

## 🔴 DAY 1: Fix 2FA Implementation

### Morning (4 hours)
- [ ] Update `bms/api-gateway/src/auth/entities/user.entity.ts`
  - Add `twoFactorSecret` column
  - Add `twoFactorEnabled` column
  - Add `twoFactorTempSecret` column
  - Add `twoFactorBackupCodes` column (jsonb)

- [ ] Create migration `bms/api-gateway/src/migrations/[timestamp]-AddTwoFactorFields.ts`
  - Add all 4 columns
  - Test migration up/down

- [ ] Install dependencies
  ```bash
  cd bms/api-gateway
  npm install speakeasy qrcode
  npm install -D @types/speakeasy @types/qrcode
  ```

### Afternoon (4 hours)
- [ ] Create `bms/api-gateway/src/auth/dto/two-factor.dto.ts`
  - Enable2FADto
  - Verify2FADto
  - Disable2FADto

- [ ] Create `bms/api-gateway/src/auth/two-factor.controller.ts`
  - GET /auth/2fa/generate
  - POST /auth/2fa/enable
  - POST /auth/2fa/verify
  - POST /auth/2fa/disable

- [ ] Update `bms/api-gateway/src/auth/auth.module.ts`
  - Add TwoFactorController
  - Add TwoFactorService to providers

- [ ] Test 2FA backend with Postman/Insomnia

---

## 🔴 DAY 2: 2FA Frontend + Testing

### Morning (4 hours)
- [ ] Create `bms-web/src/app/settings/security/page.tsx`
  - QR code display
  - Token input
  - Backup codes display
  - Disable 2FA form

- [ ] Install frontend dependencies
  ```bash
  cd bms-web
  npm install @stripe/stripe-js @stripe/react-stripe-js
  ```

### Afternoon (4 hours)
- [ ] Create `bms/api-gateway/src/auth/guards/two-factor.guard.ts`
  - Check if 2FA enabled
  - Verify token from header
  - Allow/deny access

- [ ] Test complete 2FA flow
  - Generate QR code
  - Scan with Google Authenticator
  - Enable 2FA
  - Login with 2FA
  - Use backup code
  - Disable 2FA

- [ ] Document 2FA setup in README

---

## 🟡 DAY 3: CRM Contacts List

### Morning (4 hours)
- [ ] Create `bms-web/src/app/crm/contacts/page.tsx`
  - Search input
  - Type filter dropdown
  - Status filter dropdown
  - Data table with columns
  - "New Contact" button

- [ ] Create API route `bms-web/src/pages/api/crm/contacts.ts`
  - Proxy to backend
  - Handle authentication

### Afternoon (4 hours)
- [ ] Style contacts list page
  - Responsive design
  - Loading states
  - Empty state
  - Pagination

- [ ] Test contacts list
  - Search functionality
  - Filters
  - Click to detail page

---

## 🟡 DAY 4: CRM Contact Detail

### Morning (4 hours)
- [ ] Create `bms-web/src/app/crm/contacts/[id]/page.tsx`
  - Contact header with name/type/status
  - Info cards (email, phone, address)
  - Tabs (info, activities, opportunities)
  - Edit button

### Afternoon (4 hours)
- [ ] Implement tabs content
  - Info tab: all contact fields
  - Activities tab: timeline
  - Opportunities tab: list

- [ ] Create API routes
  - GET /api/crm/contacts/[id]
  - GET /api/crm/contacts/[id]/activities
  - GET /api/crm/contacts/[id]/opportunities

- [ ] Test contact detail page

---

## 🟡 DAY 5: CRM Contact Form

### Morning (4 hours)
- [ ] Create `bms-web/src/app/crm/contacts/new/page.tsx`
  - Type selector
  - General info section
  - Contact section
  - Address section
  - Notes section

### Afternoon (4 hours)
- [ ] Implement form validation
  - Required fields
  - Email format
  - Phone format

- [ ] Create API route POST /api/crm/contacts
  - Validate data
  - Call backend
  - Redirect to detail page

- [ ] Test contact creation flow
  - Create new contact
  - Verify in list
  - Check detail page

- [ ] Create edit page (copy of new page with pre-filled data)

---

## 📊 END OF WEEK DELIVERABLES

### Backend
✅ 2FA fully functional
✅ User entity updated
✅ Migration applied
✅ All endpoints tested

### Frontend
✅ 2FA settings page working
✅ CRM contacts list page
✅ CRM contact detail page
✅ CRM contact form (new/edit)

### Testing
✅ 2FA flow tested end-to-end
✅ CRM CRUD operations tested
✅ All pages responsive

---

## 🚀 WEEK 2 PREVIEW

### Monday-Tuesday: CRM Dashboard + Activities
- Create CRM dashboard with KPIs
- Implement activity timeline component
- Add activity creation form

### Wednesday-Thursday: CRM Import + Polish
- CSV import UI
- Duplicate detection
- Contact merge UI
- Polish all CRM pages

### Friday: Testing + Documentation
- Write tests for CRM module
- Update API documentation
- Create user guide for CRM

---

## 📝 NOTES

### Dependencies to Install
```bash
# Backend
cd bms/api-gateway
npm install speakeasy qrcode
npm install -D @types/speakeasy @types/qrcode

# Frontend
cd bms-web
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### Environment Variables to Add
```env
# bms/api-gateway/.env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
BUDGET_INSIGHT_CLIENT_ID=...
BUDGET_INSIGHT_CLIENT_SECRET=...
```

### Database Migrations to Run
```bash
cd bms/api-gateway
npm run typeorm migration:run
```

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/2fa-implementation

# Commit frequently
git add .
git commit -m "feat: add 2FA user entity fields"

# Push and create PR
git push origin feature/2fa-implementation
```

---

## ⚠️ BLOCKERS TO WATCH

1. **Missing Dependencies**: Install immediately if build fails
2. **Database Connection**: Ensure PostgreSQL is running
3. **API Keys**: Get test keys for Stripe/Budget Insight
4. **CORS Issues**: Configure properly for local development

---

## 🎯 SUCCESS CRITERIA

- [ ] Can enable 2FA on user account
- [ ] Can scan QR code with authenticator app
- [ ] Can login with 2FA code
- [ ] Can use backup code
- [ ] Can disable 2FA
- [ ] Can create new contact
- [ ] Can view contact list
- [ ] Can view contact details
- [ ] Can edit contact
- [ ] Can search/filter contacts

---

**Focus**: Complete these 5 days of work to unlock the next phase of development. Every item checked brings BMS closer to 100% completion!
