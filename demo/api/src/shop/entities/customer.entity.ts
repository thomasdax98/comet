import { RootBlockEntity } from "@comet/blocks-api";
import { CrudField, CrudGenerator, DocumentInterface } from "@comet/cms-api";
import { BaseEntity, Collection, Entity, OneToMany, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Order } from "@src/shop/entities/order.entity";
import { v4 as uuid } from "uuid";

@Entity()
@ObjectType({
    implements: () => [DocumentInterface],
})
@RootBlockEntity()
@CrudGenerator({ targetDirectory: `${__dirname}/../generated/` })
export class Customer extends BaseEntity<Customer, "id"> implements DocumentInterface {
    [OptionalProps]?: "createdAt" | "updatedAt";

    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = uuid();

    @Property()
    @Field()
    firstname: string;

    @Property()
    @Field()
    lastname: string;

    @Property()
    @Field()
    email: string;

    @Property()
    @Field()
    address: string;

    @OneToMany(() => Order, (order) => order.customer)
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
