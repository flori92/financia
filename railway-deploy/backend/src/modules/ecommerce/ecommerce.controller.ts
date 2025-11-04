import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CartService } from './cart.service';

@ApiTags('E-commerce')
@Controller('ecommerce')
export class EcommerceController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly cartService: CartService,
  ) {}

  @Post('products')
  @ApiOperation({ summary: 'Créer un produit' })
  async createProduct(@Body() data: any) {
    return this.catalogService.createProduct(data);
  }

  @Get('products')
  @ApiOperation({ summary: 'Liste des produits' })
  async getProducts(@Query('q') query: string, @Query() filters: any) {
    return this.catalogService.searchProducts(query, filters);
  }

  @Post('products/:id/publish')
  @ApiOperation({ summary: 'Publier un produit' })
  async publishProduct(@Param('id') id: string) {
    return this.catalogService.publishProduct(id);
  }

  @Post('cart/add')
  @ApiOperation({ summary: 'Ajouter au panier' })
  async addToCart(@Body() data: any) {
    return this.cartService.addToCart(data.sessionId, data.productId, data.quantity);
  }

  @Post('cart/promo')
  @ApiOperation({ summary: 'Appliquer un code promo' })
  async applyPromo(@Body() data: any) {
    return this.cartService.applyPromo(data.sessionId, data.code);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Finaliser la commande' })
  async checkout(@Body() data: any) {
    return this.cartService.checkout(data.sessionId, data);
  }
}
