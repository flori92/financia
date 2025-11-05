# BMS - Immediate Implementation Guide

## Week 1: Quick Wins & Critical Fixes

### Day 1: Fix usePermissions Hook

**Current Issue:** The hook uses localStorage instead of fetching from backend.

**File:** `bms-web/src/hooks/usePermissions.ts`

```typescript
"use client";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api-client";

export function usePermissions() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const user = await apiClient.get('/api/v1/auth/me');
        setUserRole(user.role);
        setPermissions(user.permissions || []);
      } catch (error) {
        console.error('Failed to fetch permissions', error);
        // Fallback to localStorage
        const role = window.localStorage.getItem("user_role") || "user";
        setUserRole(role);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some((perm) => permissions.includes(perm));
  };

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every((perm) => permissions.includes(perm));
  };

  return {
    userRole,
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin: () => userRole === "admin",
    isManager: () => userRole === "manager",
    isAccountant: () => userRole === "accountant",
  };
}
```

**Backend Endpoint Needed:**

```typescript
// File: bms/api-gateway/src/auth/auth.controller.ts
@Get('me')
@UseGuards(JwtAuthGuard)
async getMe(@Request() req) {
  const user = await this.authService.findUserById(req.user.id);
  const permissions = await this.rbacService.getUserPermissions(req.user.id);
  
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    companyId: user.companyId,
    permissions: permissions.map(p => `${p.resource}:${p.action}`),
  };
}
```


### Day 2: Implement Redis Caching

**Step 1: Install Dependencies**

```bash
cd bms/api-gateway
npm install @nestjs/cache-manager cache-manager cache-manager-redis-store redis
```

**Step 2: Create Cache Module**

```typescript
// File: bms/api-gateway/src/common/cache/cache.module.ts
import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { CacheService } from './cache.service';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: redisStore,
        host: config.get('REDIS_HOST', 'localhost'),
        port: config.get('REDIS_PORT', 6379),
        ttl: 300, // 5 minutes default
      }),
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
```

**Step 3: Create Cache Service**

```typescript
// File: bms/api-gateway/src/common/cache/cache.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }

  // Helper to generate cache keys
  generateKey(prefix: string, ...parts: any[]): string {
    return `${prefix}:${parts.join(':')}`;
  }
}
```

**Step 4: Use Cache in Services**

```typescript
// File: bms/api-gateway/src/companies/companies.service.ts
@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepo: Repository<Company>,
    private cacheService: CacheService,
  ) {}

  async findOne(id: string): Promise<Company> {
    const cacheKey = this.cacheService.generateKey('company', id);
    
    // Try cache first
    const cached = await this.cacheService.get<Company>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const company = await this.companiesRepo.findOne({ where: { id } });
    
    // Cache for 10 minutes
    if (company) {
      await this.cacheService.set(cacheKey, company, 600);
    }

    return company;
  }

  async update(id: string, updateDto: UpdateCompanyDto): Promise<Company> {
    const company = await this.companiesRepo.save({ id, ...updateDto });
    
    // Invalidate cache
    const cacheKey = this.cacheService.generateKey('company', id);
    await this.cacheService.del(cacheKey);

    return company;
  }
}
```

