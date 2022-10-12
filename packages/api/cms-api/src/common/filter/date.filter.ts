import { Field, InputType } from "@nestjs/graphql";
import { IsDate, IsOptional } from "class-validator";

@InputType()
export class DateFilter {
    @Field({ nullable: true })
    @IsOptional()
    @IsDate()
    equal?: Date;

    @Field({ nullable: true })
    @IsOptional()
    @IsDate()
    lowerThan?: Date;

    @Field({ nullable: true })
    @IsOptional()
    @IsDate()
    greaterThan?: Date;

    @Field({ nullable: true })
    @IsOptional()
    @IsDate()
    lowerThanEqual?: Date;

    @Field({ nullable: true })
    @IsOptional()
    @IsDate()
    greaterThanEqual?: Date;

    @Field({ nullable: true })
    @IsOptional()
    @IsDate()
    notEqual?: Date;
}
