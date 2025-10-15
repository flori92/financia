# Mise à Jour des Entités pour la Synchronisation Frappe

## Champs à ajouter à toutes les entités synchronisables

Ajouter ces deux champs avant `updatedAt` dans les entités suivantes:

```typescript
@ApiProperty({ description: 'ID Frappe pour synchronisation', required: false })
@Column({ type: 'varchar', length: 255, nullable: true })
frappeId?: string;

@ApiProperty({ description: 'Date de dernière synchronisation avec Frappe', required: false })
@Column({ type: 'timestamp', nullable: true })
lastSyncAt?: Date;
```

## Entités à mettre à jour

- [x] Account (`accounting/entities/account.entity.ts`) - ✅ Fait
- [x] JournalEntry (`accounting/entities/journal-entry.entity.ts`) - ✅ Fait
- [x] Invoice (`invoices/entities/invoice.entity.ts`) - ✅ Fait
- [x] Payment (`payments/entities/payment.entity.ts`) - ✅ Fait
- [x] Company (`companies/entities/company.entity.ts`) - ✅ Fait + NIF

**🎉 Toutes les entités sont maintenant prêtes pour la synchronisation Frappe !**

## Migration Base de Données

Après avoir mis à jour les entités, TypeORM synchronisera automatiquement en mode développement.

Pour la production, créer une migration:

```bash
npm run typeorm migration:generate -- -n AddFrappeSync
npm run typeorm migration:run
```

## Note

Ces champs sont optionnels (nullable) pour ne pas impacter le fonctionnement existant.
Si Frappe n'est pas configuré, ils resteront NULL.
