import { Float, Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { Product } from "@src/shop/entities/product.entity";
import { ProductsVatService } from "@src/shop/products-vat.service";

@Resolver(() => Product)
export class ProductVatResolver {
    constructor(private readonly customProductsService: ProductsVatService) {}
    @ResolveField(() => Float)
    async vat(@Parent() product: Product): Promise<number> {
        return this.customProductsService.calculateVAT(product);
    }
}
