import { BlockDataInterface, RootBlock, RootBlockEntity } from "@comet/blocks-api";
import { CrudField, CrudGenerator, DamImageBlock, DocumentInterface, RootBlockDataScalar, RootBlockType } from "@comet/cms-api";
import { BaseEntity, Collection, DecimalType, Entity, Enum, ManyToMany, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Float, ID, ObjectType } from "@nestjs/graphql";
import { Order } from "@src/shop/entities/order.entity";
import { v4 as uuid } from "uuid";

import { ProductType } from "./product-type.enum";

@Entity()
@ObjectType({
    implements: () => [DocumentInterface],
})
@RootBlockEntity()
@CrudGenerator({ targetDirectory: `${__dirname}/../generated/` })
export class Product extends BaseEntity<Product, "id"> implements DocumentInterface {
    [OptionalProps]?: "createdAt" | "updatedAt";

    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = uuid();

    @Property()
    @Field()
    name: string;

    @Property()
    @Field()
    description: string;

    @Property({ columnType: "numeric(10,2)", type: DecimalType })
    @Field(() => Float)
    // numeric fields are retrieved as string by MikroORM
    // https://github.com/mikro-orm/mikro-orm/issues/2295
    price: string | number;

    @Enum({ items: () => ProductType })
    @Field(() => ProductType)
    type: ProductType;

    @Property({ customType: new RootBlockType(DamImageBlock) })
    @Field(() => RootBlockDataScalar(DamImageBlock))
    @RootBlock(DamImageBlock)
    image: BlockDataInterface;

    @ManyToMany(() => Order, (order) => order.products)
    @CrudField({
        input: false,
    })
    orders = new Collection<Order>(this);

    @Property({ columnType: "timestamp with time zone" })
    @Field()
    createdAt: Date = new Date();

    @Property({ columnType: "timestamp with time zone", onUpdate: () => new Date() })
    @Field()
    updatedAt: Date = new Date();
}
