# 🚀 BMS IMPLEMENTATION ROADMAP - DETAILED ACTION PLAN

**Date**: 19 October 2025  
**Status**: Post-2FA Implementation Analysis  
**Current Completion**: 92% → Target: 100%

---

## 📊 EXECUTIVE SUMMARY

### Recent Progress
✅ **2FA Service Implemented** - `two-factor.service.ts` created with:
- TOTP generation with QR codes
- Backup codes (10 per user)
- Enable/disable with password verification
- Verification with backup code fallback

### Critical Finding
⚠️ **User Entity Missing 2FA Fields** - The 2FA service references fields that don't exist in `user.entity.ts`:
- `twoFactorSecret`
- `twoFactorEnabled`
- `twoFactorTempSecret`
- `twoFactorBackupCodes`

### Architecture Assessment
**Strengths**:
- ✅ 25 backend modules well-structured
- ✅ Complete SYSCOHADA accounting
- ✅ Multi-tenant with proper isolation
- ✅ Comprehensive CRM backend (90% complete)
- ✅ Banking reconciliation working (CSV import)

**Critical Gaps**:
- 🔴 User entity needs 2FA fields + migration
- 🔴 2FA controller/endpoints missing
- 🔴 CRM frontend incomplete (only opportunities, no contacts)
- 🔴 No real banking API integrations
- 🔴 No payment gateway integrations
- 🔴 Test coverage at 10%

---

## 🎯 PHASE 1: COMPLETE 2FA IMPLEMENTATION (Week 1)

### Priority 1.1: Fix User Entity & Database


**File**: `bms/api-gateway/src/auth/entities/user.entity.ts`

**Add these columns**:
```typescript
@Column({ name: 'two_factor_secret', nullable: true })
twoFactorSecret: string | null;

@Column({ name: 'two_factor_enabled', default: false })
twoFactorEnabled: boolean;

@Column({ name: 'two_factor_temp_secret', nullable: true })
twoFactorTempSecret: string | null;

@Column({ name: 'two_factor_backup_codes', type: 'jsonb', nullable: true })
twoFactorBackupCodes: string[] | null;
```

**Create Migration**: `bms/api-gateway/src/migrations/[timestamp]-AddTwoFactorFields.ts`
```typescript
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTwoFactorFields1729300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', new TableColumn({
      name: 'two_factor_secret',
      type: 'varchar',
      isNullable: true,
    }));
    
    await queryRunner.addColumn('users', new TableColumn({
      name: 'two_factor_enabled',
      type: 'boolean',
      default: false,
    }));
    
    await queryRunner.addColumn('users', new TableColumn({
      name: 'two_factor_temp_secret',
      type: 'varchar',
      isNullable: true,
    }));
    
    await queryRunner.addColumn('users', new TableColumn({
      name: 'two_factor_backup_codes',
      type: 'jsonb',
      isNullable: true,
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'two_factor_backup_codes');
    await queryRunner.dropColumn('users', 'two_factor_temp_secret');
    await queryRunner.dropColumn('users', 'two_factor_enabled');
    await queryRunner.dropColumn('users', 'two_factor_secret');
  }
}
```

### Priority 1.2: Install Missing Dependencies

**File**: `bms/api-gateway/package.json`

```bash
cd bms/api-gateway
npm install speakeasy qrcode
npm install -D @types/speakeasy @types/qrcode
```

### Priority 1.3: Create 2FA DTOs

**File**: `bms/api-gateway/src/auth/dto/two-factor.dto.ts`
```typescript
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class Enable2FADto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  token: string;
}

export class Verify2FADto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class Disable2FADto {
  @IsString()
  @IsNotEmpty()
  password: string;
}
```

### Priority 1.4: Create 2FA Controller

**File**: `bms/api-gateway/src/auth/two-factor.controller.ts`
```typescript
import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TwoFactorService } from './services/two-factor.service';
import { Enable2FADto, Verify2FADto, Disable2FADto } from './dto/two-factor.dto';

@Controller('auth/2fa')
@UseGuards(JwtAuthGuard)
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @Get('generate')
  async generateSecret(@Request() req) {
    return this.twoFactorService.generateSecret(req.user.id);
  }

  @Post('enable')
  async enable(@Request() req, @Body() dto: Enable2FADto) {
    return this.twoFactorService.enable(req.user.id, dto.token);
  }

  @Post('verify')
  async verify(@Request() req, @Body() dto: Verify2FADto) {
    const isValid = await this.twoFactorService.verify(req.user.id, dto.token);
    return { valid: isValid };
  }

  @Post('disable')
  async disable(@Request() req, @Body() dto: Disable2FADto) {
    await this.twoFactorService.disable(req.user.id, dto.password);
    return { message: '2FA désactivé avec succès' };
  }
}
```

### Priority 1.5: Update Auth Module

**File**: `bms/api-gateway/src/auth/auth.module.ts`

Add to imports:
```typescript
import { TwoFactorService } from './services/two-factor.service';
import { TwoFactorController } from './two-factor.controller';
```

Add to module:
```typescript
controllers: [AuthController, TwoFactorController],
providers: [AuthService, JwtStrategy, LocalStrategy, TwoFactorService],
```

### Priority 1.6: Create 2FA Guard

**File**: `bms/api-gateway/src/auth/guards/two-factor.guard.ts`
```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TwoFactorService } from '../services/two-factor.service';

@Injectable()
export class TwoFactorGuard implements CanActivate {
  constructor(private twoFactorService: TwoFactorService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user.twoFactorEnabled) {
      return true; // 2FA not enabled, allow access
    }

    const token = request.headers['x-2fa-token'];
    if (!token) {
      throw new UnauthorizedException('2FA token required');
    }

    const isValid = await this.twoFactorService.verify(user.id, token);
    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA token');
    }

    return true;
  }
}
```

### Priority 1.7: Frontend 2FA Settings Page

**File**: `bms-web/src/app/settings/security/page.tsx`
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

export default function SecuritySettings() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');

  const generateQR = async () => {
    const res = await fetch('/api/auth/2fa/generate', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    setQrCode(data.qrCode);
  };

  const enable2FA = async () => {
    const res = await fetch('/api/auth/2fa/enable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ token })
    });
    const data = await res.json();
    setBackupCodes(data.backupCodes);
    setQrCode(null);
  };

  const disable2FA = async () => {
    await fetch('/api/auth/2fa/disable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ password })
    });
    setPassword('');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Sécurité - Authentification à deux facteurs</h1>
      
      <Card className="p-6">
        {!qrCode && backupCodes.length === 0 && (
          <div>
            <p className="mb-4">Activez l'authentification à deux facteurs pour sécuriser votre compte.</p>
            <Button onClick={generateQR}>Activer 2FA</Button>
          </div>
        )}

        {qrCode && (
          <div>
            <p className="mb-4">Scannez ce QR code avec votre application d'authentification:</p>
            <Image src={qrCode} alt="QR Code" width={200} height={200} />
            <Input
              type="text"
              placeholder="Code à 6 chiffres"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="mt-4 mb-4"
            />
            <Button onClick={enable2FA}>Confirmer</Button>
          </div>
        )}

        {backupCodes.length > 0 && (
          <div>
            <p className="mb-4 font-bold">Codes de secours (à conserver précieusement):</p>
            <ul className="mb-4">
              {backupCodes.map((code, i) => (
                <li key={i} className="font-mono">{code}</li>
              ))}
            </ul>
            <Button onClick={() => setBackupCodes([])}>Fermer</Button>
          </div>
        )}

        <div className="mt-6 pt-6 border-t">
          <h3 className="font-bold mb-4">Désactiver 2FA</h3>
          <Input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
          />
          <Button variant="destructive" onClick={disable2FA}>Désactiver</Button>
        </div>
      </Card>
    </div>
  );
}
```

**Effort**: 2 days, 1 developer  
**Priority**: 🔴 CRITICAL

---

## 🎯 PHASE 2: COMPLETE CRM FRONTEND (Week 2-3)

### Priority 2.1: Create Contacts List Page

**File**: `bms-web/src/app/crm/contacts/page.tsx`


```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/table/data-table';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ type: '', status: '' });

  useEffect(() => {
    fetchContacts();
  }, [search, filter]);

  const fetchContacts = async () => {
    const params = new URLSearchParams({
      search,
      ...filter,
    });
    const res = await fetch(`/api/crm/contacts?${params}`);
    const data = await res.json();
    setContacts(data.contacts);
  };

  const columns = [
    { key: 'companyName', label: 'Entreprise' },
    { key: 'firstName', label: 'Prénom' },
    { key: 'lastName', label: 'Nom' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Téléphone' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Statut' },
    { key: 'lifetimeValue', label: 'Valeur', format: (v) => `${v} FCFA` },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contacts CRM</h1>
        <Link href="/crm/contacts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau contact
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search />}
          />
        </div>
        <select
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className="border rounded px-4"
        >
          <option value="">Tous les types</option>
          <option value="client">Client</option>
          <option value="prospect">Prospect</option>
          <option value="supplier">Fournisseur</option>
          <option value="partner">Partenaire</option>
        </select>
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="border rounded px-4"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
        </select>
      </div>

      <DataTable
        data={contacts}
        columns={columns}
        onRowClick={(contact) => window.location.href = `/crm/contacts/${contact.id}`}
      />
    </div>
  );
}
```

### Priority 2.2: Create Contact Detail Page

**File**: `bms-web/src/app/crm/contacts/[id]/page.tsx`
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Mail, Phone, MapPin } from 'lucide-react';

export default function ContactDetailPage() {
  const params = useParams();
  const [contact, setContact] = useState(null);
  const [activities, setActivities] = useState([]);
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    fetchContact();
    fetchActivities();
    fetchOpportunities();
  }, [params.id]);

  const fetchContact = async () => {
    const res = await fetch(`/api/crm/contacts/${params.id}`);
    const data = await res.json();
    setContact(data);
  };

  const fetchActivities = async () => {
    const res = await fetch(`/api/crm/contacts/${params.id}/activities`);
    const data = await res.json();
    setActivities(data);
  };

  const fetchOpportunities = async () => {
    const res = await fetch(`/api/crm/contacts/${params.id}/opportunities`);
    const data = await res.json();
    setOpportunities(data);
  };

  if (!contact) return <div>Chargement...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{contact.companyName || `${contact.firstName} ${contact.lastName}`}</h1>
          <p className="text-gray-600">{contact.type} - {contact.status}</p>
        </div>
        <Button>
          <Edit className="mr-2 h-4 w-4" />
          Modifier
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-4 w-4" />
            <span className="font-semibold">Email</span>
          </div>
          <p>{contact.email || 'Non renseigné'}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="h-4 w-4" />
            <span className="font-semibold">Téléphone</span>
          </div>
          <p>{contact.phone || 'Non renseigné'}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4" />
            <span className="font-semibold">Adresse</span>
          </div>
          <p>{contact.city || 'Non renseigné'}</p>
        </Card>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="activities">Activités ({activities.length})</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunités ({opportunities.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold">Position</label>
                <p>{contact.position || '-'}</p>
              </div>
              <div>
                <label className="font-semibold">Site web</label>
                <p>{contact.website || '-'}</p>
              </div>
              <div>
                <label className="font-semibold">NIF</label>
                <p>{contact.taxId || '-'}</p>
              </div>
              <div>
                <label className="font-semibold">Valeur vie client</label>
                <p>{contact.lifetimeValue} FCFA</p>
              </div>
            </div>
            <div className="mt-4">
              <label className="font-semibold">Notes</label>
              <p className="mt-2">{contact.notes || 'Aucune note'}</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card className="p-6">
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="border-l-4 border-blue-500 pl-4">
                  <p className="font-semibold">{activity.type}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-400">{new Date(activity.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities">
          <Card className="p-6">
            <div className="space-y-4">
              {opportunities.map((opp) => (
                <div key={opp.id} className="border rounded p-4">
                  <h3 className="font-semibold">{opp.title}</h3>
                  <p className="text-sm">{opp.amount} FCFA - {opp.stage}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Priority 2.3: Create Contact Form Page

**File**: `bms-web/src/app/crm/contacts/new/page.tsx`
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function NewContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    type: 'client',
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    website: '',
    addressLine1: '',
    city: '',
    country: 'BJ',
    taxId: '',
    notes: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/crm/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/crm/contacts/${data.id}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Nouveau contact</h1>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Type de contact</h2>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full border rounded px-4 py-2"
          >
            <option value="client">Client</option>
            <option value="prospect">Prospect</option>
            <option value="supplier">Fournisseur</option>
            <option value="partner">Partenaire</option>
          </select>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Informations générales</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nom de l'entreprise"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
            <Input
              label="Position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />
            <Input
              label="Prénom"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            <Input
              label="Nom"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Contact</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Téléphone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Site web"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
            <Input
              label="NIF"
              value={formData.taxId}
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
            />
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Adresse</h2>
          <div className="space-y-4">
            <Input
              label="Adresse"
              value={formData.addressLine1}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ville"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <Input
                label="Pays"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Notes</h2>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
          />
        </Card>

        <div className="flex gap-4">
          <Button type="submit">Créer le contact</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}
```

### Priority 2.4: Create CRM Dashboard

**File**: `bms-web/src/app/crm/page.tsx`
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Users, TrendingUp, DollarSign, Activity } from 'lucide-react';
import Link from 'next/link';

export default function CRMDashboard() {
  const [stats, setStats] = useState({
    totalContacts: 0,
    activeOpportunities: 0,
    totalValue: 0,
    recentActivity: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await fetch('/api/crm/stats');
    const data = await res.json();
    setStats(data);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord CRM</h1>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Contacts</p>
              <p className="text-3xl font-bold">{stats.totalContacts}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Opportunités</p>
              <p className="text-3xl font-bold">{stats.activeOpportunities}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valeur pipeline</p>
              <p className="text-3xl font-bold">{stats.totalValue.toLocaleString()} FCFA</p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Activités (7j)</p>
              <p className="text-3xl font-bold">{stats.recentActivity}</p>
            </div>
            <Activity className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
          <div className="space-y-2">
            <Link href="/crm/contacts/new" className="block p-3 border rounded hover:bg-gray-50">
              + Nouveau contact
            </Link>
            <Link href="/crm/opportunities/new" className="block p-3 border rounded hover:bg-gray-50">
              + Nouvelle opportunité
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Activités récentes</h2>
          <p className="text-gray-600">Aucune activité récente</p>
        </Card>
      </div>
    </div>
  );
}
```

**Effort**: 1.5 weeks, 1 frontend developer  
**Priority**: 🔴 CRITICAL

---

## 🎯 PHASE 3: BANKING INTEGRATIONS (Week 4-5)

### Priority 3.1: Budget Insight Integration

**File**: `bms/api-gateway/src/integrations/banking/budget-insight/budget-insight.client.ts`


```typescript
import axios, { AxiosInstance } from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface BIConnection {
  id: number;
  id_user: number;
  id_connector: number;
  state: string;
  last_update: string;
}

export interface BIAccount {
  id: number;
  id_connection: number;
  number: string;
  name: string;
  balance: number;
  currency: string;
  type: string;
  iban: string;
}

export interface BITransaction {
  id: number;
  id_account: number;
  date: string;
  value: number;
  original_wording: string;
  simplified_wording: string;
  type: string;
  state: string;
}

@Injectable()
export class BudgetInsightClient {
  private readonly logger = new Logger(BudgetInsightClient.name);
  private readonly client: AxiosInstance;
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get('BUDGET_INSIGHT_URL', 'https://api.biapi.pro/2.0');
    this.clientId = this.configService.get('BUDGET_INSIGHT_CLIENT_ID');
    this.clientSecret = this.configService.get('BUDGET_INSIGHT_CLIENT_SECRET');

    this.client = axios.create({
      baseURL: this.baseUrl,
      auth: {
        username: this.clientId,
        password: this.clientSecret,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Create a user in Budget Insight
   */
  async createUser(email: string): Promise<{ id_user: number; token: string }> {
    try {
      const response = await this.client.post('/users', { email });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create BI user', error);
      throw error;
    }
  }

  /**
   * Get connection URL for bank authentication
   */
  async getConnectionUrl(userId: number, connectorId: number, redirectUri: string): Promise<string> {
    try {
      const response = await this.client.post(`/users/${userId}/connections`, {
        id_connector: connectorId,
        redirect_uri: redirectUri,
      });
      return response.data.redirect_url;
    } catch (error) {
      this.logger.error('Failed to get connection URL', error);
      throw error;
    }
  }

  /**
   * List all connections for a user
   */
  async getConnections(userId: number): Promise<BIConnection[]> {
    try {
      const response = await this.client.get(`/users/${userId}/connections`);
      return response.data.connections;
    } catch (error) {
      this.logger.error('Failed to get connections', error);
      throw error;
    }
  }

  /**
   * Get all accounts for a connection
   */
  async getAccounts(userId: number, connectionId: number): Promise<BIAccount[]> {
    try {
      const response = await this.client.get(`/users/${userId}/connections/${connectionId}/accounts`);
      return response.data.accounts;
    } catch (error) {
      this.logger.error('Failed to get accounts', error);
      throw error;
    }
  }

  /**
   * Get transactions for an account
   */
  async getTransactions(
    userId: number,
    accountId: number,
    minDate?: string,
    maxDate?: string,
  ): Promise<BITransaction[]> {
    try {
      const params: any = {};
      if (minDate) params.min_date = minDate;
      if (maxDate) params.max_date = maxDate;

      const response = await this.client.get(`/users/${userId}/accounts/${accountId}/transactions`, {
        params,
      });
      return response.data.transactions;
    } catch (error) {
      this.logger.error('Failed to get transactions', error);
      throw error;
    }
  }

  /**
   * Sync a connection (refresh data)
   */
  async syncConnection(userId: number, connectionId: number): Promise<void> {
    try {
      await this.client.put(`/users/${userId}/connections/${connectionId}`, {
        expand: 'accounts,transactions',
      });
    } catch (error) {
      this.logger.error('Failed to sync connection', error);
      throw error;
    }
  }

  /**
   * Delete a connection
   */
  async deleteConnection(userId: number, connectionId: number): Promise<void> {
    try {
      await this.client.delete(`/users/${userId}/connections/${connectionId}`);
    } catch (error) {
      this.logger.error('Failed to delete connection', error);
      throw error;
    }
  }

  /**
   * List available bank connectors
   */
  async getConnectors(country: string = 'BJ'): Promise<any[]> {
    try {
      const response = await this.client.get('/connectors', {
        params: { country },
      });
      return response.data.connectors;
    } catch (error) {
      this.logger.error('Failed to get connectors', error);
      throw error;
    }
  }
}
```

### Priority 3.2: Budget Insight Service

**File**: `bms/api-gateway/src/integrations/banking/budget-insight/budget-insight.service.ts`
```typescript
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BudgetInsightClient } from './budget-insight.client';
import { BankAccount } from '../../../banking/entities/bank-account.entity';
import { BankTransaction } from '../../../banking/entities/bank-transaction.entity';
import { BankConnection } from '../entities/bank-connection.entity';

@Injectable()
export class BudgetInsightService {
  private readonly logger = new Logger(BudgetInsightService.name);

  constructor(
    private readonly biClient: BudgetInsightClient,
    @InjectRepository(BankConnection)
    private connectionRepo: Repository<BankConnection>,
    @InjectRepository(BankAccount)
    private accountRepo: Repository<BankAccount>,
    @InjectRepository(BankTransaction)
    private transactionRepo: Repository<BankTransaction>,
  ) {}

  /**
   * Initialize bank connection for a company
   */
  async initConnection(companyId: string, userId: string, connectorId: number): Promise<string> {
    this.logger.log(`Initializing BI connection for company ${companyId}`);

    // Create or get BI user
    let connection = await this.connectionRepo.findOne({
      where: { companyId, provider: 'budget_insight' },
    });

    if (!connection) {
      const biUser = await this.biClient.createUser(`company-${companyId}@bms.local`);
      connection = this.connectionRepo.create({
        companyId,
        userId,
        provider: 'budget_insight',
        externalUserId: biUser.id_user.toString(),
        status: 'pending',
      });
      await this.connectionRepo.save(connection);
    }

    // Get connection URL
    const redirectUri = `${process.env.APP_URL}/api/integrations/banking/budget-insight/callback`;
    const connectionUrl = await this.biClient.getConnectionUrl(
      parseInt(connection.externalUserId),
      connectorId,
      redirectUri,
    );

    return connectionUrl;
  }

  /**
   * Handle OAuth callback and sync accounts
   */
  async handleCallback(companyId: string, connectionId: number): Promise<void> {
    this.logger.log(`Handling BI callback for company ${companyId}`);

    const connection = await this.connectionRepo.findOne({
      where: { companyId, provider: 'budget_insight' },
    });

    if (!connection) {
      throw new BadRequestException('Connection not found');
    }

    const biUserId = parseInt(connection.externalUserId);

    // Sync connection
    await this.biClient.syncConnection(biUserId, connectionId);

    // Get accounts
    const biAccounts = await this.biClient.getAccounts(biUserId, connectionId);

    // Save accounts
    for (const biAccount of biAccounts) {
      let account = await this.accountRepo.findOne({
        where: { companyId, externalId: biAccount.id.toString() },
      });

      if (!account) {
        account = this.accountRepo.create({
          companyId,
          name: biAccount.name,
          accountNumber: biAccount.number,
          iban: biAccount.iban,
          currency: biAccount.currency,
          openingBalance: biAccount.balance,
          isActive: true,
          provider: 'budget_insight',
          externalId: biAccount.id.toString(),
        });
      } else {
        account.name = biAccount.name;
        account.accountNumber = biAccount.number;
        account.iban = biAccount.iban;
      }

      await this.accountRepo.save(account);
    }

    // Update connection status
    connection.status = 'active';
    connection.externalConnectionId = connectionId.toString();
    await this.connectionRepo.save(connection);

    // Sync transactions
    await this.syncTransactions(companyId);
  }

  /**
   * Sync transactions for all accounts
   */
  async syncTransactions(companyId: string): Promise<number> {
    this.logger.log(`Syncing transactions for company ${companyId}`);

    const connection = await this.connectionRepo.findOne({
      where: { companyId, provider: 'budget_insight', status: 'active' },
    });

    if (!connection) {
      throw new BadRequestException('No active connection found');
    }

    const biUserId = parseInt(connection.externalUserId);
    const accounts = await this.accountRepo.find({
      where: { companyId, provider: 'budget_insight' },
    });

    let totalSynced = 0;

    for (const account of accounts) {
      const biAccountId = parseInt(account.externalId);

      // Get transactions from last 90 days
      const minDate = new Date();
      minDate.setDate(minDate.getDate() - 90);

      const biTransactions = await this.biClient.getTransactions(
        biUserId,
        biAccountId,
        minDate.toISOString().split('T')[0],
      );

      for (const biTx of biTransactions) {
        // Check if transaction already exists
        const existing = await this.transactionRepo.findOne({
          where: { externalId: biTx.id.toString() },
        });

        if (!existing) {
          const transaction = this.transactionRepo.create({
            companyId,
            accountId: account.id,
            transactionDate: new Date(biTx.date),
            amount: biTx.value,
            label: biTx.simplified_wording || biTx.original_wording,
            reference: biTx.id.toString(),
            status: 'pending',
            provider: 'budget_insight',
            externalId: biTx.id.toString(),
          });

          await this.transactionRepo.save(transaction);
          totalSynced++;
        }
      }
    }

    this.logger.log(`Synced ${totalSynced} new transactions`);
    return totalSynced;
  }

  /**
   * Get available banks for a country
   */
  async getAvailableBanks(country: string = 'BJ'): Promise<any[]> {
    return this.biClient.getConnectors(country);
  }

  /**
   * Disconnect bank connection
   */
  async disconnect(companyId: string): Promise<void> {
    const connection = await this.connectionRepo.findOne({
      where: { companyId, provider: 'budget_insight' },
    });

    if (!connection) {
      throw new BadRequestException('Connection not found');
    }

    const biUserId = parseInt(connection.externalUserId);
    const connectionId = parseInt(connection.externalConnectionId);

    await this.biClient.deleteConnection(biUserId, connectionId);

    connection.status = 'disconnected';
    await this.connectionRepo.save(connection);
  }
}
```

### Priority 3.3: Bank Connection Entity

**File**: `bms/api-gateway/src/integrations/banking/entities/bank-connection.entity.ts`
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('bank_connections')
export class BankConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  userId: string;

  @Column()
  provider: string; // 'budget_insight', 'bridge', 'manual'

  @Column({ nullable: true })
  externalUserId: string;

  @Column({ nullable: true })
  externalConnectionId: string;

  @Column({ default: 'pending' })
  status: string; // 'pending', 'active', 'error', 'disconnected'

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Priority 3.4: Banking Integration Controller

**File**: `bms/api-gateway/src/integrations/banking/banking-integration.controller.ts`
```typescript
import { Controller, Post, Get, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BudgetInsightService } from './budget-insight/budget-insight.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('integrations/banking')
@UseGuards(JwtAuthGuard)
export class BankingIntegrationController {
  constructor(private readonly budgetInsightService: BudgetInsightService) {}

  @Get('banks')
  async getAvailableBanks(@Query('country') country: string = 'BJ') {
    return this.budgetInsightService.getAvailableBanks(country);
  }

  @Post('connect')
  async initConnection(
    @CurrentUser() user,
    @Body() body: { companyId: string; connectorId: number },
  ) {
    const url = await this.budgetInsightService.initConnection(
      body.companyId,
      user.id,
      body.connectorId,
    );
    return { connectionUrl: url };
  }

  @Get('budget-insight/callback')
  async handleCallback(@Query('company_id') companyId: string, @Query('connection_id') connectionId: string) {
    await this.budgetInsightService.handleCallback(companyId, parseInt(connectionId));
    return { message: 'Connection successful', redirect: '/settings/banking' };
  }

  @Post('sync/:companyId')
  async syncTransactions(@Param('companyId') companyId: string) {
    const count = await this.budgetInsightService.syncTransactions(companyId);
    return { message: `${count} transactions synced` };
  }

  @Delete('disconnect/:companyId')
  async disconnect(@Param('companyId') companyId: string) {
    await this.budgetInsightService.disconnect(companyId);
    return { message: 'Disconnected successfully' };
  }
}
```

### Priority 3.5: Environment Variables

**File**: `bms/api-gateway/.env`
```env
# Budget Insight
BUDGET_INSIGHT_URL=https://api.biapi.pro/2.0
BUDGET_INSIGHT_CLIENT_ID=your_client_id
BUDGET_INSIGHT_CLIENT_SECRET=your_client_secret

# App URL for callbacks
APP_URL=http://localhost:3000
```

**Effort**: 2 weeks, 1 backend developer  
**Priority**: 🔴 HIGH

---

## 🎯 PHASE 4: PAYMENT GATEWAYS (Week 6)

### Priority 4.1: Stripe Integration

**File**: `bms/api-gateway/src/payments/gateways/stripe/stripe.service.ts`


```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../entities/payment.entity';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
  ) {
    const apiKey = this.configService.get('STRIPE_SECRET_KEY');
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2023-10-16',
    });
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: any,
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      this.logger.error('Failed to create payment intent', error);
      throw error;
    }
  }

  /**
   * Confirm a payment intent
   */
  async confirmPayment(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.confirm(paymentIntentId);
    } catch (error) {
      this.logger.error('Failed to confirm payment', error);
      throw error;
    }
  }

  /**
   * Create a refund
   */
  async createRefund(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
    try {
      const refundData: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      return await this.stripe.refunds.create(refundData);
    } catch (error) {
      this.logger.error('Failed to create refund', error);
      throw error;
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');

    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);

      this.logger.log(`Received Stripe webhook: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'charge.refunded':
          await this.handleRefund(event.data.object as Stripe.Charge);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error('Webhook error', error);
      throw error;
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const payment = await this.paymentRepo.findOne({
      where: { externalId: paymentIntent.id },
    });

    if (payment) {
      payment.status = 'completed';
      payment.paidAt = new Date();
      await this.paymentRepo.save(payment);
      this.logger.log(`Payment ${payment.id} marked as completed`);
    }
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const payment = await this.paymentRepo.findOne({
      where: { externalId: paymentIntent.id },
    });

    if (payment) {
      payment.status = 'failed';
      await this.paymentRepo.save(payment);
      this.logger.log(`Payment ${payment.id} marked as failed`);
    }
  }

  private async handleRefund(charge: Stripe.Charge): Promise<void> {
    const payment = await this.paymentRepo.findOne({
      where: { externalId: charge.payment_intent as string },
    });

    if (payment) {
      payment.status = 'refunded';
      await this.paymentRepo.save(payment);
      this.logger.log(`Payment ${payment.id} marked as refunded`);
    }
  }

  /**
   * Create a customer
   */
  async createCustomer(email: string, name: string, metadata: any): Promise<Stripe.Customer> {
    try {
      return await this.stripe.customers.create({
        email,
        name,
        metadata,
      });
    } catch (error) {
      this.logger.error('Failed to create customer', error);
      throw error;
    }
  }

  /**
   * Create a subscription
   */
  async createSubscription(
    customerId: string,
    priceId: string,
    metadata: any,
  ): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
      });
    } catch (error) {
      this.logger.error('Failed to create subscription', error);
      throw error;
    }
  }
}
```

### Priority 4.2: Stripe Controller

**File**: `bms/api-gateway/src/payments/gateways/stripe/stripe.controller.ts`
```typescript
import { Controller, Post, Body, Headers, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { StripeService } from './stripe.service';

@Controller('payments/stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  async createPaymentIntent(
    @Body() body: { amount: number; currency: string; invoiceId?: string },
  ) {
    return this.stripeService.createPaymentIntent(body.amount, body.currency, {
      invoiceId: body.invoiceId,
    });
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    await this.stripeService.handleWebhook(req.rawBody, signature);
    return { received: true };
  }

  @Post('refund')
  @UseGuards(JwtAuthGuard)
  async createRefund(@Body() body: { paymentIntentId: string; amount?: number }) {
    return this.stripeService.createRefund(body.paymentIntentId, body.amount);
  }
}
```

### Priority 4.3: Install Stripe

```bash
cd bms/api-gateway
npm install stripe
```

### Priority 4.4: Environment Variables

**File**: `bms/api-gateway/.env`
```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Priority 4.5: Frontend Stripe Integration

**File**: `bms-web/src/components/payments/stripe-payment.tsx`
```typescript
'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ amount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payments/success`,
      },
    });

    if (submitError) {
      setError(submitError.message);
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <div className="text-red-500 mt-2">{error}</div>}
      <Button type="submit" disabled={!stripe || loading} className="mt-4 w-full">
        {loading ? 'Traitement...' : `Payer ${amount} FCFA`}
      </Button>
    </form>
  );
}

export default function StripePayment({ amount, invoiceId, onSuccess }) {
  const [clientSecret, setClientSecret] = useState(null);

  const createPaymentIntent = async () => {
    const res = await fetch('/api/payments/stripe/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency: 'xof', invoiceId }),
    });
    const data = await res.json();
    setClientSecret(data.clientSecret);
  };

  if (!clientSecret) {
    return <Button onClick={createPaymentIntent}>Payer par carte</Button>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm amount={amount} onSuccess={onSuccess} />
    </Elements>
  );
}
```

**Effort**: 1 week, 1 developer  
**Priority**: 🔴 HIGH

---

## 🎯 PHASE 5: TESTING INFRASTRUCTURE (Week 7-8)

### Priority 5.1: Backend Unit Tests

**File**: `bms/api-gateway/src/crm/crm.service.spec.ts`
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrmService } from './crm.service';
import { Contact } from './entities/contact.entity';
import { Tag } from './entities/tag.entity';
import { Activity } from './entities/activity.entity';
import { Opportunity } from './entities/opportunity.entity';

describe('CrmService', () => {
  let service: CrmService;
  let contactRepo: Repository<Contact>;

  const mockContactRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrmService,
        {
          provide: getRepositoryToken(Contact),
          useValue: mockContactRepository,
        },
        {
          provide: getRepositoryToken(Tag),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Activity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Opportunity),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CrmService>(CrmService);
    contactRepo = module.get<Repository<Contact>>(getRepositoryToken(Contact));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createContact', () => {
    it('should create a contact successfully', async () => {
      const createDto = {
        companyId: 'company-1',
        type: 'client',
        companyName: 'Test Company',
        email: 'test@example.com',
      };

      const savedContact = { id: '1', ...createDto };

      mockContactRepository.findOne.mockResolvedValue(null);
      mockContactRepository.create.mockReturnValue(savedContact);
      mockContactRepository.save.mockResolvedValue(savedContact);

      const result = await service.createContact(createDto as any);

      expect(result).toEqual(savedContact);
      expect(mockContactRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockContactRepository.save).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      const createDto = {
        companyId: 'company-1',
        email: 'existing@example.com',
      };

      mockContactRepository.findOne.mockResolvedValue({ id: '1' });

      await expect(service.createContact(createDto as any)).rejects.toThrow(
        'Un contact avec cet email existe déjà',
      );
    });
  });
});
```

### Priority 5.2: E2E Tests

**File**: `bms/api-gateway/test/crm.e2e-spec.ts`
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('CRM (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/crm/contacts (POST)', () => {
    it('should create a new contact', () => {
      return request(app.getHttpServer())
        .post('/crm/contacts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          companyId: 'test-company',
          type: 'client',
          companyName: 'Test Company',
          email: 'contact@test.com',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.companyName).toBe('Test Company');
        });
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .post('/crm/contacts')
        .send({})
        .expect(401);
    });
  });

  describe('/crm/contacts (GET)', () => {
    it('should return list of contacts', () => {
      return request(app.getHttpServer())
        .get('/crm/contacts?companyId=test-company')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('contacts');
          expect(Array.isArray(res.body.contacts)).toBe(true);
        });
    });
  });
});
```

### Priority 5.3: Frontend E2E Tests with Playwright

**File**: `bms-web/e2e/crm.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('CRM Module', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should create a new contact', async ({ page }) => {
    await page.goto('/crm/contacts');
    await page.click('text=Nouveau contact');

    await page.fill('input[name="companyName"]', 'Test Company');
    await page.fill('input[name="email"]', 'test@company.com');
    await page.fill('input[name="phone"]', '+22912345678');

    await page.click('button:has-text("Créer le contact")');

    await expect(page).toHaveURL(/\/crm\/contacts\/[a-z0-9-]+/);
    await expect(page.locator('h1')).toContainText('Test Company');
  });

  test('should search contacts', async ({ page }) => {
    await page.goto('/crm/contacts');
    await page.fill('input[placeholder="Rechercher..."]', 'Test');

    await page.waitForTimeout(500); // Debounce

    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCount(1);
  });

  test('should filter contacts by type', async ({ page }) => {
    await page.goto('/crm/contacts');
    await page.selectOption('select', 'client');

    await page.waitForTimeout(500);

    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });
});
```

### Priority 5.4: Setup Playwright

```bash
cd bms-web
npm install -D @playwright/test
npx playwright install
```

**File**: `bms-web/playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Effort**: 2 weeks, 1 QA + 1 developer  
**Priority**: 🔴 CRITICAL

---

## 📋 SUMMARY & NEXT STEPS

### Immediate Actions (This Week)

1. **Fix 2FA Implementation** (2 days)
   - Add fields to User entity
   - Create migration
   - Install dependencies
   - Create controller and DTOs
   - Test 2FA flow

2. **Start CRM Frontend** (3 days)
   - Create contacts list page
   - Create contact detail page
   - Create contact form

### Week 2-3: Complete CRM
- Finish all CRM pages
- Add activity timeline
- Implement CSV import UI
- Create CRM dashboard

### Week 4-5: Banking Integration
- Implement Budget Insight client
- Create bank connection flow
- Test with real bank accounts
- Add sync scheduler

### Week 6: Payment Gateways
- Integrate Stripe
- Add PayPal (optional)
- Test payment flows
- Handle webhooks

### Week 7-8: Testing
- Write unit tests (70% coverage target)
- Write E2E tests
- Setup CI/CD pipeline
- Performance testing

### Success Metrics
- ✅ 2FA working end-to-end
- ✅ CRM fully functional (contacts + opportunities)
- ✅ Real banking connections working
- ✅ Stripe payments processing
- ✅ 70%+ test coverage
- ✅ All critical paths tested

### Risk Mitigation
- Start with Budget Insight sandbox
- Use Stripe test mode
- Parallel development (frontend + backend)
- Daily standups to track progress
- Weekly demos to stakeholders

---

**BMS is 92% complete. With this 8-week focused roadmap, it will reach 100% production-ready status with all critical features implemented and tested.**
