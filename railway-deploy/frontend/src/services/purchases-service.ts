import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

export interface Supplier {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  taxId?: string;
  paymentTerms: string;
  paymentMethod: string;
  status: 'active' | 'inactive' | 'blacklisted';
  rating: number;
  notes?: string;
  companyId: string;
  purchaseOrders?: PurchaseOrder[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplier?: Supplier;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  netAmount: number;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  notes?: string;
  companyId: string;
  receipts?: PurchaseReceipt[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate?: number;
  discountRate?: number;
  notes?: string;
}

export interface PurchaseReceipt {
  id: string;
  receiptNumber: string;
  purchaseOrderId: string;
  purchaseOrder?: PurchaseOrder;
  status: 'pending' | 'partial' | 'completed';
  items: PurchaseReceiptItem[];
  totalReceived: number;
  receivedDate: Date;
  receivedBy: string;
  notes?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseReceiptItem {
  id: string;
  orderItemId: string;
  productId: string;
  productName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitPrice: number;
  totalPrice: number;
  batchNumber?: string;
  expiryDate?: Date;
  notes?: string;
}

class PurchasesService {
  // Fournisseurs
  async getSuppliers(companyId: string, filters?: {
    search?: string;
    status?: Supplier['status'];
    rating?: number;
  }): Promise<Supplier[]> {
    const params = new URLSearchParams({ companyId });
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.rating) params.append('rating', filters.rating.toString());
    
    return apiGet(`/purchases/suppliers?${params.toString()}`);
  }

  async createSupplier(supplierData: Partial<Supplier>, companyId: string): Promise<Supplier> {
    return apiPost('/purchases/suppliers', { ...supplierData, companyId });
  }

  async updateSupplier(id: string, supplierData: Partial<Supplier>, companyId: string): Promise<Supplier> {
    return apiPut(`/purchases/suppliers/${id}`, { ...supplierData, companyId });
  }

  async deleteSupplier(id: string, companyId: string): Promise<void> {
    return apiDelete(`/purchases/suppliers/${id}?companyId=${companyId}`);
  }

  async getSupplier(id: string, companyId: string): Promise<Supplier> {
    return apiGet(`/purchases/suppliers/${id}?companyId=${companyId}`);
  }

  // Commandes d'achat
  async getPurchaseOrders(companyId: string, filters?: {
    supplierId?: string;
    status?: PurchaseOrder['status'];
    orderDate?: Date;
    expectedDeliveryDate?: Date;
  }): Promise<PurchaseOrder[]> {
    const params = new URLSearchParams({ companyId });
    if (filters?.supplierId) params.append('supplierId', filters.supplierId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.orderDate) params.append('orderDate', filters.orderDate.toISOString());
    if (filters?.expectedDeliveryDate) params.append('expectedDeliveryDate', filters.expectedDeliveryDate.toISOString());
    
    return apiGet(`/purchases/orders?${params.toString()}`);
  }

  async createOrder(orderData: Partial<PurchaseOrder>, companyId: string): Promise<PurchaseOrder> {
    return apiPost('/purchases/orders', { ...orderData, companyId });
  }

  async updateOrder(id: string, orderData: Partial<PurchaseOrder>, companyId: string): Promise<PurchaseOrder> {
    return apiPut(`/purchases/orders/${id}`, { ...orderData, companyId });
  }

  async deleteOrder(id: string, companyId: string): Promise<void> {
    return apiDelete(`/purchases/orders/${id}?companyId=${companyId}`);
  }

  async getOrder(id: string, companyId: string): Promise<PurchaseOrder> {
    return apiGet(`/purchases/orders/${id}?companyId=${companyId}`);
  }

  async sendOrder(id: string, companyId: string): Promise<PurchaseOrder> {
    return apiPost(`/purchases/orders/${id}/send`, { companyId });
  }

  async confirmOrder(id: string, companyId: string): Promise<PurchaseOrder> {
    return apiPost(`/purchases/orders/${id}/confirm`, { companyId });
  }

  async cancelOrder(id: string, companyId: string, reason?: string): Promise<PurchaseOrder> {
    return apiPost(`/purchases/orders/${id}/cancel`, { companyId, reason });
  }

  // Réceptions
  async createReceipt(receiptData: Partial<PurchaseReceipt>, companyId: string): Promise<PurchaseReceipt> {
    return apiPost('/purchases/receipts', { ...receiptData, companyId });
  }

  async getReceipts(companyId: string, filters?: {
    purchaseOrderId?: string;
    status?: PurchaseReceipt['status'];
    receivedDate?: Date;
  }): Promise<PurchaseReceipt[]> {
    const params = new URLSearchParams({ companyId });
    if (filters?.purchaseOrderId) params.append('purchaseOrderId', filters.purchaseOrderId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.receivedDate) params.append('receivedDate', filters.receivedDate.toISOString());
    
    return apiGet(`/purchases/receipts?${params.toString()}`);
  }

  async updateReceipt(id: string, receiptData: Partial<PurchaseReceipt>, companyId: string): Promise<PurchaseReceipt> {
    return apiPut(`/purchases/receipts/${id}`, { ...receiptData, companyId });
  }

  async completeReceipt(id: string, companyId: string): Promise<PurchaseReceipt> {
    return apiPost(`/purchases/receipts/${id}/complete`, { companyId });
  }

  // Three-way matching
  async threeWayMatch(orderId: string, companyId: string): Promise<any> {
    return apiPost(`/purchases/orders/${orderId}/three-way-match`, { companyId });
  }

  // Statistiques
  async getPurchaseStatistics(companyId: string, period?: {
    startDate: Date;
    endDate: Date;
  }): Promise<any> {
    const params = new URLSearchParams({ companyId });
    if (period?.startDate) params.append('startDate', period.startDate.toISOString());
    if (period?.endDate) params.append('endDate', period.endDate.toISOString());
    
    return apiGet(`/purchases/statistics?${params.toString()}`);
  }

  // RFQ (Request for Quotation)
  async createRFQ(rfqData: any, companyId: string): Promise<any> {
    return apiPost('/purchases/rfq', { ...rfqData, companyId });
  }

  async getRFQs(companyId: string, filters?: {
    status?: string;
    deadline?: Date;
  }): Promise<any[]> {
    const params = new URLSearchParams({ companyId });
    if (filters?.status) params.append('status', filters.status);
    if (filters?.deadline) params.append('deadline', filters.deadline.toISOString());
    
    return apiGet(`/purchases/rfq?${params.toString()}`);
  }

  async sendRFQ(id: string, supplierIds: string[], companyId: string): Promise<any> {
    return apiPost(`/purchases/rfq/${id}/send`, { supplierIds, companyId });
  }
}

export const purchasesService = new PurchasesService();
