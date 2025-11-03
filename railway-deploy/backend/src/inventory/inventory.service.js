const { getRepository } = require('typeorm');
const { InventoryProduct, InventoryMovement } = require('./inventory.entity');

class InventoryService {
  
  async getProducts(companyId, filters = {}) {
    try {
      const productRepository = getRepository(InventoryProduct);
      const query = productRepository.createQueryBuilder('product')
        .where('product.companyId = :companyId', { companyId });

      if (filters.search) {
        query.andWhere(
          '(product.name ILIKE :search OR product.sku ILIKE :search OR product.category ILIKE :search)',
          { search: `%${filters.search}%` }
        );
      }

      if (filters.category) {
        query.andWhere('product.category = :category', { category: filters.category });
      }

      if (filters.status) {
        query.andWhere('product.status = :status', { status: filters.status });
      }

      query.orderBy('product.name', 'ASC');

      const products = await query.getMany();
      
      // Calculer la valeur totale pour chaque produit
      return products.map(product => ({
        ...product,
        totalValue: parseFloat(product.quantity) * parseFloat(product.unitPrice)
      }));
    } catch (error) {
      throw new Error(`Erreur récupération produits: ${error.message}`);
    }
  }

  async createProduct(productData) {
    try {
      const productRepository = getRepository(InventoryProduct);
      
      // Déterminer le statut automatiquement
      let status = 'in_stock';
      if (productData.quantity === 0) {
        status = 'out_of_stock';
      } else if (productData.quantity < productData.minQuantity) {
        status = 'low_stock';
      }

      const product = productRepository.create({
        ...productData,
        status
      });

      const savedProduct = await productRepository.save(product);

      // Créer mouvement d'entrée initial
      if (productData.quantity > 0) {
        await this.createMovement({
          productId: savedProduct.id,
          type: 'in',
          quantity: productData.quantity,
          reason: 'Stock initial',
          date: new Date().toISOString().split('T')[0],
          companyId: productData.companyId
        });
      }

      return savedProduct;
    } catch (error) {
      throw new Error(`Erreur création produit: ${error.message}`);
    }
  }

  async updateProduct(productId, updateData) {
    try {
      const productRepository = getRepository(InventoryProduct);
      
      // Récupérer le produit actuel
      const currentProduct = await productRepository.findOne(productId);
      if (!currentProduct) {
        throw new Error('Produit non trouvé');
      }

      // Mettre à jour le statut automatiquement si la quantité change
      if (updateData.quantity !== undefined) {
        let status = 'in_stock';
        if (updateData.quantity === 0) {
          status = 'out_of_stock';
        } else if (updateData.quantity < updateData.minQuantity || updateData.quantity < currentProduct.minQuantity) {
          status = 'low_stock';
        }
        updateData.status = status;

        // Créer mouvement d'ajustement si la quantité change
        const quantityDiff = parseFloat(updateData.quantity) - parseFloat(currentProduct.quantity);
        if (quantityDiff !== 0) {
          await this.createMovement({
            productId,
            type: quantityDiff > 0 ? 'in' : 'out',
            quantity: Math.abs(quantityDiff),
            reason: 'Ajustement manuel',
            date: new Date().toISOString().split('T')[0],
            companyId: currentProduct.companyId
          });
        }
      }

      await productRepository.update(productId, updateData);
      
      return await productRepository.findOne(productId);
    } catch (error) {
      throw new Error(`Erreur mise à jour produit: ${error.message}`);
    }
  }

  async deleteProduct(productId) {
    try {
      const productRepository = getRepository(InventoryProduct);
      const movementRepository = getRepository(InventoryMovement);
      
      // Supprimer les mouvements associés
      await movementRepository.delete({ productId });
      
      // Supprimer le produit
      const result = await productRepository.delete(productId);
      
      return result.affected > 0;
    } catch (error) {
      throw new Error(`Erreur suppression produit: ${error.message}`);
    }
  }

  async getMovements(companyId, filters = {}) {
    try {
      const movementRepository = getRepository(InventoryMovement);
      const query = movementRepository.createQueryBuilder('movement')
        .leftJoinAndSelect('movement.product', 'product')
        .where('movement.companyId = :companyId', { companyId });

      if (filters.productId) {
        query.andWhere('movement.productId = :productId', { productId: filters.productId });
      }

      if (filters.type) {
        query.andWhere('movement.type = :type', { type: filters.type });
      }

      if (filters.startDate) {
        query.andWhere('movement.date >= :startDate', { startDate: filters.startDate });
      }

      if (filters.endDate) {
        query.andWhere('movement.date <= :endDate', { endDate: filters.endDate });
      }

      query.orderBy('movement.date', 'DESC');

      return await query.getMany();
    } catch (error) {
      throw new Error(`Erreur récupération mouvements: ${error.message}`);
    }
  }

  async createMovement(movementData) {
    try {
      const movementRepository = getRepository(InventoryMovement);
      const movement = movementRepository.create(movementData);
      
      return await movementRepository.save(movement);
    } catch (error) {
      throw new Error(`Erreur création mouvement: ${error.message}`);
    }
  }

  async getDashboardMetrics(companyId) {
    try {
      const productRepository = getRepository(InventoryProduct);
      
      // Statistiques générales
      const [
        totalProducts,
        lowStockCount,
        outOfStockCount
      ] = await Promise.all([
        productRepository.count({ where: { companyId } }),
        productRepository.count({ where: { companyId, status: 'low_stock' } }),
        productRepository.count({ where: { companyId, status: 'out_of_stock' } })
      ]);

      // Calculer la valeur totale du stock
      const products = await productRepository
        .createQueryBuilder('product')
        .select('SUM(product.quantity * product.unitPrice)', 'totalValue')
        .where('product.companyId = :companyId', { companyId })
        .getRawOne();

      const totalValue = products.totalValue || 0;

      // Produits en alerte
      const alertProducts = await productRepository
        .createQueryBuilder('product')
        .where('product.companyId = :companyId', { companyId })
        .andWhere('product.status IN (:...statuses)', { statuses: ['low_stock', 'out_of_stock'] })
        .orderBy('product.quantity', 'ASC')
        .limit(10)
        .getMany();

      // Catégories
      const categories = await productRepository
        .createQueryBuilder('product')
        .select('product.category', 'category')
        .addSelect('COUNT(*)', 'count')
        .where('product.companyId = :companyId', { companyId })
        .groupBy('product.category')
        .orderBy('count', 'DESC')
        .getRawMany();

      return {
        totalProducts,
        totalValue: parseFloat(totalValue),
        lowStockCount,
        outOfStockCount,
        alertProducts,
        categories
      };
    } catch (error) {
      throw new Error(`Erreur récupération KPIs: ${error.message}`);
    }
  }

  async getCategories(companyId) {
    try {
      const productRepository = getRepository(InventoryProduct);
      
      const categories = await productRepository
        .createQueryBuilder('product')
        .select('DISTINCT product.category', 'category')
        .where('product.companyId = :companyId', { companyId })
        .orderBy('product.category', 'ASC')
        .getRawMany();

      return categories.map(cat => cat.category);
    } catch (error) {
      throw new Error(`Erreur récupération catégories: ${error.message}`);
    }
  }
}

module.exports = new InventoryService();
