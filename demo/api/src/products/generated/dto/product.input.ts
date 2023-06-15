// This file has been generated by comet api-generator.
// You may choose to use this file as scaffold by moving this file out of generated folder and removing this comment.
import { BlockInputInterface, isBlockInputInterface } from "@comet/blocks-api";
import { DamImageBlock, IsNullable, IsSlug, PartialType, RootBlockInputScalar } from "@comet/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";

import { ProductType } from "../../entities/product.entity";

@InputType()
export class ProductInput {
    @IsNotEmpty()
    @IsString()
    @Field()
    title: string;

    @IsNotEmpty()
    @IsString()
    @IsSlug()
    @Field()
    slug: string;

    @IsNotEmpty()
    @IsString()
    @Field()
    description: string;

    @IsNotEmpty()
    @IsEnum(ProductType)
    @Field(() => ProductType)
    type: ProductType;

    @IsNullable()
    @IsNumber()
    @Field({ nullable: true })
    price?: number;

    @IsNotEmpty()
    @IsBoolean()
    @Field()
    inStock: boolean;

    @IsNotEmpty()
    @Field(() => RootBlockInputScalar(DamImageBlock))
    @Transform(({ value }) => (isBlockInputInterface(value) ? value : DamImageBlock.blockInputFactory(value)), { toClassOnly: true })
    @ValidateNested()
    image: BlockInputInterface;
}

@InputType()
export class ProductUpdateInput extends PartialType(ProductInput) {}
