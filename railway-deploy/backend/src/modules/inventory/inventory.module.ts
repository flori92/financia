import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from '../../inventory/inventory.service';
import { WarehouseService } from './warehouse.service';
import { Product } from '../../inventory/entities/product.entity';
import { InventoryBatch } from '../../inventory/entities/inventory-batch.entity';
import { Picking } from '../../inventory/entities/picking.entity';
import { Warehouse } from './entities/warehouse.entity';
import { WarehouseLocation } from './entities/warehouse-location.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      InventoryBatch,
      Picking,
      Warehouse,
      WarehouseLocation
    ])
  ],
  controllers: [InventoryController],
  providers: [InventoryService, WarehouseService],
  exports: [InventoryService, WarehouseService]
})
export class InventoryModule {}
