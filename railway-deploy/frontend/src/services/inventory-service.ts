import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  location: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastUpdated: string;
  supplier?: string;
  description?: string;
  maxQuantity?: number;
  costPrice?: number;
  unit?: string;
  weight?: number;
  barcode?: string;
  image?: string;
  metadata?: Record<string, any>;
}

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  type: 'main' | 'secondary' | 'transit';
  status: 'active' | 'inactive' | 'maintenance';
  capacity: number;
  usedCapacity: number;
  companyId: string;
  locations?: WarehouseLocation[];
}

export interface WarehouseLocation {
  id: string;
  code: string;
  name: string;
  type: 'storage' | 'picking' | 'receiving' | 'shipping' | 'quarantine';
  capacity: number;
  usedCapacity: number;
  status: 'active' | 'inactive' | 'maintenance';
  warehouseId: string;
  warehouse?: Warehouse;
}

export interface InventoryBatch {
  id: string;
  batchNumber: string;
  productId: string;
  product?: Product;
  initialQuantity: number;
  currentQuantity: number;
  unitCost: number;
  manufactureDate: Date;
  expiryDate: Date;
  status: 'active' | 'expired' | 'quarantine' | 'closed';
  locationId?: string;
  location?: WarehouseLocation;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface Picking {
  id: string;
  pickingNumber: string;
  productId: string;
  product?: Product;
  batchId?: string;
  batch?: InventoryBatch;
  quantity: number;
  pickedQuantity: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  notes?: string;
  metadata?: Record<string, any>;
  optimizedPath?: any[];
}

class InventoryService {
  // Produits
  async getProducts(companyId: string, filters?: {
    search?: string;
    category?: string;
    status?: string;
  }): Promise<Product[]> {
    const params = new URLSearchParams({ companyId });
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    
    return apiGet(`/inventory/items?${params.toString()}`);
  }

  async createProduct(productData: Partial<Product>, companyId: string): Promise<Product> {
    return apiPost('/inventory/items', { ...productData, companyId });
  }

  async updateProduct(id: string, productData: Partial<Product>, companyId: string): Promise<Product> {
    return apiPut(`/inventory/items/${id}`, { ...productData, companyId });
  }

  async deleteProduct(id: string, companyId: string): Promise<void> {
    return apiDelete(`/inventory/items/${id}?companyId=${companyId}`);
  }

  async adjustStock(adjustmentData: {
    productId: string;
    quantity: number;
    reason: string;
    type: 'increase' | 'decrease';
  }, companyId: string): Promise<any> {
    return apiPost('/inventory/adjust-stock', { ...adjustmentData, companyId });
  }

  // Entrepôts
  async getWarehouses(companyId: string): Promise<Warehouse[]> {
    return apiGet(`/inventory/warehouses?companyId=${companyId}`);
  }

  async createWarehouse(warehouseData: Partial<Warehouse>, companyId: string): Promise<Warehouse> {
    return apiPost('/inventory/warehouses', { ...warehouseData, companyId });
  }

  async updateWarehouse(id: string, warehouseData: Partial<Warehouse>, companyId: string): Promise<Warehouse> {
    return apiPut(`/inventory/warehouses/${id}`, { ...warehouseData, companyId });
  }

  async deleteWarehouse(id: string, companyId: string): Promise<void> {
    return apiDelete(`/inventory/warehouses/${id}?companyId=${companyId}`);
  }

  async transferStock(transferData: {
    fromWarehouseId: string;
    toWarehouseId: string;
    items: Array<{
      productId: string;
      quantity: number;
    }>;
  }, companyId: string): Promise<any> {
    return apiPost('/inventory/transfers', { ...transferData, companyId });
  }

  async getStock(warehouseId: string, itemId?: string, companyId?: string): Promise<any> {
    const params = new URLSearchParams({ warehouseId });
    if (itemId) params.append('itemId', itemId);
    if (companyId) params.append('companyId', companyId);
    
    return apiGet(`/inventory/stock?${params.toString()}`);
  }

  // Lots (Batches)
  async createBatch(batchData: Partial<InventoryBatch>, companyId: string): Promise<InventoryBatch> {
    return apiPost('/inventory/batches', { ...batchData, companyId });
  }

  async getBatchHistory(batchId: string, companyId: string): Promise<any> {
    return apiGet(`/inventory/batches/${batchId}/history?companyId=${companyId}`);
  }

  async calculateFIFO(itemId: string, quantity: number, companyId: string): Promise<any> {
    return apiPost('/inventory/calculate-fifo', { itemId, quantity, companyId });
  }

  // Préparations de commande (Picking)
  async createPicking(pickingData: Partial<Picking>, companyId: string): Promise<Picking> {
    return apiPost('/inventory/picking', { ...pickingData, companyId });
  }

  async optimizePicking(pickingId: string, companyId: string): Promise<any> {
    return apiPost(`/inventory/picking/${pickingId}/optimize`, { companyId });
  }

  async updatePickingStatus(pickingId: string, status: Picking['status'], companyId: string): Promise<Picking> {
    return apiPut(`/inventory/picking/${pickingId}/status`, { status, companyId });
  }

  async getPickings(companyId: string, filters?: {
    status?: Picking['status'];
    priority?: Picking['priority'];
    dueDate?: Date;
  }): Promise<Picking[]> {
    const params = new URLSearchParams({ companyId });
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.dueDate) params.append('dueDate', filters.dueDate.toISOString());
    
    return apiGet(`/inventory/picking?${params.toString()}`);
  }
}

export const inventoryService = new InventoryService();
