// This file has been generated by comet api-generator.
// You may choose to use this file as scaffold by moving this file out of generated folder and removing this comment.
import { PartialType } from "@comet/cms-api";
import { Field, ID, InputType } from "@nestjs/graphql";
import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsUUID } from "class-validator";

@InputType()
export class OrderInput {
    @IsNotEmpty()
    @IsBoolean()
    @Field()
    isPaid: boolean;

    @IsNotEmpty()
    @IsDate()
    @Field()
    date: Date;

    @Field(() => [ID])
    @IsArray()
    @IsUUID(undefined, { each: true })
    products: string[];

    @IsNotEmpty()
    @Field(() => ID)
    @IsUUID()
    customer: string;
}

@InputType()
export class OrderUpdateInput extends PartialType(OrderInput) {}
