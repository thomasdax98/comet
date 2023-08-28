// This file has been generated by comet api-generator.
// You may choose to use this file as scaffold by moving this file out of generated folder and removing this comment.
import { BooleanFilter, DateFilter, ManyToOneFilter, NumberFilter } from "@comet/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";

@InputType()
export class OrderFilter {
    @Field(() => NumberFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => NumberFilter)
    totalAmountPaid?: NumberFilter;

    @Field(() => BooleanFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => BooleanFilter)
    isPaid?: BooleanFilter;

    @Field(() => DateFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => DateFilter)
    date?: DateFilter;

    @Field(() => ManyToOneFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => ManyToOneFilter)
    customer?: ManyToOneFilter;

    @Field(() => DateFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => DateFilter)
    createdAt?: DateFilter;

    @Field(() => DateFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => DateFilter)
    updatedAt?: DateFilter;

    @Field(() => [OrderFilter], { nullable: true })
    @Type(() => OrderFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    and?: OrderFilter[];

    @Field(() => [OrderFilter], { nullable: true })
    @Type(() => OrderFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    or?: OrderFilter[];
}
