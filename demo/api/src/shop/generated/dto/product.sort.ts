// This file has been generated by comet api-generator.
// You may choose to use this file as scaffold by moving this file out of generated folder and removing this comment.
import { SortDirection } from "@comet/cms-api";
import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IsEnum } from "class-validator";

export enum ProductSortField {
    name = "name",
    description = "description",
    price = "price",
    type = "type",
    createdAt = "createdAt",
    updatedAt = "updatedAt",
}
registerEnumType(ProductSortField, {
    name: "ProductSortField",
});

@InputType()
export class ProductSort {
    @Field(() => ProductSortField)
    @IsEnum(ProductSortField)
    field: ProductSortField;

    @Field(() => SortDirection, { defaultValue: SortDirection.ASC })
    @IsEnum(SortDirection)
    direction: SortDirection = SortDirection.ASC;
}
