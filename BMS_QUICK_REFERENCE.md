# BMS Quick Reference Card

**Last Updated:** November 5, 2025  
**Status:** Post-Analysis - Implementation Ready

---

## 📊 PROJECT STATUS AT A GLANCE

| Category | Status | Completion |
|----------|--------|------------|
| **Infrastructure** | 🟡 Partial | 60% |
| **Authentication** | 🟢 Good | 85% |
| **Accounting** | 🟡 Partial | 40% |
| **Invoicing** | 🟡 Partial | 50% |
| **CRM** | 🟡 Partial | 45% |
| **Banking** | 🔴 Minimal | 20% |
| **Payments** | 🔴 Minimal | 15% |
| **Integrations** | 🔴 Minimal | 10% |
| **Mobile** | 🟡 Partial | 30% |
| **Analytics** | 🟡 Partial | 35% |
| **OVERALL** | 🟡 | **~38%** |

---

## 🎯 TOP 5 PRIORITIES

### 1. Enable Redis Caching ⚡
**Time:** 4 hours | **Impact:** HIGH  
**Why:** Performance and scalability  
**File:** `bms/api-gateway/src/app.module.ts`

### 2. Complete Journal Entries 📊
**Time:** 8 hours | **Impact:** CRITICAL  
**Why:** Core accounting functionality  
**File:** `bms/api-gateway/src/accounting/services/journal-entry.service.ts`

### 3. Set Up Database Backups 💾
**Time:** 4 hours | **Impact:** CRITICAL  
**Why:** Data protection  
**File:** `scripts/backup-database.sh`

### 4. Integrate Stripe Payments 💳
**Time:** 6 hours | **Impact:** HIGH  
**Why:** Revenue generation  
**File:** `bms/api-gateway/src/payments/providers/stripe.service.ts`

### 5. Add Environment Validation ✅
**Time:** 2 hours | **Impact:** HIGH  
**Why:** Prevent runtime errors  
**File:** `bms/api-gateway/src/config/env.validation.ts`

---

## 🚀 QUICK START COMMANDS

### Development
```bash
# Start backend
cd bms/api-gateway
npm run start:dev

# Start frontend
cd bms-web
npm run dev

# Start mobile
cd bms/mobile
npm start
```

### Testing
```bash
# Run tests
npm test

# Check for mocks
node scripts/verify-no-mocks.js

# Lint code
npm run lint
```

### Database
```bash
# Backup
./scripts/backup-database.sh

# Restore
./scripts/restore-database.sh <backup-file>

# Run migrations
npm run typeorm migration:run
```

---

## 📁 KEY FILES TO KNOW

### Configuration
- `bms/api-gateway/.env` - Backend config
- `bms-web/.env.local` - Frontend config
- `bms/api-gateway/src/app.module.ts` - Main module

### Core Services
- `bms/api-gateway/src/accounting/accounting.service.ts`
- `bms/api-gateway/src/invoices/invoices.service.ts`
- `bms/api-gateway/src/crm/crm.service.ts`
- `bms/api-gateway/src/auth/auth.service.ts`

### Database
- `bms/api-gateway/src/database/schema.sql` - Schema
- `bms/api-gateway/src/migrations/` - Migrations

---

## 🔧 COMMON TASKS

### Add a New Module
```bash
cd bms/api-gateway
nest g module <name>
nest g controller <name>
nest g service <name>
```

### Create a Migration
```bash
npm run typeorm migration:generate -- -n <MigrationName>
npm run typeorm migration:run
```

### Add a New API Endpoint
```typescript
// In controller
@Get('endpoint')
@RequirePermissions('resource:read')
async getEndpoint(@GetCompany() companyId: string) {
  return this.service.getData(companyId);
}
```

### Add Caching
```typescript
@Injectable()
export class MyService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}
  
  async getData(key: string) {
    const cached = await this.cache.get(key);
    if (cached) return cached;
    
    const data = await this.fetchData();
    await this.cache.set(key, data, 600); // 10 min
    return data;
  }
}
```

---

## 🐛 TROUBLESHOOTING

### Redis Connection Failed
```bash
# Check if Redis is running
redis-cli ping

# Start Redis
redis-server

# Or with Docker
docker run -d -p 6379:6379 redis
```

### Database Connection Failed
```bash
# Check PostgreSQL
psql -c "SELECT version();"

# Check connection string
echo $DATABASE_URL
```

### Port Already in Use
```bash
# Find process
lsof -i :3001

# Kill process
kill -9 <PID>
```

### TypeScript Errors
```bash
# Clean build
rm -rf dist
npm run build

# Check types
npx tsc --noEmit
```

---

## 📊 MONITORING ENDPOINTS

### Health Check
```bash
curl http://localhost:3001/api/v1/health
```

### Metrics (Prometheus)
```bash
curl http://localhost:3001/metrics
```

### API Docs
```
http://localhost:3001/api/docs
```

---

## 🔐 SECURITY CHECKLIST

- [ ] JWT_SECRET is strong and unique
- [ ] Database credentials are secure
- [ ] API keys are in environment variables
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is active
- [ ] SQL injection protection (TypeORM)
- [ ] XSS protection (Helmet)
- [ ] HTTPS in production
- [ ] Audit logging is enabled

---

## 📈 PERFORMANCE TARGETS

| Metric | Target | Current |
|--------|--------|---------|
| API Response Time (p95) | < 200ms | ~300ms |
| Database Query Time (p95) | < 50ms | ~100ms |
| Cache Hit Rate | > 70% | N/A |
| Uptime | > 99.9% | TBD |
| Error Rate | < 0.1% | TBD |

---

## 🎓 LEARNING RESOURCES

### NestJS
- Docs: https://docs.nestjs.com
- Best Practices: https://docs.nestjs.com/fundamentals

### TypeORM
- Docs: https://typeorm.io
- Migrations: https://typeorm.io/migrations

### Next.js
- Docs: https://nextjs.org/docs
- App Router: https://nextjs.org/docs/app

### Stripe
- API Docs: https://stripe.com/docs/api
- Webhooks: https://stripe.com/docs/webhooks

---

## 🔗 USEFUL LINKS

### Project Documents
- [Comprehensive Analysis](./BMS_COMPREHENSIVE_FEATURE_ANALYSIS.md)
- [Immediate Action Plan](./BMS_IMMEDIATE_ACTION_PLAN.md)
- [Next Steps Summary](./BMS_NEXT_STEPS_SUMMARY.md)

### External Services
- Stripe Dashboard: https://dashboard.stripe.com
- Railway Dashboard: https://railway.app
- GitHub Repo: [Your repo URL]

---

## 📞 CONTACTS

### Team
- **Tech Lead:** [Name]
- **Backend Dev:** [Name]
- **Frontend Dev:** [Name]
- **DevOps:** [Name]

### Support
- **Slack:** #bms-dev
- **Email:** dev@bms.com
- **Docs:** https://docs.bms.com

---

## ✅ DAILY CHECKLIST

### Morning
- [ ] Pull latest changes
- [ ] Check CI/CD status
- [ ] Review open PRs
- [ ] Check error logs

### During Development
- [ ] Write tests
- [ ] Update documentation
- [ ] Follow coding standards
- [ ] Test locally

### Before Commit
- [ ] Run linter
- [ ] Run tests
- [ ] Check for console.logs
- [ ] Update CHANGELOG

### End of Day
- [ ] Push changes
- [ ] Update task status
- [ ] Document blockers
- [ ] Plan tomorrow

---

## 🎯 WEEK 1 GOALS

### Monday-Tuesday
- ✅ Fix controller routes (DONE)
- 🔄 Enable Redis caching
- 🔄 Add environment validation

### Wednesday-Thursday
- 🔄 Complete journal entries
- 🔄 Set up database backups
- 🔄 Add database indexes

### Friday
- 🔄 Integrate Stripe
- 🔄 Test everything
- 🔄 Update documentation

---

## 💡 PRO TIPS

### Development
- Use `npm run start:dev` for hot reload
- Use Postman collections for API testing
- Keep `.env.example` updated
- Write tests as you code

### Git Workflow
- Branch naming: `feature/description` or `fix/description`
- Commit messages: Use conventional commits
- PR template: Fill out completely
- Code review: Be thorough

### Performance
- Use database indexes wisely
- Cache expensive queries
- Paginate large datasets
- Use lazy loading

### Security
- Never commit secrets
- Validate all inputs
- Use parameterized queries
- Keep dependencies updated

---

## 🚨 EMERGENCY CONTACTS

### Production Issues
1. Check health endpoint
2. Check error logs
3. Check database connection
4. Check Redis connection
5. Rollback if needed

### Rollback Procedure
```bash
# Revert to previous version
git revert <commit>

# Or restore database
./scripts/restore-database.sh <backup-file>

# Restart services
pm2 restart all
```

---

**Keep this card handy for quick reference! 📌**
