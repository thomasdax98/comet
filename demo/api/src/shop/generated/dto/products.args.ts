// This file has been generated by comet api-generator.
// You may choose to use this file as scaffold by moving this file out of generated folder and removing this comment.
import { OffsetBasedPaginationArgs } from "@comet/cms-api";
import { ArgsType, Field } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";

import { ProductFilter } from "./product.filter";
import { ProductSort } from "./product.sort";

@ArgsType()
export class ProductsArgs extends OffsetBasedPaginationArgs {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    search?: string;

    @Field(() => ProductFilter, { nullable: true })
    @ValidateNested()
    @Type(() => ProductFilter)
    @IsOptional()
    filter?: ProductFilter;

    @Field(() => [ProductSort], { nullable: true })
    @ValidateNested({ each: true })
    @Type(() => ProductSort)
    @IsOptional()
    sort?: ProductSort[];
}