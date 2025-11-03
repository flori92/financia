const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } = require('typeorm');

@Entity('inventory_products')
class InventoryProduct {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column()
  name;

  @Column()
  sku;

  @Column()
  category;

  @Column('decimal')
  quantity;

  @Column('decimal')
  minQuantity;

  @Column('decimal')
  unitPrice;

  @Column()
  location;

  @Column({
    type: 'enum',
    enum: ['in_stock', 'low_stock', 'out_of_stock'],
    default: 'in_stock'
  })
  status;

  @Column({ nullable: true })
  supplier;

  @Column()
  companyId;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}

@Entity('inventory_categories')
class InventoryCategory {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column()
  name;

  @Column({ nullable: true })
  description;

  @Column()
  companyId;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}

@Entity('inventory_movements')
class InventoryMovement {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column()
  productId;

  @Column({
    type: 'enum',
    enum: ['in', 'out', 'adjustment']
  })
  type;

  @Column('decimal')
  quantity;

  @Column()
  reason;

  @Column()
  date;

  @Column({ nullable: true })
  referenceId; // Pour lier à une commande, facture, etc.

  @Column()
  companyId;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}

module.exports = { 
  InventoryProduct, 
  InventoryCategory, 
  InventoryMovement 
};
