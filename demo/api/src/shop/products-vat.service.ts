import { Injectable } from "@nestjs/common";
import { Product } from "@src/shop/entities/product.entity";
import { ProductsService } from "@src/shop/generated/products.service";

@Injectable()
export class ProductsVatService {
    constructor(private readonly productsService: ProductsService) {}

    calculateVAT(product: Product): number {
        return Number(((Number(product.price) / 1.2) * 0.2).toFixed(2));
    }
}
