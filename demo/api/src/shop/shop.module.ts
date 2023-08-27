import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { Customer } from "@src/shop/entities/customer.entity";
import { Order } from "@src/shop/entities/order.entity";
import { Product } from "@src/shop/entities/product.entity";
import { CustomerResolver } from "@src/shop/generated/customer.resolver";
import { CustomersService } from "@src/shop/generated/customers.service";
import { ProductResolver } from "@src/shop/generated/product.resolver";
import { ProductsService } from "@src/shop/generated/products.service";
import { OrderResolver } from "@src/shop/order.resolver";
import { OrdersService } from "@src/shop/orders.service";
import { ProductVatResolver } from "@src/shop/product-vat.resolver";
import { ProductsVatService } from "@src/shop/products-vat.service";

@Module({
    imports: [MikroOrmModule.forFeature([Order, Product, Customer])],
    providers: [
        OrderResolver,
        OrdersService,
        ProductResolver,
        ProductVatResolver,
        ProductsService,
        ProductsVatService,
        CustomerResolver,
        CustomersService,
    ],
    exports: [],
})
export class ShopModule {}
