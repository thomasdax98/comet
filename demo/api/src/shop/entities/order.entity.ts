import { RootBlockEntity } from "@comet/blocks-api";
import { CrudField, DocumentInterface } from "@comet/cms-api";
import { BaseEntity, Collection, DecimalType, Entity, ManyToMany, ManyToOne, OptionalProps, PrimaryKey, Property, Ref } from "@mikro-orm/core";
import { Field, Float, ID, ObjectType } from "@nestjs/graphql";
import { Customer } from "@src/shop/entities/customer.entity";
import { Product } from "@src/shop/entities/product.entity";
import { v4 as uuid } from "uuid";

@Entity()
@ObjectType({
    implements: () => [DocumentInterface],
})
@RootBlockEntity()
export class Order extends BaseEntity<Order, "id"> implements DocumentInterface {
    [OptionalProps]?: "createdAt" | "updatedAt";

    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = uuid();

    @Property({ columnType: "numeric(10,2)", type: DecimalType })
    @Field(() => Float)
    @CrudField({
        input: false,
    })
    // numeric fields are retrieved as string by MikroORM
    // https://github.com/mikro-orm/mikro-orm/issues/2295
    totalAmountPaid: string;

    @Property()
    @Field(() => Boolean)
    isPaid: boolean;

    @Property({ type: Date })
    @Field(() => Date)
    date: Date;

    @ManyToMany(() => Product, (product) => product.orders, { owner: true })
    products = new Collection<Product>(this);

    @ManyToOne(() => Customer, { ref: true })
    customer: Ref<Customer>;

    @Property({ columnType: "timestamp with time zone" })
    @Field()
    createdAt: Date = new Date();

    @Property({ columnType: "timestamp with time zone", onUpdate: () => new Date() })
    @Field()
    updatedAt: Date = new Date();
}
