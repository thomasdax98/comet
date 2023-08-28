// This file has been generated by comet api-generator.
// You may choose to use this file as scaffold by moving this file out of generated folder and removing this comment.
import { extractGraphqlFields, SubjectEntity, validateNotModified } from "@comet/cms-api";
import { FindOptions } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { Args, ID, Info, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { GraphQLResolveInfo } from "graphql";

import { Order } from "../entities/order.entity";
import { Product } from "../entities/product.entity";
import { PaginatedProducts } from "./dto/paginated-products";
import { ProductInput, ProductUpdateInput } from "./dto/product.input";
import { ProductsArgs } from "./dto/products.args";
import { ProductsService } from "./products.service";

@Resolver(() => Product)
export class ProductResolver {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly productsService: ProductsService,
        @InjectRepository(Product) private readonly repository: EntityRepository<Product>,
    ) {}

    @Query(() => Product)
    @SubjectEntity(Product)
    async product(@Args("id", { type: () => ID }) id: string): Promise<Product> {
        const product = await this.repository.findOneOrFail(id);
        return product;
    }

    @Query(() => PaginatedProducts)
    async products(@Args() { search, filter, sort, offset, limit }: ProductsArgs, @Info() info: GraphQLResolveInfo): Promise<PaginatedProducts> {
        const where = this.productsService.getFindCondition({ search, filter });

        const fields = extractGraphqlFields(info, { root: "nodes" });
        const populate: string[] = [];
        if (fields.includes("orders")) {
            populate.push("orders");
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const options: FindOptions<Product, any> = { offset, limit, populate };

        if (sort) {
            options.orderBy = sort.map((sortItem) => {
                return {
                    [sortItem.field]: sortItem.direction,
                };
            });
        }

        const [entities, totalCount] = await this.repository.findAndCount(where, options);
        return new PaginatedProducts(entities, totalCount);
    }

    @Mutation(() => Product)
    async createProduct(@Args("input", { type: () => ProductInput }) input: ProductInput): Promise<Product> {
        const { image: imageInput, ...assignInput } = input;
        const product = this.repository.create({
            ...assignInput,

            image: imageInput.transformToBlockData(),
        });

        await this.entityManager.flush();

        return product;
    }

    @Mutation(() => Product)
    @SubjectEntity(Product)
    async updateProduct(
        @Args("id", { type: () => ID }) id: string,
        @Args("input", { type: () => ProductUpdateInput }) input: ProductUpdateInput,
        @Args("lastUpdatedAt", { type: () => Date, nullable: true }) lastUpdatedAt?: Date,
    ): Promise<Product> {
        const product = await this.repository.findOneOrFail(id);
        if (lastUpdatedAt) {
            validateNotModified(product, lastUpdatedAt);
        }

        const { image: imageInput, ...assignInput } = input;
        product.assign({
            ...assignInput,
        });

        if (imageInput) {
            product.image = imageInput.transformToBlockData();
        }

        await this.entityManager.flush();

        return product;
    }

    @Mutation(() => Boolean)
    @SubjectEntity(Product)
    async deleteProduct(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
        const product = await this.repository.findOneOrFail(id);
        await this.entityManager.remove(product);
        await this.entityManager.flush();
        return true;
    }

    @ResolveField(() => [Order])
    async orders(@Parent() product: Product): Promise<Order[]> {
        return product.orders.loadItems();
    }
}
