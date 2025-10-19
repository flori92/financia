import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { PermissionsGuard } from './guards/permissions.guard';
import { RbacService } from './rbac.service';
import { RbacController } from './rbac.controller';

/**
 * Module RBAC - Role-Based Access Control
 * Gestion des permissions granulaires
 */
@Module({
  imports: [TypeOrmModule.forFeature([Permission, Role])],
  controllers: [RbacController],
  providers: [PermissionsGuard, RbacService],
  exports: [PermissionsGuard, RbacService],
})
export class RbacModule {}
